const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");

const inputFilter = require("../../validation/inputFilter");

const refresh = require("../../services/refresh");

const { verify } = require("jsonwebtoken");

router.post("/account/refresh", async (req, res, next) => {
    try {
        inputFilter({ refreshToken: "string" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.refreshToken, process.env.REFRESH_KEY);
    } catch (e) {
        error("refreshToken", "Invalid or Expired Refresh Token", next, 401);
        return;
    }
    try {
        const data = await refresh(req.body.refreshToken, payLoad.id, next);
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
