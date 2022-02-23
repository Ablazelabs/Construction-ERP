const { error, allModels } = require("../config/config");
const { groupByFn } = require("./payrollControl");
const authorization = require("../validation/auth");
const {
    getAccounts,
    convertJournalTransactionToBaseCurrency,
    getTotalDebitAmount,
    getTotalCreditAmount,
    getOpeningBalanceAmount,
} = require("./generalLedgerDetailFunctions");
const {
    accounting_period,
    transaction_lock,
    exchange_rate,
    general_journal_detail,
    currency,
    opening_balance,
    account_type_financial_statement_section,
    chart_of_account,
} = allModels;
const post = async (reqBody, creator, enums, next) => {
    const allowedAccountingPeriodStatus = [2, 3];
    if (
        allowedAccountingPeriodStatus.indexOf(
            reqBody.accounting_period_status
        ) == -1
    ) {
        error(
            "accounting_period_status",
            `can only be one of ${allowedAccountingPeriodStatus} from ${enums["accounting_period_status"]}`,
            next
        );
        return;
    }
    if (reqBody.is_current_posting_period) {
        const current = await accounting_period.findFirst({
            where: {
                is_current_posting_period: true,
            },
            select: {
                id: true,
                months: true,
            },
        });
        if (current) {
            error(
                "is_current_posting_period",
                `there's already a current posting period ie ${
                    enums["months"][current.months - 1]
                }`,
                next
            );
            return;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    await accounting_period.create({
        data: {
            ...reqBody,
            ...defaultData,
        },
    });
    //   console.log(data);
    return { success: true };
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await accounting_period.findMany({
        where: {
            ...queryFilter,
            status: 0,
        },
        orderBy: [...querySort],
        take: limit,
        skip,
        select: {
            ...projection,
        },
    });
    return data;
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    creator,
    enums,
    next
) => {
    const myAccountingPeriod = await accounting_period.findUnique({
        select: {
            ...updateDataProjection,
            isProtectedForEdit: true,
            is_current_posting_period: true,
            period_ending_date: true,
            accounting_period_status: true,
        },
        where: { id: reqBody.id },
    });
    if (!myAccountingPeriod) {
        error("id", "material doesn't exist", next);
        return false;
    }
    if (myAccountingPeriod.isProtectedForEdit) {
        error("id", `this accounting period is protected against edit`, next);
        return false;
    }
    if (updateData.is_current_posting_period) {
        if (
            updateData.is_current_posting_period ===
            myAccountingPeriod.is_current_posting_period
        ) {
            updateData.is_current_posting_period = undefined;
        } else {
            const data = await accounting_period.findFirst({
                select: { is_current_posting_period: true, months: true },
                where: { is_current_posting_period: true },
            });
            if (data) {
                error(
                    "is_current_posting_period",
                    `there's already a current posting period ie ${
                        enums["months"][data.months - 1]
                    }`,
                    next
                );
                return false;
            }
        }
    }
    if (updateData.accounting_period_status) {
        //if update is to close or make it future, if current is open we need to check stuff
        if (
            updateData.accounting_period_status == 2 ||
            updateData.accounting_period_status == 3
        ) {
            //check if transaction is locked
            if (
                myAccountingPeriod.accounting_period_status == 1 ||
                myAccountingPeriod.accounting_period_status == 4
            ) {
                const locked = await transaction_lock.findFirst({
                    where: {
                        lock_date: myAccountingPeriod.period_ending_date,
                    },
                    select: {
                        lock_date: true,
                    },
                });
                if (!locked) {
                    error(
                        "accounting_period_status",
                        `please lock transaction at end date of the period ur trying to close ie ${myAccountingPeriod.period_ending_date}`,
                        next
                    );
                    return false;
                }
            }
            //if current was closed or future the update isn't disallowed
        } else {
            //update data sent is to open
            if (
                myAccountingPeriod.accounting_period_status == 2 ||
                myAccountingPeriod.accounting_period_status == 3
            ) {
                //check here if everyother period is closed
                const data = await accounting_period.findFirst({
                    where: {
                        OR: [
                            { accounting_period_status: 1 },
                            { accounting_period_status: 4 },
                        ],
                    },
                    select: {
                        months: true,
                    },
                });
                if (data) {
                    error(
                        "accounting_period_status",
                        `there is already a period that's open ie ${
                            enums["months"][data.months - 1]
                        }`,
                        next
                    );
                    return false;
                }
            }
        }
    }
    try {
        await accounting_period.update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name == "document_category_id") {
            error(
                "document_category_id",
                "no material category exists with this id",
                next
            );
            return false;
        }
    }
    return { success: true };
};
const deleter = async ({ id }) => {
    try {
        await accounting_period.update({
            where: { id },
            data: { status: 1, endDate: new Date() },
        });
    } catch (e) {
        console.log(e);
        return { success: false };
    }
    return { success: true };
};

//#region Closing requests and more

/**
 *
 * @param {{id:number, accounting_period_status:number}} param0
 * @param {number} creator
 * @param {Function} next
 * @returns
 */
const isValidToChangeStatus = async (
    { id, accounting_period_status },
    creator,
    next
) => {
    const accountingPeriod = await accounting_period.findUnique({
        where: { id },
    });
    if (!accountingPeriod) {
        return { status: false };
    }
    const thisYearPeriods = await accounting_period.findMany({
        where: {
            period_starting_date: {
                gte: new Date(new Date().getFullYear(), 0, 1),
                lt: new Date(new Date().getFullYear() + 1, 0, 1),
            },
        },
    });
    return {
        status: await isPreviousPeriodClosed(thisYearPeriods, accountingPeriod),
    };
};
/**
 *
 * @param {{id:number, accounting_period_status:number}} param0
 * @param {number} creator
 * @param {Function} next
 * @returns
 */
const changeStatus = async (
    { id, accounting_period_status },
    creator,
    next
) => {
    if (!(await isValidToChangeStatus({ id }, creator, next)).status) {
        error("status", "status isn't valid for cchange", next);
        return false;
    }
    try {
        await accounting_period.update({
            where: { id },
            data: {
                revisedBy: creator,
                accounting_period_status,
            },
        });
        return { success: true };
    } catch {
        error("id", "no accounting period exists with this id", next);
        return false;
    }
};
/**
 *
 * @param {id:number} param0
 * @param {number} creator
 * @param {Function} next
 */
const processClosing = async ({ id }, creator, next) => {
    const baseCurrency = await currency.findFirst({
        where: {
            is_base_currency: true,
        },
    });
    if (!baseCurrency) {
        error(
            "currency",
            "Base Currency could not found. Please set and try again.",
            next
        );
        return false;
    }

    let closingTypeMessage = "";

    //1. if the Period is the Last Period of the Fasical Year, Make Year-End Closing, otherwise Make Month-End Closing
    const accountingPeriod = await accounting_period.findUnique({
        where: { id },
    });
    if (accountingPeriod) {
        if (accountingPeriod.period_number == 12)
            closingTypeMessage = "Year-End Closing";
        else closingTypeMessage = "Month-End Closing";

        let monthStartDate = accountingPeriod.period_starting_date;
        //last day of the month start date
        let monthEndDate = new Date(
            monthStartDate.getFullYear(),
            monthStartDate.getMonth() + 1,
            0
        );

        const periodJournals = await general_journal_detail.findMany({
            where: {
                general_journal_header: {
                    journal_date: {
                        gte: monthStartDate,
                        lte: monthEndDate,
                    },
                    journal_posting_status: 1,
                    status: 0,
                },
            },
            include: {
                general_journal_header: {
                    include: {
                        currency: true,
                    },
                },
                chart_of_account: {
                    include: {
                        account_type: {
                            include: {
                                account_category: true,
                            },
                        },
                    },
                },
            },
        });
        // #region Check if Closing is Valid
        const validationResult = await isClosingValid(
            baseCurrency,
            periodJournals,
            accountingPeriod,
            accountingPeriod.period_number == 12 ? 3 : 2,
            creator
        );
        if (!validationResult.success) {
            error("accountingPeriod", validationResult.messages, next);
            return false;
        }
        // #endregion

        return await processMonthAndYearEndClosing(
            accountingPeriod,
            creator,
            baseCurrency,
            closingTypeMessage
        );
    }
};

//#endregion

//#region helper functions(main are on the above region)
/**
 *
 * @param {import("@prisma/client").accounting_period[]} thisYearPeriods
 * @param {import("@prisma/client").accounting_period} accountingPeriod
 */
const isPreviousPeriodClosed = async (thisYearPeriods, accountingPeriod) => {
    if (accountingPeriod.period_number == 1) return true;

    //Find the previous Month
    const previousMonth = thisYearPeriods.filter(
        (ap) => ap.period_number == accountingPeriod.period_number - 1
    )[0];

    if (previousMonth) {
        if (previousMonth.accounting_period_status == 2) return true;
        else return false;
    }
    return false;
};
/**
 *
 * @param {import("@prisma/client").currency} baseCurrency
 * @param {import("@prisma/client").general_journal_detail&{
 *         general_journal_header:import("@prisma/client").general_journal_header&{
 *              currency:import("@prisma/client").currency
 *         },
 *         chart_of_account:import("@prisma/client").chart_of_account_files&{
 *              account_type:import("@prisma/client").account_type&{
 *                  account_category: import("@prisma/client").account_category
 *              }
 *         }
 * }[]} periodJournals
 * @param {import("@prisma/client").accounting_period} accountingPeriod
 * @param {number} closingType
 * @param {number} creator
 * @returns
 */
const isClosingValid = async (
    baseCurrency,
    periodJournals,
    accountingPeriod,
    closingType,
    creator
) => {
    let messages = [];

    // #region 1st Validation (Is priovious period CLOSED?)
    const thisYearPeriods = await accounting_period.findMany({
        where: {
            period_starting_date: {
                gte: new Date(
                    accountingPeriod.period_starting_date.getFullYear(),
                    0,
                    1
                ),
                lt: new Date(
                    accountingPeriod.period_starting_date.getFullYear() + 1,
                    0,
                    1
                ),
            },
        },
    });
    if (closingType == 2) {
        if (accountingPeriod) {
            if (
                accountingPeriod.period_number > 1 &&
                thisYearPeriods.length == 0
            )
                messages.push("Priovious period is NOT found");

            if (
                !(await isPreviousPeriodClosed(
                    thisYearPeriods,
                    accountingPeriod
                ))
            )
                messages.push("The priovious period is NOT closed");
        } else messages.push("The priovious period NOT found.");
    } else {
        if (
            !isAllPreviousPeriodClosed(
                thisYearPeriods.filter((p) => p.id != accountingPeriod.id)
            )
        )
            messages.push(
                "All priovious accounting period are not closed. Please close all the periods before processing Year-End Closing."
            );
    }
    // #endregion

    // #region 2nd Validation (Is Base Currency Configured)
    if (!baseCurrency) messages.push("Base Currency is not configured.");
    // #endregion

    // #region 3rd Validation (Is transaction locked throughout the system)

    if (accountingPeriod) {
        var endDateOfThePeriod = accountingPeriod.period_ending_date;

        //var transactionLocks = applicationDbContext.TransactionLocks.Where(t => endDateOfThePeriod <= t.LockDate.Date).ToList();

        if (
            !(await isTransactionLocked(endDateOfThePeriod, creator)) &&
            accountingPeriod.accounting_period_status != 4
        )
            messages.push("Transaction is not locked.");
    }

    // #endregion

    // #region 4th Validation (Are EXCHANGE RATE configured for the Period)

    if (accountingPeriod) {
        const exchangeRates = await exchange_rate.findMany({
            where: {
                date: {
                    gte: new Date(
                        accountingPeriod.period_starting_date.getFullYear(),
                        accountingPeriod.period_starting_date.getMonth(),
                        1
                    ),
                    lte: new Date(
                        accountingPeriod.period_starting_date.getFullYear(),
                        accountingPeriod.period_starting_date.getMonth() + 1,
                        0
                    ),
                },
                status: 0,
            },
        });
        const foreignCurrecies = periodJournals
            .filter(
                (elem) =>
                    elem.general_journal_header.currency_id != baseCurrency.id
            )
            .map((elem) => elem.general_journal_header.currency);

        if (foreignCurrecies.length > 0) {
            if (exchangeRates.length == 0)
                messages.push(
                    "Exchange rate is NOT configured for this Period."
                );
            else {
                const currencyNotFound = foreignCurrecies.filter(
                    (elem) =>
                        !exchangeRates.find((eR) => eR.currency_id == elem.id)
                );

                if (currencyNotFound.length > 0)
                    messages.push(
                        `There are foriegn currecy in the transaction which has no Exchange rate: (${currencyNotFound.map(
                            (elem) => elem.currency_code
                        )})`
                    );
            }
        }
    }
    // #endregion

    if (messages.length > 0) return { success: false, messages };

    return { success: true };
};
/**
 *
 * @param {import("@prisma/client").accounting_period[]} periods
 */
const isAllPreviousPeriodClosed = (periods) => {
    for (let i in periods) {
        const period = periods[i];
        if (period.accounting_period_status != 2) return false;
    }
    return true;
};
/**
 *
 * @param {Date} transactionRecordDate
 * @param {number} creator id of user
 * @returns
 */
const isTransactionLocked = async (transactionRecordDate, creator) => {
    //1. Is Super user
    let lockTransaction = true;
    if (await authorization.isUserSuper(creator)) {
        lockTransaction = true;
    }

    if (lockTransaction) {
        //2. Check if Transaction has locked at the intended record date
        const transactionLock = await transaction_lock.findFirst({
            where: {
                status: 0,
                lock_date: {
                    lte: transactionRecordDate,
                },
            },
        });
        if (!transactionLock) lockTransaction = false;
    }

    return lockTransaction;
};
/**
 *
 * @param {import("@prisma/client").accounting_period} accountingPeriod
 * @param {number} creator
 * @param {import("@prisma/client").currency} baseCurrency
 * @param {string} closingTypeMessage
 */
const processMonthAndYearEndClosing = async (
    accountingPeriod,
    creator,
    baseCurrency,
    closingTypeMessage
) => {
    let messageList = [];
    let accountingPeriodForClosing = [];

    let monthStartDate, monthEndDate;

    if (accountingPeriod.is_current_posting_period)
        accountingPeriodForClosing.push(accountingPeriod);
    else
        accountingPeriodForClosing = await getAccountingPeriodInvolveInClosing(
            accountingPeriod
        );
    if (!accountingPeriodForClosing.length) {
        messageList.push("Accounting period not found");
        error(
            `${closingTypeMessage} is not successfully processed, Please correct the error/s and try again.`,
            messageList,
            next
        );
        return false;
    }

    let generalJournalDetail = {};
    let openingBalanceAccount = {};

    //1. GET all Posted Transaction of this Specific Month
    //2. GROUP By Chart of Account
    //3. LOOP through the Group and CALCULATE sum of transactions during the Period (Identify if it is DEBIT or CREDIT)
    //4. Get the Opening balance of that Period
    //4. ADD the amount with opening balance of that period
    //5. GIVE the sum as opening balance of the Next Period and CHANGE the status of the NEXT Period to OPEN
    //6. CHANGE the status of the Current Period to CLOSED

    let periodOpeningBalance,
        nextPeriodAccountOpeningBalance,
        existingOpeningBalance;
    let journalsWithBCY = [],
        journalsWithFCY = [];
    let transactionAccountAmountDuringThePeriodInBCY = 0,
        transactionAccountAmountDuringThePeriodInFCY = 0,
        nextPeriodOpeningBalanceAmount = 0;
    let accountOpeningBalanceOfThisPeriod;

    //Collect all Chart of Account
    const chartOfAccounts = await chart_of_account.findMany({
        where: { status: 0 },
        include: { account_type: { include: { account_category: true } } },
    });
    let netIncome = 0.0;
    if (accountingPeriod.is_year_end_closing) {
        netIncome = await getNetIncome(
            accountingPeriod.period_starting_date,
            period_ending_date
        );
        const periodJournals = await general_journal_detail.findMany({
            where: {
                general_journal_header: {
                    journal_date: {
                        gte: accountingPeriod.period_starting_date,
                        lte: accountingPeriod.period_ending_date,
                    },
                    journal_posting_status: 1,
                    status: 0,
                },
            },
            include: {
                general_journal_header: {
                    include: {
                        currency: true,
                    },
                },
                chart_of_account: {
                    include: {
                        account_type: {
                            include: {
                                account_category: true,
                            },
                        },
                    },
                },
            },
        });

        const periodOpeningBalance = await opening_balance.findFirst({
            where: accountingPeriod.is_year_end_closing
                ? {
                      opening_balance_date: {
                          gte: new Date(
                              accountingPeriod.period_starting_date.getFullYear(),
                              1,
                              1
                          ),
                          lt: new Date(
                              accountingPeriod.period_starting_date.getFullYear() +
                                  1,
                              1,
                              1
                          ),
                      },
                  }
                : {
                      opening_balance_date: {
                          gte: new Date(
                              accountingPeriod.period_starting_date.getFullYear(),
                              accountingPeriod.period_starting_date.getMonth(),
                              1
                          ),
                          lt: new Date(
                              accountingPeriod.period_starting_date.getFullYear(),
                              accountingPeriod.period_starting_date.getMonth() +
                                  1,
                              1
                          ),
                      },
                  },
            include: {
                opening_balance_account: {
                    include: {
                        chart_of_account: {
                            include: {
                                account_type: {
                                    include: {
                                        account_category,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        let nextPeriodAccountOpeningBalance = {
            opening_balance_date: new Date(
                accountingPeriod.period_starting_date.getFullYear() + 1,
                accountingPeriod.period_starting_date.getMonth(),
                accountingPeriod.period_starting_date.getDate()
            ),
            month: accountingPeriod.period_starting_date.getMonth(),
            price_precision: periodOpeningBalance
                ? periodOpeningBalance.price_precision
                : 2,
            createdBy: `${creator}`,
            revisedBy: `${creator}`,

            isProtectedForEdit: true,
            status: 0,
            startDate: new Date(),
            endDate: new Date("9999/12/31"),
        };
        let openingBalanceAccounts = [];
        for (let i in chartOfAccounts) {
            const account = chartOfAccounts[i];
            transactionAccountAmountDuringThePeriodInBCY = 0.0;
            transactionAccountAmountDuringThePeriodInFCY = 0.0;
            nextPeriodOpeningBalanceAmount = 0.0;

            journalsWithBCY = periodJournals.filter(
                (j) =>
                    j.chart_of_account_id == account.id &&
                    j.general_journal_header.currency_id == baseCurrency.id
            );
            journalsWithFCY = periodJournals.filter(
                (j) =>
                    j.chart_of_account_id == account.id &&
                    j.general_journal_header.currency_id != baseCurrency.id
            );

            //Amount in FOREIGN CURRENCY
            if (journalsWithFCY.length > 0)
                transactionAccountAmountDuringThePeriodInFCY =
                    await convertJournalTransactionToBaseCurrency(
                        journalsWithFCY,
                        baseCurrency
                    );

            //Amount in BASE CURRENCY
            transactionAccountAmountDuringThePeriodInBCY =
                getTotalDebitAmount(journalsWithBCY, account) +
                getTotalCreditAmount(journalsWithBCY, account);

            const accountOpeningBalanceOfThisPeriod =
                periodOpeningBalance?.opening_balance_account.find(
                    (ob) => ob.chart_of_account_id == account.id
                );

            nextPeriodOpeningBalanceAmount =
                transactionAccountAmountDuringThePeriodInBCY +
                transactionAccountAmountDuringThePeriodInFCY;

            if (accountOpeningBalanceOfThisPeriod)
                nextPeriodOpeningBalanceAmount =
                    nextPeriodOpeningBalanceAmount +
                    getOpeningBalanceAmount(accountOpeningBalanceOfThisPeriod);

            //Collect Next Period Opening Balance
            openingBalanceAccounts.push(
                constructOpeningBalanceAccountForNextPeriod(
                    nextPeriodOpeningBalanceAmount,
                    account,
                    creator,
                    baseCurrency.id
                )
            );
        }
        if (openingBalanceAccounts.length) {
            if (!periodOpeningBalance)
                await opening_balance.create({
                    data: {
                        ...nextPeriodAccountOpeningBalance,
                        opening_balance_account: {
                            createMany: {
                                skipDuplicates: true,
                                data: openingBalanceAccounts,
                            },
                        },
                    },
                });
            else {
                for (let i in openingBalanceAccounts) {
                    const newOpeningBalanceAccount = openingBalanceAccounts[i];
                    if (newOpeningBalanceAccount) {
                        let existingOpeningBalanceAccount =
                            periodOpeningBalance.opening_balance_account.find(
                                (a) =>
                                    a.chart_of_account_id ==
                                    newOpeningBalanceAccount.chart_of_account_id
                            );

                        if (existingOpeningBalanceAccount) {
                            //EDIT if exist
                            if (
                                existingOpeningBalanceAccount.chart_of_account
                                    .account_type.account_category.name ==
                                    "Income" ||
                                existingOpeningBalanceAccount.chart_of_account
                                    .account_type.account_category.name ==
                                    "Expense"
                            ) {
                                // Make Temporary Account ZERO if Year-End Closing
                                existingOpeningBalanceAccount.amount_debit = 0;
                                existingOpeningBalanceAccount.amount_credit = 0;
                            } else if (
                                existingOpeningBalanceAccount.chart_of_account
                                    .account_name == "RetainedEarnings"
                            ) {
                                var totalAmount =
                                    netIncome +
                                    getOpeningBalanceAmount(
                                        existingOpeningBalanceAccount
                                    );

                                if (totalAmount > 0) {
                                    existingOpeningBalanceAccount.amount_credit =
                                        Math.abs(totalAmount);
                                    existingOpeningBalanceAccount.debit_or_credit =
                                        JournalEntryType.Credit;
                                } else {
                                    existingOpeningBalanceAccount.amount_credit =
                                        Math.abs(totalAmount);
                                    existingOpeningBalanceAccount.debit_or_credit = 2;
                                }
                            } else {
                                var amount = await getOpeningBalanceAmount(
                                    newOpeningBalanceAccount,
                                    existingOpeningBalanceAccount.chart_of_account
                                );
                                //jumped here to make getOpeningBalanceAmount (accounting period version(accepts two arguments))
                                //code stopped here
                                var result =
                                    await generalJournalDetail.IdentifyAndReturnCreditOrDebitAmount(
                                        existingOpeningBalanceAccount.chart_of_account,
                                        amount
                                    );

                                if (result.Item1 != 0) {
                                    existingOpeningBalanceAccount.AmountDebit =
                                        Math.Abs(result.Item1);
                                    existingOpeningBalanceAccount.AmountCredit = 0;
                                    existingOpeningBalanceAccount.DebitOrcredit =
                                        JournalEntryType.Debit;
                                } else {
                                    existingOpeningBalanceAccount.AmountCredit =
                                        Math.Abs(result.Item2);
                                    existingOpeningBalanceAccount.AmountDebit = 0;
                                    existingOpeningBalanceAccount.DebitOrcredit =
                                        JournalEntryType.Credit;
                                }
                            }
                        } //ADD if not exist
                        else {
                            if (
                                existingOpeningBalanceAccount.ChartOfAccount
                                    .AccountType.AccountCategory.Name ==
                                    EnumeratorExtension.GetDescription(
                                        ChartOfAccountCategory.Income
                                    ) ||
                                existingOpeningBalanceAccount.ChartOfAccount
                                    .AccountType.AccountCategory.Name ==
                                    EnumeratorExtension.GetDescription(
                                        ChartOfAccountCategory.Expense
                                    )
                            ) {
                                // Make Temporary Account ZERO if Year-End Closing
                                newOpeningBalanceAccount.AmountDebit = 0;
                                newOpeningBalanceAccount.AmountCredit = 0;
                            }
                            periodOpeningBalance.OpeningBalanceAccounts.Add(
                                newOpeningBalanceAccount
                            );
                        }
                    }
                }
            }

            if (applicationDbContext.SaveChanges() > 0) {
                // #region Close the Currect Period
                if (
                    !(await ChangePeriodStatus(
                        accountingPeriod.PeriodStartingDate,
                        AcountingPeriodStatus.Closed,
                        userName,
                        false
                    ))
                ) {
                    messageList.Add(
                        `Failed to change {accountingPeriod.PeriodMonth.GetDescription()} Period status to CLOSE and Transaction has been rollback.`
                    );
                    transaction.Rollback();
                }
                // #endregion

                // #region Open the next Accounting Period

                if (
                    !(await ChangePeriodStatus(
                        accountingPeriod.PeriodStartingDate.AddYears(1),
                        AcountingPeriodStatus.Open,
                        userName,
                        true
                    ))
                ) {
                    messageList.Add(
                        `Failed to change {Enum.GetName(typeof(Months), nextPeriodAccountOpeningBalance.Month)} Period status to OPEN and Transaction has been rollback.`
                    );
                    transaction.Rollback();
                }

                // #endregion
            } else {
                messageList.Add(
                    `Failed to Save Opening Balance for {Enum.GetName(typeof(Months), nextPeriodAccountOpeningBalance.Month)} Period and Transaction has been rollback. It seems that there is NO change to close in this period.`
                );

                transaction.Rollback();
            }
        }
    }
};
/**
 *
 * @param {number} nextPeriodOpeningBalance
 * @param {import("@prisma/client").chart_of_account & {
 *   account_type: import("@prisma/client").account_type & {
 *       account_category: import("@prisma/client").account_category;
 *   };
 *}} account
 * @param {number} creator
 * @param {number} baseCurrencyId
 */
const constructOpeningBalanceAccountForNextPeriod = (
    nextPeriodOpeningBalance,
    account,
    creator,
    baseCurrencyId
) => {
    let openingBalanceAccount = {
        chart_of_account_id: account.id,
        currency_id: baseCurrencyId,
        status: 0,
        createdBy: `${creator}`,
        revisedBy: `${creator}`,
        startDate: new Date(),
        endDate: new Date("9999/12/31"),
        isProtectedForEdit: false,
    };
    if (account.account_type.account_category.is_debit) {
        if (nextPeriodOpeningBalance < 0) {
            openingBalanceAccount.debit_or_credit = 1;
            openingBalanceAccount.amount_credit = Math.abs(
                nextPeriodOpeningBalance
            );
        } else if (nextPeriodOpeningBalance > 0) {
            openingBalanceAccount.debit_or_credit = 2;
            openingBalanceAccount.amount_debit = Math.abs(
                nextPeriodOpeningBalance
            );
        }
    } else {
        if (nextPeriodOpeningBalance < 0) {
            openingBalanceAccount.debit_or_credit = 2;
            openingBalanceAccount.amount_debit = Math.abs(
                nextPeriodOpeningBalance
            );
        } else if (nextPeriodOpeningBalance > 0) {
            openingBalanceAccount.debit_or_credit = 1;
            openingBalanceAccount.amount_credit = Math.abs(
                nextPeriodOpeningBalance
            );
        }
    }

    return openingBalanceAccount;
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 */
const getNetIncome = async (startDate, endDate) => {
    let operatingIncomeBalance = 0.0,
        netProfitOrLoss = 0.0;

    let grossProfit = 0.0;
    let operatingProfit = 0.0;

    const openingBalance = await opening_balance.findFirst({
        where: {
            opening_balance_date: {
                gte: new Date(new Date().getFullYear(), 0, 1),
                lt: new Date(new Date().getFullYear() + 1, 0, 1),
            },
        },
        include: {
            opening_balance_account: {
                where: {
                    OR: [
                        { amount_credit: { gt: 0 } },
                        { amount_debit: { gt: 0 } },
                    ],
                },
                include: {
                    chart_of_account: {
                        include: {
                            account_type: {
                                include: {
                                    account_category: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const journals = await general_journal_detail.findMany({
        where: {
            general_journal_header: {
                journal_date: {
                    gte: startDate,
                    lte: endDate,
                },
                OR: [{ report_basis: 1 }, { report_basis: 2 }],
                journal_posting_status: 1,
                status: 0,
            },
        },
        include: {
            general_journal_header: true,
            chart_of_account: {
                include: {
                    account_type: {
                        include: {
                            account_category: true,
                        },
                    },
                },
            },
        },
    });
    //Select Account Types configured under BALANCE SHEET report Sections
    const accountTypesInsideBalanceSheetReportSections =
        await account_type_financial_statement_section.findMany({
            where: {
                financial_statement_section: {
                    financial_statement_type: 1,
                },
            },
            include: {
                financial_statement_section: true,
                account_type: true,
            },
        });

    //Group Account Type under it's section
    const otherKeys = accountTypesInsideBalanceSheetReportSections.length
        ? Object.keys(accountTypesInsideBalanceSheetReportSections[0])
        : [];
    const accountTypesGroupedUnderReportSectionsObj = groupByFn(
        ["financial_statement_section_id"],
        accountTypesInsideBalanceSheetReportSections,
        otherKeys
    );
    let accountTypesGroupedUnderReportSections = [];
    for (let i in accountTypesGroupedUnderReportSectionsObj) {
        accountTypesGroupedUnderReportSections.push(
            accountTypesGroupedUnderReportSectionsObj[i].otherKeys
        );
    }

    //Sort Them by Sequence Number
    accountTypesGroupedUnderReportSections.sort(
        (a, b) =>
            a[0].financial_statement_section.sequence_on_report -
            b[0].financial_statement_section.sequence_on_report
    );

    let financialStatementSection = {};

    let nonOperatingIncomeAmount = 0.0;

    //Loop through the Report Sections
    for (let i in accountTypesGroupedUnderReportSections) {
        const accountTypeUnderReportSection =
            accountTypesGroupedUnderReportSections[i];
        financialStatementSection =
            accountTypeUnderReportSection[0]?.financial_statement_section;

        const journalsOfTheReportSectionAccounts = journals.filter(
            (j) =>
                accountTypeUnderReportSection.filter(
                    (at) =>
                        at.account_type_id == j.chart_of_account.account_type_id
                ).length
        );

        const incomeStatementAccounts = await getAccounts(
            journalsOfTheReportSectionAccounts,
            openingBalance
        );

        if (financialStatementSection.sequence_on_report == 1)
            operatingIncomeBalance =
                incomeStatementAccounts.reportSectionTotalAmount;
        else if (financialStatementSection.sequence_on_report == 2) {
            //Substract Profit Tax (30 % of gross profit), APPLY THIS IN YEAR-END CLOSING
            grossProfit =
                operatingIncomeBalance -
                incomeStatementAccounts.reportSectionTotalAmount; //Oprating Income - Cost of goods sold
        } else if (financialStatementSection.sequence_on_report == 3)
            operatingProfit =
                grossProfit - incomeStatementAccounts.reportSectionTotalAmount;
        //Gross profit - Operating Expense
        else if (financialStatementSection.sequence_on_report == 4)
            nonOperatingIncomeAmount =
                incomeStatementAccounts.reportSectionTotalAmount;
        else if (financialStatementSection.sequence_on_report == 5)
            netProfitOrLoss =
                operatingProfit -
                (nonOperatingIncomeAmount +
                    incomeStatementAccounts.reportSectionTotalAmount);
    }

    //netProfitOrLoss is Profit before Tax

    //	Profit Tax(30 % of gross profit)  APPLY THIS IN YEAR-END CLOSING

    return netProfitOrLoss;
};
/**
 *
 * @param {import("@prisma/client").accounting_period} accountingPeriod
 */
const getAccountingPeriodInvolveInClosing = async (accountingPeriod) => {
    // #region 2. Get all Accounting Periods including the period you are trying to close but except the Current Opened Period
    const accountingPeriods = await accounting_period.findMany({
        where: {
            period_starting_date: {
                gte: new Date(
                    accountingPeriod.period_starting_date.getFullYear(),
                    1,
                    1
                ),
                lt: new Date(
                    accountingPeriod.period_starting_date.getFullYear() + 1,
                    1,
                    1
                ),
            },
            status: 0,
        },
    });
    let involvedAccountingPeriods = [];
    const currentPeriod = accountingPeriods.find(
        (p) => p.is_current_posting_period
    );

    for (let i in accountingPeriods) {
        const period = accountingPeriods[i];
        if (
            period?.period_number >= accountingPeriod.period_number &&
            period?.period_number < currentPeriod?.period_number
        )
            involvedAccountingPeriods.push(period);
    }
    // #endregion

    return involvedAccountingPeriods;
};
//#endregion

module.exports = {
    post,
    get,
    patch,
    deleter,
    isValidToChangeStatus,
    changeStatus,
};
