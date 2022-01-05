const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const { post, get, patch, deleter } = require("../services/role");
router.post("/role", async (req, res, next) => {
    try {
        inputFilter({ name: "string" }, { privileges: "object" }, req.body, 4);
        inputFilter({}, { description: "string" }, req.body, 0, 300);
        if (req.body.privileges) {
            if (!Array.isArray(updateData.privileges)) {
                throw { key: "privileges", message: "must be an array" };
            }
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    const privileges = req.body.privileges
        ? req.body.privileges.map((element) => {
              return { id: element };
          })
        : [];
    try {
        const data = await post(req.body, privileges, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
    }
});
router.get("/role", async (req, res, next) => {
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
                { name: "string", description: "string", id: "number" },
                req.body.filter
            );
        }
        if (req.body.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    name: "number",
                    id: "number",
                    description: "number",
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const projection = {
        name: true,
        description: true,
        concurrency_stamp: true,
        id: true,
        privileges: true,
    };
    let queryFilter = {};
    for (let i in filter) {
        if (typeof filter[i] !== "string")
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
        res.json(await get(queryFilter, querySort, limit, skip, projection));
    } catch (e) {
        error("database", "error", next, 500);
    }
});
router.patch("/role", async (req, res, next) => {
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
                name: "string",
                description: "string",
                privileges: "object",
            },
            req.body.updateData
        );
        if (updateData.privileges) {
            if (!Array.isArray(updateData.privileges)) {
                throw { key: "privileges", message: "must be an array" };
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
router.delete("/role", async (req, res, next) => {
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
