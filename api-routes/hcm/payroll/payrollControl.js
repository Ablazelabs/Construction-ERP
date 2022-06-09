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
const {
    getLockandRun,
    postLock,
    postRun,
    getPost,
    postPost,
} = require("../../../services/payrollControl");

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
router.get(["/lock", "/run"], async (req, res, next) => {
    const runOrLock = req.path.split("/").pop();
    try {
        const data = await getLockandRun(runOrLock, next);
        if (!data) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
router.get("/post", async (req, res, next) => {
    // let reqBody = {};
    // try {
    //     reqBody = inputFilter({ id: "number" }, {}, req.body);
    // } catch (e) {
    //     error(e.key, e.message, next);
    //     return;
    // }
    try {
        const data = await getPost();
        if (!data) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
router.post("/lock", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                startDate: "string",
                endDate: "string",
                payroll_frequency_type_id: "number",
            },
            {},
            req.body
        );
        reqBody.startDate = new Date(reqBody.startDate);
        reqBody.endDate = new Date(reqBody.endDate);
        if (isNaN(reqBody.startDate.getTime())) {
            throw {
                key: "startDate",
                message: "please send string with format yyyy/mm/dd",
            };
        }
        if (isNaN(reqBody.endDate.getTime())) {
            throw {
                key: "endDate",
                message: "please send string with format yyyy/mm/dd",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await postLock(reqBody, res.locals.id, next);
        if (!data) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
router.post("/run", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                id: "number",
            },
            {
                reprocess: "boolean",
            },
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        const data = await postRun(
            { payroll_frequency_type_id: reqBody.id },
            res.locals.id,
            reqBody.reprocess,
            next
        );
        if (!data) {
            console.error("error");
            return;
        }

        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500); //database error means internal server error
        return false;
    }
});
router.post("/post", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
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
        const data = await postPost(reqBody.id, res.locals.id, next);
        if (!data) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
