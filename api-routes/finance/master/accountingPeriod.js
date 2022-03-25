const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const {
    post,
    get,
    patch,
    deleter,
    isValidToChangeStatus,
    changeStatus,
    processClosing,
} = require("../../../services/accountingPeriod");
const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");
//#region const data defs
const enums = {
    months: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
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
};
const data_input = {
    months: "number",
    period_number: "number",
    accounting_period_status: "number",
    is_current_posting_period: "boolean",
    is_year_end_closing: "boolean",
    period_starting_date: "string",
    period_ending_date: "string",
};
const url = "/accounting_period";
//#endregion

const requiredInputFilter = data_input,
    optionalInputFilter = {},
    dateValue = data_dates,
    myEnums = enums,
    phoneValue = [],
    emailValue = [],
    rangeValues = {},
    filters = data_filter,
    sorts = data_sort,
    projections = data_projection;

//#region prev crud operations
router.post(url, async (req, res, next) => {
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
router.patch(url, async (req, res, next) => {
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
            enums,
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
//#endregion

router.post(`${url}/change_status`, async (req, res, next) => {
    const requiredFields = {
        id: "number",
        accounting_period_status: "number",
    };
    const enums = {
        accounting_period_status: myEnums.accounting_period_status,
    };
    const reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter: requiredFields,
            myEnums: enums,
        },
        next
    );
    if (!reqBody) {
        return;
    }
    try {
        const data = await changeStatus(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get(`${url}/is_valid_to_change_status`, async (req, res, next) => {
    const requiredFields = {
        id: "number",
        accounting_period_status: "number",
    };
    const enums = {
        accounting_period_status: myEnums.accounting_period_status,
    };
    const reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter: requiredFields,
            myEnums: enums,
        },
        next
    );
    if (!reqBody) {
        return;
    }
    try {
        const data = await isValidToChangeStatus(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get(`${url}/process_closing`, async (req, res, next) => {
    res.json(["no need for this get"]);
});
router.post(`${url}/process_closing`, async (req, res, next) => {
    const requiredFields = {
        id: "number",
    };
    const reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter: requiredFields,
        },
        next
    );
    if (!reqBody) {
        return;
    }
    try {
        const data = await processClosing(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
