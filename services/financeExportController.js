const {
    allModels,
    COMPANY_NAME,
    REPORT_BASIS_TITLE,
} = require("../config/config");
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
const mainCss = `
<style>
    body{padding-top:50px;padding-bottom:20px}.body-content{padding-left:15px;padding-right:15px}.carousel-caption p{font-size:20px;line-height:1.4}.carousel-inner .item img[src$=".svg"]{width:100%}#qrCode{margin:15px}@media screen and (max-width:767px){.carousel-caption{display:none}}
</style>
`;
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
    const filters = {
        fromDate: dateRange[0],
        toDate: dateRange[1],
        dateFormat,
        reportBasis,
    };
    const generalLedgers = await getGeneralLedgers(filters);
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
          ${mainCss}


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
            Amount is displayed in your base currency
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
        "!cols": [
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
        ],
    };
    let dataSheet = [
        [
            "name",
            "Account Code",
            "Account Id",
            "Credit Total",
            "Debit Total",
            "Valance",
            "Is Debit",
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
            name: "General Ledger",
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
    const openingBalance = await opening_balance.findFirst({
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
    if (generalLedgerList) {
        generalLedgerList.sort((a, b) => a.accountName.localeCompare(b));
    }
    const returned = {
        generalLedgerList,
        companyName: COMPANY_NAME,
        reportTitle: "General Ledger",
        reportType: `${REPORT_BASIS_TITLE} ${
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

//--------------------------------------------------------Account Transaction Export------------------------------------------------------------------------

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
const accountTransactionsExport = async ({
    accounts,
    fromDate,
    toDate,
    reportBasis,
    reportBy,
    dateFormat,
    exportAs,
}) => {
    const accountTransaction = await getAccountTransaction({
        accounts,
        fromDate,
        toDate,
        reportBasis,
        reportBy,
        dateFormat,
    });
    if (exportAs === "xlsx") {
        return accountTransactionsBuildExcel(accountTransaction);
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
            { ...document, html: getHtmlAccountTypes(accountTransaction) },
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
                    reportBasis == 3
                        ? [{ report_basis: 1 }, { report_basis: 2 }]
                        : [{ report_basis: reportBasis }],
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
        reportType: `${REPORT_BASIS_TITLE} ${
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
 * @param {{
 * companyName: string,
 * reportTitle: string,
 * reportType: string,
 * reportDateRange: string,
 * groupedBy: string,
 * accountName: string,
 * accountTransactions: {
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
 * }[]
 * }} accountTransaction
 */
const accountTransactionsBuildExcel = (accountTransaction) => {
    const sheetOptions = {
        "!cols": Array(12).fill({ wch: 15 }),
    };
    let dataSheet = [
        [
            "date",
            "Transaction Details",
            "Transaction Id",
            "Transaction Type",
            "Transaction Number",
            "Reference Number",
            "Debit",
            "Credit",
            "Account Group",
            "Account Type",
            "Account Name",
            "Account Id",
        ],
    ];
    for (let i in accountTransaction.accountTransactions) {
        const row = accountTransaction.accountTransactions[i];
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
            row.accountName,
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

/**
 *
 * @param {{
 * companyName: string,
 * reportTitle: string,
 * reportType: string,
 * reportDateRange: string,
 * groupedBy: string,
 * accountName: string,
 * accountTransactions: {
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
 * }[]
 * }} accountTransaction
 */
const getHtmlAccountTypes = (accountTransaction) => {
    const addedRows = "";
    {
        for (let i in accountTransaction.accountTransactions) {
            const item = accountTransaction.accountTransactions[i];
            addedRows += `<tr>
                <td>${item.journalDate}) </td>
                <td>${item.accountType}) </td>
                <td>${item.accountName}) </td>
                <td>${item.transactionType}) </td>
                <td>${item.transactionDetails})</td>
                <td>${item.transactionNumber})</td>
                <td>${item.referenceNumber})</td>
                <td>
                    ${
                        !item.journalDate.match(/as on/i)
                            ? `<span> ${item.amountDebit} </span>`
                            : item.amountDebit
                    }
                </td>
                <td>
                    ${
                        !item.journalDate.match(/as on/i)
                            ? `<span> ${item.amountCredit} </span>`
                            : item.amountCredit
                    }
                </td>
            </tr>`;
        }
    }
    return (
        `
        <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
              asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
              asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
        ${mainCss}  
    <section class="content-header">
        <div class="container-fluid text-center">
            <h6>${accountTransaction?.companyName}</h6>
            <h5>${accountTransaction?.reportTitle}</h5>
            <small class="text-center">${accountTransaction?.reportType}</small><br />
            <h5><strong>${accountTransaction?.accountName}</strong></h5>
            <h6>${accountTransaction?.reportDateRange}</h6>
        </div>
    </section>
    
    <section class="content" style="background-color:white">
        <div class="box-body table-responsive no-padding">
    
            <table id="tblAccountTransactions" class="table table-hover">
                <thead>
                    <tr>
                        <th> Date </th>
                        <th> Account Type </th>
                        <th> Account </th>
                        <th> Type </th>
                        <th> Transaction Details </th>
                        <th> Transaction# </th>
                        <th> Reference# </th>
                        <th> Debit </th>
                        <th> Credit </th>
                    </tr>
                </thead>
    
                <tbody>
                    ` +
        addedRows +
        `
                </tbody>
            </table>
    
            <div>
                <br />
                Amount is displayed in your base currency
                <span class="right badge badge-success">ETB</span>
                <br />
                <br />
                <br />
            </div>
        </div>
    </section>
    `
    );
};

//--------------------------------------------------------jounal Export------------------------------------------------------------------------

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
const journalExport = async ({
    dateRange,
    dateFormat,
    exportAs,
    reportBasis,
}) => {
    const filters = {
        fromDate: dateRange[0],
        toDate: dateRange[1],
        dateFormat,
        reportBasis,
    };
    const journals = await getJournals(filters);
    if (exportAs === "xlsx") {
        return journalBuildExcel(journals);
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
            { ...document, html: getHtmlJournal(journals) },
            options
        );
    }
};
/**
 *
 * @param {{fromDate:Date, toDate:Date, dateFormat:string, reportBasis:number}} param0
 */
const getJournals = async ({ fromDate, toDate, dateFormat, reportBasis }) => {
    const journalDetails = await general_journal_detail.findMany({
        where: {
            general_journal_header: {
                journal_date: {
                    gte: fromDate,
                    lte: toDate,
                },
                OR:
                    reportBasis == 3
                        ? [{ report_basis: 1 }, { report_basis: 2 }]
                        : [{ report_basis: reportBasis }],
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
            contact: true,
        },
    });
    let journalReportList;
    if (journalDetails.length) {
        let journal = [...journalDetails];
        journal.sort(
            (a, b) =>
                a.general_journal_header.journal_date.getTime() -
                b.general_journal_header.journal_date.getTime()
        );
        const otherKeys = Object.keys(journalDetails[0]).filter(
            (elem) => elem != "chart_of_account_id"
        );
        const groupedJournalDetails = groupByFn(
            ["chart_of_account_id"],
            journal,
            otherKeys,
            false
        );
        const baseCurrency = await currency.findFirst({
            where: {
                is_base_currency: true,
            },
        });
        let amount = 0,
            totalDebitAmount = 0,
            totalCreditAmount = 0;

        let journalWithFCY = {};
        for (let i in groupedJournalDetails) {
            const groupJournal = groupedJournalDetails[i];
            if (groupJournal.otherKeys.length) {
                totalDebitAmount = 0;
                totalCreditAmount = 0;
                const pushedObj = groupJournal.otherKeys[0];
                const pushed = {
                    journalDate: `${pushedObj?.general_journal_header?.journal_date.toDateString()}`,
                    accountCode: `${pushedObj?.chart_of_account?.account_code}`,
                    journalHeader:
                        `${pushedObj?.general_journal_header?.journal_date
                            .toDateString()
                            .toUpperCase()} - JOURNAL` +
                        (pushedObj?.contact
                            ? "(" + pushedObj.contact.contact_display_name + ")"
                            : ""),
                    account: `${pushedObj?.general_journal_header?.journal_date
                        .toDateString()
                        .toUpperCase()} - JOURNAL`,
                    entryType: "JOURNAL",
                    headerPostingReference: `${pushedObj?.posting_reference}`,
                    amountCredit: "CREDIT",
                    amountDebit: "DEBIT",
                    journalId: parseInt(pushedObj.general_journal_header_id),
                    isHeader: true,
                };
                if (journalReportList) {
                    journalReportList.push(pushed);
                } else {
                    journalReportList = [pushed];
                }
                for (let i in groupJournal.otherKeys) {
                    const journalDetail = groupJournal.otherKeys[i];
                    if (journalDetail) {
                        amount = 0;
                        if (
                            journalDetail.general_journal_header.currency_id !=
                            baseCurrency.id
                        )
                            amount =
                                await convertJournalTransactionToBaseCurrency(
                                    [
                                        {
                                            ...journalDetail,
                                            chart_of_account_id:
                                                groupJournal.chart_of_account_id,
                                        },
                                    ],
                                    getTotalDebitAmount,
                                    getTotalCreditAmount
                                );
                        else {
                            if (journalDetail.amount_credit > 0)
                                amount = journalDetail.amount_credit;
                            else amount = journalDetail.amount_debit;
                        }

                        if (journalDetail.amount_credit > 0)
                            totalCreditAmount += amount;
                        else totalDebitAmount += amount;
                        const pushed = {
                            journalId: journalDetail.id,
                            journalDate:
                                journalDetail.general_journal_header.journal_date.toDateString(),
                            accountCode:
                                journalDetail.chart_of_account.account_code,
                            account:
                                journalDetail.chart_of_account.account_name,
                            entryType: "JOURNAL",
                            headerPostingReference:
                                pushedObj?.posting_reference,
                            amountCredit:
                                journalDetail.amount_credit > 0
                                    ? `${Math.abs(amount)}`
                                    : `${Math.abs(
                                          journalDetail.amount_credit
                                      )}`,
                            amountDebit:
                                journalDetail.amount_debit > 0
                                    ? `${Math.abs(amount)}`
                                    : `${Math.abs(journalDetail.amount_debit)}`,
                        };
                        if (journalReportList) {
                            journalReportList.push(pushed);
                        } else {
                            journalReportList = [pushed];
                        }
                    }
                }
                const pushed2 = {
                    journalId: pushedObj.general_journal_header_id,
                    account: "",
                    amountCredit: `${Math.abs(totalCreditAmount)}`,
                    amountDebit: `${Math.abs(totalDebitAmount)}`,
                    isTotal: true,
                };
                if (journalReportList) {
                    journalReportList.push(pushed2);
                } else {
                    journalReportList = [pushed2];
                }
            }
        }
    }
    return {
        companyName: COMPANY_NAME,
        reportTitle: "Journal Report",
        reportType: `${REPORT_BASIS_TITLE} ${
            ["accrual", "cash", "both"][reportBasis - 1]
        }`,
        reportDateRange: `From ${fromDate.toDateString()} to ${toDate.toDateString()}`,
        journalReportList,
    };
};

/**
 *
 * @param {{
 *   companyName: string,
 *   reportTitle: string,
 *   reportType: string,
 *   reportDateRange: string
 *   journalReportList: {
 *      journalDate: string,
 *      accountCode: string,
 *      journalHeader: string,
 *      account: string,
 *      entryType: string,
 *      headerPostingReference: string,
 *      amountCredit: string,
 *      amountDebit: string,
 *      journalId: number,
 *      isHeader: boolean,
 *      isTotal:boolean
 *  }[]
 * }
 * } journal
 */
const journalBuildExcel = (journal) => {
    let mergeRanges = [];
    mergeRanges.push({ s: { c: 0, r: 0 }, e: { c: 2, r: 2 } }); //A1:C3

    const sheetOptions = {
        "!cols": Array(3).fill({ wch: 50 }),
        "!merges": mergeRanges,
    };
    let dataSheet = [
        [
            `${journal.companyName} - ${journal.reportTitle} - ${journal.reportDateRange}`,
        ],
        [],
        [],
        [],
    ];
    for (let i in journal.journalReportList) {
        const row = journal.journalReportList[i];
        //header part
        if (row.isHeader) {
            dataSheet.push([]);
            dataSheet.push([
                row.account + " - " + row.headerPostingReference,
                "Debit",
                "Credit",
            ]);
            dataSheet.push([]);
        }
        if (row.isHeader && !row.isTotal) {
            dataSheet.push([row.account, row.amountDebit, row.amountCredit]);
        }
        if (row.isTotal) {
            dataSheet.push(["", row.amountDebit, row.amountCredit]);
            dataSheet.push([]);
        }
    }
    const buffer = xlsx.build([
        {
            name: "Journal Report",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};

/**
 *
 * @param {{
 *   companyName: string,
 *   reportTitle: string,
 *   reportType: string,
 *   reportDateRange: string
 *   journalReportList: {
 *      journalDate: string,
 *      accountCode: string,
 *      journalHeader: string,
 *      account: string,
 *      entryType: string,
 *      headerPostingReference: string,
 *      amountCredit: string,
 *      amountDebit: string,
 *      journalId: number,
 *      isHeader: boolean,
 *      isTotal:boolean
 *  }[]
 * }
 * } journal
 */
const getHtmlJournal = (journal) => {
    let addedRows = "";
    for (let i in journal.journalReportList) {
        const item = journal.journalReportList[i];
        if (item.isTotal) {
            addedRows += `<tr style="background-color:cornsilk">
                    <td>${item.account}</td>
                    <td>
                        <span> ${item.amountCredit} </span>
                    </td>
                    <td>
                        <span> ${item.amountDebit} </span>
                        <br />
                    </td>
                </tr>`;
        } else {
            addedRows += `<tr>`;
            if (item.isHeader) {
                addedRows += `<td>${item.account} - <strong>${item.headerPostingReference}</strong></td>`;
            } else {
                addedRows += `<td>${item.account}</td>`;
            }
            addedRows += `
                <td>${item.amountCredit}</td>
                <td>${item.amountDebit}</td>
            </tr>`;
        }
    }
    return (
        `
    <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
          asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
          asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
    ${mainCss}



<section class="content-header">
    <div class="container-fluid text-center">
        <h6>${journal?.companyName}</h6>
        <h5>${journal?.reportTitle}</h5>
        <small class="text-center">${journal?.reportType}</small><br />
        <h6>${journal?.reportDateRange}</h6>
    </div>
</section>

<section class="content" style="background-color:white">
    <div class="box-body table-responsive no-padding">

        <table id="tblGeneralLedger" class="table table-hover">
            <tbody>
                ` +
        addedRows +
        `
            </tbody>
        </table>

        <div>
            <br />
            Amount is displayed in your base currency
            <span class="right badge badge-success">ETB</span>
        </div>

    </div>
</section>

`
    );
};

module.exports = {
    accountTransactionsExport,
    generalLedgerExport,
    journalExport,
};
// same as the others
