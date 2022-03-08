const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");

const { post, get, patch, deleter } = require("../services/account");

router.post("/account", async (req, res, next) => {
    //error messages clearly define what the code fragment is trying to achieve
    let otherData = {};
    try {
        otherData = inputFilter(
            {
                username: "string",
            },
            {
                phone_number: "string",
                email: "string",
                phone_number: "string",
                two_factor_enabled: "boolean",
                roleId: "number",
            },
            req.body
        );
        inputFilter({ password: "string" }, {}, req.body, 8);
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    if (!req.body.phone_number && !req.body.email) {
        error("identifier", "email or phone must be provided", next);
        return;
    }
    const identifier = req.body.phone_number
        ? { key: "phone_number", value: req.body.phone_number }
        : { key: "email", value: req.body.email };
    if (identifier["key"] == "phone_number") {
        if (!validation.checkPhoneNumber(identifier["value"], next)) return;
    } else {
        if (!validation.checkEmail(identifier["value"], next)) return;
    }
    if (!validation.checkPassword(req.body.password, next)) {
        return;
    }
    otherData[identifier.key] = undefined;
    try {
        let identifier2 = {};
        identifier2[identifier.key] = identifier.value;
        const data = await post(
            identifier2,
            identifier.key,
            req.body,
            otherData,
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
router.get("/account", async (req, res, next) => {
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
                    username: "string",
                    email: "string",
                    phone_number: "string",
                    role: "number",
                    id: "number",
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
                    username: "number",
                    email: "number",
                    phone_number: "number",
                    id: "number",
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
        username: true,
        normalized_username: true,
        email: true,
        phone_number: true,
        two_factor_enabled: true,
        lockout_enabled: true,
        concurrency_stamp: true,
        role: true,
    };
    let role = {};
    if (filter.role) {
        role = {
            id: filter.role,
        };
        filter.role = undefined;
    }
    let queryFilter = {};
    for (let i in filter) {
        if (typeof filter[i] == "number")
            queryFilter[i] = { equals: filter[i] };
        else queryFilter[i] = { contains: filter[i] };
    }
    let querySort = [];
    for (let i in sort) {
        let pushedObj = {};
        pushedObj[i] = sort[i] ? "asc" : "desc";
        querySort.push(pushedObj);
    }
    try {
        res.json(
            await get(queryFilter, querySort, role, limit, skip, projection)
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/account", async (req, res, next) => {
    let updateData = {};
    try {
        inputFilter(
            {
                id: "number",
                updateData: "object",
                concurrency_stamp: "string",
            },
            {},
            req.body
        );

        updateData = inputFilter(
            {},
            {
                username: "string",
                email: "string",
                phone_number: "string",
                two_factor_enabled: "boolean",
                roleId: "number",
            },
            req.body.updateData
        );
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
router.delete("/account", async (req, res, next) => {
    try {
        inputFilter(
            {
                id: "number",
            },
            {},
            req.body
        );
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
