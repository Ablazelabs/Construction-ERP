const { error, allModels: models } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const {
    chart_of_account,
    chart_of_account_files,
    general_journal_files,
    general_journal_header,
    account_type,
    currency,
} = models;
const hasDuplicates = (array) => {
    return new Set(array).size !== array.length;
};
const checkUnique = async (data, model, key, ignored, rowIndex) => {
    let query = {};
    query[key] = data;
    const queryData = await model.findFirst({
        where: {
            ...query,
        },
        select: {
            status: true,
            id: true,
        },
    });
    if (queryData) {
        if (queryData.status == 1) {
            ignored[rowIndex] = queryData.id;
            return true;
        }
        return false;
    }
    return true;
};
const allModels = {
    chart_of_account_files,
    general_journal_files,
};
module.exports = async (
    data,
    type,
    creator,
    fileType,
    fileName,
    fileUrl,
    next
) => {
    const myModel =
        type == "chart_of_account_files"
            ? chart_of_account
            : general_journal_header;
    if (data.length < 2) {
        error("file", "no data has been sent for creation", next);
        return false;
    }
    let continueDbCheck = true;
    let ignoredRows = {};
    const firstRow =
        type == "chart_of_account_files"
            ? [
                  "account_code",
                  "account_name",
                  "account_number",
                  "account_type_id",
                  "currency_id",
                  "add_to_dashboard_watch_list",
                  "description",
              ]
            : [
                  "journal_date",
                  "posting_reference",
                  "notes",
                  "chart_of_account_id",
                  "description",
                  "credit_amount",
                  "debit_amount",
                  "currency_id",
              ];
    const columnNumber = 7;
    if (data[0].length != columnNumber) {
        error(
            "file",
            `all column must be filled like so(${columnNumber} columns) ${String(
                firstRow
            )}`,
            next
        );
        return false;
    }
    let allErrors = [];
    for (let i in data) {
        if (i == 0) {
            continue;
        }
        try {
            const requiredColumns =
                type == "chart_of_account_files"
                    ? {
                          0: "string",
                          1: "string",
                          2: "string",
                          3: "string",
                          4: "string",
                          5: "boolean",
                      }
                    : {
                          0: "string",
                          1: "string",
                          2: "string",
                          3: "string",
                      };
            const optionalColumns =
                type == "chart_of_account_files"
                    ? { 6: "string" }
                    : { 4: "string", 5: "number", 6: "number" };
            inputFilter(requiredColumns, optionalColumns, data[i]);
        } catch (e) {
            allErrors.push({
                row: Number(i) + 1,
                column: Number(e.key) + 1,
                message: e.message,
            });
            continueDbCheck = false;
        }
        if (type == "general_journal_files") {
            data[i][0] = new Date(data[i][0]);
            if (!data[i][0].getTime()) {
                continueDbCheck = false;
                allErrors.push({
                    row: Number(i) + 1,
                    column: 1,
                    message: "please send a valid date format yyyy/mm/dd",
                });
            }
        }
        if (!continueDbCheck) {
            continue;
        }
        const uniqueRows = type == "chart_of_account_files" ? [0] : [];
        for (let k in uniqueRows) {
            if (
                !(await checkUnique(
                    data[i][uniqueRows[k]],
                    myModel,
                    firstRow[uniqueRows[k]],
                    ignoredRows,
                    i
                ))
            ) {
                allErrors.push({
                    row: Number(i) + 1,
                    column: Number(uniqueRows[k]) + 1,
                    message: `${
                        firstRow[uniqueRows[k]]
                    } is already registered in database`,
                });
            }
        }
        if (type == "chart_of_account_files") {
            const myAccType = await account_type.findFirst({
                where: {
                    type: data[i][3],
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            if (myAccType && myAccType.status == 0) {
                data[i][3] = myAccType.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 3 + 1,
                    message: `no type exists with this name`,
                });
            }
            const myCurrency = await currency.findFirst({
                where: {
                    currency_code: data[i][4],
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            if (myCurrency && myCurrency.status == 0) {
                data[i][4] = myCurrency.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 4 + 1,
                    message: `no currency exists with this name`,
                });
            }
        } else {
            const myCurrency = await currency.findFirst({
                where: {
                    is_base_currency: true,
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            //we assume data[i][7] stands for currency id(for base currency)
            if (myCurrency && myCurrency.status == 0) {
                data[i][7] = myCurrency.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: "all",
                    message: `no currency is registered as base`,
                });
            }
            const myChart = await chart_of_account.findFirst({
                where: {
                    account_code: data[i][3],
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            if (myChart && myChart.status == 0) {
                data[i][3] = myChart.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 3 + 1,
                    message: `no account exists with this code`,
                });
            }
            if (data[i][5] && data[i][6]) {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 5,
                    message: `both credit and debit can't have an amount`,
                });
            }
        }
    }

    if (allErrors.length > 0) {
        error("file", allErrors, next);
        return false;
    }
    let ignoredArray = [];
    let ignoredArrayValues = [];
    for (let i in ignoredRows) {
        ignoredArray.push(i);
        ignoredArrayValues.push(ignoredRows[i]);
    }
    if (hasDuplicates(ignoredArray)) {
        error(
            "file",
            "some duplicate values exist(has to do with a deleted user)",
            next
        );
        return false;
    }
    let updateRows = [];
    for (let i in ignoredArray) {
        updateRows.push(data[ignoredArray[i]]);
        data[ignoredArray[i]] = undefined;
        //   updateRows = updateRows.concat(
        //     data.splice(ignoredArray[i], ignoredArray[i])
        //   );
        //   console.log(ignoredArray[i], updateRows.length);
    }
    let newData = [];
    for (let i in data) {
        if (data[i] == undefined) {
            continue;
        }
        newData.push(data[i]);
    }
    data = [...newData];
    let minDate = new Date(0);
    let maxDate = new Date("9999/12/31");
    // minDate = minDate.toISOString();
    // maxDate = maxDate.to();
    const defaultData = {
        startDate: minDate,
        endDate: maxDate,
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    let createRows = data.map((row, rowIndex) => {
        let returnedObj = {};
        if (rowIndex == 0) {
            return {};
        }
        for (let i in firstRow) {
            returnedObj[firstRow[i]] = row[i];
        }
        if (type == "general_journal_files") {
            returnedObj["general_journal_detail"] = {};
            returnedObj["general_journal_detail"]["create"] = [
                {
                    ...defaultData,
                    debit_or_credit: row[5] ? 1 : 2,
                    posting_reference: row[1],
                    chart_of_account_id: row[3],
                    description: row[4],
                },
            ];
            returnedObj["journal_comment"] = {};
            returnedObj["journal_comment"]["create"] = [
                {
                    ...defaultData,
                    comment: "Journal imported from excel",
                    application_user_id: creator,
                },
            ];
            returnedObj["posting_responsible_user_id"] = creator;
            returnedObj["chart_of_account_id"] = undefined;
            returnedObj["credit_amount"] = undefined;
            returnedObj["debit_amount"] = undefined;
            returnedObj["description"] = undefined;
        }

        return { ...returnedObj, ...defaultData };
    });

    createRows.shift();
    updateRows = updateRows.map((row, rowIndex) => {
        let returnedObj = {};
        for (let i in firstRow) {
            returnedObj[firstRow[i]] = row[i];
        }
        return {
            ...returnedObj,
            ...defaultData,
            id: ignoredArrayValues[rowIndex],
        };
    });
    let count;
    if (type == "chart_of_account_files") {
        count = await myModel.createMany({
            data: [...createRows],
            skipDuplicates: true,
        });
        count = count.count;
    } else {
        count = 0;
        try {
            for (let i in createRows) {
                await myModel.create({
                    data: { ...createRows[i] },
                });
                count++;
            }
        } catch {}
    }
    const { id } = await myModel.findFirst({
        select: {
            id: true,
        },
    });
    for (let i in updateRows) {
        await myModel.update({
            data: {
                ...updateRows[i],
            },
            where: {
                id: updateRows[i].id,
            },
        });
    }
    let foreignKeyId =
        type == "chart_of_account_files"
            ? { chart_of_account_id: id }
            : { general_journal_header_id: id };
    await allModels[type].create({
        data: {
            ...defaultData,
            path: fileUrl,
            name: fileName,
            type: fileType,
            ...foreignKeyId,
        },
    });
    console.log(count);
    return count;
};
