const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const jobEquipAdder = require("../../../services/jobTitle");
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

router.post("/job_title_equip", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { safetyEquipments: "object", jobTitle: "object" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.safetyEquipments)) {
            throw { key: "safetyEquipments", message: "please send array" };
        }
        if (!reqBody.safetyEquipments.length) {
            throw {
                key: "safetyEquipments",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { safetyEquipments } = reqBody;
    const { jobTitle } = reqBody;

    let listError = false;
    for (let i in safetyEquipments) {
        try {
            if (typeof safetyEquipments[i] == "number") {
                safetyEquipments[i] = Math.floor(safetyEquipments[i]);
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
            "safetyEquipments",
            "all array inputs(safetyEquipments) must be int(equipment ids)",
            next
        );
        return;
    }
    const operationDataType = "job_title";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    const jobReqBody = returnReqBody(
        jobTitle,
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
    if (!jobReqBody) {
        return;
    }
    try {
        const data = await jobEquipAdder(
            safetyEquipments,
            jobReqBody,
            uniqueValues[operationDataType],
            res.locals.id,
            next
        );
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
