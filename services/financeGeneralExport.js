const { allModels } = require("../config/config");
const { general_journal_header, export_template } = allModels;
const xlsx = require("node-xlsx");
/**
 *
 * @param {{
 *  from:Date,
 *  to:Date,
 *  template_id:number,
 *  journal_posting_status:number,
 *  account_status:number,
 *  account_category_name:string,
 *  period_filter:number,
 *  exportAs:"xlsx"|"csv"
 *}} reqBody
 * @param {object} modules
 * @param {number} creator
 * @param {Function} next
 */
const exporter = async (
    {
        from,
        to,
        template_id,
        journal_posting_status,
        account_status,
        account_category_name,
        period_filter,
        exportAs,
    },
    modules,
    allModuleFields,
    enumerator1,
    enumerator2,
    creator,
    sort,
    next
) => {
    const exportTemplate = await export_template.findUnique({
        where: {
            id: template_id,
        },
    });
    if (!exportTemplate) {
        error(
            "export_template_id",
            "no export template exists with this id",
            next
        );
        return;
    }
    const moduleName = modules[exportTemplate.module_name - 1];
    let list = [];
    const export_template_fields =
        exportTemplate.export_template_fields.split(",");
    const excel_columns = exportTemplate.excel_columns.split(",");
    if (moduleName === "exportReadyJournal") {
        list = await readyJournalHandler(
            {
                from,
                to,
                exportTemplate,
                journal_posting_status,
                account_status,
                account_category_name,
                period_filter,
            },
            moduleName,
            allModuleFields,
            enumerator1,
            enumerator2,
            creator,
            next
        );
    } else {
        const enumerator = enumerator1[moduleName] || enumerator2[moduleName];
        let addedFilter = {};
        if (moduleName === "chart_of_account") {
            if (account_status) {
                addedFilter = { status: account_status - 1 };
            } else if (account_category_name) {
                addedFilter = {
                    account_type: {
                        account_category: {
                            name: {
                                contains: account_category_name,
                            },
                        },
                    },
                };
            }
        }
        let select = {};
        for (let i in export_template_fields) {
            const key =
                allModuleFields[moduleName][
                    parseInt(export_template_fields[i]) - 1
                ];
            select[key] = true;
            if (moduleName === "chart_of_account") {
                if (key == "parent_account") {
                    select[key] = { select: { account_name: true } };
                } else if (key == "account_type") {
                    select[key] = { select: { code: true } };
                } else if (key == "currency") {
                    select[key] = { select: { currency_code: true } };
                } else if (key == "head_account") {
                    select[key] = { select: { account_name: true } };
                }
            } else {
                if (key == "currency") {
                    select[key] = { select: { currency_code: true } };
                }
            }
        }
        let creation = {};
        if (from && to) {
            creation = {
                gt: from,
                lte: to,
            };
        }
        const data = await allModels[moduleName].findMany({
            where: {
                status: 0,
                ...addedFilter,
                creationDate: creation,
            },
            sort,
            select,
        });
        list = data.map((elem) => {
            let newElem = {};
            for (let i in export_template_fields) {
                const key =
                    allModuleFields[moduleName][
                        parseInt(export_template_fields[i]) - 1
                    ];
                if (enumerator[key]) {
                    newElem[key] = enumerator[key][elem[key] - 1];
                } else if (
                    elem[key] &&
                    typeof elem[key] == "object" &&
                    Object.keys(elem[key]).length > 0
                ) {
                    if (Object.keys(elem[key]).length === 1) {
                        const inKey = Object.keys(elem[key])[0];
                        //one more in check is enough for this usecase(use loops if the objects are treed more than 3 times)
                        if (
                            typeof elem[key][inKey] === "object" &&
                            Object.keys(elem[key][inKey]).length > 0
                        ) {
                            if (Object.keys(elem[key][inKey]).length === 1)
                                newElem[key] =
                                    elem[key][inKey][
                                        Object.keys(elem[key][inKey])[0]
                                    ];
                            else newElem[key] = elem[key][inKey]["id"];
                            continue;
                        } else {
                            newElem[key] = elem[key][inKey];
                        }

                        continue;
                    }
                    newElem[key] = elem[key].id;
                } else if (elem[key]?.toDateString) {
                    newElem[key] = elem[key].toDateString();
                } else {
                    newElem[key] = elem[key];
                }
            }
            return newElem;
        });
    }
    const data = buildFile(
        list,
        excel_columns,
        export_template_fields,
        allModuleFields[moduleName],
        moduleName,
        exportAs
    );
    // if (exportAs === "xlsx") {
    //     require("fs").writeFileSync("./output.xlsx", data);
    // } else {
    //     require("fs").writeFileSync("./output.csv", data);
    // }
    return data;
};
/**
 *
 * @param {{
 *  from:Date,
 *  to:Date,
 *  exportTemplate:import("@prisma/client").export_template,
 *  journal_posting_status:number,
 *  account_status:number,
 *  account_category_name:string,
 *  period_filter:number,
 *}} reqBody
 * @param {string} moduleName
 * @param {number} creator
 * @param {Function} next
 */
const readyJournalHandler = async (
    { from, to, exportTemplate, journal_posting_status, period_filter },
    moduleName,
    allModuleFields,
    enumerator1,
    enumerator2,
    creator,
    next
) => {
    const enumerator = enumerator1[moduleName] || enumerator2[moduleName];
    let addedFilter = {};

    if (journal_posting_status) {
        addedFilter = {
            journal_posting_status,
        };
    }
    if (period_filter) {
        const now = new Date();
        if (period_filter === 1) {
            addedFilter = {
                ...addedFilter,
                journal_date: {
                    gt: new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate(),
                        00,
                        00,
                        00,
                        00
                    ),
                },
            };
        } else if (period_filter === 2) {
            addedFilter = {
                ...addedFilter,
                journal_date: {
                    gt: new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate() - 7,
                        00,
                        00,
                        00,
                        00
                    ),
                },
            };
        } else if (period_filter === 3) {
            addedFilter = {
                ...addedFilter,
                journal_date: {
                    gt: new Date(
                        now.getFullYear(),
                        now.getMonth() - 1,
                        now.getDate(),
                        00,
                        00,
                        00,
                        00
                    ),
                },
            };
        } else if (period_filter === 4) {
            addedFilter = {
                ...addedFilter,
                journal_date: {
                    gt: new Date(
                        now.getFullYear(),
                        now.getMonth() - 3,
                        now.getDate(),
                        00,
                        00,
                        00,
                        00
                    ),
                },
            };
        } else if (period_filter === 5) {
            addedFilter = {
                ...addedFilter,
                journal_date: {
                    gt: new Date(
                        now.getFullYear() - 1,
                        now.getMonth(),
                        now.getDate(),
                        00,
                        00,
                        00,
                        00
                    ),
                },
            };
        }
    }
    let select = {};
    const export_template_fields =
        exportTemplate.export_template_fields.split(",");
    for (let i in export_template_fields) {
        const key =
            allModuleFields[moduleName][
                parseInt(export_template_fields[i]) - 1
            ];
        select[key] = true;
        if (moduleName === "chart_of_account") {
            if (key == "parent_account") {
                //continue from here friday
                select[key] = { select: { account_name: true } };
            } else if (key == "account_type") {
                select[key] = { select: { code: true } };
            } else if (key == "currency") {
                select[key] = { select: { currency_code: true } };
            } else if (key == "head_account") {
                select[key] = { select: { account_name: true } };
            }
        }
    }
    const generalJournalHeaders = await general_journal_header.findMany({
        where: {
            status: 0,
            ...addedFilter,
        },
        include: {
            currency: true,
            general_journal_detail: {
                include: {
                    tax: true,
                    chart_of_account: true,
                },
            },
        },
    });
    const exportReadyJounals = [];
    for (let i in generalJournalHeaders) {
        const generalJournalHeader = generalJournalHeaders[i];
        for (let k in generalJournalHeader.general_journal_detail) {
            const detail = generalJournalHeader.general_journal_detail[k];
            let exported = {};
            for (let i in export_template_fields) {
                const key =
                    allModuleFields[moduleName][
                        parseInt(export_template_fields[i]) - 1
                    ];
                if (
                    key === "posting_reference" ||
                    key === "reference_number" ||
                    key === "notes" ||
                    key === "journal_date"
                ) {
                    if (generalJournalHeader[key]?.toDateString) {
                        exported[key] =
                            generalJournalHeader[key].toDateString();
                    } else {
                        exported[key] = generalJournalHeader[key];
                    }
                } else if (
                    key === "report_basis" ||
                    key === "journal_posting_status" ||
                    key === "journal_type"
                ) {
                    exported[key] =
                        enumerator[key][generalJournalHeader[key] - 1];
                } else if (
                    key === "is_inclusive_tax" ||
                    key === "tax_name" ||
                    key === "tax_percentage" ||
                    key === "tax_amount" ||
                    key === "tax_type"
                ) {
                    if (key === "is_inclusive_tax") {
                        exported[key] = Boolean(detail.tax);
                    }
                    if (key === "tax_name") {
                        exported[key] = detail.tax?.tax_name;
                    }
                    if (key === "tax_percentage") {
                        exported[key] = detail.tax?.tax_percentage;
                    }
                    if (key === "tax_amount") {
                        exported[key] =
                            detail.debit_or_credit === 1
                                ? detail.amount_credit ||
                                  0 * detail.tax?.tax_percentage ||
                                  0
                                : undefined;
                    }
                    if (key === "tax_type") {
                        exported[key] =
                            detail.tax?.tax_type &&
                            enumerator[key][detail.tax.tax_type - 1];
                    }
                } else if (
                    key === "amount_debit" ||
                    key === "amount_credit" ||
                    key === "description"
                ) {
                    exported[key] = detail[key];
                } else if (
                    key === "account_name" ||
                    key === "currency_code" ||
                    key === "total"
                ) {
                    if (key === "account_name") {
                        exported[key] = detail.chart_of_account.account_name;
                    }
                    if (key === "currency_code") {
                        exported[key] =
                            generalJournalHeader.currency.currency_code;
                    }
                    if (key === "total") {
                        exported[key] =
                            exported.amount_credit || 0 + exported.debit || 0;
                    }
                }
            }
            exportReadyJounals.push(exported);
        }
    }
    return exportReadyJounals;
};
const buildFile = (
    list,
    excel_columns,
    export_template_fields,
    moduleFields,
    moduleName,
    exportAs
) => {
    let cols = Array(excel_columns.length).fill(1);
    cols = cols.map((_elem, index) => {
        return { wch: excel_columns[index].length + 5 };
    });
    const sheetOptions = {
        "!cols": cols,
    };
    let dataSheet = [excel_columns];
    for (let i in list) {
        const row = list[i];
        let addedRow = [];
        for (let i in export_template_fields) {
            const key = moduleFields[parseInt(export_template_fields[i]) - 1];
            addedRow.push(row[key]);
        }
        dataSheet.push(addedRow);
    }
    if (exportAs === "xlsx") {
        return xlsx.build([
            {
                name:
                    moduleName === "exportReadyJournal"
                        ? "General Journal"
                        : moduleName,
                data: dataSheet,
                options: sheetOptions,
            },
        ]);
    } else {
        let c = "";
        dataSheet.forEach((elem) => {
            c += `${elem}\n`;
        });
        return Buffer.from(c);
    }
};
module.exports = exporter;
