const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");

const confirm = require("../../services/requestConfirmation");

router.get("/account/request_confirmation", async (req, res, next) => {
    let typeObj = {};
    try {
        if (Object.keys(req.body).length !== 0) {
            typeObj = inputFilter({ type: "string" }, {}, req.body);
        } else {
            typeObj = inputFilter({ type: "string" }, {}, req.query);
        }
        if (type !== "email" && type !== "phone_number") {
            throw {
                key: "type",
                message: "can only be one of email or phone_number",
            };
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    try {
        const data = await confirm(type, res.locals.id, next);
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
