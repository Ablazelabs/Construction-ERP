const { error, allModels: models } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const {
    client,
    equipment,
    evaluation,
    instruction,
    manpower,
    material_category,
    material,
    phase,
    priority,
    work_category,
    document_category,
    documentation,
} = models;
const hasDuplicates = (array) => {
    return new Set(array).size !== array.length;
};
const checkUnique = async (data, model, key, ignored, rowIndex) => {
    let query = {};
    query[key] = data;
    const queryData = await model.findUnique({
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
module.exports = async (data, type, creator, next) => {
    const allModels = [
        client,
        equipment,
        evaluation,
        instruction,
        manpower,
        material_category,
        material,
        phase,
        priority,
        work_category,
        document_category,
        documentation,
    ];
    if (data.length < 2) {
        error("file", "no data has been sent for creation", next);
        return false;
    }
    let continueDbCheck = true;
    let ignoredRows = {};
    const firstRow =
        type == 0
            ? [
                  "name",
                  "tradeName",
                  "address",
                  "city",
                  "tel",
                  "tinNumber",
                  "subCity",
                  "woreda",
                  "contactPersonName",
                  "contactPersonPhone",
                  "contactPersonEmail",
                  "email",
              ]
            : type == 6
            ? ["name", "description", "unit", "material_category_id"]
            : type == 8
            ? ["name", "description", "color"]
            : type == 11
            ? ["name", "description", "document_category_id"]
            : ["name", "description"];
    const columnNumber =
        type == 0 ? 12 : type == 6 ? 4 : type == 8 || type == 11 ? 3 : 2;
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
                type == 0
                    ? {
                          0: "string",
                          1: "string",
                          2: "string",
                          4: "string",
                          5: "string",
                          8: "string",
                          9: "string",
                          10: "string",
                          11: "string",
                      }
                    : type == 6
                    ? { 0: "string", 2: "string", 3: "string" }
                    : type == 11
                    ? { 0: "string", 2: "string" }
                    : { 0: "string" };
            const optionalColumns =
                type == 0
                    ? {
                          3: "string",
                          6: "string",
                          7: "string",
                      }
                    : { 1: "string" };
            inputFilter(requiredColumns, optionalColumns, data[i]);
        } catch (e) {
            allErrors.push({
                row: Number(i) + 1,
                column: Number(e.key) + 1,
                message: e.message,
            });
            continueDbCheck = false;
        }
        if (type == 0) {
            validation.checkEmail(data[i][10], () => {
                continueDbCheck = false;
                allErrors.push({
                    row: Number(i) + 1,
                    column: 11,
                    message: "email format is wrong",
                });
            });
            validation.checkEmail(data[i][11], () => {
                continueDbCheck = false;
                allErrors.push({
                    row: Number(i) + 1,
                    column: 12,
                    message: "email format is wrong",
                });
            });
            validation.checkPhoneNumber(data[i][4], () => {
                continueDbCheck = false;
                allErrors.push({
                    row: Number(i) + 1,
                    column: 5,
                    message: "phone number format is wrong",
                });
            });
            validation.checkPhoneNumber(data[i][9], () => {
                continueDbCheck = false;
                allErrors.push({
                    row: Number(i) + 1,
                    column: 10,
                    message: "phone number format is wrong",
                });
            });
        }
        if (!continueDbCheck) {
            continue;
        }
        const uniqueRows = type == 0 ? [1, 4, 5, 9, 10, 11] : [0];
        for (let k in uniqueRows) {
            if (
                !(await checkUnique(
                    data[i][uniqueRows[k]],
                    allModels[type],
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
        if (type == 6) {
            const category = await allModels[5].findUnique({
                where: {
                    name: data[i][3],
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            if (category && category.status == 0) {
                data[i][3] = category.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 3 + 1,
                    message: `no category exists with the name ${data[i][3]}`,
                });
            }
        } else if (type == 11) {
            const category = await allModels[10].findUnique({
                where: {
                    name: data[i][2],
                },
                select: {
                    id: true,
                    status: true,
                },
            });
            if (category && category.status == 0) {
                data[i][2] = category.id;
            } else {
                allErrors.push({
                    row: Number(i) + 1,
                    column: 2 + 1,
                    message: `no document category exists with this name`,
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
    await allModels[type].createMany({
        data: [...createRows],
        skipDuplicates: true,
    });
    for (let i in updateRows) {
        await allModels[type].update({
            data: {
                ...updateRows[i],
            },
            where: {
                id: updateRows[i].id,
            },
        });
    }

    return true;
};
