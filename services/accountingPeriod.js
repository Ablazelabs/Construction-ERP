const { error, allModels } = require("../config/config");
const authorization = require("../validation/auth");

const {
    accounting_period,
    transaction_lock,
    exchange_rate,
    general_journal_detail,
    currency,
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

/**
 *
 * @param {Array<import("@prisma/client").general_ledger & {general_journal_header:import("@prisma/client").general_journal_header}>} generalLedgerWithFCY
 * @param {Function} getTotalCreditAmount
 * @param {Function} getTotalDebitAmount
 * @returns
 */
const convertGeneralLedgerToBaseCurrency = async (
    generalLedgerWithFCY,
    getTotalCreditAmount,
    getTotalDebitAmount
) => {
    const minMaxDates = generalLedgerWithFCY.map(({ general_journal_header }) =>
        general_journal_header.journal_date.getTime()
    );
    const startDate = new Date(Math.min(...minMaxDates));
    const endDate = new Date(Math.max(...minMaxDates));

    const exchangeRates = await exchange_rate.findMany({
        where: {
            status: 0,
            date: {
                gt: new Date(startDate.getFullYear(), startDate.getMonth(), 0),
                lt: new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0),
            },
        },
    });
    let amountInFCY = 0;
    let amountInBCY = 0;
    let totalAmountInBCY = 0;

    for (let i in generalLedgerWithFCY) {
        const journal = generalLedgerWithFCY[i];
        amountInFCY = 0;
        amountInBCY = 0;

        const exchangeRate = exchangeRates.find(
            (elem) =>
                elem.date.getFullYear() ==
                    journal.general_journal_header.journal_date.getFullYear() &&
                elem.date.getMonth() ==
                    journal.general_journal_header.journal_date.getMonth() &&
                elem.currency_id == journal.general_journal_header.currency_id
        );

        if (exchangeRate) {
            amountInFCY =
                getTotalDebitAmount([journal], journal.chart_of_account) +
                getTotalCreditAmount([journal], journal.chart_of_account);
            amountInBCY = amountInFCY * exchangeRate.rate;
        }
        totalAmountInBCY += amountInBCY;
    }

    return totalAmountInBCY;
};

/**
 *
 * @param {Array<import("@prisma/client").general_ledger & {general_journal_header:import("@prisma/client").general_journal_header}>} journalsWithFCY
 * @param {Function} getTotalCreditAmount
 * @param {Function} getTotalDebitAmount
 * @returns
 */
const convertJournalTransactionToBaseCurrency = async (
    journalsWithFCY,
    getTotalCreditAmount,
    getTotalDebitAmount
) => {
    return await convertGeneralLedgerToBaseCurrency(
        journalsWithFCY,
        getTotalCreditAmount,
        getTotalDebitAmount
    );
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

        var monthStartDate = accountingPeriod.period_starting_date;
        //last day of the month start date
        var monthEndDate = new Date(
            monthStartDate.getFullYear(),
            monthStartDate.getMonth() + 1,
            0
        );

        var periodJournals = await general_journal_detail.findMany({
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
            periodJournals,
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
 * @param {string} closingTypeMessage
 */
const processMonthAndYearEndClosing = async (
    accountingPeriod,
    creator,
    baseCurrency,
    periodJournals,
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
    //jumped GetAccountingPeriodInvolveInClosing
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
    let openingBalance = {};
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
    // List<ChartOfAccount> chartOfAccounts = applicationDbContext.ChartOfAccounts.Include("AccountType.AccountCategory").Where(a => a.Status == RecordStatus.Active).ToList();
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
    convertGeneralLedgerToBaseCurrency,
    convertJournalTransactionToBaseCurrency,
    isValidToChangeStatus,
    changeStatus,
};
