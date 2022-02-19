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
    account_type_financial_statement_section,
    currency,
    general_journal_detail,
    financial_settings,
    chart_of_account,
    tax,
} = allModels;
const xlsx = require("node-xlsx");
const pdf = require("pdf-creator-node");
const {
    getOpeningBalanceAmount,
    getTotalDebitAmount,
    getTotalCreditAmount,
} = require("./financeExportController");
const mainCss = `
<style>
    body{padding-top:50px;padding-bottom:20px}.body-content{padding-left:15px;padding-right:15px}.carousel-caption p{font-size:20px;line-height:1.4}.carousel-inner .item img[src$=".svg"]{width:100%}#qrCode{margin:15px}@media screen and (max-width:767px){.carousel-caption{display:none}}
</style>
`;
//--------------------------------------------------------Profit Loss Export------------------------------------------------------------------------

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
const profitLossExport = async ({
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
    const profitLoss = await getProfitLoss(filters);
    if (exportAs === "xlsx") {
        return profitLossBuildExcel(profitLoss);
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
            { ...document, html: getHtmlProfitLoss(profitLoss) },
            options
        );
    }
};
/**
 *
 * @param {{fromDate:Date, toDate:Date, dateFormat:string, reportBasis:number}} param0
 */
const getProfitLoss = async ({ fromDate, toDate, dateFormat, reportBasis }) => {
    const openingBalance = await opening_balance.findFirst({
        where: {
            opening_balance_date: {
                gte: new Date(fromDate.getFullYear(), 0, 1),
                lt: new Date(fromDate.getFullYear() + 1, 0, 1),
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
            },
        });
    //Group Account Type under it's section
    var accountTypesGroupedUnderReportSections =
        accountTypesInsideBalanceSheetReportSections.length
            ? groupByFn(
                  ["financial_statement_section_id"],
                  accountTypesInsideBalanceSheetReportSections,
                  Object.keys(accountTypesInsideBalanceSheetReportSections[0])
              )
            : [];
    //Sort Them by Sequence Number
    //by now we know what groupByFn returns, but here it's treated as if its array of arrays and sorts them by their first index's sequence on report, so all i can do is change the variable to array of arrays by accessing other keys;
    let newGrouped = [];
    for (let i in accountTypesGroupedUnderReportSections) {
        newGrouped.push(accountTypesGroupedUnderReportSections[i].otherKeys);
    }
    newGrouped.sort(
        (a, b) =>
            a[0]?.financial_statement_section?.sequence_on_report -
            b[0]?.financial_statement_section?.sequence_on_report
    );
    accountTypesGroupedUnderReportSections = newGrouped;

    let operatingIncomeBalance = 0.0;
    let grossProfit = 0.0;
    let operatingProfit = 0.0;
    let nonOperatingIncomeAmount = 0.0;
    let accounts = [];
    //Loop through the Report Sections
    for (let i in accountTypesGroupedUnderReportSections) {
        const accountTypeUnderReportSection =
            accountTypesGroupedUnderReportSections[i];
        //here accountTypeUnderReportSection is an array of acctypefinancialstatementsection containing the same financial statement section id

        // const financialStatementSection = accountTypeUnderReportSection[0].financial_statement_section;
        const financialStatementSection =
            accountTypesInsideBalanceSheetReportSections[0]
                .financial_statement_section;
        //TODO change this back

        // #region 1. add SECTION NAME as a Title
        accounts.push({
            accountName: financialStatementSection.name,
            isSectionTitle: true,
            sequenceOnReport: financialStatementSection.sequence_on_report,
        });
        // #endregion

        // #region 2. Add ACCOUNTS and their AMOUNT

        let journalsOfTheReportSectionAccounts = journals.filter(
            (j) =>
                accountTypeUnderReportSection.filter(
                    (at) =>
                        at.account_type_id == j.chart_of_account.account_type_id
                ).length > 0
        );

        const incomeStatementAccounts = await getAccounts(
            journalsOfTheReportSectionAccounts,
            openingBalance
        );

        accounts.push(...incomeStatementAccounts.reportAccounts);
        // #endregion

        // #region 3. add TOTAL AMOUNT of the section
        accounts.push({
            accountName: `TOTAL ${financialStatementSection.name}`,
            amount: `${incomeStatementAccounts.reportSectionTotalAmount}`,
            isSectionTotal: true,
        });

        if (financialStatementSection.sequence_on_report == 1)
            operatingIncomeBalance =
                incomeStatementAccounts.reportSectionTotalAmount;
        else if (financialStatementSection.sequence_on_report == 2) {
            grossProfit =
                operatingIncomeBalance -
                incomeStatementAccounts.reportSectionTotalAmount; //Oprating Income - Cost of goods sold

            accounts.push({
                accountName: "Gross Profit",
                amount: `${grossProfit}`,
                isAccountCategoryTotal: true,
            });
        } else if (financialStatementSection.sequence_on_report == 3) {
            operatingProfit =
                grossProfit - incomeStatementAccounts.reportSectionTotalAmount; //Gross profit - Operating Expense

            accounts.push({
                accountName: "Operating Profit",
                amount: `${operatingProfit}`,
                isAccountCategoryTotal: true,
            });
        } else if (financialStatementSection.sequence_on_report == 4)
            nonOperatingIncomeAmount =
                incomeStatementAccounts.reportSectionTotalAmount;
        else if (financialStatementSection.sequence_on_report == 5) {
            accounts.push({
                accountName: "Net Profit/Loss", //Operating Proft - (Non Operating Income + Non Operating Expense)
                amount: `${
                    operatingProfit -
                    (nonOperatingIncomeAmount +
                        incomeStatementAccounts.reportSectionTotalAmount)
                }`,
                isAccountCategoryTotal: true,
            });
        }
        // #endregion
    }
    return {
        companyName: COMPANY_NAME,
        reportTitle:
            "Statement of profit or Loss and other comprehensive income",
        reportType: `${REPORT_BASIS_TITLE} ${
            ["accrual", "cash", "both"][reportBasis - 1]
        }`,
        reportDateRange: `From ${fromDate.toDateString()} To ${toDate.toDateString()}`,
        accounts,
    };
};

/**
 *
 * @param {{
 *   companyName: string;
 *   reportTitle: string;
 *   reportType: string;
 *   reportDateRange: string;
 *   taxSummaryList: {
 *       taxId: number;
 *       taxAmountCredit: number;
 *       taxAmountDebit: number;
 *       taxName: string;
 *       taxPercentage: number;
 *   }[];
 * }} taxSummary
 */
const profitLossBuildExcel = (profitLoss) => {
    let mergeRanges = [];
    mergeRanges.push({ s: { c: 0, r: 0 }, e: { c: 3, r: 2 } }); //A1:D3

    const sheetOptions = {
        "!cols": Array(4).fill({ wch: 50 }),
        "!merges": mergeRanges,
    };
    let dataSheet = [
        [
            `${profitLoss.companyName}  ${profitLoss.reportTitle}  ${profitLoss.reportDateRange}`,
        ],
        [],
        [],
        ["Account", "", "Total"],
    ];
    for (let i in profitLoss.accounts) {
        const row = profitLoss.profitLossList[i];
        if (row.isSectionTitle) {
            dataSheet.push([row.accountName]);
            dataSheet.push([]);
        } else if (row.isSectionTotal) {
            dataSheet.push([row.accountName, [], [], row.amount]);
            dataSheet.push([]);
        } else if (row.isAccountCategoryTotal || row.IsTotal) {
            dataSheet.push(["", "", row.accountName, row.amount]);
        }
    }
    const buffer = xlsx.build([
        {
            name: "Trail Balance",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};

/**
 *
 * @param {{
 *   companyName: string;
 *   reportTitle: string;
 *   reportType: string;
 *   reportDateRange: string;
 *   taxSummaryList: {
 *       taxId: number;
 *       taxAmountCredit: number;
 *       taxAmountDebit: number;
 *       taxName: string;
 *       taxPercentage: number;
 *   }[];
 * }} taxSummary
 */
const getHtmlProfitLoss = (profitLoss) => {
    let addedRows = "";

    for (let i in profitLoss.accounts) {
        const item = profitLoss.accounts[i];
        if (item.isSectionTitle) {
            addedRows += `
            <tr style="border-bottom:0px!important">
                <td><span style="padding-top: 20px;padding-bottom: 0;color:#a3a3a3;">${item.AccountName}</span> </td>
                <td style="padding-top: 20px">&nbsp;</td>
            </tr>`;
        } else if (item.isSectionTotal) {
            addedRows += `
            <tr>
                <td><strong>${item.AccountName}</strong></td>
                <td class="rep-subttl">${item.Amount}</td>
            </tr>
            `;
        } else if (item.isAccountCategoryTotal) {
            addedRows += `
            <tr class="text-right" style="border-bottom:0px!important">
                <td><strong>${item.AccountName}</strong></td>
                <td style="text-align:left;" class="rep-subttl">${item.Amount}</td>
            </tr>
            `;
        } else if (item.isTotal) {
            addedRows += `
            <tr class="text-right">
                <td><strong>${item.AccountName}</strong></td>
                <td style="text-align:left;" class="rep-grandTtl">${item.Amount}</td>
            </tr>
            `;
        } else {
            addedRows += `
            <tr>
                <td> <a href=""> ${item.AccountName} </a>  </td>
                <td> <a href="#"> ${item.Amount} </a>  </td>
            </tr>
            `;
        }
    }
    let lastAdded = ``;
    if (profitLoss.footNotes && profitLoss.footNotes.length) {
        let innerAddedRows = "";

        for (let i in profitLoss.footNotes) {
            innerAddedRows += `<p><sup class="mr-1">${i}</sup>${note.title}:<font class="text-secondary">${note.description}</font></p>`;
        }
        lastAdded +=
            `<section id="footer">
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="callout callout-danger">
                                <h5> Notes</h5>
                                ` +
            innerAddedRows +
            `
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
    }

    return (
        `         
            <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
                  asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
                  asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
            ${mainCss}
        
        
            <section class="content" style="background-color:white">
            <div class="box-body">
        
                <table id="tblTrailBalance" class="table table-condensed zi-table financial-comparsion">
                    <thead>
                        <tr class="rep-fin-th">
                            <th>Account</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>` +
        addedRows +
        `</tbody>
                </table>
        
                <div>
                    <br />
                    Amount is displayed in your base currency
                    <span class="right badge badge-success"> ETB </span>
                </div>
        
            </div>
        </section>
        `
    );
};
/**
 *
 * @param {(import("@prisma/client").general_journal_detail & {
 *   general_journal_header: import("@prisma/client").general_journal_header;
 *   chart_of_account: import("@prisma/client").chart_of_account & {
 *       account_type:import("@prisma/client").account_type&{
 *          account_category:import("@prisma/client").account_category
 *       };
 *   };
 * })[]} journals
 * @param {import("@prisma/client").opening_balance & {
 *   opening_balance_account: (import("@prisma/client").opening_balance_account & {
 *       chart_of_account: import("@prisma/client").chart_of_account & {
 *          account_type:import("@prisma/client").account_type&{
 *              account_category:import("@prisma/client").account_category
 *       };
 *   };
 *   })[];
 * }} openingBalance
 */
const getAccounts = async (journals, openingBalance) => {
    // #region Local fields

    let reportSectionTotalAmount = 0;

    //Exchange rate fields

    let reportAccounts = [];
    const baseCurrency = await currency.findFirst({
        where: {
            is_base_currency: true,
        },
    });

    let groupedJournalsUnderAccountTypes = [...journals];
    for (let i in journals) {
        const accountTypeJournals = groupedJournalsUnderAccountTypes.filter(
            (elem) =>
                elem.chart_of_account.account_type_id ===
                journals[i].chart_of_account.account_type_id
        );
        if (accountTypeJournals.length) {
            let accountTypeTotalAmount = 0;
            groupedJournalsUnderAccountTypes =
                groupedJournalsUnderAccountTypes.filter(
                    (elem) =>
                        elem.chart_of_account.account_type_id !==
                        journals[i].chart_of_account.account_type_id
                );
            let reportItems = [];
            let journalsGroupedByAccount = [...accountTypeJournals];
            for (let i in accountTypeJournals) {
                const accountJournals = journalsGroupedByAccount.filter(
                    (elem) =>
                        elem.chart_of_account_id ===
                        accountTypeJournals[i].chart_of_account_id
                );
                if (accountJournals.length) {
                    journalsGroupedByAccount = journalsGroupedByAccount.filter(
                        (elem) =>
                            elem.chart_of_account_id ===
                            accountTypeJournals[i].chart_of_account_id
                    );
                    let amountDueToExchangeRate = 0;
                    const account = accountJournals[0].chart_of_account;
                    let journalsWithFCY = accountJournals.filter(
                        (elem) =>
                            elem.general_journal_header_id === baseCurrency.id
                    );
                    if (journalsWithFCY.length) {
                        amountDueToExchangeRate =
                            await convertJournalTransactionToBaseCurrency(
                                journalsWithFCY,
                                baseCurrency
                            );
                    }
                    const currencyJournals = accountJournals.filter(
                        (elem) =>
                            elem.general_journal_header.currency_id ==
                            baseCurrency.id
                    );
                    const accountBalance =
                        getOpeningBalanceAmount(openingBalance, account.id) +
                        (getTotalDebitAmount(currencyJournals, account) +
                            getTotalCreditAmount(currencyJournals, account)) +
                        amountDueToExchangeRate;
                    if (accountBalance != 0) {
                        accountTypeTotalAmount += accountBalance;

                        reportItems.push({
                            accountId: account.id,
                            accountType: account.account_type.type,
                            accountName:
                                account.account_name +
                                "(" +
                                account.account_code +
                                ")",
                            amount: `${accountBalance}`,
                        });
                    }
                }
            }
            reportSectionTotalAmount += accountTypeTotalAmount;
            reportAccounts.push(...reportItems);
        }
    }
    return { reportAccounts, reportSectionTotalAmount };

    // #endregion

    //Loop through all Account Type of a specific Report Section
};
module.exports = {
    profitLossExport,
};
