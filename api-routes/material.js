const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const { userHasPrivilege } = require("../validation/auth");
const { post, get, patch, deleter } = require("../services/material");
router.post("/material", async (req, res, next) => {
    try {
        inputFilter(
            {
                name: "string",
                accessToken: "string",
                unit: "string",
                material_category_id: "number",
                startDate: "string",
                endDate: "string",
            },
            {
                isProtectedForEdit: "boolean",
            },
            req.body,
            4
        );
        inputFilter({}, { description: "string" }, req.body, 0, 300);
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
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }
    const PRIVILEGE_TYPE = "material_create";
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    try {
        const data = await post(req.body, payLoad.id, next);
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
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    try {
        inputFilter(
            { limit: "number", accessToken: "string" },
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
                    description: "string",
                    unit: "string",
                    material_category_name: "string",
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
                    name: "number",
                    id: "number",
                    description: "number",
                    unit: "number",
                    material_category_name: "number",
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }

    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
    }

    const PRIVILEGE_TYPE = "material_read";
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    const projection = {
        name: true,
        description: true,
        id: true,
        unit: true,
        material_category: true,
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
        if (i == "material_category_name") {
            queryFilter["material_category"] = {
                name: {
                    contains: filter[i],
                },
            };
        } else {
            queryFilter[i] = { contains: filter[i] };
        }
    }
    let querySort = {};
    for (let i in sort) {
        if (i === "material_category_name") {
            querySort["material_category"] = {
                name: sort[i] ? "asc" : "desc",
            };
        } else {
            querySort[i] = sort[i] ? "asc" : "desc";
        }
    }
    try {
        res.json(await get(queryFilter, querySort, limit, skip, projection));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/material", async (req, res, next) => {
    let updateData = {};
    try {
        inputFilter(
            {
                accessToken: "string",
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
                description: "string",
                unit: "string",
                material_category_id: "number",
                startDate: "string",
                endDate: "string",
                isProtectedForEdit: "boolean",
            },
            req.body.updateData
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }

    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }

    const PRIVILEGE_TYPE = "material_update";
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

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
            payLoad.id,
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
router.delete("/material", async (req, res, next) => {
    try {
        inputFilter(
            {
                accessToken: "string",
                id: "number",
            },
            {},
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }
    const PRIVILEGE_TYPE = "material_delete";
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

    try {
        res.json(await deleter(req.body));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
module.exports = router;
