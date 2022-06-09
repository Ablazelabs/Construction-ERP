const express = require("express");
const router = express.Router();
const { error } = require("../../config/config");
const inputFilter = require("../../validation/inputFilter");

router.get("/working_days", (req, res, next) => {
    let reqBody;
    try {
        reqBody = inputFilter(
            { date1: "string", date2: "string" },
            { includeSaturday: "boolean", defaultBehaviour: "boolean" },
            req.body
        );
        reqBody.date1 = new Date(reqBody.date1);
        reqBody.date2 = new Date(reqBody.date2);
        if (!reqBody.date1.getTime()) {
            throw { key: "date1", message: "date1 must be in a date format" };
        }
        if (!reqBody.date1.getTime()) {
            throw { key: "date1", message: "date1 must be in a date format" };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { date1, date2, includeSaturday, defaultBehaviour } = reqBody;
    if (!(defaultBehaviour === false)) {
        defaultBehaviour = true;
    }
    if (date1 > date2) {
        const tempDate = new Date(date1);
        date1 = new Date(date2);
        date2 = new Date(tempDate);
    }
    //loop for difference in days
    let differenceInDays =
        (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24);
    differenceInDays += Number(defaultBehaviour);
    let counter = 0;
    let workingDays = 0;
    for (
        let i = new Date(date1);
        counter < differenceInDays;
        i.setDate(date1.getDate() + counter)
    ) {
        counter += 1;
        if (i.getDay() === 0) {
            continue;
        }
        if (!includeSaturday && i.getDay() === 6) {
            continue;
        }
        workingDays++;
    }
    res.json({
        differenceInDays,
        workingDays,
    });
});

module.exports = router;
