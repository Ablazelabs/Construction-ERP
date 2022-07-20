const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const {
    paymentRequestApprove,
    projectRequestApprove,
} = require("../../../services/financeApprovals");

router.patch("/project_request", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            {
                id: "object",
                approved_by_id: "number",
            },
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
        if (!Array.isArray(req.body.id) || !req.body.id.length) {
            throw {
                key: "id",
                message: "id must be an array and mustn't be empty",
            };
        }
        reqBody.approval_status = Math.floor(reqBody.approval_status);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { id, approval_status } = reqBody;
    try {
        const data = await projectRequestApprove(
            id,
            approval_status,
            res.locals.id,
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

router.patch("/payment_request", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            {
                id: "object",
                approval_status: "number",
            },
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
        if (!Array.isArray(req.body.id) || !req.body.id.length) {
            throw {
                key: "id",
                message: "id must be an array and mustn't be empty",
            };
        }
        reqBody.approval_status = Math.floor(reqBody.approval_status);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { id, approval_status } = reqBody;
    try {
        const data = await paymentRequestApprove(
            id,
            approval_status,
            res.locals.id,
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
