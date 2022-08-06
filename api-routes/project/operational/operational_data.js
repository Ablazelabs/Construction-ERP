const express = require("express");
const router = express.Router();
const {
    error,
    getOperationDataType,
    allModels,
} = require("../../../config/config");
const {
    post,
    get,
    patch,
    getProjectId,
    patchSecondRemark,
} = require("../../../services/operational_data");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const allConfigs = require("./operational_data.json");
const {
    allRoutes,
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
    const operationDataType = getOperationDataType(req.path);
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
    if (
        operationDataType === "daily_report" &&
        req.body.todo_ids &&
        Array.isArray(req.body.todo_ids) &&
        req.body.todo_ids.length
    ) {
        let success = true;
        for (const i in req.body.todo_ids) {
            if (typeof req.body.todo_ids[i] !== "number") {
                success = false;
            }
        }
        success && (reqBody.todo_ids = req.body.todo_ids);
    }
    if (
        operationDataType === "daily_report" &&
        req.body.employee_ids &&
        Array.isArray(req.body.employee_ids) &&
        req.body.employee_ids.length
    ) {
        let success = true;
        for (const i in req.body.employee_ids) {
            if (typeof req.body.employee_ids[i] !== "number") {
                success = false;
            }
        }
        success && (reqBody.employee_ids = req.body.employee_ids);
    }
    //before posting like the others we need to check date values of operational data(except for the ones that don't have project id as foreign key to keep the date limit)
    //this will be extended now with also task_manager id holder values to respect the task manager dates!
    try {
        const data = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            operationDataType !== "project" &&
                checkAgainstProject[operationDataType],
            checkAgainstTaskManager[operationDataType],
            next,
            operationDataType === "project"
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
    const operationDataType = getOperationDataType(req.path);
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
        let data = await get(
            queryFilter,
            querySort,
            limit,
            skip,
            projection,
            operationDataType,
            res.locals.id
        );
        if (operationDataType === "daily_report") {
            const ids = data.map((elem) => ({ id: Number(elem.revisedBy) }));
            const userNames = await allModels.user.findMany({
                where: {
                    OR: ids,
                },
                select: {
                    id: true,
                    employee: {
                        select: {
                            first_name: true,
                            middle_name: true,
                        },
                    },
                },
            });
            res.json(
                data.map((elem) => {
                    let remarks = [];
                    try {
                        remarks = JSON.parse(elem.remark) || [null, null];
                    } catch (e) {
                        remarks = [elem.remark, null];
                    }
                    const foundManager = userNames.find(
                        (emp) => emp.id === Number(elem.revisedBy)
                    );
                    console.log({ foundManager, elem, userNames });
                    const manager_name =
                        foundManager?.employee?.first_name +
                        " " +
                        foundManager?.employee?.middle_name;
                    return {
                        ...elem,
                        remark: remarks[0],
                        remark2: remarks[1],
                        manager_name,
                    };
                })
            );
        } else {
            res.json(data);
        }
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/project/project_id", async (req, res, next) => {
    res.json({ project_id: await getProjectId() });
});
router.patch(allRoutes, async (req, res, next) => {
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
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            res.locals.id,
            operationDataType !== "project" &&
                checkAgainstProject[operationDataType],
            checkAgainstTaskManager[operationDataType],
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
router.patch("/report_remark", async (req, res, next) => {
    if (!(req.body.remark && typeof req.body.remark === "string")) {
        error("remark", "remark please send string", next);
        return;
    }
    if (!(req.body.id && typeof req.body.id === "number")) {
        error("id", "id please send number", next);
        return;
    }
    res.json(await patchSecondRemark(req.body.id, req.body.remark));
});
router.delete(allRoutes, defaultDeleter);
module.exports = router;
