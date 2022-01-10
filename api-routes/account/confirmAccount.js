const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");

const confirm = require("../../services/confirmAccount");

router.get("/account/confirm_account", async (req, res, next) => {
    let codeAndId = {};
    try {
        if (Object.keys(req.body).length !== 0) {
            codeAndId = inputFilter(
                { code: "string", id: "string", type: "string" },
                {},
                req.body
            );
        } else {
            codeAndId = inputFilter(
                { code: "string", id: "string", type: "string" },
                {},
                req.query
            );
        }
        var { code, id, type } = codeAndId;
        id = parseInt(id);
        code = parseInt(code);
        if (isNaN(id) || isNaN(code)) {
            throw {
                key: isNaN(id) ? "id" : "code",
                message: "should be a number",
            };
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
        const data = await confirm(code, id, type, next);
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
