const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    post,
    deleteFnExternal,
    deleteFnInternal,
} = require("../../../services/vacancyApplicant");
const { returnReqBody } = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");

const allConfigs = require("./jobPosCompStrucRecru.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
    uniqueValues,
} = allConfigs;

router.post("/vacancy_applicant_external", async (req, res, next) => {
    const operationDataType = "external_applicant";
    const optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const requiredInputFilter = allInputFilters[operationDataType];

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
    const reqBody2 = returnReqBody(
        req.body,
        {
            requiredInputFilter: { vacancy_id: "number" },
            optionalInputFilter: {},
            dateValue: [],
            myEnums: {},
            phoneValue: [],
            emailValue: [],
            rangeValues: {},
        },
        next
    );
    if (!reqBody2) {
        return;
    }

    try {
        const data = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next,
            true
        );
        if (data == false) {
            return;
        }
        const data2 = await post(
            {
                ...reqBody2,
                application_date: new Date(),
                application_status: 1,
                is_employee: 2,
                external_applicant_id: data.id,
                name: reqBody.applicant_name,
            },
            "vacancy_applicant",
            res.locals.id,
            uniqueValues["vacancy_applicant"],
            next
        );
        if (data2 == false) {
            return;
        }
        res.json(data2);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.delete("/vacancy_applicant_external", async (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
        console.log(req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleteFnExternal(req.body.id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
router.post("/vacancy_applicant_internal", async (req, res, next) => {
    const operationDataType = "vacancy_internal_applicant";
    const optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const requiredInputFilter = allInputFilters[operationDataType];

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
            {
                ...reqBody,
                application_date: new Date(),
                application_status: 1,
                is_employee: 1,
            },
            "vacancy_applicant",
            res.locals.id,
            uniqueValues["vacancy_applicant"],
            next
        );
        if (data == false) {
            return;
        }
        const data2 = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            next
        );
        if (data2 == false) {
            return;
        }
        res.json(data2);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.delete("/vacancy_applicant_internal", async (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleteFnInternal(req.body.id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});

module.exports = router;
