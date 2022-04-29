const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { get } = require("../../../services/hcmEmployeeMasters");
const { returnGetData } = require("../../../validation/basicValidators");

const allConfigs = require("./hcmEmployeeMasters.json");
const { allProjections, allSorts, allFilters } = allConfigs;

const projectionEnum = [
    "id",
    "id_number",
    "first_name",
    "middle_name",
    "last_name",
    "gender",
    "date_of_birth",
    "employment_start_date",
    "date_of_joining",
    "marital_status",
    "marital_since",
    "place_of_birth",
    "photo",
    "is_employee_active",
    "type",
    "prev_employment_leave_days",
    "bank_account_number",
    "document_ref",
    "pension_ref",
    "nationality",
    "country",
    "language",
    "title",
    "religion",
    "employee_type",
    "startDate",
    "endDate",
    "creationDate",
    "createdBy",
    "revisionDate",
    "revisedBy",
    "isProtectedForEdit",
];
router.get("/employee/export", async (req, res, next) => {
    const operationDataType = "employee";
    const filters = allFilters[operationDataType],
        sorts = allSorts[operationDataType],
        projections = allProjections[operationDataType];
    if (!req.body.limit) {
        req.body.limit = 1000;
    }
    const customProjection = req.body.customProjection;
    console.log(req.body);
    if (customProjection) {
        if (
            Array.isArray(customProjection) &&
            customProjection.length <= projectionEnum.length &&
            customProjection > 0
        ) {
            error(
                "customProjection",
                `please send at least one and less than ${projectionEnum.length} or an array`,
                next
            );
            return;
        }
        for (let i in customProjection) {
            if (
                typeof customProjection[i] !== "number" ||
                customProjection[i] < 0 ||
                customProjection[i] >= projectionEnum.length
            ) {
                error(
                    "customProjection",
                    `all data in the custom projection must be integers, between 0 and ${projectionEnum.length}`,
                    next
                );
                return;
            }
        }
    }
    const getData = returnGetData(
        req.body,
        { filters, sorts, projections },
        next
    );
    if (!getData) {
        return;
    }
    const { queryFilter, querySort, limit, skip, projection } = getData;

    let newProjection = {};
    if (customProjection) {
        for (let i in customProjection) {
            newProjection[projectionEnum[customProjection[i]]] =
                projection[projectionEnum[customProjection[i]]];
        }
    } else {
        newProjection = projection;
    }
    try {
        const data = await get(
            queryFilter,
            querySort,
            limit,
            skip,
            newProjection,
            operationDataType
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});

module.exports = router;
