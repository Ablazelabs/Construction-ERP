const express = require("express");
const router = express.Router();
const { verify } = require("jsonwebtoken");

const { error } = require("../../config/config");

const changepassword = require("../../services/changepassword");
const inputFilter = require("../../validation/inputFilter");
const { userHasPrivilegeOver } = require("../../validation/auth");
const validation = require("../../validation/validation");
router.post("/account/changepassword", async (req, res, next) => {
    try {
        inputFilter(
            { newPassword: "string" },
            {
                id: "number",
                password: "string",
            },
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    if (!validation.checkPassword(req.body.newPassword, next)) {
        return;
    }
    let id;
    let selfUpdate = false;
    if (res.locals.tempId) {
        id = res.locals.tempId;
    } else {
        if (!req.body.id && req.body.id != 0) {
            if (req.body.password) {
                selfUpdate = true;
                id = res.locals.id;
            } else {
                error("id", "must be given with access token", next);
                return;
            }
        } else {
            id = req.body.id;
        }
        const PRIVILEGE_TYPE = "password_PATCH";
        if (
            !(await userHasPrivilegeOver(
                res.locals.id,
                req.body.id,
                PRIVILEGE_TYPE,
                next
            ))
        ) {
            return;
        }
    }

    try {
        const data = await changepassword(selfUpdate, id, req.body, next);
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
