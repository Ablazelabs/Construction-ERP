const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const approvalLogic = require("../../../services/leaveTransferApproval");
const inputFilter = require("../../../validation/inputFilter");

const arrayInput = {
    id: "number",
    approve: "boolean",
};

router.patch("/leave_transfer_approve", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ approvalLeaveList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.approvalLeaveList)) {
            throw { key: "approvalLeaveList", message: "please send array" };
        }
        if (!reqBody.approvalLeaveList.length) {
            throw {
                key: "approvalLeaveList",
                message: "length of array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { approvalLeaveList } = reqBody;
    let listError = false;
    for (let i in approvalLeaveList) {
        try {
            approvalLeaveList[i] = inputFilter(
                arrayInput,
                {},
                approvalLeaveList[i]
            );
        } catch (e) {
            console.log(e);
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "approvalLeaveList",
            "some inputs don't have id(int), approve(bool) format",
            next
        );
        return;
    }
    try {
        const data = await approvalLogic(
            approvalLeaveList,
            res.locals.id,
            next
        );
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
