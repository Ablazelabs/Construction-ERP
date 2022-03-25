//#region enumDefs
const allModuleFields = require("./allModuleFields.json");
//#endregion
const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const { post, patch } = require("../../../services/rest_finance_operational");

const { returnReqBody } = require("../../../validation/basicValidators");

const allConfigs = require("./rest_finance_operational.json");
const {
    allInputFilters,
    allOptionalInputFilters,
    dateValues,
    enums,
    phoneValues,
    emailValues,
    allRangeValues,
} = allConfigs;

router.post("/export_template", async (req, res, next) => {
    const operationDataType = "export_template";
    const requiredInputFilter = allInputFilters[operationDataType],
        optionalInputFilter = allOptionalInputFilters[operationDataType],
        dateValue = dateValues[operationDataType],
        myEnums = enums[operationDataType],
        phoneValue = phoneValues[operationDataType],
        emailValue = emailValues[operationDataType],
        rangeValues = allRangeValues[operationDataType];

    let reqBody = returnReqBody(
        req.body,
        {
            requiredInputFilter,
            optionalInputFilter,
            dateValue,
            myEnums,
            phoneValue,
            emailValue,
            rangeValues,
        },
        next
    );
    if (!reqBody) {
        return;
    }
    const fields = [
        ...allModuleFields[myEnums.module_name[reqBody.module_name - 1]],
        "startDate",
        "endDate",
        "creationDate",
        "createdBy",
        "revisionDate",
        "revisedBy",
        "status",
        "isProtectedForEdit",
    ];
    if (
        !Array.isArray(reqBody.export_template_fields) ||
        !reqBody.export_template_fields.length
    ) {
        error(
            "export_template_fields",
            "export_template_fields please send array of numbers",
            next
        );
        return;
    }
    if (
        !Array.isArray(reqBody.excel_columns) ||
        reqBody.excel_columns.length != reqBody.export_template_fields.length
    ) {
        error(
            "excel_columns",
            "excel_columns please send array of strings(equal in length with export_template_fields)",
            next
        );
        return;
    }
    let enumArrayError = reqBody.export_template_fields.find(
        (elem) => typeof elem != "number" || elem < 1 || elem > fields.length
    );
    if (enumArrayError || enumArrayError === 0) {
        error(
            "export_template_fields",
            "export_template_fields please send array of numbers(only fields of the module allowed as an enum)",
            next
        );
        return;
    }
    enumArrayError = reqBody.excel_columns.find(
        (elem) => typeof elem != "string"
    );
    if (enumArrayError) {
        error(
            "excel_columns",
            "excel_columns please send array of strings",
            next
        );
        return;
    }
    reqBody.excel_columns = reqBody.excel_columns.map((elem) =>
        elem.replace(/,/g, "")
    );
    try {
        const data = await post(
            {
                ...reqBody,
                export_template_fields: `${reqBody.export_template_fields}`,
                excel_columns: `${reqBody.excel_columns}`,
            },
            operationDataType,
            res.locals.id,
            next
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
//based on a given name (enum of modules) gives out the columns in snake case format!
router.get("/export_template/column", async (req, res, next) => {
    res.json({
        columns:
            allModuleFields[
                enums["export_template"].module_name[req?.body?.module_name - 1]
            ],
    });
});
module.exports = router;
