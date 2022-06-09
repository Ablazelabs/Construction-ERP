const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const {
    getRelease,
    postRelease,
    postCreate,
    getCreate,
    getAAtype,
} = require("../../../services/attendanceSheet");

const { returnReqBody } = require("../../../validation/basicValidators");
const inputFilter = require("../../../validation/inputFilter");

router.get("/release", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                startDate: "string",
                endDate: "string",
            },
            {
                business_unit_id: "number",
                employee_id: "number",
                isReleaseSelected: "boolean",
            },
            req.body
        );
        const dateValue = ["startDate", "endDate"];
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
        const diffDays =
            (reqBody.endDate - reqBody.startDate) / (1000 * 3600 * 24);
        if (diffDays > 31) {
            throw {
                message:
                    "Number of days in the date range(Start Date - End Date) can't be greater than 31",
                key: "endDate",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return false;
    }
    try {
        const data = await getRelease(reqBody);
        if (data === false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/release", async (req, res, next) => {
    try {
        reqBody = inputFilter(
            {
                hcmReleaseList: "object",
                isRelease: "boolean",
                delegated_username: "string",
            },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.hcmReleaseList)) {
            throw { key: "hcmReleaseList", message: "please send array" };
        }
        if (!reqBody.hcmReleaseList.length) {
            throw {
                key: "hcmReleaseList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { hcmReleaseList, isRelease, delegated_username } = reqBody;
    let listError = false;
    for (let i in hcmReleaseList) {
        try {
            if (typeof hcmReleaseList[i] == "number") {
                hcmReleaseList[i] = Math.floor(hcmReleaseList[i]);
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
            "hcmReleaseList",
            "all array inputs(hcm release list) must be int(attendance payroll ids)",
            next
        );
        return;
    }
    try {
        const data = await postRelease(
            delegated_username,
            hcmReleaseList,
            isRelease,
            res.locals.id
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
router.get("/create", async (req, res, next) => {
    let reqBody = {};
    try {
        reqBody = inputFilter(
            {
                date: "string",
            },
            {
                employee_id: "number",
                business_unit_id: "number",
            },
            req.body
        );
        const dateValue = ["date"];
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
    } catch (e) {
        error(e.key, e.message, next);
        return false;
    }
    try {
        const data = await getCreate(reqBody, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get("/aa_type", async (_req, res, next) => {
    try {
        const data = await getAAtype();
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch("/create", async (req, res, next) => {
    try {
        reqBody = inputFilter(
            {
                attendanceList: "object",
                delegated_username: "string",
            },
            {},
            req.body,
            1
        );
        if (!Array.isArray(reqBody.attendanceList)) {
            throw { key: "attendanceList", message: "please send array" };
        }
        if (!reqBody.attendanceList.length) {
            throw {
                key: "attendanceList",
                message: "array can't be empty",
            };
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { attendanceList, delegated_username } = reqBody;
    let listError = "";
    for (let i in attendanceList) {
        try {
            attendanceList[i] = inputFilter(
                {
                    id: "number",
                    date: "string",
                    employee: "number",
                },
                {},
                attendanceList[i]
            );
            const dateValue = ["date"];
            for (let k in dateValue) {
                if (!attendanceList[i][dateValue[k]]) {
                    continue;
                }
                attendanceList[i][dateValue[k]] = new Date(
                    attendanceList[i][dateValue[k]]
                );
                if (!attendanceList[i][dateValue[k]].getTime()) {
                    throw {
                        key: dateValue[k],
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        } catch {
            listError = e.message;
            break;
        }
    }
    if (listError) {
        error("attendanceList", listError, next);
        return;
    }
    try {
        const data = await postCreate(
            delegated_username,
            attendanceList,
            res.locals.id
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
