const { error, allModels: models } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const { employee, employee_pay_scale } = models;
const { patch: mPatch, post: mPost } = require("./mostCRUD/mostCRUD");
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
module.exports = async (data, uniqueValues, creator, next) => {
    if (data.length < 2) {
        error("file", "no data has been sent for creation", next);
        return false;
    }
    let continueDbCheck = true;
    let ignoredRows = {};
    const firstRow = ["employee_id", "scale"];
    const columnNumber = firstRow.length;
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
            const requiredColumns = { 0: "number", 1: "number" };
            const optionalColumns = {};
            inputFilter(requiredColumns, optionalColumns, data[i]);
        } catch (e) {
            allErrors.push({
                row: Number(i) + 1,
                column: Number(e.key) + 1,
                message: e.message,
            });
            continueDbCheck = false;
        }
    }
    if (allErrors.length > 0) {
        error("file", allErrors, next);
        return false;
    }
    let minDate = new Date(0);
    let maxDate = new Date("9999/12/31");
    const defaultData = {
        startDate: minDate,
        endDate: maxDate,
    };
    console.log(data);
    for (let i in data) {
        if (i == 0) {
            continue;
        }
        const employeeId = data[i][0];
        const scale = data[i][1];
        const emp = await employee.findUnique({
            where: {
                id: employeeId,
            },
        });
        if (emp) {
            const prevEmpScale = await employee_pay_scale.findFirst({
                where: {
                    employee_id: emp.id,
                },
                select: {
                    id: true,
                },
            });
            console.log(i, prevEmpScale);
            if (prevEmpScale) {
                await mPatch(
                    { scale: true, status: true },
                    prevEmpScale,
                    { scale, status: 0 },
                    "employee_pay_scale",
                    creator,
                    [],
                    (whatever) => {
                        console.log(whatever);
                    }
                );
            } else {
                await mPost(
                    {
                        employee_id: emp.id,
                        scale,
                        ...defaultData,
                    },
                    "employee_pay_scale",
                    creator,
                    uniqueValues,
                    next
                );
            }
        }
    }
    return true;
};
