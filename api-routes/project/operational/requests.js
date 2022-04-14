const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    post,
    get,
    patch,
    getProjectId,
} = require("../../../services/projectRequests");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const allConfigs = require("./requests.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    allProjections,
    allSorts,
    allFilters,
} = allConfigs;

router.post("/project_requests", async (req, res, next) => {
    const requiredInputFilter = allInputFilters.all_requests;
    const dateValue = dateValues.all_requests;
    const myEnums = enums.all_requests;
    const optionalInputFilter = allOptionalInputFilters.all_requests;

    let reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue: undefined,
            emailValue: undefined,
            rangeValues: undefined,
        },
        next
    );
    if (!reqBody) {
        return;
    }
    //#region delete unnecessary reqbody returns;
    delete reqBody.startDate;
    delete reqBody.endDate;
    //#endregion
    //header data(data not in array)
    //now we know all neccesary header data has been sent( now to make sure )
    //now to check for individual requests
    let { request } = req.body;
    if (!request || !request.length) {
        error("request", "at least one request must be sent", next);
        return;
    }
    const requestTypeKey =
        reqBody.request_type === 1
            ? "individual_payment"
            : reqBody.request_type === 2
            ? "individual_manpower"
            : "individual_store";
    for (let i in request) {
        let individualRequestBody = returnReqBody(
            request[i],
            {
                requiredInputFilter: {
                    ...allInputFilters.all_individuals,
                    ...allInputFilters[requestTypeKey],
                },
                optionalInputFilter: {
                    ...allOptionalInputFilters.allInputFilters,
                    ...allOptionalInputFilters[requestTypeKey],
                },
                dateValue: {
                    ...dateValue.all_individuals,
                    ...dateValue[requestTypeKey],
                },
                myEnums: { ...enums.all_individuals, ...enums[requestTypeKey] },
                phoneValue: undefined,
                emailValue: undefined,
                rangeValues: undefined,
            },
            next
        );
        if (!individualRequestBody) {
            return;
        }
        //#region delete unnecessary reqbody returns;
        delete individualRequestBody.startDate;
        delete individualRequestBody.endDate;
        delete individualRequestBody.isProtectedForEdit;
        //#endregion
        request[i] = individualRequestBody;
    }
    try {
        console.log({ reqBody, request });
        return { success: true };
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
router.get("/project_requests", async (req, res, next) => {
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
router.patch("/project_requests", async (req, res, next) => {
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
router.delete("/project_requests", defaultDeleter);
module.exports = router;
