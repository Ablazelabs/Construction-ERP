const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const validation = require("../../../validation/validation");
const {
    post,
    get,
    patch,
    deleter,
} = require("../../../services/jobPosCompStrucRecru");

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
    job_category: {
        category_description: "string",
    },
    job_safety_equipment: {
        safety_equipment_id: "number",
        job_title_id: "number",
    },
    job_title: {
        title_name: "string",
    },
    safety_equipment: {
        name: "string",
    },
    business_unit: {
        name: "string",
    },
    company: {
        code: "string",
        name: "string",
    },
    location: {
        location_name: "string",
        address_1: "string",
    },
    company_primary_contact: {
        id: "number",
        name: "string",
        phone: "string",
    },
    external_applicant: {
        applicant_name: "string",
        father_name: "string",
        gender: "number", // ["male", "female"],
        training_type_id: "number",
    },
    vacancy: {
        number_of_position: "number", //[1+],
        vacancy_status: "number", //["Draft", "Approved", "Rejected", "Published", "Closed", "Locked"],
        vacancy_type: "number", //["Internal", "External", "Both"],
        job_title_id: "number",
    },
    vacancy_applicant: {
        name: "string",
        application_date: "string",
        application_status: "number", //["Pending", "Selected", "Hired", "Accepted"],
        is_employee: "number", //["Employee", "ExternalApplicant"],
        vacancy_id: "number",
    },
    vacancy_examiner: {
        vacancy_id: "number",
        employee_id: "number",
    },
    vacancy_internal_applicant: {
        employee_id: "number",
        vacancy_id: "number",
    },
    vacancy_request_reason: {
        reason: "string",
    },
};
const enums = {
    business_unit: {},
    location: {},
    job_title: {},
    job_category: {},
    job_safety_equipment: {},
    safety_equipment: {},
    company: {},
    company_primary_contact: {},
    external_applicant: {
        gender: ["male", "female"],
        marital_status: ["Single", "Married", "Widowed", "Divorced"], //optional
    },
    vacancy: {
        vacancy_type: ["Internal", "External", "Both"],
        vacancy_status: [
            "Draft",
            "Approved",
            "Rejected",
            "Published",
            "Closed",
            "Locked",
        ],
    },
    vacancy_applicant: {
        application_status: ["Pending", "Selected", "Hired", "Accepted"],
        is_employee: ["Employee", "ExternalApplicant"],
    },
    vacancy_examiner: {},
    vacancy_internal_applicant: {},
    vacancy_request_reason: {},
};
const allOptionalInputfilters = {
    job_category: {},
    job_safety_equipment: {},
    job_title: {
        job_specification: "string",
        min_experience: "number", //[0-40]
        paygrade_id: "number",
        training_type_id: "number",
        job_category_id: "number",
    },
    safety_equipment: {},
    business_unit: {
        parent_id: "number",
        is_root: "boolean",
        cost_center_id: "number",
        employee_id: "number",
    },
    company: {
        country_id: "number",
        currency_id: "number",
        logo: "string", //needs file handling
    },
    location: {
        address_2: "string",
        city: "string",
        state_or_province: "string",
        zip_or_portal_code: "string",
        phone: "string",
        fax: "string",
        website: "string",
        email: "string",
    },
    company_primary_contact: {
        email: "string",
        location_id: "number",
        //needs location
    },
    external_applicant: {
        grand_father_name: "string",
        mobile_number: "string",
        email: "string",
        experience_year: "number", //[0+]
        marital_status: "number", // ["Single", "Married", "Widowed", "Divorced"], //optional
        file: "string",
        name: "string",
        type: "string",
    },
    vacancy: {
        opening_date: "string",
        closing_date: "string",
        action_date: "string",
        requested_by: "string",
        approved_by: "string",
        remark: "string",
        vacancy_request_reason_id: "number",
    },
    vacancy_applicant: {
        remark: "string",
        scale: "number",
        result: "number",
        external_applicant_id: "number",
        employee_id: "number",
    },
    vacancy_examiner: {},
    vacancy_internal_applicant: {},
    vacancy_request_reason: {},
};
const allRangeValues = {
    job_title: {
        min_experience: [0, 40],
    },
    external_applicant: {
        experience_year: [0, Infinity],
    },
    vacancy: {
        number_of_position: [1, Infinity],
    },
};
const phoneValues = {
    business_unit: [],
    location: ["phone"],
    job_title: [],
    job_category: [],
    job_safety_equipment: [],
    safety_equipment: [],
    company: [],
    company_primary_contact: ["phone"],
    external_applicant: ["mobile_number"],
    vacancy_examiner: [],
    vacancy_internal_applicant: [],
    vacancy_request_reason: [],
};
const emailValues = {
    business_unit: [],
    location: ["email"],
    job_title: [],
    job_category: [],
    job_safety_equipment: [],
    safety_equipment: [],
    company: [],
    company_primary_contact: ["email"],
    external_applicant: ["email"],
};
const dateValues = {
    business_unit: [],
    location: [],
    job_title: [],
    job_category: [],
    job_safety_equipment: [],
    safety_equipment: [],
    company: [],
    company_primary_contact: [],
    vacancy: ["opening_date", "closing_date", "action_date"],
    vacancy_applicant: ["application_date"],
};
const allProjections = {
    job_category: {
        ...auditLogProjection,
        id: true,
        category_description: true,
    },
    job_safety_equipment: {
        ...auditLogProjection,
        id: true,
        safety_equipment_id: true,
        job_title: true,
    },
    job_title: {
        ...auditLogProjection,
        id: true,
        title_name: true,
        job_specification: true,
        min_experience: true,
        paygrade_id: true,
        training_type: true,
        job_category: true,
    },
    safety_equipment: {
        ...auditLogProjection,
        id: true,
        name: true,
    },
    business_unit: {
        ...auditLogProjection,
        id: true,
        name: true,
        parent_id: true,
        is_root: true,
        cost_center: true,
        employee: true,
    },
    company: {
        ...auditLogProjection,
        id: true,
        code: true,
        name: true,
        logo: true,
        country: true,
        currency: true,
    },
    location: {
        ...auditLogProjection,
        id: true,
        location_name: true,
        address_1: true,
        address_2: true,
        city: true,
        state_or_province: true,
        zip_or_portal_code: true,
        phone: true,
        fax: true,
        website: true,
        email: true,
    },
    company_primary_contact: {
        ...auditLogProjection,
        id: true,
        name: true,
        phone: true,
        email: true,
        location: true,
    },
    external_applicant: {
        ...auditLogProjection,
        id: true,
        applicant_name: true,
        father_name: true,
        grand_father_name: true,
        mobile_number: true,
        email: true,
        experience_year: true,
        gender: true,
        marital_status: true,
        file: true,
        name: true,
        type: true,
        training_type: true,
        //needs training_type
    },
    vacancy: {
        ...auditLogProjection,
        id: true,
        number_of_position: true,
        vacancy_status: true,
        opening_date: true,
        closing_date: true,
        action_date: true,
        vacancy_type: true,
        requested_by: true,
        approved_by: true,
        remark: true,
        job_title_id: true,
        vacancy_request_reason: true,
        //needs job_title
        //needs vacancy_request_reason
    },
    vacancy_applicant: {
        ...auditLogProjection,
        id: true,
        name: true,
        application_date: true,
        remark: true,
        scale: true,
        result: true,
        application_status: true,
        is_employee: true,
        external_applicant: true,
        employee: true,
        vacancy: true,
        //needs external_applicant
        //needs employee
        //needs vacancy
    },
    vacancy_examiner: {
        ...auditLogProjection,
        id: true,
        vacancy: true,
        employee: true,
        //needs vacancy
        //needs employee
    },
    vacancy_internal_applicant: {
        ...auditLogProjection,
        id: true,
        employee: true,
        vacancy: true,
    },
    vacancy_request_reason: {
        ...auditLogProjection,
        id: true,
        reason: true,
    },
};
const allFilters = {
    job_category: {
        id: "number",
        category_description: "string",
    },
    job_safety_equipment: {
        id: "number",
        safety_equipment_id: "number",
        job_title_id: "number",
    },
    job_title: {
        id: "number",
        title_name: "string",
        job_specification: "string",
        min_experience: "number", //[0-40]
        paygrade_id: "number",
        training_type_id: "number",
        job_category_id: "number",
    },
    safety_equipment: {
        id: "number",
        name: "string",
    },
    business_unit: {
        id: "number",
        name: "string",
        parent_id: "number",
        is_root: "boolean",
        cost_center_id: "number",
        employee_id: "number",
    },
    company: {
        id: "number",
        code: "string",
        name: "string",
        country_id: "number",
        currency_id: "number",
    },
    location: {
        id: "number",
        location_name: "string",
        address_1: "string",
        address_2: "string",
        city: "string",
        state_or_province: "string",
        zip_or_portal_code: "string",
        phone: "string",
        fax: "string",
        website: "string",
        email: "string",
    },
    company_primary_contact: {
        id: "number",
        name: "string",
        phone: "string",
        email: "string",
        location_id: "number",
    },
    external_applicant: {
        id: "number",
        applicant_name: "string",
        father_name: "string",
        grand_father_name: "string",
        mobile_number: "string",
        email: "string",
        experience_year: "number",
        gender: "number",
        marital_status: "number",
        file: "string",
        name: "string",
        type: "string",
        training_type_id: "number",
    },
    vacancy: {
        id: "number",
        number_of_position: "number",
        vacancy_status: "number",
        vacancy_type: "number",
        requested_by: "string",
        approved_by: "string",
        remark: "string",
        job_title_id: "number",
        vacancy_request_reason_id: "number",
    },
    vacancy_applicant: {
        id: "number",
        name: "string",
        remark: "string",
        scale: "number",
        result: "number",
        application_status: "number",
        is_employee: "number",
        external_applicant_id: "number",
        employee_id: "number",
        vacancy_id: "number",
    },
    vacancy_examiner: {
        id: "number",
        vacancy_id: "number",
        employee_id: "number",
    },
    vacancy_internal_applicant: {
        id: "number",
        employee_id: "number",
        vacancy_id: "number",
    },
    vacancy_request_reason: {
        id: "number",
        reason: "string",
    },
};
const allSorts = {
    job_category: {
        ...auditLogSort,
        id: "number",
        category_description: "number",
    },
    job_safety_equipment: {
        ...auditLogSort,
        id: "number",
        safety_equipment_id: "number",
        job_title_id: "number",
    },
    job_title: {
        ...auditLogSort,
        id: "number",
        title_name: "number",
        job_specification: "number",
        min_experience: "number",
        paygrade_id: "number",
        training_type_id: "number",
        job_category_id: "number",
    },
    safety_equipment: {
        ...auditLogSort,
        id: "number",
        name: "number",
    },
    business_unit: {
        ...auditLogSort,
        id: "number",
        name: "number",
        parent_id: "number",
        is_root: "number",
        cost_center_id: "number",
        employee_id: "number",
    },
    company: {
        ...auditLogSort,
        id: "number",
        code: "number",
        name: "number",
        country_id: "number",
        currency_id: "number",
        logo: "number",
    },
    location: {
        ...auditLogSort,
        id: "number",
        location_name: "number",
        address_1: "number",
        address_2: "number",
        city: "number",
        state_or_province: "number",
        zip_or_portal_code: "number",
        phone: "number",
        fax: "number",
        website: "number",
        email: "number",
    },
    company_primary_contact: {
        ...auditLogSort,
        id: "number",
        name: "number",
        phone: "number",
        email: "number",
        location_id: "number",
    },
    external_applicant: {
        ...auditLogSort,
        id: "number",
        applicant_name: "number",
        father_name: "number",
        grand_father_name: "number",
        mobile_number: "number",
        email: "number",
        experience_year: "number",
        gender: "number",
        marital_status: "number",
        file: "number",
        name: "number",
        type: "number",
        training_type_id: "number",
        //needs training_type
    },
    vacancy: {
        ...auditLogSort,
        id: "number",
        number_of_position: "number",
        vacancy_status: "number",
        opening_date: "number",
        closing_date: "number",
        action_date: "number",
        vacancy_type: "number",
        requested_by: "number",
        approved_by: "number",
        remark: "number",
        job_title_id: "number",
        vacancy_request_reason_id: "number",
        //needs job_title
        //needs vacancy_request_reason
    },
    vacancy_applicant: {
        ...auditLogSort,
        id: "number",
        name: "number",
        application_date: "number",
        remark: "number",
        scale: "number",
        result: "number",
        application_status: "number",
        is_employee: "number",
        external_applicant_id: "number",
        employee_id: "number",
        vacancy_id: "number",
        //needs external_applicant
        //needs employee
        //needs vacancy
    },
    vacancy_examiner: {
        ...auditLogSort,
        id: "number",
        vacancy_id: "number",
        employee_id: "number",
        //needs vacancy
        //needs employee
    },
    vacancy_internal_applicant: {
        ...auditLogSort,
        id: "number",
        employee_id: "number",
        vacancy_id: "number",
    },
    vacancy_request_reason: {
        ...auditLogSort,
        id: "number",
        reason: "number",
    },
};
const allPostRoutes = [
    "/job_positions/job_category",
    "/job_positions/job_safety_equipment",
    "/job_positions/job_title",
    "/job_positions/safety_equipment",
    "/company_structure/business_unit",
    "/company_structure/location",
    "/company_structure/company_primary_contact",
    "/recruitment/vacancy",
    "/recruitment/vacancy_applicant",
    "/recruitment/vacancy_examiner",
    "/recruitment/vacancy_internal_applicant",
    "/recruitment/vacancy_request_reason",
];
const allRoutes = [
    "/job_positions/job_category",
    "/job_positions/job_safety_equipment",
    "/job_positions/job_title",
    "/job_positions/safety_equipment",
    "/company_structure/business_unit",
    "/company_structure/company", //added
    "/company_structure/location",
    "/company_structure/company_primary_contact",
    "/recruitment/external_applicant", //added
    "/recruitment/vacancy",
    "/recruitment/vacancy_applicant",
    "/recruitment/vacancy_examiner",
    "/recruitment/vacancy_internal_applicant",
    "/recruitment/vacancy_request_reason",
];

router.post(allPostRoutes, async (req, res, next) => {
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
    for (let i in allRangeValues[operationDataType]) {
        if (!reqBody[i] && reqBody[i] != 0) {
            continue;
        }
        if (
            reqBody[i] < allRangeValues[operationDataType][i][0] ||
            reqBody[i] > allRangeValues[operationDataType][i][1]
        ) {
            error(
                i,
                `must be in range ${allRangeValues[operationDataType][i]}`,
                next
            );
            return false;
        }
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
router.patch(allPostRoutes, async (req, res, next) => {
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
        for (let i in allRangeValues[operationDataType]) {
            if (!updateData[i] && updateData[i] != 0) {
                continue;
            }
            if (
                updateData[i] < allRangeValues[operationDataType][i][0] ||
                updateData[i] > allRangeValues[operationDataType][i][1]
            ) {
                error(
                    i,
                    `must be in range ${allRangeValues[operationDataType][i]}`,
                    next
                );
                return false;
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
