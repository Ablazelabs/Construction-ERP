const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");

const inputFilter = require("../../../validation/inputFilter");

const { returnReqBody } = require("../../../validation/basicValidators");
const { exporter, getName } = require("../../../services/financeGeneralExport");

router.post("/general_export", async (req, res, next) => {
    let reqBody = {};
    const inputFilterData = {
        from: "string",
        to: "string",
        template_id: "number",
    };
    const inputFilterOptionalData = {
        journal_posting_status: "number",
        account_status: "number",
        account_category_name: "string",
        period_filter: "string",
    };
    try {
        reqBody = inputFilter(
            { ...inputFilterData, exportAs: "string" },
            inputFilterOptionalData,
            req.body
        );
        if (!Array.isArray(reqBody.dateRange)) {
            throw { key: "dateRange", message: "please send array" };
        }
        if (reqBody.dateRange.length != 2) {
            throw {
                key: "dateRange",
                message: "date range must contain two dates(from - to)",
            };
        }
        let enumAndDate = returnReqBody(
            {
                period_filter: reqBody.period_filter,
                from: reqBody.from,
                to: reqBody.to,
            },
            {
                requiredInputFilter: {
                    from: "string",
                    to: "string",
                },
                optionalInputFilter: {
                    period_filter: reqBody.period_filter,
                },
                myEnums: {
                    period_filter: [
                        "TODAY",
                        "THIS_WEEK",
                        "THIS_MONTH",
                        "THIS_QUARTER",
                        "THIS_YEAR",
                    ],
                },
                dateValue: ["from", "to"],
            },
            next
        );
        if (!enumAndDate) return false;
        reqBody.period_filter = enumAndDate.period_filter;
        reqBody.from = enumAndDate.from;
        reqBody.to = enumAndDate.to;
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await exporter(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/general_export/account_category_name", async (req, res, next) => {
    res.json(await getName());
});
module.exports = router;
