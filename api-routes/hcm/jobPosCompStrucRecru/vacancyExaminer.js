const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const examinersAdd = require("../../../services/vacancyExaminer");
const inputFilter = require("../../../validation/inputFilter");

//make sure of something here
router.put("/vacancy_examiner", async (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { examiners: "object", vacancy_id: "number" },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.examiners)) {
            throw { key: "examiners", message: "please send array" };
        }
        if (!reqBody.examiners.length) {
            throw {
                key: "examiners",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { examiners } = reqBody;
    const { vacancy_id } = reqBody;
    let listError = false;
    for (let i in examiners) {
        try {
            if (typeof examiners[i] == "number") {
                examiners[i] = Math.floor(examiners[i]);
                continue;
            }
            throw "error in list";
        } catch {
            listError = true;
            break;
        }
    }
    if (listError) {
        error(
            "examiners",
            "all array inputs(examiners) must be int(employee ids)",
            next
        );
        return;
    }
    try {
        const data = await examinersAdd(examiners, vacancy_id, res.locals.id);
        if (!data) {
            return;
        } else res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return false;
    }
});
module.exports = router;
