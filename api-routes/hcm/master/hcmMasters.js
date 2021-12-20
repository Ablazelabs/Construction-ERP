const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const validation = require("../../../validation/validation");
const { post, get, patch, deleter } = require("../../../services/hcmMasters");

const defaultDateValues = [];
const auditLogProjection = {
    startDate: true,
    endDate: true,
    creationDate: true,
    createdBy: true,
    revisionDate: true,
    revisedBy: true,
    isProtectedForEdit: true,
};
const auditLogSort = {
    startDate: "number",
    endDate: "number",
    creationDate: "number",
    createdBy: "number",
    revisionDate: "number",
    revisedBy: "number",
    isProtectedForEdit: "number",
};
const allInputFilters = {
    currency: {
        currency_code: "string",
        name: "string",
        symbol: "string",
        is_base_currency: "boolean",
        currency_description: "string",
    },
    country: {
        country_code: "string",
        country_name: "string",
    },
    title: {
        short_code: "string",
        name: "string",
    },
    language: {
        code: "string",
        name: "string",
    },
    action_reason: {
        reason_description: "string",
        action_type_code: "string",
    },
    action_type: {},
    address_type: {
        type_name: "string",
    },
    commitment: {
        type_name: "string",
    },
    custom_report: {
        query_name: "string",
        query: "string",
    },
    discipline_case_type: {
        case_description: "string",
    },
    duration_measure: {
        measure: "string",
    },
    employee_group: {
        group_description: "string",
    },
    employee_type: {
        description: "string",
    },
    field_of_study: {
        field_of_study_name: "string",
    },
    hcm_configuration: {},
    employee_transaction_lock: {
        payroll_lock: "boolean",
    },
    license_type: {
        license_type_name: "string",
    },
    nationality: {
        nationality_code: "string",
        nationality_name: "string",
    },
    religion: {
        name: "string",
    },
    training_type: {
        training_type_name: "string",
    },
};
const enums = {
    currency: {
        currency_format: ["comma", "period", "Space"],
    },
    action_type: {
        employee_status: ["active", "Inactive", "Retired", "Withdraw"],
    },
};
const allOptionalInputfilters = {
    currency: {
        price_precision: "number",
        currency_format: "number", //["comma","period","Space"],//optional
    },
    country: {},
    title: {},
    language: {},
    action_reason: {
        action_type_id: "number",
    },
    action_type: {
        action_type_description: "string",
        is_initial_hiring: "boolean",
        is_with_org_assignment: "boolean",
        default_action_type_code: "string",
        is_promotion: "boolean",
        employee_status: "number", //["active", "Inactive", "Retired", "Withdraw"]//optional
    },
    address_type: {},
    commitment: {},
    custom_report: {},
    discipline_case_type: {},
    duration_measure: {},
    employee_group: {},
    employee_type: {},
    field_of_study: {},
    hcm_configuration: {
        income_tax_payable_id: "number",
        employer_tax_id: "number",
        employer_tax_control_id: "number",
        employer_pension_account_id: "number",
        employer_pension: "number", //[1,20],
        employee_pension: "number", //[1,20],
        employee_retirement_age: "number", //[40,100]
    },
    employee_transaction_lock: {},
    license_type: {},
    nationality: {},
    religion: {},
    training_type: {},
};
const phoneValues = {
    account_category: [],
    account_type: [],
    closing_note: [],
    financial_statement_section: [],
    bank: [],
    contact: [],
    contact_address: [],
    contact_person: [],
    cost_center: [],
    cost_center_accounts: [],
    payment_term: [],
    exchange_rate: [],
    company_address: [],
    date_format_type: [],
    financial_settings: [],
    industry: [],
    journal_users: [],
    primary_contact: [],
    foot_note: [],
    associated_tax_group: [],
    tax: [],
    tax_authority: [],
    tax_exemption: [],
    tax_group: [],
    tax_rule: [],
    accounting_period: [],
    journal_type: [],
};
const emailValues = phoneValues;
const dateValues = phoneValues;
const allProjections = {
    currency: {
        ...auditLogProjection,
        id: true,
        currency_code: true,
        currency_description: true,
        name: true,
        symbol: true,
        price_precision: true,
        currency_format: true,
        is_base_currency: true,
    },
    country: {
        ...auditLogProjection,
        id: true,
        country_code: true,
        country_name: true,
    },
    title: {
        ...auditLogProjection,
        id: true,
        short_code: true,
        name: true,
    },
    language: {
        ...auditLogProjection,
        id: true,
        code: true,
        name: true,
    },
    action_reason: {
        ...auditLogProjection,
        id: true,
        reason_description: true,
        action_type_code: true,
        action_type: true,
    },
    action_type: {
        ...auditLogProjection,
        id: true,
        action_type_description: true,
        is_initial_hiring: true,
        is_with_org_assignment: true,
        default_action_type_code: true,
        is_promotion: true,
        employee_status: true,
    },
    address_type: {
        ...auditLogProjection,
        id: true,
        type_name: true,
    },
    commitment: {
        ...auditLogProjection,
        id: true,
        type_name: true,
    },
    custom_report: {
        ...auditLogProjection,
        id: true,
        query_name: true,
        query: true,
    },
    discipline_case_type: {
        ...auditLogProjection,
        id: true,
        case_description: true,
    },
    duration_measure: {
        ...auditLogProjection,
        id: true,
        measure: true,
    },
    employee_group: {
        ...auditLogProjection,
        id: true,
        group_description: true,
    },
    employee_type: {
        ...auditLogProjection,
        id: true,
        description: true,
    },
    field_of_study: {
        ...auditLogProjection,
        id: true,
        field_of_study_name: true,
    },
    hcm_configuration: {
        ...auditLogProjection,
        id: true,
        income_tax_payable_id: true,
        employer_tax_id: true,
        employer_tax_control_id: true,
        employer_pension_account_id: true,
        employer_pension: true,
        employee_pension: true,
        employee_retirement_age: true,
    },
    employee_transaction_lock: {
        ...auditLogProjection,
        id: true,
        payroll_lock: true,
    },
    license_type: {
        ...auditLogProjection,
        id: true,
        license_type_name: true,
    },
    nationality: {
        ...auditLogProjection,
        id: true,
        nationality_code: true,
        nationality_name: true,
    },
    religion: {
        ...auditLogProjection,
        id: true,
        name: true,
    },
    training_type: {
        ...auditLogProjection,
        id: true,
        training_type_name: true,
    },
};
const allFilters = {
    currency: {
        id: "number",
        currency_code: "string",
        currency_description: "string",
        name: "string",
        symbol: "string",
        price_precision: "number",
        currency_format: "number",
        is_base_currency: "boolean",
    },
    country: {
        id: "number",
        country_code: "string",
        country_name: "string",
    },
    title: {
        id: "number",
        short_code: "string",
        name: "string",
    },
    language: {
        id: "number",
        code: "string",
        name: "string",
    },
    action_reason: {
        id: "number",
        reason_description: "string",
        action_type_code: "string",
        action_type_id: "number",
    },
    action_type: {
        id: "number",
        action_type_description: "string",
        is_initial_hiring: "boolean",
        is_with_org_assignment: "boolean",
        default_action_type_code: "string",
        is_promotion: "boolean",
        employee_status: "number",
    },
    address_type: {
        id: "number",
        type_name: "string",
    },
    commitment: {
        id: "number",
        type_name: "string",
    },
    custom_report: {
        id: "number",
        query_name: "string",
        query: "string",
    },
    discipline_case_type: {
        id: "number",
        case_description: "string",
    },
    duration_measure: {
        id: "number",
        measure: "string",
    },
    employee_group: {
        id: "number",
        group_description: "string",
    },
    employee_type: {
        id: "number",
        description: "string",
    },
    field_of_study: {
        id: "number",
        field_of_study_name: "string",
    },
    hcm_configuration: {
        id: "number",
        income_tax_payable_id: "number",
        employer_tax_id: "number",
        employer_tax_control_id: "number",
        employer_pension_account_id: "number",
        employer_pension: "number",
        employee_pension: "number",
        employee_retirement_age: "number",
    },
    employee_transaction_lock: {
        id: "number",
        payroll_lock: "boolean",
    },
    license_type: {
        id: "number",
        license_type_name: "string",
    },
    nationality: {
        id: "number",
        nationality_code: "string",
        nationality_name: "string",
    },
    religion: {
        id: "number",
        name: "string",
    },
    training_type: {
        id: "number",
        training_type_name: "string",
    },
};
const allSorts = {
    currency: {
        ...auditLogSort,
        id: "number",
        currency_code: "number",
        currency_description: "number",
        name: "number",
        symbol: "number",
        price_precision: "number",
        currency_format: "number",
        is_base_currency: "number",
    },
    country: {
        ...auditLogSort,
        id: "number",
        country_code: "number",
        country_name: "number",
    },
    title: {
        ...auditLogSort,
        id: "number",
        short_code: "number",
        name: "number",
    },
    language: {
        ...auditLogSort,
        id: "number",
        code: "number",
        name: "number",
    },
    action_reason: {
        ...auditLogSort,
        id: "number",
        reason_description: "number",
        action_type_code: "number",
        action_type_id: "number",
    },
    action_type: {
        ...auditLogSort,
        id: "number",
        action_type_description: "number",
        is_initial_hiring: "number",
        is_with_org_assignment: "number",
        default_action_type_code: "number",
        is_promotion: "number",
        employee_status: "number",
    },
    address_type: {
        ...auditLogSort,
        id: "number",
        type_name: "number",
    },
    commitment: {
        ...auditLogSort,
        id: "number",
        type_name: "number",
    },
    custom_report: {
        ...auditLogSort,
        id: "number",
        query_name: "number",
        query: "number",
    },
    discipline_case_type: {
        ...auditLogSort,
        id: "number",
        case_description: "number",
    },
    duration_measure: {
        ...auditLogSort,
        id: "number",
        measure: "number",
    },
    employee_group: {
        ...auditLogSort,
        id: "number",
        group_description: "number",
    },
    employee_type: {
        ...auditLogSort,
        id: "number",
        description: "number",
    },
    field_of_study: {
        ...auditLogSort,
        id: "number",
        field_of_study_name: "number",
    },
    hcm_configuration: {
        ...auditLogSort,
        id: "number",
        income_tax_payable_id: "number",
        employer_tax_id: "number",
        employer_tax_control_id: "number",
        employer_pension_account_id: "number",
        employer_pension: "number",
        employee_pension: "number",
        employee_retirement_age: "number",
    },
    employee_transaction_lock: {
        ...auditLogSort,
        id: "number",
        payroll_lock: "number",
    },
    license_type: {
        ...auditLogSort,
        id: "number",
        license_type_name: "number",
    },
    nationality: {
        ...auditLogSort,
        id: "number",
        nationality_code: "number",
        nationality_name: "number",
    },
    religion: {
        ...auditLogSort,
        id: "number",
        name: "number",
    },
    training_type: {
        ...auditLogSort,
        id: "number",
        training_type_name: "number",
    },
};
const allRoutes = [
    "/currency",
    "/country",
    "/title",
    "/language",
    "/action_reason",
    "/action_type",
    "/address_type",
    "/commitment",
    "/custom_report",
    "/discipline_case_type",
    "/duration_measure",
    "/employee_group",
    "/employee_type",
    "/field_of_study",
    "/hcm_configuration",
    "/employee_transaction_lock",
    "/license_type",
    "/nationality",
    "/religion",
    "/training_type",
];

router.post(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputfilters[operationDataType];
    try {
        reqBody = inputFilter(
            {
                ...requiredInputFilter,
            },
            { isProtectedForEdit: "boolean", ...optionalInputFilter },
            req.body,
            1
        );
        reqBody.startDate = new Date();
        reqBody.endDate = new Date("9999/12/31");
        for (let i in dateValues[operationDataType]) {
            if (!reqBody[dateValues[operationDataType][i]]) {
                continue;
            }
            reqBody[dateValues[operationDataType][i]] = new Date(
                reqBody[dateValues[operationDataType][i]]
            );
            if (!reqBody[dateValues[operationDataType][i]].getTime()) {
                throw {
                    key: dateValues[operationDataType][i],
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        for (let i in enums[operationDataType]) {
            const key = i;
            const myArray = enums[operationDataType][i];
            if (!reqBody[key] && reqBody[key] != 0) {
                continue;
            } else {
                if (reqBody[key] < 1 || reqBody[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    reqBody[key] = Math.floor(reqBody[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    for (let i in phoneValues[operationDataType]) {
        if (reqBody[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    reqBody[phoneValues[operationDataType][i]],
                    next,
                    phoneValues[operationDataType][i]
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (reqBody[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    reqBody[emailValues[operationDataType][i]],
                    next,
                    emailValues[operationDataType][i]
                )
            )
                return;
    }
    if (operationDataType === "hcm_configuration") {
        if (
            reqBody.employer_pension ||
            reqBody.employer_pension == 0 ||
            reqBody.employer_pension == false
        ) {
            if (reqBody.employer_pension < 1 || reqBody.employer_pension > 20) {
                error("employer_pension", "must be below 20 and above 1", next);
                return;
            }
        }
        if (
            reqBody.employee_pension ||
            reqBody.employee_pension == 0 ||
            reqBody.employee_pension == false
        ) {
            if (reqBody.employee_pension < 1 || reqBody.employee_pension > 20) {
                error("employee_pension", "must be below 20 and above 1", next);
                return;
            }
        }
        if (
            reqBody.employee_retirement_age ||
            reqBody.employee_retirement_age == 0 ||
            reqBody.employee_retirement_age == false
        ) {
            if (
                reqBody.employee_retirement_age < 40 ||
                reqBody.employee_retirement_age > 100
            ) {
                error(
                    "employee_retirement_age",
                    "must be below 20 and above 1",
                    next
                );
                return;
            }
        }
    }
    try {
        const data = await post(
            reqBody,
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
router.get(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    try {
        inputFilter(
            { limit: "number" },
            { skip: "number", filter: "object", sort: "object" },
            req.body
        );
        limit = req.body.limit;
        skip = req.body.skip || 0;
        if (req.body.filter) {
            filter = inputFilter(
                {},
                { ...allFilters[operationDataType] },
                req.body.filter
            );
        }
        if (req.body.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    ...allSorts[operationDataType],
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const projection = {
        ...allProjections[operationDataType],
    };
    let queryFilter = {};
    for (let i in filter) {
        if (typeof filter[i] == "number")
            queryFilter[i] = { equals: filter[i] };
        else queryFilter[i] = { contains: filter[i] };
    }
    let querySort = {};
    for (let i in sort) {
        querySort[i] = sort[i] ? "asc" : "desc";
    }
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                operationDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let updateData = {};
    try {
        inputFilter({ id: "number", updateData: "object" }, {}, req.body);

        updateData = inputFilter(
            {},
            {
                ...allInputFilters[operationDataType],
                ...allOptionalInputfilters[operationDataType],
                isProtectedForEdit: "boolean",
            },
            req.body.updateData
        );

        // if date values sent in update data, transform them into a date value, if wrong format detected throw an error

        for (let i in dateValues[operationDataType]) {
            const key = dateValues[operationDataType][i];
            if (updateData[key]) {
                updateData[key] = new Date(updateData[key]);
                if (!updateData[key].getTime()) {
                    throw {
                        key: key,
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        }
        for (let i in enums[operationDataType]) {
            const key = i;
            const myArray = enums[operationDataType][i];
            if (!updateData[key] && updateData[key] != 0) {
                continue;
            } else {
                if (updateData[key] < 1 || updateData[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    updateData[key] = Math.floor(updateData[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }
    //if phone or email values given in update data validate it.
    for (let i in phoneValues[operationDataType]) {
        if (updateData[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    updateData[phoneValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (updateData[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    updateData[phoneValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
    if (operationDataType === "hcm_configuration") {
        if (
            updateData.employer_pension ||
            updateData.employer_pension == 0 ||
            updateData.employer_pension == false
        ) {
            if (
                updateData.employer_pension < 1 ||
                updateData.employer_pension > 20
            ) {
                error("employer_pension", "must be below 20 and above 1", next);
                return;
            }
        }
        if (
            updateData.employee_pension ||
            updateData.employee_pension == 0 ||
            updateData.employee_pension == false
        ) {
            if (
                updateData.employee_pension < 1 ||
                updateData.employee_pension > 20
            ) {
                error("employee_pension", "must be below 20 and above 1", next);
                return;
            }
        }
        if (
            updateData.employee_retirement_age ||
            updateData.employee_retirement_age == 0 ||
            updateData.employee_retirement_age == false
        ) {
            if (
                updateData.employee_retirement_age < 40 ||
                updateData.employee_retirement_age > 100
            ) {
                error(
                    "employee_retirement_age",
                    "must be below 20 and above 1",
                    next
                );
                return;
            }
        }
    }
    let updateDataProjection = {};
    for (let i in updateData) {
        if (updateData[i]) {
            updateDataProjection[i] = true;
        }
    }
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
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
        return;
    }
});
router.delete(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    try {
        inputFilter({ id: "number" }, {}, req.body);
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    try {
        res.json(await deleter(req.body, operationDataType));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
module.exports = router;
