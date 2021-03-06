const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    generalLedgerExport,
    accountTransactionsExport,
    journalExport,
    trailBalanceExport,
    taxSummaryExport,
} = require("../../../services/financeExportController");

const inputFilter = require("../../../validation/inputFilter");

const { returnReqBody } = require("../../../validation/basicValidators");

const { enums } = require("./rest_finance_operational.json");

router.post("/general_ledger", async (req, res, next) => {
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
        const data = await generalLedgerExport(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.post("/account_transaction", async (req, res, next) => {
    let reqBody = {};
    const inputFilterData = {
        accounts: "object", //Array<number>
        dateRange: "object",
        reportBasis: "number", //enum
        reportBy: "number", //enum
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
        if (!Array.isArray(reqBody.accounts)) {
            throw { key: "accounts", message: "please send array" };
        }
        if (!reqBody.accounts.length) {
            throw {
                key: "accounts",
                message: "accounts must have data",
            };
        }
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
                reportBy: reqBody.reportBy,
                from: reqBody.dateRange[0],
                to: reqBody.dateRange[1],
            },
            {
                requiredInputFilter: {
                    reportBasis: "number",
                    reportBy: "number",
                    from: "string",
                    to: "string",
                },
                myEnums: {
                    reportBasis: enums.general_journal_header.report_basis,
                    reportBy: [
                        "Date",
                        "Account Type",
                        "Account",
                        "Transaction Type",
                    ],
                },
                dateValue: ["from", "to"],
            },
            next
        );
        if (!enumAndDate) return;
        reqBody.reportBasis = enumAndDate.reportBasis;
        reqBody.reportBy = enumAndDate.reportBy;
        reqBody.fromDate = enumAndDate.from;
        reqBody.toDate = enumAndDate.to;
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await accountTransactionsExport(
            reqBody,
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
router.post("/journal", async (req, res, next) => {
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
        const data = await journalExport(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.post("/trail_balance", async (req, res, next) => {
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
        const data = await trailBalanceExport(reqBody, res.locals.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.post("/tax_summary", async (req, res, next) => {
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
        const data = await taxSummaryExport(reqBody, res.locals.id, next);
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
