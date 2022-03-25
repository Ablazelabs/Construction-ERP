const { error, allModels } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const { employee, employee_pay_scale } = allModels;
const { patch: mPatch, post: mPost } = require("./mostCRUD/mostCRUD");
module.exports = async (data, uniqueValues, creator, next) => {
    if (data.length < 2) {
        error("file", "no data has been sent for creation", next);
        return false;
    }
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
            if (prevEmpScale) {
                await mPatch(
                    { scale: true, status: true },
                    prevEmpScale,
                    { scale, status: 0 },
                    "employee_pay_scale",
                    creator,
                    [], //error 500 if next called so.
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
