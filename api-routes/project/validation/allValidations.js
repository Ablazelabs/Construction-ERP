const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { patch } = require("../../../services/projectValidations");

const allRoutes = [
    "/manpower_requirement",
    "/required_equipment",
    "/required_material",
    "/request",
    "/required_document",
    "/request_payment",
];
router.patch(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let reqBody;
    try {
        reqBody = inputFilter(
            { id: "number", approval_status: "number" },
            {},
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
        const data = await patch(id, approval_status, operationDataType, next);
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
