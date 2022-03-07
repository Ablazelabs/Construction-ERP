const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");

const inputFilter = require("../../../validation/inputFilter");

const { returnReqBody } = require("../../../validation/basicValidators");
const exporter = require("../../../services/financeGeneralExport");
const allData = require("./rest_finance_operational.json");
const allMasterData = require("../master/financemasters.json");
const allModuleFields = require("./allModuleFields.json");
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
        period_filter: "number",
    };
    try {
        reqBody = inputFilter(
            { ...inputFilterData, exportAs: "string" },
            inputFilterOptionalData,
            req.body
        );
        let enumAndDate = returnReqBody(
            {
                period_filter: reqBody.period_filter,
                from: reqBody.from,
                to: reqBody.to,
                account_status: reqBody.account_status,
                journal_posting_status: reqBody.journal_posting_status,
            },
            {
                requiredInputFilter: {
                    from: "string",
                    to: "string",
                },
                optionalInputFilter: {
                    period_filter: "number",
                    account_status: "number",
                    journal_posting_status: "number",
                },
                myEnums: {
                    period_filter: [
                        "TODAY",
                        "THIS WEEK",
                        "THIS MONTH",
                        "THIS QUARTER",
                        "THIS YEAR",
                    ],
                    account_status: ["Active", "Inactive"],
                    journal_posting_status:
                        allData.enums.general_journal_header
                            .journal_posting_status,
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
        const data = await exporter(
            reqBody,
            allData.enums.export_template.module_name,
            allModuleFields,
            {
                ...allData.enums,
                exportReadyJournal: {
                    report_basis:
                        allData.enums.general_journal_header.report_basis,
                    journal_posting_status:
                        allData.enums.general_journal_header
                            .journal_posting_status,
                    journal_type:
                        allData.enums.general_journal_header.journal_source,
                    tax_type: allMasterData.enums.tax.tax_type,
                },
            },
            allMasterData.enums,
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
    }
});

module.exports = router;
