const {
    allModels,
    COMPANY_NAME,
    REPORT_BASIS_TITLE,
} = require("../config/config");
const { getAccounts } = require("./accountingPeriod");
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
        const row = profitLoss.accounts[i];
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
            name: "Profit Loss",
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
                <td><span style="padding-top: 20px;padding-bottom: 0;color:#a3a3a3;">${item.accountName}</span> </td>
                <td style="padding-top: 20px">&nbsp;</td>
            </tr>`;
        } else if (item.isSectionTotal) {
            addedRows += `
            <tr>
                <td><strong>${item.accountName}</strong></td>
                <td class="rep-subttl">${item.amount}</td>
            </tr>
            `;
        } else if (item.isAccountCategoryTotal) {
            addedRows += `
            <tr class="text-right" style="border-bottom:0px!important">
                <td><strong>${item.accountName}</strong></td>
                <td style="text-align:left;" class="rep-subttl">${item.amount}</td>
            </tr>
            `;
        } else if (item.isTotal) {
            addedRows += `
            <tr class="text-right">
                <td><strong>${item.accountName}</strong></td>
                <td style="text-align:left;" class="rep-grandTtl">${item.amount}</td>
            </tr>
            `;
        } else {
            addedRows += `
            <tr>
                <td> <a href=""> ${item.accountName} </a>  </td>
                <td> <a href="#"> ${item.amount} </a>  </td>
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
        
            <section class="content-header">
                <div class="container-fluid text-center">
                    <h6>${profitLoss.companyName}</h6>
                    <h5>${profitLoss.reportTitle}</h5>
                    <small class="text-center">${profitLoss.reportType}</small><br />
                    <h6>${profitLoss.reportDateRange}</h6>
                </div>
            </section>
        
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

//--------------------------------------------------------Cash Flow Export------------------------------------------------------------------------

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
const cashFlowExport = async ({
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
    const cashFlow = await getCashFlow(filters);
    if (exportAs === "xlsx") {
        return cashFlowBuildExcel(cashFlow);
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
            { ...document, html: getHtmlCashFlow(cashFlow) },
            options
        );
    }
};
/**
 *
 * @param {{fromDate:Date, toDate:Date, dateFormat:string, reportBasis:number}} param0
 */
const getCashFlow = async ({ fromDate, toDate, dateFormat, reportBasis }) => {
    //#region Local Fields
    let beginningCashBalance = 0;
    let accountName = "";
    let operatingActivityAmount = 0;
    let investingActivityAmount = 0;
    let journalsOfTheReportSectionAccounts = [];
    var financialStatementSection = {};
    // #endregion

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
    const journalsAsOfToday = await general_journal_detail.findMany({
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
    // var chartOfAccounts = applicationDbContext.ChartOfAccounts.Include("AccountType.AccountCategory").Where(COA => COA.Status == RecordStatus.Active).ToList();

    // #region Read Report Section Configuration

    //Select Account Types configured under BALANCE SHEET report Sections

    const accountTypesInsideBalanceSheetReportSections =
        await account_type_financial_statement_section.findMany({
            where: {
                financial_statement_section: {
                    financial_statement_type: 3,
                },
            },
            include: {
                financial_statement_section: true,
                account_type: true,
            },
        });

    //Group Account Type under it's section
    const accountTypesGroupedUnderReportSectionsObj =
        accountTypesInsideBalanceSheetReportSections.length
            ? groupByFn(
                  ["financial_statement_section_id"],
                  accountTypesInsideBalanceSheetReportSections,
                  Object.keys(accountTypesInsideBalanceSheetReportSections[0])
              )
            : {};
    //Sort Them by Sequence Number
    let accountTypesGroupedUnderReportSections = [];
    for (let i in accountTypesGroupedUnderReportSectionsObj) {
        accountTypesGroupedUnderReportSections.push(
            accountTypesGroupedUnderReportSectionsObj[i].otherKeys
        );
    }
    accountTypesGroupedUnderReportSections.sort(
        (a, b) =>
            a?.[0].financial_statement_section.sequence_on_report -
            b?.[0].financial_statement_section.sequence_on_report
    );
    //this is an array of arrays
    // #endregion

    // #region 1. Beginning Cash Balance
    let accounts = [
        {
            index: 1,
            isSectionHeader: true,
            amount: `${beginningCashBalance}`,
            accountName: "Beginning Cash Balance",
        },
    ];
    // #endregion

    //Loop through the Report Sections
    for (let i in accountTypesGroupedUnderReportSections) {
        const accountTypeUnderReportSection =
            accountTypesGroupedUnderReportSections[i];
        const financialStatementSection =
            accountTypeUnderReportSection?.[0].financial_statement_section;

        // #region 1. add SECTION NAME as a Title
        accounts.push({
            accountName: financialStatementSection.name,
            isSectionTitle: true,
            sequenceOnReport: financialStatementSection.sequence_on_report,
        });
        // #endregion

        // #region 2. Add ACCOUNTS and their AMOUNT
        journalsOfTheReportSectionAccounts = journalsAsOfToday.filter(
            (j) =>
                accountTypeUnderReportSection.filter(
                    (at) =>
                        at.account_type_id == j.chart_of_account.account_type_id
                ).length > 0
        );

        const cashFlowAccounts = await getAccounts(
            journalsOfTheReportSectionAccounts,
            openingBalance
        );
        accounts.push(...cashFlowAccounts.reportAccounts);
        // #endregion

        // #region 3. add TOTAL AMOUNT of the section

        if (
            financialStatementSection.name ==
            "CASH_FLOWS_FROM_OPERATING_ACTIVITIES"
        ) {
            accountName = "Net cash provided by Operating Activities";
            operatingActivityAmount = cashFlowAccounts.reportSectionTotalAmount;
        } else if (
            financialStatementSection.name ==
            "CASH_FLOWS_FROM_INVESTING_ACTIVITIES"
        ) {
            accountName = "Net cash provided by Investing Activities";
            investingActivityAmount = cashFlowAccounts.reportSectionTotalAmount;
        } else if (
            financialStatementSection.name ==
            "CASH_FLOWS_FROM_FINANCING_ACTIVITIES"
        ) {
            accountName = "Net cash provided by Financing Activities";
        }

        accounts.push({
            accountName: accountName,
            amount: `${cashFlowAccounts.reportSectionTotalAmount}`,
            isSectionTotal: true,
        });

        if (
            financialStatementSection.name ==
            "CASH_FLOWS_FROM_FINANCING_ACTIVITIES"
        ) {
            accounts.push({
                accountName: "Net Change in cash (A) + (B) + (C)",
                amount: `${
                    operatingActivityAmount +
                    investingActivityAmount +
                    cashFlowAccounts.reportSectionTotalAmount
                }`,
                isSectionFooter: true,
            });

            accounts.push({
                isTotal: true,
                amount: `${
                    beginningCashBalance +
                    (operatingActivityAmount +
                        investingActivityAmount +
                        cashFlowAccounts.reportSectionTotalAmount)
                }`,
                accountName: "Ending Cash Balance",
            });
        }

        // #endregion
    }
    return {
        companyName: COMPANY_NAME,
        reportTitle: "Statement of cash flow",
        reportDateRange: `From ${fromDate.toDateString()} To ${toDate.toDateString()}`,
        accounts,
    };
};

const cashFlowBuildExcel = (cashFlow) => {
    let mergeRanges = [];
    mergeRanges.push({ s: { c: 0, r: 0 }, e: { c: 2, r: 2 } }); //A1:D3

    const sheetOptions = {
        "!cols": Array(4).fill({ wch: 50 }),
        "!merges": mergeRanges,
    };
    let dataSheet = [
        [
            `${cashFlow.companyName}  ${cashFlow.reportTitle}  ${cashFlow.reportDateRange}`,
        ],
        [],
        [],
        ["", "Account Code", "Total"],
        [""],
    ];
    let isHeaderAbove = false;
    for (let i in cashFlow.accounts) {
        const row = cashFlow.accounts[i];
        if (row.isSectionHeader || row.isSectionFooter) {
            dataSheet.push([row.accountName]);
            dataSheet.push([]);
        } else if (row.isSectionTitle) {
            isHeaderAbove = true;
            dataSheet.push([row.accountName]);
            dataSheet.push([]);
        } else if (row.isSectionTotal) {
            if (isHeaderAbove) {
                dataSheet.push([]);
            }
            dataSheet.push([row.accountName, "", row.amount]);
            dataSheet.push([]);
        } else if (row.isTotal) {
            if (isHeaderAbove) {
                dataSheet.push([]);
            }
            dataSheet.push([row.accountName, "", row.amount]);
            dataSheet.push([]);
        } else {
            dataSheet.push([` ${row.accountName}`, "", row.amount]);
        }
    }
    const buffer = xlsx.build([
        {
            name: "Cash Flow",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};
const getHtmlCashFlow = (cashFlow) => {
    let addedRows = "";

    for (let i in cashFlow.accounts) {
        const item = cashFlow.accounts[i];
        if (item.isSectionHeader || item.isSectionFooter) {
            addedRows += `<tr style="border-bottom:0px!important">
                <td><span class="badge bg-gray">${item.index}</span> &nbsp;&nbsp;<span style="padding-top: 20px;padding-bottom: 0;font-weight: 600;">${item.accountName}</span> </td>
                <td style="padding-top: 20px">${item.amount}</td>
            </tr>`;
        } else if (item.isSectionTitle) {
            addedRows += `<tr style="border-bottom:0px!important">
                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="padding-top: 20px;padding-bottom: 0;color:#444;">${item.accountName}</span> </td>
                <td style="padding-top: 20px">&nbsp;</td>
            </tr>`;
        } else if (item.isTotal) {
            addedRows += `<tr style="border-bottom:0px!important">
                <td>
                    <span style="padding-top: 20px;padding-bottom: 0;font-weight: 600;">
                        ${item.accountName}
                        &nbsp; <span class="badge bg-gray">1</span> &nbsp; + &nbsp; <span class="badge bg-gray">2</span>
                    </span>
                </td>
                <td style="padding-top: 20px">${item.amount}</td>
            </tr>`;
        } else if (item.isSectionTotal) {
            addedRows += `
            <tr>
                <td>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <span style="padding-top: 20px;padding-bottom: 0;font-weight: 600;">${item.accountName}</span>
                </td>
                <td>${item.amount}</td>
            </tr>
            `;
        } else {
            addedRows += `
            <tr>
                <td> <a href="#"> ${item.accountName} </a> </td>
                <td> <a href="#"> ${item.amount} </a> </td>
            </tr>
            `;
        }
    }
    let lastAdded = ``;
    if (cashFlow.footNotes && cashFlow.footNotes.length) {
        let innerAddedRows = "";

        for (let i in cashFlow.footNotes) {
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

    return `         
            <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
                  asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
                  asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
            ${mainCss}
        
            <section class="content-header">
                <div class="container-fluid text-center">
                    <h6>${cashFlow.companyName}</h6>
                    <h5>${cashFlow.reportTitle}</h5>
                    <h6>${cashFlow.reportDateRange}</h6>
                </div>
            </section>
            <section class="content" style="background-color:white">

    <div class="box-body">
        <table id="tblTrailBalance" class="table table-condensed zi-table financial-comparsion">

            <thead>
                <tr class="rep-fin-th">
                    <th>Account</th>
                    <th>Total</th>
                </tr>
            </thead>

            <tbody>
            ${addedRows}
            </tbody>
        </table>

        <div>
            <br />
            Amount is displayed in your base currency
            <span class="right badge badge-success"> ETB </span>
        </div>

    </div>
</section>
        ${lastAdded}
        `;
};

//--------------------------------------------------------Balance Sheet Export------------------------------------------------------------------------
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
const balanceSheetExport = async ({
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
    const balanceSheet = await getBalanceSheet(filters);
    if (exportAs === "xlsx") {
        return balanceSheetBuildExcel(balanceSheet);
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
            { ...document, html: getHtmlBalanceSheet(balanceSheet) },
            options
        );
    }
};
/**
 *
 * @param {{fromDate:Date, toDate:Date, dateFormat:string, reportBasis:number}} param0
 */
const getBalanceSheet = async ({
    fromDate,
    toDate,
    dateFormat,
    reportBasis,
}) => {
    //#region Local Fields
    let beginningCashBalance = 0;
    let accountName = "";
    let operatingActivityAmount = 0;
    let investingActivityAmount = 0;
    let journalsOfTheReportSectionAccounts = [];
    var financialStatementSection = {};
    // #endregion

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
    const journalsAsOfToday = await general_journal_detail.findMany({
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
    // var chartOfAccounts = applicationDbContext.ChartOfAccounts.Include("AccountType.AccountCategory").Where(COA => COA.Status == RecordStatus.Active).ToList();

    // #region Read Report Section Configuration

    //Select Account Types configured under BALANCE SHEET report Sections

    const accountTypesInsideBalanceSheetReportSections =
        await account_type_financial_statement_section.findMany({
            where: {
                financial_statement_section: {
                    financial_statement_type: 3,
                },
            },
            include: {
                financial_statement_section: true,
                account_type: true,
            },
        });

    //Group Account Type under it's section
    const accountTypesGroupedUnderReportSectionsObj =
        accountTypesInsideBalanceSheetReportSections.length
            ? groupByFn(
                  ["financial_statement_section_id"],
                  accountTypesInsideBalanceSheetReportSections,
                  Object.keys(accountTypesInsideBalanceSheetReportSections[0])
              )
            : {};
    //Sort Them by Sequence Number
    let accountTypesGroupedUnderReportSections = [];
    for (let i in accountTypesGroupedUnderReportSectionsObj) {
        accountTypesGroupedUnderReportSections.push(
            accountTypesGroupedUnderReportSectionsObj[i].otherKeys
        );
    }
    accountTypesGroupedUnderReportSections.sort(
        (a, b) =>
            a?.[0].financial_statement_section.sequence_on_report -
            b?.[0].financial_statement_section.sequence_on_report
    );
    //this is an array of arrays
    // #endregion

    //Loop through the Report Sections
    let accounts = [];
    let totalAmountOfTheSections = 0;
    for (let i in accountTypesGroupedUnderReportSections) {
        const accountTypeUnderReportSection =
            accountTypesGroupedUnderReportSections[i];
        const financialStatementSection =
            accountTypeUnderReportSection?.[0].financial_statement_section;

        // #region add 'Equity and Liabilities' TITLE to the list when Report Section is Equity
        if (financialStatementSection.name == "EQUITY") {
            accounts.push({
                accountName: "Equity and Liabilities",
                isSectionTitle: true,
                sequenceOnReport: financialStatementSection.sequence_on_report,
            });
        }
        // #endregion
        // #region 1. add SECTION NAME as a Title
        accounts.push({
            accountName: financialStatementSection.name,
            isSectionTitle: true,
            sequenceOnReport: financialStatementSection.sequence_on_report,
        });
        // #endregion

        // #region 2. Add ACCOUNTS and their AMOUNT
        journalsOfTheReportSectionAccounts = journalsAsOfToday.filter(
            (j) =>
                accountTypeUnderReportSection.filter(
                    (at) =>
                        at.account_type_id == j.chart_of_account.account_type_id
                ).length > 0
        );

        const cashFlowAccounts = await getAccounts(
            journalsOfTheReportSectionAccounts,
            openingBalance
        );
        accounts.push(...cashFlowAccounts.reportAccounts);
        if (cashFlowAccounts.reportAccounts) {
            totalAmountOfTheSections +=
                cashFlowAccounts.reportSectionTotalAmount;
        }
        // #endregion

        // #region 3. add TOTAL AMOUNT of the section

        accounts.push({
            accountName: `TOTAL ${financialStatementSection.name}`,
            amount: `${cashFlowAccounts.reportSectionTotalAmount}`,
            isSectionTotal: true,
        });
        if (financialStatementSection.sequence_on_report == 2) {
            accounts.push({
                accountName: `TOTAL ASSETS`,
                amount: `${totalAmountOfTheSections}`,
                isSectionTotal: true,
            });
            totalAmountOfTheSections = 0;
        }
        // #endregion
    }
    accounts.push({
        accountName: "TOTAL LIABILITIES & EQUITIES",
        amount: `${totalAmountOfTheSections}`,
        isAccountCategoryTotal: true,
    });
    return {
        companyName: COMPANY_NAME,
        reportTitle: "Statement of Financial Position",
        reportType: `${REPORT_BASIS_TITLE} ${
            ["accrual", "cash", "both"][reportBasis - 1]
        }`,
        reportDateRange: `From ${fromDate.toDateString()} To ${toDate.toDateString()}`,
        accounts,
    };
};

const balanceSheetBuildExcel = (balanceSheet) => {
    let mergeRanges = [];
    mergeRanges.push({ s: { c: 0, r: 0 }, e: { c: 3, r: 2 } }); //A1:D3

    const sheetOptions = {
        "!cols": Array(4).fill({ wch: 50 }),
        "!merges": mergeRanges,
    };
    let dataSheet = [
        [
            `${balanceSheet.companyName}  ${balanceSheet.reportTitle}  ${balanceSheet.reportDateRange}`,
        ],
        [],
        [],
        ["Assets", "", "", "Total"],
        [],
    ];
    for (let i in balanceSheet.accounts) {
        const row = balanceSheet.accounts[i];
        if (row.isSectionTitle) {
            dataSheet.push([]);
            dataSheet.push([]); //supposed data
            dataSheet.push([]);
        }
        if (row.isHeaderAccountType) {
            dataSheet.push(["", "", "", row.accountName]);
        }
        if (row.accountId > 0) {
            dataSheet.push([`  ${row.accountName}`, "", "", row.amount]);
        }
        if (row.isTotalHeaderAccountType) {
            dataSheet.push(["", "", "", row.amount]);
        }
        if (row.isSectionTotal) {
            dataSheet.push([]);
            dataSheet.push([row.accountName, "", "", row.amount]);
            dataSheet.push([]);
        }
        if (row.isAccountCategoryTotal) {
            dataSheet.push(["", "", row.accountName, row.amount]);
            dataSheet.push([]);
        }
    }
    const buffer = xlsx.build([
        {
            name: "Balance Sheet",
            data: dataSheet,
            options: sheetOptions,
        },
    ]);
    return buffer;
};
const getHtmlBalanceSheet = (balanceSheet) => {
    let addedRows = "";

    for (let i in balanceSheet.accounts) {
        const item = balanceSheet.accounts[i];
        if (item.AccountId > 0) {
            addedRows += `<tr>
                    <td> <span> ${item.accountName} </span></td>
                    <td> <span> ${item.amount} </span> </td>
                </tr>`;
        } else if (item.isTotalSubTitleAccountCategory) {
            addedRows += `<tr>
                    <td><strong>${item.accountName}</strong></td>
                    <td><strong>${item.amount}</strong></td>
                </tr>`;
        } else if (item.isTotalTitleAccountCategory) {
            addedRows += `<tr>
                    <td style="text-align:right"><strong>${item.accountName}</strong></td>
                    <td style="border-bottom: 3px double #c6c6c6!important"><strong>${item.amount}</strong></td>
                </tr>`;
        } else if (item.isSectionTitle) {
            addedRows += `<tr>
                    <td>${item.accountName}</td>
                    <td>-</td>
                </tr>`;
        } else {
            addedRows += `<tr>
                    <td>${item.accountName}</td>
                    <td>${item.amount}</td>
                </tr>`;
        }
    }
    return `         
            <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
                  asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
                  asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
            ${mainCss}
        
            <section class="content-header">
                <div class="container-fluid text-center">
                    <h6>${balanceSheet.companyName}</h6>
                    <h5>${balanceSheet.reportTitle}</h5>
                    <small class="text-center">${balanceSheet.reportType}</small><br />
                    <h6>${balanceSheet.reportDateRange}</h6>
                </div>
            </section>

            <section class="content" style="background-color:white">
            <div class="box-body">
        
                <table id="tblTrailBalance" class="table table-condensed zi-table financial-comparsion">
                    <thead>
                        <tr>
                            <th>Assets</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${addedRows}
                    </tbody>
                </table>
        
                <div>
                    <br />
                    Amount is displayed in your base currency
                    <span class="right badge badge-success">ETB</span>
                </div>
            </div>
        </section>
        `;
};

module.exports = {
    profitLossExport,
    cashFlowExport,
    balanceSheetExport,
    getAccounts,
};
