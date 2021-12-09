const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const validation = require("../../../validation/validation");

const { post, get, patch, deleter } = require("../../../services/client");

router.post("/client", async (req, res, next) => {
    try {
        inputFilter(
            {
                name: "string",
                tradeName: "string",
                address: "string",
                tel: "string",
                tinNumber: "string",
                contactPersonName: "string",
                contactPersonPhone: "string",
                contactPersonEmail: "string",
                email: "string",
                startDate: "string",
                endDate: "string",
            },
            {
                isProtectedForEdit: "boolean",
                subCity: "string",
                woreda: "string",
                city: "string",
            },
            req.body,
            4
        );
        req.body.startDate = new Date(req.body.startDate);
        req.body.endDate = new Date(req.body.endDate);
        if (!req.body.startDate.getTime()) {
            throw {
                key: "startDate",
                message: "please send date in yyyy/mm/dd format",
            };
        }
        if (!req.body.endDate.getTime()) {
            throw {
                key: "endDate",
                message: "please send date in yyyy/mm/dd format",
            };
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    if (
        !validation.checkEmail(
            req.body.contactPersonEmail,
            next,
            "contactPersonEmail"
        )
    ) {
        return;
    }
    if (!validation.checkEmail(req.body.email, next)) {
        return;
    }
    if (
        !validation.checkPhoneNumber(
            req.body.contactPersonPhone,
            next,
            "contactPersonPhone"
        )
    ) {
        return;
    }
    if (!validation.checkPhoneNumber(req.body.tel, next, "tel")) {
        return;
    }
    try {
        const data = await post(req.body, res.locals.id, next);
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
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    try {
        inputFilter(
            { limit: "number" },
            { skip: "number", filter: "object", sort: "object" },
            req.body
        );
        limit = req.body.limit;
        skip = req.body.skip || 0;
        if (req.body.filter) {
            filter = inputFilter(
                {},
                {
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
                },
                req.body.filter
            );
        }
        if (req.body.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    id: "number",
                    startDate: "number",
                    endDate: "number",
                    name: "number",
                    isProtectedForEdit: "number",
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
                    revisionDate: "number",
                    creationDate: "number",
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const projection = {
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
        startDate: true,
        endDate: true,
        creationDate: true,
        createdBy: true,
        revisionDate: true,
        revisedBy: true,
        isProtectedForEdit: true,
    };
    let queryFilter = {};
    for (let i in filter) {
        queryFilter[i] = { contains: filter[i] };
    }
    let querySort = {};
    for (let i in sort) {
        querySort[i] = sort[i] ? "asc" : "desc";
    }
    try {
        res.json(await get(queryFilter, querySort, limit, skip, projection));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/client", async (req, res, next) => {
    let updateData = {};
    try {
        inputFilter(
            {
                id: "number",
                updateData: "object",
            },
            {},
            req.body
        );

        updateData = inputFilter(
            {},
            {
                name: "string",
                tradeName: "string",
                address: "string",
                tel: "string",
                tinNumber: "string",
                contactPersonName: "string",
                contactPersonPhone: "string",
                contactPersonEmail: "string",
                email: "string",
                startDate: "string",
                endDate: "string",
                isProtectedForEdit: "boolean",
                subCity: "string",
                woreda: "string",
                city: "string",
            },
            req.body.updateData
        );
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
            if (!updateData.startDate.getTime()) {
                throw {
                    key: "startDate",
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
            if (!updateData.endDate.getTime()) {
                throw {
                    key: "endDate",
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }
    let updateDataProjection = {};
    for (let i in updateData) {
        if (updateData[i]) {
            updateDataProjection[i] = true;
        }
    }
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
