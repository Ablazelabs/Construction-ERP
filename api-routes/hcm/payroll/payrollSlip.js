const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const { getSlip, sendSlip } = require("../../../services/payrollSlip");
const inputFilter = require("../../../validation/inputFilter");
const pdf = require("pdf-creator-node");
const fs = require("fs");
const dateValue = ["fromDate", "toDate"];

router.get("/payroll_slip", async (req, res, next) => {
    try {
        reqBody = inputFilter(
            {
                selectedEmployees: "object",
                fromDate: "string",
                toDate: "string",
            },
            {
                activeEmployees: "boolean",
                sendOrGet: "boolean",
            },
            req.body
        );
        if (!Array.isArray(reqBody.selectedEmployees)) {
            throw { key: "selectedEmployees", message: "please send array" };
        }
        if (!reqBody.selectedEmployees.length) {
            throw {
                key: "selectedEmployees",
                message: "array can't be empty",
            };
        }
        for (let i in dateValue) {
            if (!reqBody[dateValue[i]]) {
                continue;
            }
            reqBody[dateValue[i]] = new Date(reqBody[dateValue[i]]);
            if (!reqBody[dateValue[i]].getTime()) {
                throw {
                    key: dateValue[i],
                    message: `${dateValue[i]} please send date in yyyy/mm/dd format`,
                };
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let { selectedEmployees } = reqBody;
    const { fromDate, toDate, activeEmployees, sendOrGet } = reqBody;
    let listError = false;
    for (let i in selectedEmployees) {
        try {
            if (typeof selectedEmployees[i] == "number") {
                selectedEmployees[i] = Math.floor(selectedEmployees[i]);
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
            "selectedEmployees",
            "all array inputs(selectedEmployees) must be int(employee ids)",
            next
        );
        return;
    }
    try {
        const slipDetails = await getSlip(
            selectedEmployees,
            fromDate,
            toDate,
            activeEmployees ? true : false
        );
        const options = {
            format: "A3",
            orientation: "portrait",
            border: "10mm",
        };
        const document = {
            data: {},
            path: "./output.pdf",
            type: "buffer",
        };
        let constructedPdf = [];
        let buff;
        for (let i in slipDetails) {
            const slipDetail = slipDetails[i];
            buff = await pdf.create(
                { ...document, html: slipDetail.html },
                options
            );
            constructedPdf.push({
                pdf: buff,
                employee_id: slipDetail.EmployeeId,
                first_name: slipDetail.first_name,
                middle_name: slipDetail.middle_name,
                last_name: slipDetail.last_name,
                id: slipDetail.id,
            });
        }
        if (!sendOrGet) {
            res.json(constructedPdf);
        } else {
            const data = await sendSlip(constructedPdf, fromDate, toDate);
            if (!data) {
                error(
                    "employee",
                    "error happened while sending email(employee has no email)",
                    next
                );
                return false;
            }
            res.json({ success: true });
        }
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
module.exports = router;
