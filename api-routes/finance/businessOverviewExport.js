const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");
const { profitLossExport } = require("../../services/businessOverviewExport");

const inputFilter = require("../../validation/inputFilter");

const { returnReqBody } = require("../../validation/basicValidators");

const { enums } = require("./operational/rest_finance_operational.json");

router.post("/profit_loss", async (req, res, next) => {
    let reqBody = {};
    const inputFilterData = {
        dateRange: "object",
        reportBasis: "number",
    };
    const inputFilterOptionalData = {
        dateFormat: "string",
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
                reportBasis: reqBody.reportBasis,
                from: reqBody.dateRange[0],
                to: reqBody.dateRange[1],
            },
            {
                requiredInputFilter: {
                    reportBasis: "number",
                    from: "string",
                    to: "string",
                },
                myEnums: {
                    reportBasis: enums.general_journal_header.report_basis,
                },
                dateValue: ["from", "to"],
            },
            next
        );
        if (!enumAndDate) return false;
        reqBody.reportBasis = enumAndDate.reportBasis;
        reqBody.dateRange[0] = enumAndDate.from;
        reqBody.dateRange[1] = enumAndDate.to;
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await profitLossExport(reqBody, res.locals.id, next);
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
