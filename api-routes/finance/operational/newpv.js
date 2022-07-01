const express = require("express");
const router = express.Router();
const { error, getOperationDataType } = require("../../../config/config");

const {
    patchPaymentRequest,
    deleter,
    postPaymentRequest,
    postPettyCash,
} = require("../../../services/newpv");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");


const allConfigs = require("./rest_finance_operational.json");
const {
    allRoutes,
    allPostRoutes,
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
} = allConfigs;

router.post("payment_request", (req, res, next) => {
    const operationDataType = "payment_request";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = returnReqBody(
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
        const data = await postPaymentRequest(
            reqBody,
            operationDataType,
            res.locals.id,
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
router.post("petty_cash", (req, res, next) => {
    const operationDataType = "payment_request";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    let reqBody = returnReqBody(
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
        const data = await postPettyCash(
            reqBody,
            operationDataType,
            res.locals.id,
            next
        );
        if (data == false) {
            return;
        }
        //I used promise.all to handle transaction decreasing remaining balance from payment request!
        res.json(data[0]);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("payment_request", (req, res, next) => {
    const operationDataType = getOperationDataType(req.path);

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
        const data = await patchPaymentRequest(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            res.locals.id,
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
router.patch("petty_cash", (req, res, next) => {});
router.post("/payment_request/add_attachment", (req, res, next) => {});
router.delete("/payment_request/remove_attachment", (req, res, next) => {});
/**
 * will also replace the id(use it ass add or as patch)
 */
router.post("/payment_request/add_id", (req, res, next) => {});
/**
 * will also replace the id(use it ass add or as patch)
 */
router.patch("petty_cash/add_id", (req, res, next) => {});
