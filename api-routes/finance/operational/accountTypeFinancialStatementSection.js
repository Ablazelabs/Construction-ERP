const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const {
    get,
    post,
} = require("../../../services/accountTypeFinancialStatementSection");

const { returnReqBody } = require("../../../validation/basicValidators");

const allConfigs = require("../master/financemasters.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
} = allConfigs;

router.post("/configuration", async (req, res, next) => {
    let reqBody = {};
    const viewModelData = {
        requiredInputFilter: {
            financialStatementType: "number",
            financialStatementSectionId: "number",
            financialStatementSections: "object",
        },
        optionalInputFilter: {
            accountTypeIds: "object",
        },
        dateValue: [],
        myEnums: {},
        phoneValue: [],
        emailValue: [],
        rangeValues: {},
    };
    const financialStatementSectionsData = {
        requiredInputFilter: allInputFilters["financial_statement_section"],
        optionalInputFilter:
            allOptionalInputFilters["financial_statement_section"],
        dateValue: dateValues["financial_statement_section"],
        myEnums: enums["financial_statement_section"],
        phoneValue: phoneValues["financial_statement_section"],
        emailValue: emailValues["financial_statement_section"],
        rangeValues: allRangeValues["financial_statement_section"],
    };
    try {
        reqBody = inputFilter(
            {
                viewModel: "object",
            },
            {},
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { viewModel } = reqBody;
    viewModel = returnReqBody(viewModel, viewModelData, next);
    if (!viewModel) {
        return;
    }
    let { financialStatementSections, accountTypeIds } = viewModel;

    try {
        if (!Array.isArray(financialStatementSections)) {
            throw {
                key: "financialStatementSections",
                message: "please send array",
            };
        }
        if (!financialStatementSections.length) {
            throw {
                key: "financialStatementSections",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    if (accountTypeIds) {
        if (!Array.isArray(accountTypeIds)) {
            error("accountTypeIds", "please send array", next);
            return false;
        }
        if (!accountTypeIds.length) {
            error("accountTypeIds", "array can't be empty", next);
            return false;
        }
    }
    if (accountTypeIds) {
        let listError = false;
        for (let i in accountTypeIds) {
            try {
                if (typeof accountTypeIds[i] == "number") {
                    accountTypeIds[i] = Math.floor(accountTypeIds[i]);
                    continue;
                }
                throw "error in list";
            } catch {
                listError = true;
                break;
            }
        }
        if (listError) {
            error(
                "accountTypeIds",
                "all array inputs(accountTypeIds) must be int(account type ids)",
                next
            );
            return false;
        }
    }
    for (let i in financialStatementSections) {
        financialStatementSections[i] = returnReqBody(
            financialStatementSections[i],
            financialStatementSectionsData,
            next
        );
        if (!financialStatementSections[i]) {
            return;
        }
    }

    try {
        const data = await post(viewModel);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/configuration", async (_req, res, next) => {
    try {
        res.json(await get());
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
