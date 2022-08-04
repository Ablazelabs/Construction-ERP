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
const { allProjections, allSorts, allFilters } = allConfigs;

// router.get("/all_project_requests", async (req, res, next) => {
//     const filters = allFilters["request_payment"],
//         sorts = allSorts["request_payment"],
//         projections = {
//             request_type: true,
//             priority: true,
//             approval_status: true,
//             prepared_by: true,
//             remark: true,
//             id: true,
//             status: true,
//             total_amount: true,
//             vat_amount: true,
//             sub_total: true,
//             checked_by: true,
//             approved_by: true,
//             project: true,
//             finance_approval_status: true,
//             action_note: true,
//             remark: true,
//         };
//     delete req.body?.sort?.startDate;
//     delete req.body?.sort?.endDate;
//     const getData = returnGetData(
//         req.body,
//         { filters, sorts, projections },
//         next
//     );
//     if (!getData) {
//         return;
//     }
//     let { queryFilter, querySort, limit, skip, projection } = getData;
//     delete projection.startDate;
//     delete projection.endDate;
//     const pushedOrAddedFilter = { approval_status: { not: 0 } };
//     if (queryFilter.OR) {
//         queryFilter.OR.push(pushedOrAddedFilter);
//     } else {
//         queryFilter.OR = [pushedOrAddedFilter];
//     }
//     try {
//         res.json(
//             await get(
//                 queryFilter,
//                 querySort,
//                 limit,
//                 skip,
//                 projection,
//                 "project_request"
//             )
//         );
//     } catch (e) {
//         console.log(e);
//         error("database", "error", next, 500);
//     }
// });
router.get(
    ["/required_equipment", "/required_material", "/manpower_requirement"],
    async (req, res, next) => {
        const project_id = parseInt(req?.body?.filter?.project_id);
        if (isNaN(project_id)) {
            return error(
                "project_id",
                "please send project Id as a filter",
                next,
                400
            );
        }
        allModels.individual_requests.findMany({
            where: {},
        });
        //returnable material, //non returnable equipment
        const operationDataType = getOperationDataType(req.path);
        let requestType = 3;
        let filterOperationDataType = "individual_store";
        if (operationDataType === "manpower_requirement") {
            requestType = 2;
            filterOperationDataType = "individual_manpower";
        }
        if (operationDataType === "required_material") {
            req.body.filter = { ...(req.body.filter || {}), returnable: false };
        } else if (operationDataType === "required_equipment") {
            req.body.filter = { ...(req.body.filter || {}), returnable: true };
        }
        const filters = allFilters[filterOperationDataType],
            sorts = allSorts[filterOperationDataType];
        const projections = allProjections[filterOperationDataType];
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
        delete projection.isProtectedForEdit;
        queryFilter = {
            ...(queryFilter || {}),
            project_request: {
                approval_status: 0,
                request_type: requestType,
                project_id,
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
                    "individual_requests"
                )
            );
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
        }
    }
);

module.exports = router;
