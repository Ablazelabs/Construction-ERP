const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { getExportedExcel } = require("../../../services/cashPaymentCustom");

router.get("/excel_export", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                from: "string",
                to: "string",
            },
            {},
            req.body
        );
        const dateValue = ["from", "to"];
        for (let i in dateValue) {
            if (!reqBody[dateValue[i]]) {
                continue;
            }
            reqBody[dateValue[i]] = new Date(reqBody[dateValue[i]]);
            if (!reqBody[dateValue[i]].getTime()) {
                throw {
                    key: dateValue[i],
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        try {
            const data = await getExportedExcel(reqBody.from, reqBody.to);
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
