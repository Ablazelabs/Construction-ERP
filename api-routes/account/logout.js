const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");

const logout = require("../../services/logout");

router.post("/account/logout", async (req, res, next) => {
    try {
        inputFilter({ refreshToken: "string" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    try {
        const data = await logout(req.body, next);
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
