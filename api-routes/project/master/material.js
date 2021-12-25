const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post, get, patch } = require("../../../services/material");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const requiredInputFilter = {
    name: "string",
    unit: "string",
    material_category_id: "number",
};
const optionalInputFilter = {
    description: "string",
};
const filters = {
    name: "string",
    description: "string",
    unit: "string",
    material_category_id: "number",
};
const sorts = {
    name: "number",
    id: "number",
    description: "number",
    unit: "number",
    material_category_name: "number",
    material_category_id: "number",
};
const projections = {
    name: true,
    description: true,
    id: true,
    unit: true,
    material_category: true,
};
const dateValue = {},
    myEnums = {},
    phoneValue = [],
    emailValue = [],
    rangeValues = {};
router.post("/material", async (req, res, next) => {
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
    if (!reqBody) {
        return;
    }

    try {
        const data = await post(
            reqBody,
            "material",
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
router.get("/material", async (req, res, next) => {
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
                "material"
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/material", async (req, res, next) => {
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
            "material",
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
router.delete("/material", defaultDeleter);
module.exports = router;
