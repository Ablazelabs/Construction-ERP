const { allModels, error, COMPANY_NAME } = require("../config/config");
const {
    convertGeneralLedgerToBaseCurrency,
    convertJournalTransactionToBaseCurrency,
} = require("./accountingPeriod");
const { groupByFn } = require("./payrollControl");
const {
    general_ledger,
    opening_balance,
    currency,
    general_journal_detail,
    financial_settings,
    chart_of_account,
} = allModels;
const xlsx = require("node-xlsx");
const pdf = require("pdf-creator-node");

//--------------------------------------------------------General Ledger Export------------------------------------------------------------------------
/**
 *
 * @param {{
 *  dateRange: Array<Date>,
 *  reportBasis: number,
 *  dateFormat: string,
 *  exportAs: string
 *}} reqBody
 * @param {number} creator
 * @param {Function} next
 * @returns
 */
const generalLedgerExport = async (
    { dateRange, dateFormat, exportAs, reportBasis },
    creator,
    next
) => {
    const generalLedgerFilterAttributes = {
        fromDate: dateRange[0],
        toDate: dateRange[1],
        dateFormat,
        reportBasis,
    };
    const generalLedgers = await getGeneralLedgers(
        generalLedgerFilterAttributes
    );
    if (exportAs === "xlsx") {
        return ledgerBuildExcel(generalLedgers);
    } else {
        const document = {
            data: {},
            path: "./output.pdf",
            type: "buffer",
        };
        const options = {
            format: "A3",
            orientation: "portrait",
            border: "10mm",
        };
        return await pdf.create(
            { ...document, html: getHtmlGeneralLedger(generalLedgers) },
            options
        );
    }
};
/**
 *
 * @param {{
 *       generalLedgerList: {
 *           chartOfAccountId: number;
 *           accountName: string;
 *           accountCode: string;
 *           creditTotal: string;
 *           debitTotal: string;
 *           balance: string;
 *           isNegative: boolean;
 *       }[];
 *       companyName: string;
 *       reportTitle: string;
 *       reportType: string;
 *       reportDateRange: string;
 *   }} model
 */
const getHtmlGeneralLedger = (model) => {
    let addedRows = "";
    for (let i in model.generalLedgerList) {
        const item = model.generalLedgerList[i];
        addedRows += `
                <tr>
                    <td>${parseInt(i) + 1}</td>
                    <td>
                        ${item.accountName}
                    </td>
                    <td>
                        <span> ${
                            item.debitTotal
                        } </span>                                    
                    </td>
                    <td>
                        <span> ${
                            item.creditTotal
                        } </span>                                    
                    </td>
                    <td>
                           <span> ${
                               item.isNegative
                                   ? item.balance
                                   : `(${item.balance})`
                           } </span> 
                    </td>
                </tr>`;
    }
    return (
        `
    <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
          asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
          asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
          <style>
              body{padding-top:50px;padding-bottom:20px}.body-content{padding-left:15px;padding-right:15px}.carousel-caption p{font-size:20px;line-height:1.4}.carousel-inner .item img[src$=".svg"]{width:100%}#qrCode{margin:15px}@media screen and (max-width:767px){.carousel-caption{display:none}}
          </style>


<section class="content-header">
    <div class="container-fluid text-center">
        <h6>${model?.companyName}</h6>
        <h5>${model?.reportTitle}</h5>
        <small class="text-center">${model?.reportType}</small><br />
        <h6>${model?.reportDateRange}</h6>
    </div>
</section>


<section class="content" style="background-color:white">
    <div class="box-body table-responsive no-padding">

        <table id="tblGeneralLedger" class="table table-hover">
            <thead>
                <tr>
                    <td>No. </td>
                    <th>Account Name</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>` +
        addedRows +
        `</tbody>
        </table>
        <div>
            <br />
            @Html.DisplayName("**Amount is displayed in your base currency")
            <span class="right badge badge-success">ETB</span>
        </div>

    </div>
</section>
`
    );
};
/**
 *
 * @param {{
 *       generalLedgerList: {
 *           chartOfAccountId: number;
 *           accountName: string;
 *           accountCode: string;
 *           creditTotal: string;
 *           debitTotal: string;
 *           balance: string;
 *           isNegative: boolean;
 *       }[];
 *       companyName: string;
 *       reportTitle: string;
 *       reportType: string;
 *       reportDateRange: string;
 *   }} generalLedgers
 */
const ledgerBuildExcel = (generalLedgers) => {
    const sheetOptions = {
        "!col": [
            { wpx: 20 },
            { wpx: 15 },
            { wpx: 20 },
            { wpx: 10 },
            { wpx: 10 },
            { wpx: 10 },
        ],
    };
    let dataSheet = [
        [
            "name",
            "account_code",
            "account_id",
            "credit_total",
            "debit_total",
            "balance",
            "is_debit",
        ],
    ];
    for (let i in generalLedgers.generalLedgerList) {
        const row = generalLedgers.generalLedgerList[i];
        dataSheet.push([
            row.accountName,
            row.accountCode,
            row.chartOfAccountId,
            row.creditTotal,
            row.debitTotal,
            row.balance,
            row.isNegative,
        ]);
    }
    const buffer = xlsx.build([
        {
            name: "sheet 1",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};
/**
 *
 * @param {{
 *   fromDate: Date;
 *   toDate: Date;
 *   dateFormat: string;
 *   reportBasis: number;
 *}} filter
 */
const getGeneralLedgers = async (filter) => {
    const generalLedgers = await general_ledger.findMany({
        where: {
            journal_date: {
                gte: filter.fromDate,
                lte: filter.toDate,
            },
            general_journal_header: {
                OR:
                    filter.reportBasis == 3
                        ? [{ report_basis: 1 }, { report_basis: 2 }]
                        : [{ report_basis: filter.reportBasis }],
            },
            ledger_status: 1,
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
            general_journal_header: true,
        },
    });
    let openingBalance = await opening_balance.findFirst({
        where: {
            opening_balance_date: {
                gte: new Date(
                    filter.fromDate.getFullYear(),
                    filter.fromDate.getMonth(),
                    1
                ),
                lte: new Date(
                    filter.fromDate.getFullYear(),
                    filter.fromDate.getMonth() + 1,
                    0
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
                                    account_category: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    }); //TODO can not include what isnt in schema
    if (openingBalance.opening_balance_account.length) {
        openingBalance.opening_balance_account =
            openingBalance.opening_balance_account.filter(
                ({ amount_credit, amount_debit }) =>
                    amount_credit > 0 || amount_debit > 0
            );
    }
    return await prepareGeneralLedgers(generalLedgers, openingBalance, filter);
};
/**
 *
 * @param {Array<import("@prisma/client").general_ledger & {
 *   general_journal_header: import("@prisma/client").general_journal_header,
 *   chart_of_account: import("@prisma/client").chart_of_account & {
 *       account_type: import("@prisma/client").account_type &{
 *           account_category: import("@prisma/client").account_category;
 *       }
 *  }}>} generalLedgers
 * @param {import("@prisma/client").opening_balance & {
 *  opening_balance_account:Array<import("@prisma/client").opening_balance_account & {
 *      chart_of_account:import("@prisma/client").chart_of_account &{
 *          account_type:import("@prisma/client").account_type &{
 *              account_category: import("@prisma/client").account_category
 *          }
 *      }
 *  }>
 * }} openingBalance
 * @param {{
 *   fromDate: Date,
 *   toDate: Date,
 *   dateFormat: string,
 *   reportBasis: number,
 *}} filter
 */
const prepareGeneralLedgers = async (
    generalLedgers,
    openingBalance,
    filter
) => {
    let generalLedgerList;
    if (generalLedgers.length) {
        const otherKeys = Object.keys(generalLedgers[0]).filter(
            (elem) => elem != "chart_of_account_id"
        );
        const groupedGeneralLedgers = groupByFn(
            ["chart_of_account_id"],
            generalLedgers,
            otherKeys,
            false
        );
        //#region
        const openingBalanceStartDate = new Date(
            filter.fromDate.getFullYear(),
            filter.fromDate.getMonth(),
            1
        );
        let journalsFromOpeningBalanceDateToSearchStartDate = [];

        if (filter.fromDate.getDate() > 1)
            journalsFromOpeningBalanceDateToSearchStartDate =
                await general_ledger.findMany({
                    where: {
                        journal_date: {
                            gte: openingBalanceStartDate,
                            lt: filter.fromDate,
                        },
                        general_journal_header: {
                            OR:
                                filter.reportBasis == 3
                                    ? [{ report_basis: 1 }, { report_basis: 2 }]
                                    : [{ report_basis: filter.reportBasis }],
                            journal_posting_status: 1,
                        },
                        ledger_status: 1,
                    },
                    include: {
                        general_journal_header: true,
                    },
                });
        //#endregion
        const baseCurrency = await currency.findFirst({
            where: { is_base_currency: true },
        });
        let totalAmount = 0.0;
        let amountDueToExchangeRate;
        let account;
        let accountWithFCY = [];
        let journalsWithFCY = [];
        for (let i in groupedGeneralLedgers) {
            const generalLedger = groupedGeneralLedgers[i];
            if (generalLedger.otherKeys.length) {
                amountDueToExchangeRate = 0;
                account = generalLedger.otherKeys[0].chart_of_account;
                journalsWithFCY =
                    journalsFromOpeningBalanceDateToSearchStartDate.filter(
                        (elem) =>
                            elem.chart_of_account_id === account.id &&
                            elem.general_journal_header.currency_id !==
                                baseCurrency.id
                    );
                /**
                 * other keys contains list of objects with the same chart of account id in this case( bear in mind the objects don't have the chart of account key( u can get that from genralLedger.chart_of_account_id))
                 */
                accountWithFCY = generalLedger.otherKeys.filter(
                    (elem) =>
                        elem.general_journal_header.currency_id !=
                        baseCurrency.id
                );
                journalsWithFCY = [...journalsWithFCY, ...accountWithFCY];
                if (journalsWithFCY.length) {
                    amountDueToExchangeRate =
                        await convertGeneralLedgerToBaseCurrency(
                            journalsWithFCY.map((elem) => {
                                return {
                                    ...elem,
                                    chart_of_account_id:
                                        generalLedger.chart_of_account_id,
                                };
                            }),
                            getTotalDebitAmount,
                            getTotalCreditAmount
                        );
                }
                const baseCurrencyLedgers = generalLedger.otherKeys.filter(
                    (elem) =>
                        elem.general_journal_header.currency_id ==
                        baseCurrency.id
                );
                totalAmount =
                    getOpeningBalanceAmount(openingBalance, account.id) +
                    getTotalCreditAmount(baseCurrencyLedgers, account) +
                    getTotalDebitAmount(baseCurrencyLedgers, account) +
                    amountDueToExchangeRate;
                const amount = identifyAndReturnCreditOrDebitAmount(
                    account,
                    totalAmount
                );
                const pushed = {
                    chartOfAccountId: parseInt(account.id),
                    accountName: `${account.account_name}`,
                    accountCode: `${account.account_code}`,
                    creditTotal:
                        amount.creditAmount > 0
                            ? `${Math.abs(amount.creditAmount)}`
                            : amount.debitAmount > 0
                            ? ""
                            : `${Math.abs(amount.creditAmount)}`,
                    debitTotal:
                        amount.debitAmount > 0
                            ? `${Math.abs(amount.debitAmount)}`
                            : "",
                    balance: `${Math.abs(totalAmount)}`,
                    isNegative: totalAmount < 0,
                };
                if (!generalLedgerList) generalLedgerList = [pushed];
                else generalLedgerList.push(pushed);
            }
        }
    }
    //         public class GeneralLedgers
    // {
    //     public string CompanyName { get; set; }
    //     public string ReportTitle { get; set; }
    //     public string ReportType { get; set; }
    //     public string ReportDateRange { get; set; }
    //     public List<GeneralLedgerViewModel> GeneralLedgerList { get; set; }
    // }
    if (generalLedgerList.length) {
        generalLedgerList.sort((a, b) => a.accountName.localeCompare(b));
    }
    const returned = {
        generalLedgerList,
        companyName: COMPANY_NAME,
        reportTitle: "General Ledger",
        reportType: `${"REPORT_BASIS_TITLE"} ${
            ["accrual", "cash", "both"][filter.reportBasis - 1]
        }`,
        reportDateRange: `From ${filter.fromDate.toDateString()} To ${filter.toDate.toDateString()}`,
    };
    return returned;
};
/**
 *
 * @param { import("@prisma/client").chart_of_account&{
 *     account_type:import("@prisma/client").account_type  &{
 *     account_category: import("@prisma/client").account_category
 *     }
 * } } account
 * @param {number} amount
 * @returns
 */
const identifyAndReturnCreditOrDebitAmount = (account, amount) => {
    let debitAmount = 0,
        creditAmount = 0;

    if (account.account_type.account_category.is_debit) {
        if (amount < 0) {
            creditAmount = amount;
            debitAmount = 0;
        } else {
            debitAmount = amount;
            creditAmount = 0;
        }
    } else {
        if (amount < 0) {
            creditAmount = 0;
            debitAmount = amount;
        } else {
            debitAmount = 0;
            creditAmount = amount;
        }
    }

    return { creditAmount, debitAmount };
};
/**
 *
 * @param {import("@prisma/client").opening_balance & {
 *  opening_balance_account:Array<import("@prisma/client").opening_balance_account & {
 *      chart_of_account:import("@prisma/client").chart_of_account &{
 *          account_type:import("@prisma/client").account_type &{
 *              account_category: import("@prisma/client").account_category
 *          }
 *      }
 *  }>
 * }} openingBalance
 * @param {number} chartOfAccountId
 * @returns
 */
const getOpeningBalanceAmount = (openingBalance, chartOfAccountId) => {
    if (openingBalance?.opening_balance_account.length) {
        const openingBalanceAccount =
            openingBalance.opening_balance_account.find(
                (ob) => ob.chart_of_account_id == chartOfAccountId
            );

        if (openingBalanceAccount) {
            if (
                openingBalanceAccount.chart_of_account.account_type
                    .account_category.is_debit
            )
                return openingBalanceAccount.debit_or_credit == 2
                    ? openingBalanceAccount.amount_debit
                    : -openingBalanceAccount.amount_credit;
            else
                return openingBalanceAccount.debit_or_credit == 1
                    ? openingBalanceAccount.amount_credit
                    : -openingBalanceAccount.amount_debit;
        }
    }
    return 0;
};
const getTotalDebitAmount = (generalLedger, chartOfAccount) => {
    if (generalLedger.length) {
        let sum = 0;
        generalLedger.forEach((elem) => {
            if (elem.chart_of_account_id === chartOfAccount.id)
                sum += elem.amount_debit;
        });
        return chartOfAccount.account_type.account_category.is_debit
            ? sum
            : -sum;
    }
};
const getTotalCreditAmount = (generalLedger, chartOfAccount) => {
    if (generalLedger.length) {
        let sum = 0;
        generalLedger.forEach((elem) => {
            if (elem.chart_of_account_id === chartOfAccount.id)
                sum += elem.amount_credit;
        });
        return chartOfAccount.account_type.account_category.is_debit
            ? -sum
            : sum;
    }
};

//--------------------------------------------------------General Ledger Export------------------------------------------------------------------------

/**
 *
 * @param {{
 *   accounts: number[],
 *   fromDate: Date,
 *   toDate: Date,
 *   reportBasis: number,
 *   reportBy: number,
 *   dateFormat: string,
 *   exportAs:"xlsx"|"pdf"
 * }} reqBody
 * @param {number} creator
 * @param {Function} next
 * @returns
 */
const accountTransactionsExport = (
    { accounts, fromDate, toDate, reportBasis, reportBy, dateFormat, exportAs },
    creator,
    next
) => {
    const accountTransactions = await getAccountTransaction({
        accounts,
        fromDate,
        toDate,
        reportBasis,
        reportBy,
        dateFormat,
    });
    if (exportAs === "xlsx") {
        return accountTransactionsBuildExcel(accountTransactions);
    } else {
        const document = {
            data: {},
            path: "./output.pdf",
            type: "buffer",
        };
        const options = {
            format: "A3",
            orientation: "portrait",
            border: "10mm",
        };
        return await pdf.create(
            { ...document, html: getHtmlAccountTypes(accountTransactions) },
            options
        );
    }
};

/**
 *
 * @param {{
 *   accounts: number[],
 *   fromDate: Date,
 *   toDate: Date,
 *   reportBasis: number,
 *   reportBy: number,
 *   dateFormat: string,
 * }} param1
 */
const getAccountTransaction = async ({
    accounts,
    fromDate,
    toDate,
    reportBasis,
    reportBy,
    dateFormat,
}) => {
    const journalDetails = await general_journal_detail.findMany({
        where: {
            general_journal_header: {
                journal_date: {
                    gte: fromDate,
                    lte: toDate,
                },
                OR:
                    filter.reportBasis == 3
                        ? [{ report_basis: 1 }, { report_basis: 2 }]
                        : [{ report_basis: filter.reportBasis }],
                journal_posting_status: 1,
                status: 0,
            },
            OR: accounts.length
                ? accounts.map((elem) => {
                      return { chart_of_account_id: elem };
                  })
                : [],
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
    let accountTransactions;
    let chartOfAccountId = accounts.length == 1 ? accounts[0] : 0;
    if (journalDetails.length) {
        const otherKeys = Object.keys(journalDetails[0]).filter(
            (elem) => elem != "chart_of_account_id"
        );
        const groupedJournalDetails = groupByFn(
            ["chart_of_account_id"],
            journalDetails,
            otherKeys,
            false
        );

        const openingBalance = await opening_balance.findFirst({
            where: {
                opening_balance_date: {
                    gte: new Date(a.getFullYear(), 0, 1),
                    lt: new Date(a.getFullYear() + 1, 0, 1),
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

        const organizationProfile = await financial_settings.findFirst({
            include: { base_currency: true },
        });

        let openingBalanceAmount = 0;
        let closingBalanceAmount = 0;

        //#region Take Journals from Opening Balance Date to Search Start Date
        const openingBalanceStartDate = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            1
        );

        let journalsFromOpeningBalanceDateToSearchStartDate = [];

        if (fromDate.getDate() > 1)
            journalsFromOpeningBalanceDateToSearchStartDate =
                await general_journal_detail.findMany({
                    where: {
                        general_journal_header: {
                            journal_date: {
                                gte: openingBalanceStartDate,
                                lt: fromDate,
                            },
                            OR:
                                reportBasis == 3
                                    ? [{ report_basis: 1 }, { report_basis: 2 }]
                                    : [{ report_basis: reportBasis }],
                            journal_posting_status: 1,
                            status: 0,
                        },
                    },
                });
        //#endregion

        const baseCurrency = await currency.findFirst({
            where: {
                is_base_currency: true,
            },
        });
        let account = {};
        let journalsWithFCY = [];
        let amountDueToExchangeRate = 0;
        let journalEntryAmount = 0;
        for (let i in groupedJournalDetails) {
            const groupJournal = groupedJournalDetails[i];
            if (groupJournal.otherKeys.length) {
                amountDueToExchangeRate = 0;
                account = groupJournal.otherKeys[0].chart_of_account;
                journalsWithFCY =
                    journalsFromOpeningBalanceDateToSearchStartDate.filter(
                        (elem) =>
                            elem.chart_of_account_id === account.id &&
                            elem.general_journal_header.currency_id !==
                                baseCurrency.id
                    );
                if (journalsWithFCY.length) {
                    amountDueToExchangeRate =
                        //jumped convertJournalTransactionToBaseCurrency
                        await convertJournalTransactionToBaseCurrency(
                            journalsWithFCY.map((elem) => {
                                return {
                                    ...elem,
                                    chart_of_account_id:
                                        groupJournal.chart_of_account_id,
                                };
                            }),
                            getTotalDebitAmount,
                            getTotalCreditAmount
                        );
                }
                const baseCurrencyDetails = groupJournal.otherKeys
                    .filter(
                        (elem) =>
                            elem.general_journal_header.currency_id ==
                            baseCurrency.id
                    )
                    .map((elem) => {
                        return {
                            ...elem,
                            chart_of_account_id:
                                groupJournal.chart_of_account_id,
                        };
                    });
                openingBalanceAmount =
                    getOpeningBalanceAmount(openingBalance, account.id) +
                    getTotalCreditAmount(baseCurrencyDetails, account) +
                    getTotalDebitAmount(baseCurrencyDetails, account) +
                    amountDueToExchangeRate;
                const amount = identifyAndReturnCreditOrDebitAmount(
                    account,
                    openingBalanceAmount
                );
                if (reportBy == 3) {
                    const pushed = {
                        journalDate: `As On ${fromDate.toDateString()}`,
                        transactionDetails: "Opening Balance",
                        accountName: `${account.account_name}`,
                        amountCredit:
                            amount.creditAmount > 0
                                ? `${
                                      organizationProfile?.base_currency
                                          ?.currency_code
                                  } ${Math.abs(amount.creditAmount)}`
                                : amount.debitAmount > 0
                                ? ""
                                : `${organizationProfile?.base_currency?.currency_code} ${amount.creditAmount}`,
                        amountDebit:
                            amount.debitAmount > 0
                                ? `${organizationProfile?.base_currency?.currency_code} ${amount.debitAmount}`
                                : "",
                    };
                    if (accountTransactions) {
                        accountTransactions.push(pushed);
                    } else {
                        accountTransactions = [pushed];
                    }
                }

                let groupJournalDetails = [...groupJournal.otherKeys];
                groupJournalDetails.sort(
                    (a, b) =>
                        a.journal_date.getTime() - b.journal_date.getTime() ||
                        a.posting_reference.localeCompare(b.posting_reference)
                );
                for (let i in groupJournalDetails) {
                    const journalDetail = groupJournalDetails[i];
                    if (journalDetail) {
                        journalEntryAmount = 0.0;
                        //Convert to Base Currency
                        if (
                            journalDetail.general_journal_header.currency_id !=
                            baseCurrency.id
                        )
                            journalEntryAmount =
                                await convertJournalTransactionToBaseCurrency(
                                    [
                                        {
                                            ...journalDetail,
                                            chart_of_account_id:
                                                groupJournal.chart_of_account_id,
                                        },
                                    ],
                                    baseCurrency
                                );
                        else
                            journalEntryAmount =
                                journalDetail.amount_credit > 0
                                    ? journalDetail.amount_credit
                                    : journalDetail.amount_debit;

                        const pushed = {
                            journalDate: `${journalDetail.general_journal_header.journal_date.toDateString()}`,
                            transactionDetails: `${journalDetail.general_journal_header.notes}`,
                            journalId: parseInt(
                                journalDetail.general_journal_header.id
                            ),
                            referenceNumber: `${journalDetail.reference_code}`,
                            transactionNumber: `${journalDetail.general_journal_header.posting_reference}`,
                            transactionType: "Journal",
                            accountId: parseInt(
                                journalDetail.chart_of_account.id
                            ),
                            accountName:
                                journalDetail.chart_of_account.account_name,
                            accountType:
                                journalDetail.chart_of_account.account_type
                                    .type,
                            accountGroup:
                                journalDetail.chart_of_account.account_type
                                    .account_category.name,
                            amountCredit:
                                journalDetail.amount_credit > 0
                                    ? `${Math.abs(journalEntryAmount)}`
                                    : "",
                            amountDebit:
                                journalDetail.amount_debit > 0
                                    ? `${Math.abs(journalEntryAmount)}`
                                    : "",
                            accountNumber:
                                journalDetail.chart_of_account.account_code,
                        };

                        if (accountTransactions) {
                            accountTransactions.push(pushed);
                        } else {
                            accountTransactions = [pushed];
                        }
                    }
                }
                journalsWithFCY = groupJournal.otherKeys
                    .filter(
                        (elem) =>
                            elem.general_journal_header.currency_id !=
                            baseCurrency.id
                    )
                    .map((elem) => {
                        return {
                            ...elem,
                            chart_of_account_id:
                                groupJournal.chart_of_account_id,
                        };
                    });
                amountDueToExchangeRate = 0;
                if (journalsWithFCY.length) {
                    amountDueToExchangeRate =
                        convertJournalTransactionToBaseCurrency(
                            journalsWithFCY,
                            baseCurrency
                        );
                }
                closingBalanceAmount =
                    openingBalanceAmount +
                    getTotalDebitAmount(baseCurrencyDetails, account) +
                    getTotalCreditAmount(baseCurrencyDetails, account) +
                    amountDueToExchangeRate;
                amount = await identifyAndReturnCreditOrDebitAmount(
                    account,
                    closingBalanceAmount
                );
                if (reportBy === 3) {
                    const pushed = {
                        journalDate: `As On ${toDate.toDateString()}`,
                        transactionDetails: "Closing Balance",
                        accountName: account.account_name,
                        amountCredit:
                            amount.creditAmount > 0
                                ? `${
                                      organizationProfile?.base_currency
                                          ?.currency_code
                                  } ${Math.abs(amount.creditAmount)}`
                                : amount.debitAmount > 0
                                ? ""
                                : `${
                                      organizationProfile?.base_currency
                                          ?.currency_code
                                  } ${Math.abs(amount.creditAmount)}`,
                        amountDebit:
                            amount.debitAmount > 0
                                ? `${
                                      organizationProfile?.base_currency
                                          ?.currency_code
                                  } ${Math.abs(amount.debitAmount)}`
                                : "",
                    };
                    if (accountTransactions) {
                        accountTransactions.push(pushed);
                    } else {
                        accountTransactions = [pushed];
                    }
                }
            }
        }
    }
    return {
        companyName: COMPANY_NAME,
        reportTitle: "Account Transactions",
        reportType: `${"REPORT_BASIS_TITLE"} ${
            ["accrual", "cash", "both"][reportBasis - 1]
        }`,
        reportDateRange: `From ${fromDate.toDateString()} To ${toDate.toDateString()}`,
        groupedBy: ["Date", "AccountType", "Account", "TransactionType"][
            reportBy - 1
        ],
        accountName:
            chartOfAccountId &&
            (
                await chart_of_account.findUnique({
                    where: { id: chartOfAccountId },
                })
            )?.account_name,
        accountTransactions,
    };
};

/**
 *
 * @param {
 * generalLedgerList: {
 *   journalDate: string,
 *   transactionDetails: string,
 *   journalId: number,
 *   referenceNumber: string,
 *   transactionNumber: string,
 *   transactionType: string,
 *   accountId: number,
 *   accountName: string,
 *   accountType: string,
 *   accountGroup: string,
 *   amountCredit: string,
 *   amountDebit: string,
 *   accountNumber: number,
 * }} accountTransactions
 */
//type fix tomorrow
const accountTransactionsBuildExcel = (accountTransactions) => {
    const sheetOptions = {
        "!col": Array(12).fill({ wpx: 15 }),
    };
    let dataSheet = [
        [
            "date",
            "transaction_details",
            "transaction_id",
            "transaction_type",
            "transaction_number",
            "reference_number",
            "debit",
            "credit",
            "account_group",
            "account_type",
            "account_name",
            "account_id",
        ],
    ];
    for (let i in accountTransactions.generalLedgerList) {
        const row = accountTransactions.generalLedgerList[i];
        dataSheet.push([
            row.journalDate,
            row.transactionDetails,
            row.journalId,
            row.transactionType,
            row.transactionNumber,
            row.referenceNumber,
            row.amountDebit,
            row.amountCredit,
            row.accountGroup,
            row.accountType,
            row.costCenter,
            row.accountId,
        ]);
    }
    const buffer = xlsx.build([
        {
            name: "Account Transactions",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};

module.exports = {
    accountTransactionsExport,
    generalLedgerExport,
};
// same as the others
