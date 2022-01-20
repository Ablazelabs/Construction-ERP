const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const salaryPost = require("../../../services/paygradeSalaryComponent");
const inputFilter = require("../../../validation/inputFilter");

router.post("/paygrade_salary_component_map", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { paygrade_id: "number", salaryComponents: "object" },
            {},
            req.body
        );
        if (!Array.isArray(reqBody.salaryComponents)) {
            throw { key: "salaryComponents", message: "please send array" };
        }
        if (!reqBody.salaryComponents.length) {
            throw {
                key: "salaryComponents",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { paygrade_id, salaryComponents } = reqBody;
    paygrade_id = parseInt(paygrade_id);
    for (let i in salaryComponents) {
        if (typeof salaryComponents[i] === "number") {
            salaryComponents[i] = parseInt(salaryComponents[i]);
        } else {
            error("salaryComponents", "please send number", 400);
            return;
        }
    }
    try {
        await salaryPost(salaryComponents, paygrade_id, res.locals.id);
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
