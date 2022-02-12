const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { getExportedExcel } = require("../../../services/crvPayment");

const { returnReqBody } = require("../../../validation/basicValidators");

router.get("/excel_export", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = returnReqBody(req.body, {
            requiredInputFilter: {
                from: "string",
                to: "string",
                project_id: "number",
                crv_types: "number",
                customer_name: "string",
            },
            dateValue: ["from", "to"],
            emailValue: [],
            phoneValue: [],
            myEnums: {
                crv_types: ["Cash", "Check"],
            },
            rangeValues: {},
        });
        if (!reqBody) {
            return false;
        }
        delete reqBody.startDate;
        delete reqBody.endDate;
        try {
            const data = await getExportedExcel(
                reqBody.from,
                reqBody.to,
                reqBody.project_id,
                reqBody.crv_types,
                reqBody.customer_name
            );
            if (data == false) {
                return;
            }
            res.json(data);
        } catch (e) {
            console.log(e);
            error("database", "error", next, 500);
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
});

module.exports = router;
