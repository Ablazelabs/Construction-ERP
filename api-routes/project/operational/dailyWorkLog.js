const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post } = require("../../../services/operational_data");

const { returnReqBody } = require("../../../validation/basicValidators");

const allConfigs = require("./operational_data.json");
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
const allRoutes = "/daily_work_log";
let checkAgainstProject = {};
let checkAgainstTaskManager = {};
for (let i in dateValues) {
    if (dateValues[i].length) {
        let containsProject = false;
        let containsTaskManager = false;
        const keys = [
            ...Object.keys(allInputFilters[i]),
            ...Object.keys(allOptionalInputFilters[i]),
        ];
        if (keys.indexOf("project_id") !== -1) {
            containsProject = true;
        }
        if (keys.indexOf("task_manager_id") !== -1) {
            containsTaskManager = true;
        }
        if (containsTaskManager) {
            checkAgainstTaskManager[i] = dateValues[i];
        } else if (containsProject) {
            checkAgainstProject[i] = dateValues[i];
        }
    }
}

router.post(allRoutes, async (req, res, next) => {
    /**
     * operation data type is = "daily_work_log" (nothing fancy)
     */
    const operationDataType = req.path.split("/").pop();

    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    const dailyWorkLogData = returnReqBody(
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
    if (!dailyWorkLogData) {
        return;
    }
    const riskTrackingData = returnReqBody(
        req.body,
        {
            requiredInputFilter: allInputFilters["risk_tracking"],
            optionalInputFilter: allOptionalInputFilters["risk_tracking"],
            dateValue: dateValues["risk_tracking"],
            myEnums: enums["risk_tracking"],
            phoneValue: phoneValues["risk_tracking"],
            emailValue: emailValues["risk_tracking"],
            rangeValues: allRangeValues["risk_tracking"],
        },
        next
    );
    if (!riskTrackingData) {
        return;
    }
    try {
        const workLogData = await post(
            dailyWorkLogData,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            undefined,
            undefined,
            next
        );
        if (workLogData == false) {
            return;
        }
        const riskData = await post(
            dailyWorkLogData,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            undefined,
            undefined,
            next
        );
        if (riskData == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
