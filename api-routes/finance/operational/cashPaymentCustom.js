const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { getExportedPdf } = require("../../../services/cashPaymentCustom");

const {
    returnReqBody,
    returnGetData,
    returnPatchData,
} = require("../../../validation/basicValidators");

const allConfigs = require("./rest_finance_operational.json");
const {
    allRoutes,
    allPostRoutes,
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
    allProjections,
    allSorts,
    allFilters,
} = allConfigs;

router.get("/pdf_export", async (req, res, next) => {
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
            const data = await getExportedPdf(reqBody.from, reqBody.to);
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
