const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { patch } = require("../../../services/projectValidations");

router.patch("/project_request", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { id: "number", approval_status: "number" },
            { action_note: "string" },
            req.body
        );
        if (reqBody.approval_status < 2 || reqBody.approval_status > 3) {
            throw {
                key: "approval_status",
                message:
                    "please send between 2 and 3 as it represents  approved, rejected",
            };
        }
        reqBody.approval_status = Math.floor(reqBody.approval_status);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { id, approval_status } = reqBody;
    try {
        const data = await patch(
            id,
            approval_status,
            reqBody.action_note,
            next
        );
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
