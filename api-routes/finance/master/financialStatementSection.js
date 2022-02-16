const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    post,
    get,
    patch,
    mDelete,
} = require("../../../services/financialStatementSection");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");

const allConfigs = require("./financemasters.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
    allProjections,
    allSorts,
    allFilters,
    uniqueValues,
} = allConfigs;

router.post("/financial_statement_section", async (req, res, next) => {
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
router.get("/financial_statement_section", async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    const filters = allFilters[operationDataType],
        sorts = allSorts[operationDataType],
        myEnums = enums[operationDataType],
        projections = allProjections[operationDataType];
    const getData = returnGetData(
        req.body,
        { filters, sorts, projections },
        next
    );
    if (!getData) {
        return;
    }
    const { queryFilter, querySort, limit, skip, projection } = getData;
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                operationDataType,
                myEnums
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/financial_statement_section", async (req, res, next) => {
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
router.delete("/financial_statement_section", (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
        req.body.id = parseInt(req.body.id);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await mDelete(req.body.id);
        if (data == false) return;
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
