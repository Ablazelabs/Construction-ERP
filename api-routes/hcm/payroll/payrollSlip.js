const express = require("express");
const router = express.Router();
const { error, sendEmail } = require("../../../config/config");
const { getSlip } = require("../../../services/payrollSlip");
const inputFilter = require("../../../validation/inputFilter");
const pdf = require("pdf-creator-node");

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
        for (let i in slipDetails) {
            const slipDetail = slipDetails[i];
            constructedPdf.push({
                pdf: await pdf.create(
                    { ...document, html: slipDetail.html },
                    options
                ),
                employee_id: slipDetail.EmployeeId,
            });
        }
        if (!sendOrGet) {
            res.json(constructedPdf);
        } else {
            await sendSlip(constructedPdf);
            res.json({ success: true });
        }
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
// router.post("/payroll_slip", async (req, res, next) => {
//     const operationDataType = req.path.split("/").pop();
//     const requiredInputFilter = allInputFilters[operationDataType],
//         optionalInputFilter = allOptionalInputFilters[operationDataType],
//         dateValue = dateValues[operationDataType],
//         myEnums = enums[operationDataType],
//         phoneValue = phoneValues[operationDataType],
//         emailValue = emailValues[operationDataType],
//         rangeValues = allRangeValues[operationDataType];

//     const reqBody = returnReqBody(
//         req.body,
//         {
//             requiredInputFilter,
//             optionalInputFilter,
//             dateValue,
//             myEnums,
//             phoneValue,
//             emailValue,
//             rangeValues,
//         },
//         next
//     );
//     if (!reqBody) {
//         return;
//     }

//     try {
//         const data = await post(
//             reqBody,
//             operationDataType,
//             res.locals.id,
//             uniqueValues[operationDataType],
//             next
//         );
//         if (data == false) {
//             return;
//         }
//         res.json(data);
//     } catch (e) {
//         console.log(e);
//         error("database", "error", next, 500);
//     }
// });
module.exports = router;
