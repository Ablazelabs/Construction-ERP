const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { jobEquipAdder, get, patch } = require("../../../services/jobTitle");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");
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
    allFilters,
    allSorts,
    allProjections,
} = allConfigs;

router.post("/job_title", async (req, res, next) => {
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
        console.log("here");
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
            console.log({ data, jobReqBody });
            return;
        } else res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
router.get("/job_title", async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    const filters = allFilters[operationDataType],
        sorts = allSorts[operationDataType],
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
                operationDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/job_title", async (req, res, next) => {
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
    let safetyData = {};
    try {
        safetyData = inputFilter(
            { safetyEquipments: "object" },
            {},
            req.body.updateData,
            1
        );
        if (!Array.isArray(safetyData.safetyEquipments)) {
            throw { key: "safetyEquipments", message: "please send array" };
        }
        // if (!safetyData.safetyEquipments.length) {
        //     throw {
        //         key: "safetyEquipments",
        //         message: "array can't be empty",
        //     };
        // }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { safetyEquipments } = safetyData;
    const { jobTitle } = safetyData;

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
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            safetyEquipments,
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
module.exports = router;
