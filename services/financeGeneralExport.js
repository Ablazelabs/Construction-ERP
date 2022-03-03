const { allModels } = require("../config/config");
const { chart_of_account, account_category, export_template } = allModels;
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
    },
    modules,
    allModuleFields,
    enumerator1,
    enumerator2,
    creator,
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
    const enumerator = enumerator1[moduleName] || enumerator2[moduleName];
    let addedFilter = {};
    if (moduleName === "chart_of_account") {
        if (account_status) {
            addedFilter = { status: account_status - 1 };
        } else if (account_category_name) {
            addedFilter = {
                account_type: {
                    account_category: {
                        name: account_category_name,
                    },
                },
            };
        }
    } else if (moduleName === "general_journal_header") {
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
    }
    let select = {};
    const export_template_fields =
        exportTemplate.export_template_fields.split(",");
    const excel_columns = exportTemplate.excel_columns.split(",");
    console.log({ export_template_fields }, allModuleFields[moduleName]);
    for (let i in export_template_fields) {
        const key =
            allModuleFields[moduleName][
                parseInt(export_template_fields[i]) - 1
            ];
        select[key] = true;
        if (moduleName === "chart_of_account") {
            if (key == "parent_account") {
                //continue from here friday
            }
        }
    }
    const data = await allModels[moduleName].findMany({
        where: {
            status: 0,
            ...addedFilter,
            creationDate: {
                gt: from,
                lte: to,
            },
        },
        select,
    });
    console.log(
        data.map((elem) => {
            let newElem = {};
            for (let i in export_template_fields) {
                const key =
                    allModuleFields[moduleName][
                        parseInt(export_template_fields[i]) - 1
                    ];
                if (enumerator[key]) {
                    newElem[key] = enumerator[key][elem[key] - 1];
                } else if (
                    typeof elem[key] == "object" &&
                    Object.keys(elem[key]) > 0
                ) {
                    if (Object.keys(elem[key]).length === 1) {
                        const inKey = Object.keys(elem[key])[0];
                        //one more in check is enough for this usecase(use loops if the objects are treed more than 3 times)
                        if (
                            typeof elem[key][inKey] === "object" &&
                            Object.keys(elem[key][inKey]) > 0
                        ) {
                            if (Object.keys(elem[key][inKey]) === 1)
                                newElem[key] =
                                    elem[key][inKey][
                                        Object.keys(elem[key][inKey])[0]
                                    ];
                            else newElem[key] = elem[key][inKey]["id"];
                            continue;
                        } else newElem[key] = elem[key][inKey];
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
        })
    );
    return { success: true };
};
module.exports = { exporter };
