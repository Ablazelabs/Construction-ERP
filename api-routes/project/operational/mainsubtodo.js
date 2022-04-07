const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post, get, patch } = require("../../../services/mainsubtodo");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const allConfigs = require("./operational_data.json");
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
const allRoutes = ["/task_manager", "/sub_task"];
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
    const operationDataType = req.path.split("/").pop();
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];
    const [pre, todos] = [req.body.prerequisites, req.body.todos];
    if (pre) {
        if (typeof pre !== "object") {
            error("prerequisites", "prerequisites must be array", next);
            return;
        }
        if (!Array.isArray(pre)) {
            error("prerequisites", "prerequisites must be array", next);
            return;
        }
        if (!pre.length) {
            error(
                "prerequisites",
                "prerequisites must have at least 1 data",
                next
            );
            return;
        }
        for (const i in pre) {
            if (typeof pre[i] !== "number") {
                error(
                    "prerequisites",
                    "prerequisites must contain only numbers",
                    next
                );
                return;
            }
        }
    }
    if (todos && operationDataType === "subtask") {
        if (typeof todos !== "object") {
            error("todos", "todos must be array", next);
            return;
        }
        if (!Array.isArray(todos)) {
            error("todos", "todos must be array", next);
            return;
        }
        if (!todos.length) {
            error("todos", "todos must have at least 1 data", next);
            return;
        }
        for (const i in todos) {
            if (typeof todos[i] !== "string") {
                error("todos", "todos must contain only strings", next);
                return;
            }
        }
    }
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
    //before posting like the others we need to check date values of operational data(except for the ones that don't have project id as foreign key to keep the date limit)
    //this will be extended now with also task_manager id holder values to respect the task manager dates!
    try {
        const data = await post(
            reqBody,
            operationDataType,
            res.locals.id,
            uniqueValues[operationDataType],
            pre,
            todos,
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
// router.patch(allRoutes, async (req, res, next) => {
//     const operationDataType = req.path.split("/").pop();

//     const requiredInputFilter = allInputFilters[operationDataType],
//         optionalInputFilter = allOptionalInputFilters[operationDataType],
//         dateValue = dateValues[operationDataType],
//         myEnums = enums[operationDataType],
//         phoneValue = phoneValues[operationDataType],
//         emailValue = emailValues[operationDataType],
//         rangeValues = allRangeValues[operationDataType];

//     const data = returnPatchData(
//         req.body,
//         {
//             requiredInputFilter,
//             optionalInputFilter,
//             dateValue,
//             myEnums,
//             phoneValue,
//             emailValue,
//             rangeValues,
//         },
//         next
//     );
//     if (!data) {
//         return;
//     }
//     const { updateData, updateDataProjection } = data;
//     try {
//         const data = await patch(
//             updateDataProjection,
//             req.body,
//             updateData,
//             operationDataType,
//             res.locals.id,
//             uniqueValues[operationDataType],
//             next
//         );
//         if (data == false) {
//             return;
//         }
//         res.json(data);
//     } catch (e) {
//         console.log(e);
//         error("database", "error", next, 500);
//         return;
//     }
// });
// router.delete(allRoutes, defaultDeleter);
module.exports = router;
