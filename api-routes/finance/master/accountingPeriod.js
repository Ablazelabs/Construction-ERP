const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const {
    post,
    get,
    patch,
    deleter,
} = require("../../../services/accountingPeriod");
const auditLogProjection = {
    startDate: true,
    endDate: true,
    creationDate: true,
    createdBy: true,
    revisionDate: true,
    revisedBy: true,
    isProtectedForEdit: true,
};
const auditLogSort = {
    startDate: "number",
    endDate: "number",
    creationDate: "number",
    createdBy: "number",
    revisionDate: "number",
    revisedBy: "number",
    isProtectedForEdit: "number",
};
const enums = {
    months: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "augest",
        "september",
        "october",
        "november",
        "december",
        "other",
    ],
    accounting_period_status: ["open", "closed", "future", "access_locked"],
};
const data_dates = ["period_starting_date", "period_ending_date"];
const data_projection = {
    id: true,
    months: true,
    period_number: true,
    accounting_period_status: true,
    is_current_posting_period: true,
    is_year_end_closing: true,
    period_starting_date: true,
    period_ending_date: true,
    ...auditLogProjection,
};
const data_filter = {
    months: "number", //["january","february","march","april","may","june","july","augest","september","october","november","december","other"],
    period_number: "number",
    accounting_period_status: "number", //["open","closed","future","access_locked"],
    is_current_posting_period: "boolean",
    is_year_end_closing: "boolean",
    period_starting_date: "string",
    period_ending_date: "string",
};
const data_sort = {
    id: "number",
    months: "number",
    period_number: "number",
    accounting_period_status: "number",
    is_current_posting_period: "number",
    is_year_end_closing: "number",
    period_starting_date: "number",
    period_ending_date: "number",
    ...auditLogSort,
};
const url = "/accounting_period";
router.post(url, async (req, res, next) => {
    try {
        let reqBody = inputFilter(
            {
                months: "number",
                period_number: "number",
                accounting_period_status: "number",
                is_current_posting_period: "boolean",
                is_year_end_closing: "boolean",
                period_starting_date: "string",
                period_ending_date: "string",
            },
            {
                isProtectedForEdit: "boolean",
            },
            req.body,
            4
        );
        reqBody.startDate = new Date();
        reqBody.endDate = new Date("9999/12/31");
        for (let i in data_dates) {
            const key = i;
            if (!reqBody[key]) {
                continue;
            }
            reqBody[key] = new Date(reqBody[key]);
            if (!reqBody[key].getTime()) {
                throw {
                    key,
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        for (let i in enums) {
            const key = i;
            const myArray = enums[i];
            if (!reqBody[key] && reqBody[key] != 0) {
                continue;
            } else {
                if (reqBody[key] < 1 || reqBody[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    reqBody[key] = Math.floor(reqBody[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    try {
        const data = await post(reqBody, res.locals.id, enums, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get(url, async (req, res, next) => {
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
                    ...data_filter,
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
                    ...data_sort,
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let queryFilter = {};
    for (let i in filter) {
        if (typeof filter[i] == "number")
            queryFilter[i] = { equals: filter[i] };
        else queryFilter[i] = { contains: filter[i] };
    }
    let querySort = {};
    for (let i in sort) {
        querySort[i] = sort[i] ? "asc" : "desc";
    }
    try {
        res.json(
            await get(queryFilter, querySort, limit, skip, data_projection)
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(url, async (req, res, next) => {
    let updateData = {};
    try {
        inputFilter({ id: "number", updateData: "object" }, {}, req.body);
        updateData = inputFilter(
            {},
            {
                months: "number",
                period_number: "number",
                accounting_period_status: "number",
                is_current_posting_period: "boolean",
                is_year_end_closing: "boolean",
                period_starting_date: "string",
                period_ending_date: "string",
                isProtectedForEdit: "boolean",
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
router.delete(url, async (req, res, next) => {
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
