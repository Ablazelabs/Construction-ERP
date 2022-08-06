const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    post,
    get,
    postEditRequest,
    getEditRequest,
    statusEditRequest,
    deleter,
} = require("../../../services/projectRequests");

const {
    returnReqBody,
    returnGetData,
} = require("../../../validation/basicValidators");

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

router.post("/project_request", async (req, res, next) => {
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
                    ...dateValues.all_individuals,
                    ...dateValues[requestTypeKey],
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
        // console.log({ reqBody, request });
        if (req.body.requirement) {
            reqBody.approval_status = 0;
        }
        const data = await post(reqBody, request, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.post("/project_edit_request", async (req, res, next) => {
    const requiredInputFilter = allInputFilters.project_edit_request;
    const dateValue = dateValues.project_edit_request;
    const myEnums = enums.project_edit_request;
    const optionalInputFilter = allOptionalInputFilters.project_edit_request;

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
    reqBody.requester_id = res.locals.id;
    //#region delete unnecessary reqbody returns;
    delete reqBody.startDate;
    delete reqBody.endDate;
    delete reqBody.isProtectedForEdit;
    //#endregion

    try {
        const data = await postEditRequest(reqBody, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/project_edit_request", async (req, res, next) => {
    try {
        res.json(await getEditRequest(Boolean(req.body.all)));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/project_edit_request/status", async (req, res, next) => {
    try {
        if (!req.body.project_id) {
            error("project_id", "please send project id", next);
            return;
        }
        if (typeof req.body.project_id !== "number") {
            error("project_id", "project id, please send number", next);
            return;
        }
        res.json(await statusEditRequest(res.locals.id, req.body.project_id));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/all_project_requests", async (req, res, next) => {
    const filters = allFilters["request_payment"],
        sorts = allSorts["request_payment"],
        projections = {
            request_type: true,
            priority: true,
            approval_status: true,
            prepared_by: true,
            remark: true,
            id: true,
            status: true,
            total_amount: true,
            vat_amount: true,
            sub_total: true,
            checked_by: true,
            approved_by: true,
            project: true,
            finance_approval_status: true,
            action_note: true,
            remark: true,
        };
    delete req.body?.sort?.startDate;
    delete req.body?.sort?.endDate;
    const getData = returnGetData(
        req.body,
        { filters, sorts, projections },
        next
    );
    if (!getData) {
        return;
    }
    let { queryFilter, querySort, limit, skip, projection } = getData;
    delete projection.startDate;
    delete projection.endDate;
    const pushedOrAddedFilter = { approval_status: { not: 0 } };
    if (queryFilter.OR) {
        queryFilter.OR.push(pushedOrAddedFilter);
    } else {
        queryFilter.OR = [pushedOrAddedFilter];
    }
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                "project_request"
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/detail_project_requests", async (req, res, next) => {
    const request_type = req.body?.filter?.request_type;
    if (typeof request_type !== "number") {
        error("request_type", "please send appropriate request type", next);
        return;
    }
    if (!request_type || request_type < 1 || request_type > 3) {
        error("request_type", "please send appropriate request type", next);
        return;
    }
    const requestTypeKey = [
        "",
        "request_payment",
        "request_manpower",
        "request_store",
    ][request_type];
    const individualTypeKey = [
        "",
        "individual_payment",
        "individual_manpower",
        "individual_store",
    ][request_type];
    const filters = allFilters[requestTypeKey],
        sorts = allSorts[requestTypeKey];
    const projections = allProjections[requestTypeKey];
    delete req.body?.sort?.startDate;
    delete req.body?.sort?.endDate;
    const getData = returnGetData(
        req.body,
        { filters, sorts, projections },
        next
    );
    if (!getData) {
        return;
    }
    let { queryFilter, querySort, limit, skip, projection } = getData;
    if (queryFilter?.approval_status?.equals === 1) {
        delete queryFilter?.approval_status;
        queryFilter["OR"] = [
            ...(queryFilter["OR"] || []),
            { approval_status: { equals: 4 } },
            { approval_status: { equals: 1 } },
        ];
    }
    delete projection.startDate;
    delete projection.endDate;

    projection.individual_requests = {
        select: {
            ...allProjections[individualTypeKey],
        },
    };
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                "project_request"
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});

// router.uploadInvoice;

router.delete("/project_request", async (req, res, next) => {
    if (req.body.id && typeof req.body.id === "number")
        await deleter(req.body.id);
    res.json({ success: true });
});
module.exports = router;
