const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post, get, patch } = require("../../../services/restMasterData");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const allRoutes = [
    "/equipment",
    "/evaluation",
    "/instruction",
    "/manpower",
    "/material_category",
    "/phase",
    "/priority",
    "/work_category",
    "/document_category",
];
const requiredInputFilter = {
    name: "string",
};
router.post(allRoutes, async (req, res, next) => {
    const masterDataType = req.path.split("/").pop();
    const color = masterDataType == "priority" ? { color: "string" } : {};
    const optionalInputFilter = {
        ...color,
        description: "string",
    };
    const dateValue = {},
        myEnums = {},
        phoneValue = [],
        emailValue = [],
        rangeValues = {};
    const reqBody = returnReqBody(
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
    try {
        const data = await post(
            reqBody,
            masterDataType,
            res.locals.id,
            ["name"],
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
    const masterDataType = req.path.split("/").pop();
    const color =
        masterDataType == "priority"
            ? [{ color: "string" }, { color: "number" }, { color: true }]
            : [{}, {}, {}];
    const filters = {
        name: "string",
        description: "string",
        ...color[0],
    };
    const sorts = {
        name: "number",
        id: "number",
        description: "number",
        ...color[1],
    };
    const projections = {
        name: true,
        description: true,
        id: true,
        ...color[2],
    };
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
                masterDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    const masterDataType = req.path.split("/").pop();
    const color = masterDataType == "priority" ? { color: "string" } : {};
    const optionalInputFilter = {
        ...color,
        description: "string",
    };
    const dateValue = {},
        myEnums = {},
        phoneValue = [],
        emailValue = [],
        rangeValues = {};
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
            masterDataType,
            res.locals.id,
            ["name"],
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
