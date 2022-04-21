const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const inputFilter = require("../validation/inputFilter");
const { post, get, patch, deleter } = require("../services/privilege");
router.post("/privilege", async (req, res, next) => {
    try {
        inputFilter({ action: "string" }, {}, req.body);
        inputFilter({}, { description: "string" }, req.body, 0, 300);
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    try {
        const data = await post(req.body, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/privilege", async (req, res, next) => {
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
                { action: "string", description: "string", all: "string" },
                req.body.filter
            );
        }
        if (req.body.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    action: "number",
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
        action: true,
        description: true,
        concurrency_stamp: true,
        id: true,
    };
    let queryFilter = {};
    for (let i in filter) {
        if (i === "all") {
            continue;
        }
        queryFilter[i] = { contains: filter[i] };
    }
    if (filter.all) {
        queryFilter["OR"] = [];
        const newFilters = { action: "string", description: "string" };
        for (let i in newFilters) {
            if (newFilters[i] === "string") {
                let temp = {};
                temp[i] = { contains: filter.all };
                queryFilter["OR"].push({ ...temp });
            }
        }
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
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/privilege", async (req, res, next) => {
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
                action: "string",
                description: "string",
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
router.delete("/privilege", async (req, res, next) => {
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
