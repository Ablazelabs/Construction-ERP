const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { post, get, patch } = require("../../../services/documentation");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const defaultDeleter = require("../../defaultDeleter");

const requiredInputFilter = {
    name: "string",
    document_category_id: "number",
};
const optionalInputFilter = {
    description: "string",
};
const filters = {
    name: "string",
    description: "string",
    document_category_id: "number",
};
const sorts = {
    name: "number",
    id: "number",
    description: "number",
    document_category_id: "number",
};
const projections = {
    name: true,
    description: true,
    id: true,
    document_category: true,
};
const dateValue = {},
    myEnums = {},
    phoneValue = [],
    emailValue = [],
    rangeValues = {};
router.post("/documentation", async (req, res, next) => {
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
            "documentation",
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
router.get("/documentation", async (req, res, next) => {
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
                "documentation"
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/documentation", async (req, res, next) => {
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
            "documentation",
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
router.delete("/documentation", defaultDeleter);
module.exports = router;
