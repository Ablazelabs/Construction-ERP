const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");

const { post, get, patch, deleter } = require("../../../services/client");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");
const requiredInputFilter = {
    name: "string",
    tradeName: "string",
    address: "string",
    tel: "string",
    tinNumber: "string",
    contactPersonName: "string",
    contactPersonPhone: "string",
    contactPersonEmail: "string",
    email: "string",
};
const optionalInputFilter = {
    subCity: "string",
    woreda: "string",
    city: "string",
};
const myEnums = {};
const phoneValue = ["tel", "contactPersonPhone"];
const emailValue = ["email", "contactPhoneEmail"];
const dateValue = [];
const rangeValues = [];
const filters = {
    name: "string",
    tradeName: "string",
    address: "string",
    tel: "string",
    tinNumber: "string",
    contactPersonName: "string",
    contactPersonPhone: "string",
    contactPersonEmail: "string",
    email: "string",
    subCity: "string",
    woreda: "string",
    city: "string",
};
const sorts = {
    id: "number",
    name: "number",
    tradeName: "number",
    address: "number",
    tel: "number",
    tinNumber: "number",
    contactPersonName: "number",
    contactPersonPhone: "number",
    contactPersonEmail: "number",
    email: "number",
    subCity: "number",
    woreda: "number",
    city: "number",
};
const projections = {
    id: true,
    name: true,
    tradeName: true,
    address: true,
    city: true,
    tel: true,
    tinNumber: true,
    subCity: true,
    woreda: true,
    contactPersonName: true,
    contactPersonPhone: true,
    contactPersonEmail: true,
    email: true,
};
router.post("/client", async (req, res, next) => {
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
        const data = await post(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/client", async (req, res, next) => {
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
        res.json(await get(queryFilter, querySort, limit, skip, projection));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/client", async (req, res, next) => {
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
            res.locals.id,
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
router.delete("/client", async (req, res, next) => {
    try {
        inputFilter({ id: "number" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleter(req.body));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});

module.exports = router;
