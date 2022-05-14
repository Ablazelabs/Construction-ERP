const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post, get, patch } = require("../../../services/hcmEmployeeMasters");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
    getManagerUsers,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const allConfigs = require("./hcmEmployeeMasters.json");
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
    uniqueValues,
    defaultValues,
} = allConfigs;

router.post(allPostRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
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
    for (let i in defaultValues) {
        if (i === operationDataType) {
            reqBody = { ...reqBody, ...defaultValues[i] };
            break;
        }
    }
    if (operationDataType === "announcement") {
        // employees:{
        //     connect:[{id:1}]
        // },
        // business_unit:{
        //     connect:[{id:2}]
        // },
        // job_title:{
        //     connect:[{id:1}]
        // },
        if (reqBody.all_employees) {
            //do nothing
        } else if (reqBody.employee_id) {
            if (Array.isArray(reqBody.employee_id)) {
                let employeesArray = [...reqBody.employee_id];
                employeesArray = employeesArray
                    .map((elem) => parseInt(elem))
                    .filter((elem) => elem);
                if (!employeesArray.length) {
                    error(
                        "employee_id",
                        "employee id please send array of numbers",
                        next
                    );
                    return;
                }
                reqBody.employees = {
                    connect: employeesArray.map((elem) => ({ id: elem })),
                };
            } else {
                error("employee_id", "employee id please send array", next);
                return;
            }
        } else if (reqBody.business_unit_id) {
            if (Array.isArray(reqBody.business_unit_id)) {
                let businessUnits = [...reqBody.business_unit_id];
                businessUnits = businessUnits
                    .map((elem) => parseInt(elem))
                    .filter((elem) => elem);
                if (!businessUnits.length) {
                    error(
                        "business_unit_id",
                        "business units please send array of numbers",
                        next
                    );
                    return;
                }
                reqBody.business_unit = {
                    connect: businessUnits.map((elem) => ({ id: elem })),
                };
            } else {
                error(
                    "business_unit_id",
                    "business units please send array",
                    next
                );
                return;
            }
        } else if (reqBody.job_title_id) {
            if (Array.isArray(reqBody.job_title_id)) {
                let jobTitlesArray = [...reqBody.job_title_id];
                jobTitlesArray = jobTitlesArray
                    .map((elem) => parseInt(elem))
                    .filter((elem) => elem);
                if (!jobTitlesArray.length) {
                    error(
                        "job_title_id",
                        "Job Titles please send array of numbers",
                        next
                    );
                    return;
                }
                reqBody.job_title = {
                    connect: jobTitlesArray.map((elem) => ({ id: elem })),
                };
            } else {
                error("job_title_id", "Job Titles please send array", next);
                return;
            }
        } else {
            error(
                "display",
                "please send one of all employees, selected employees, job titles, or business units connected to the announcement",
                next
            );
            return;
        }
        delete reqBody.employee_id;
        delete reqBody.business_unit_id;
        delete reqBody.job_title_id;
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
router.get(allRoutes, async (req, res, next) => {
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
        const data = await get(
            queryFilter,
            querySort,
            limit,
            skip,
            projection,
            operationDataType,
            res.locals.id
        );
        if (operationDataType === "announcement") {
            res.json(
                data.map((elem) => ({
                    ...elem,
                    startDate: elem.start_timme,
                    endDate: elem.end_time,
                }))
            );
        } else {
            res.json(data);
        }
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/user", async (req, res, next) => {
    res.json(await getManagerUsers());
});
router.patch(allPostRoutes, async (req, res, next) => {
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
router.delete(allRoutes, defaultDeleter);
module.exports = router;
