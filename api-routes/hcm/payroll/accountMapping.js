const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    salaryMapping,
    otherMapping,
} = require("../../../services/accountMapping");
const { returnReqBody } = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");
const mappingData = require("./hcmPayroll.json");

const requiredFilter = {
    ...mappingData.allInputFilters.salary_component_account_mapping,
};
const optionalFilter = {
    ...mappingData.allOptionalInputFilters.salary_component_account_mapping,
    id: "number",
};
router.put("/salary_component_account_mapping", async (req, res, next) => {
    try {
        reqBody = inputFilter({ accountMapping: "object" }, {}, req.body);
        if (!Array.isArray(reqBody.accountMapping)) {
            throw { key: "accountMapping", message: "please send array" };
        }
        if (!reqBody.accountMapping.length) {
            throw {
                key: "accountMapping",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { accountMapping } = reqBody;
    for (let i in accountMapping) {
        try {
            accountMapping[i] = inputFilter(
                requiredFilter,
                optionalFilter,
                accountMapping[i]
            );
        } catch (e) {
            error(e.key, e.message, next);
            return;
        }
    }
    try {
        const data = await salaryMapping(accountMapping, res.locals.id);
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});

const otherRequiredFilter = {
    ...mappingData.allInputFilters.global_payroll_account_mapping,
};
const otherOptionalFilter = {
    ...mappingData.allOptionalInputFilters.global_payroll_account_mapping,
    id: "number",
};
const otherEnums = {
    ...mappingData.enums.global_payroll_account_mapping,
};
router.put("/other_account_mapping", async (req, res, next) => {
    try {
        reqBody = inputFilter({ accountMapping: "object" }, {}, req.body);
        if (!Array.isArray(reqBody.accountMapping)) {
            throw { key: "accountMapping", message: "please send array" };
        }
        if (!reqBody.accountMapping.length) {
            throw {
                key: "accountMapping",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { accountMapping } = reqBody;
    for (let i in accountMapping) {
        accountMapping[i] = returnReqBody(
            accountMapping[i],
            {
                requiredInputFilter: otherRequiredFilter,
                optionalInputFilter: otherOptionalFilter,
                phoneValue: [],
                emailValue: [],
                dateValue: [],
                myEnums: otherEnums,
                rangeValues: [],
            },
            next
        );
        if (!accountMapping[i]) {
            return;
        }
    }
    try {
        const data = await otherMapping(accountMapping, res.locals.id);
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
