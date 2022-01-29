const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { getSlip } = require("../../../services/payrollSlip");
const inputFilter = require("../../../validation/inputFilter");

const dateValue = ["fromDate", "toDate"];

router.get("payroll_slip", async (req, res, next) => {
    try {
        reqBody = inputFilter(
            {
                selectedEmployees: "object",
                fromDate: "string",
                toDate: "string",
            },
            {
                activeEmployees: "boolean",
            },
            req.body
        );
        if (!Array.isArray(reqBody.selectedEmployees)) {
            throw { key: "selectedEmployees", message: "please send array" };
        }
        if (!reqBody.selectedEmployees.length) {
            throw {
                key: "selectedEmployees",
                message: "array can't be empty",
            };
        }
        for (let i in dateValue) {
            if (!reqBody[dateValue[i]]) {
                continue;
            }
            reqBody[dateValue[i]] = new Date(reqBody[dateValue[i]]);
            if (!reqBody[dateValue[i]].getTime()) {
                throw {
                    key: dateValue[i],
                    message: `${dateValue[i]} please send date in yyyy/mm/dd format`,
                };
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { selectedEmployees } = reqBody;
    const { fromDate, toDate, activeEmployees } = reqBody;
    let listError = false;
    for (let i in selectedEmployees) {
        try {
            if (typeof selectedEmployees[i] == "number") {
                selectedEmployees[i] = Math.floor(selectedEmployees[i]);
                continue;
            }
            throw "error in list";
        } catch {
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "selectedEmployees",
            "all array inputs(selectedEmployees) must be int(employee ids)",
            next
        );
        return;
    }
    try {
        const slipDetails = await getSlip(
            selectedEmployees,
            fromDate,
            toDate,
            activeEmployees ? true : false
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.post("payroll_slip", async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!reqBody) {
        return;
    }

    try {
        const data = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next
        );
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("payroll_slip", async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();

    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const data = returnPatchData(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!data) {
        return;
    }
    const { updateData, updateDataProjection } = data;
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next
        );
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
router.delete(
    allRoutes,
    async (req, res, next) => {
        const operationDataType = req.path.split("/").pop();
        if (
            req?.body?.id &&
            typeof req.body.id === "number" &&
            operationDataType === "overtime"
        ) {
            const logicDone = await deleteLogic(
                req.body.id,
                operationDataType,
                next
            );
            if (!logicDone) {
                return;
            }
        }
        next();
    },
    defaultDeleter
);
module.exports = router;
