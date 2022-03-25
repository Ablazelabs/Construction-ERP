const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const scalePost = require("../../../services/paygradeScale");
const inputFilter = require("../../../validation/inputFilter");
const payscaleData = require("./hcmPayroll.json");

const arrayInput = [
    {
        ...payscaleData.allInputFilters.paygrade_scale,
    },
    { ...payscaleData.allOptionalInputFilters.paygrade_scale },
];

router.post("/paygrade_scale", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter({ paygradeScaleList: "object" }, {}, req.body, 1);
        if (!Array.isArray(reqBody.paygradeScaleList)) {
            throw { key: "paygradeScaleList", message: "please send array" };
        }
        if (!reqBody.paygradeScaleList.length) {
            throw {
                key: "paygradeScaleList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { paygradeScaleList } = reqBody;
    for (let i in paygradeScaleList) {
        try {
            paygradeScaleList[i] = inputFilter(
                arrayInput[0],
                arrayInput[1],
                paygradeScaleList[i]
            );
        } catch (e) {
            error(e.key, e.message, next);
            return;
        }
    }
    let updateDataProjection = {};
    for (let i in arrayInput) {
        for (let k in arrayInput[i]) {
            updateDataProjection[k] = true;
        }
    }
    try {
        const data = await scalePost(
            paygradeScaleList,
            res.locals.id,
            payscaleData.uniqueValues.paygrade_scale,
            updateDataProjection
        );
        res.json(data);
    } catch (e) {
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
