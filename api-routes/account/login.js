const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");

const login = require("../../services/login");

router.post("/account/login", async (req, res, next) => {
    try {
        inputFilter(
            { password: "string" },
            { phone_number: "string", email: "string" },
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    if (!req.body.phone_number && !req.body.email) {
        error("identifier", "email or phone must be provided", next);
        return;
    }
    const identifier = req.body.phone_number
        ? { key: "phone_number", value: req.body.phone_number }
        : { key: "email", value: req.body.email };
    try {
        let identifier2 = {};
        identifier2[identifier.key] = identifier.value;
        const data = await login(identifier2, req.body, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
    }
});

module.exports = router;
