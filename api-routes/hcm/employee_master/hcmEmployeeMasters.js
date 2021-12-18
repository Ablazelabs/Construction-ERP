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
} = require("../../../services/hcmEmployeeMasters");

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
    address: {
        address_line_1: "string",
        employee_id: "number",
    },

    //attachment skipped because it involeves upload
    dependent: {
        fullname: "string",
        employee_id: "number",
    },

    discipline: {
        case_description: "string",
    },

    education: {
        field_of_study_id: "number",
        duration_measure_id: "number",
        training_type_id: "number",
        employee_id: "number",
    },

    //employee needs file upload too, skip it
    employee: {
        id_number: "number",
        first_name: "string",
        middle_name: "string",
        gender: "number", //["male", "female"],
    },

    employee_action: {
        employee_id: "number",
        action_reason_id: "number",
    },

    //employee attachment is skipped bc it envolves file upload
    // employee_commitment: {
    //     commitment_type_id: "number",
    //     employee_id: "number",
    // },
    // employee_commitment: {
    //     remark: "string",
    // },
    //employee_commitment has been skipped
    employee_contact: {
        name: "string",
        relationship: "string",
        address_line_1: "string",
        mobile_number: "string",
        employee_id: "number",
    },

    employee_id_range: {
        start: "number", //[0+],
        end: "number", //[0+],
    },

    employee_loan_repayment: {
        repayment_amount: "number", //[0+],
        total_amount: "number", //[0+],
    },

    employee_pay_frequency: {
        expected_working_hrs: "number",
    },

    employee_paygrade: {
        employee_id: "number",
        paygrade_id: "number",
    },
    employee_salary_component: {
        employee_id: "number",
        salary_component_id: "number",
    },

    experience: {
        company: "string",
        job_title: "string",
        employee_id: "number",
    },

    leave_assignment: {
        employee_id: "number",
    },

    leave_entitlement: {
        id: "number",
        employee_id: "number",
        attendance_abscence_type_id: "number",
    },
    leave_transfer: {
        remark: "string",
        employee_id: "number",
    },

    license: {
        expiry_date: "string",
    },

    org_assignment: {
        job_title_id: "number",
        business_unit_id: "number",
    },

    service_allowance_pay: {
        allowance_pay: "number", //[0+]
    },

    shift_assignment: {
        shift_schedule_hdr_id: "number",
        employee_id: "number",
    },
};
const enums = {
    address: {},
    dependent: {
        relationship: ["child", "other"],
    },
    discipline: {},
    education: {},
    employee: {
        gender: ["male", "female"],
        marital_status: ["Single", "Married", "Widowed", "Divorced"], //optional
    },
    employee_action: {
        employee_status: ["Active", "Inactive", "Retired", "Withdraw"], //optional
    },
    employee_contact: {},
    employee_id_range: {},
    employee_loan_repayment: {},
    employee_pay_frequency: {},
    employee_paygrade: {},
    employee_salary_component: {},
    experience: {},
    leave_assignment: {
        leave_assignment_type: ["Direct", "Request", "Plan"], //optional
        leave_request_status: [
            "Pending",
            "Approved",
            "Rejected",
            "Released",
            "Locked",
        ], //optional
    },
    leave_entitlement: {},
    leave_transfer: {
        leave_request_status: [
            "Pending",
            "Approved",
            "Rejected",
            "Released",
            "Locked",
        ], //optional
    },
    license: {},
    org_assignment: {},
    service_allowance_pay: {},
    shift_assignment: {},
};
const allOptionalInputfilters = {
    address: {
        address_line_2: "string",
        region: "string",
        city: "string",
        mobile_number: "string",
        house_number: "string",
        postal_box: "string",
        email: "string",
        address_type_id: "number",
    },
    dependent: {
        relationship: "number", //["child", "other"]
        dependent_date_of_birth: "string",
    },
    discipline: {
        attachment_id: "number",
        case_type_id: "number",
        employee_id: "number",
    },
    education: {
        score: "string",
    },
    employee: {
        last_name: "string",
        date_of_birth: "string",
        employment_start_date: "string",
        date_of_joining: "string",
        marital_status: "number", //["Single", "Married", "Widowed", "Divorced"], //optional
        marital_since: "string",
        place_of_birth: "string",
        photo: "string",
        is_employee_active: "boolean",
        type: "string",
        prev_employment_leave_days: "Float?",
        bank_account_number: "string",
        document_ref: "string",
        pension_ref: "string",
        nationality_id: "number",
        country_id: "number",
        language_id: "number",
        title_id: "number",
        religion_id: "number",
        employee_type_id: "number",
    },
    employee_action: {
        employee_status: "number", //["Active", "Inactive", "Retired", "Withdraw"],//optional
        attachment_id: "number",
    },
    employee_contact: {
        address_line_2: "string",
    },
    employee_id_range: {
        number_of_digit: "number",
        employee_type_id: "number",
    },
    employee_loan_repayment: {
        employee_id: "number",
        salary_component_id: "number",
    },
    employee_pay_frequency: {
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    employee_paygrade: {},
    employee_salary_component: {
        amount: "Float?",
    },
    experience: {
        salary: "Float?",
        comment: "string",
    },
    leave_assignment: {
        is_half_day: "boolean",
        leave_assignment_type: "number", //["Direct", "Request", "Plan"],//optional
        leave_request_status: "number", //["Pending", "Approved", "Rejected", "Released","Locked"],//optional
        action_date: "string",
        delegated_user_name: "string",
        attendance_abscence_type_id: "number",
    },
    leave_entitlement: {},
    leave_transfer: {
        from_year: "number",
        to_year: "number",
        number_of_days: "number",
        leave_request_status: "number", //["Pending", "Approved", "Rejected", "Released","Locked"],//optional
        action_date: "string",
        delegated_user_name: "string",
    },
    license: {
        license_number: "string",
        issued_date: "string",
        license_type_id: "number",
        employee_id: "number",
    },
    org_assignment: {
        employee_group_id: "number",
        location_id: "number",
        employee_action_id: "number",
    },
    service_allowance_pay: {
        employee_id: "number",
    },
    shift_assignment: {},
};
const phoneValues = {
    address: ["mobile_number"],
    attachment: [],
    dependent: [],
    discipline: [],
    education: [],
    employee: [],
    employee_action: [],
    employee_attachment: [],
    employee_commitment: [],
    employee_contact: ["mobile_number"],
    employee_id_range: [],
    employee_loan_repayment: [],
    employee_pay_frequency: [],
    employee_paygrade: [],
    employee_salary_component: [],
    experience: [],
    leave_assignment: [],
    leave_entitlement: [],
    leave_transfer: [],
    license: [],
    org_assignment: [],
    service_allowance_pay: [],
    shift_assignment: [],
};
const emailValues = {
    address: ["email"],
    attachment: [],
    dependent: [],
    discipline: [],
    education: [],
    employee: [],
    employee_action: [],
    employee_attachment: [],
    employee_commitment: [],
    employee_contact: [],
    employee_id_range: [],
    employee_loan_repayment: [],
    employee_pay_frequency: [],
    employee_paygrade: [],
    employee_salary_component: [],
    experience: [],
    leave_assignment: [],
    leave_entitlement: [],
    leave_transfer: [],
    license: [],
    org_assignment: [],
    service_allowance_pay: [],
    shift_assignment: [],
};
const dateValues = {
    address: [],
    attachment: [],
    dependent: ["dependent_date_of_birth"],
    discipline: [],
    education: [],
    employee: [
        "date_of_birth",
        "employment_start_date",
        "date_of_joining",
        "marital_since",
    ],
    employee_action: [],
    employee_attachment: [],
    employee_commitment: [],
    employee_contact: [],
    employee_id_range: [],
    employee_loan_repayment: [],
    employee_pay_frequency: [],
    employee_paygrade: [],
    employee_salary_component: [],
    experience: [],
    leave_assignment: ["action_date"],
    leave_entitlement: [],
    leave_transfer: ["action_date"],
    license: ["issued_date", "expiry_date"],
    org_assignment: [],
    service_allowance_pay: [],
    shift_assignment: [],
};
const allProjections = {
    address: {
        id: true,
        address_line_1: true,
        address_line_2: true,
        region: true,
        city: true,
        mobile_number: true,
        house_number: true,
        postal_box: true,
        email: true,
        employee: true,
        address_type: true,
    },
    attachment: {
        id: true,
        description: true,
        type: true,
        name: true,
        size: true,
        path: true,
        employee: true,
    },
    dependent: {
        id: true,
        fullname: true,
        relationship: true,
        dependent_date_of_birth: true,
        employee: true,
    },
    discipline: {
        id: true,
        case_description: true,
        attachment: true,
        case_type: true,
        employee: true,
    },
    education: {
        id: true,
        duration: true,
        score: true,
        field_of_study: true,
        duration_measure: true,
        training_type: true,
        employee: true,
    },
    employee: {
        id: true,
        id_number: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        gender: true,
        date_of_birth: true,
        employment_start_date: true,
        date_of_joining: true,
        marital_status: true,
        marital_since: true,
        place_of_birth: true,
        photo: true,
        is_employee_active: true,
        type: true,
        prev_employment_leave_days: true,
        bank_account_number: true,
        document_ref: true,
        pension_ref: true,
        nationality: true,
        country: true,
        language: true,
        title: true,
        religion: true,
        employee_type: true,
    },
    employee_action: {
        id: true,
        employee_status: true,
        attachment: true,
        employee: true,
        action_reason: true,
    },
    employee_attachment: {
        id: true,
        description: true,
        path: true,
        employee: true,
    },
    employee_commitment: {
        id: true,
        commitment_type: true,
        employee: true,
        remark: true,
    },
    employee_contact: {
        id: true,
        name: true,
        relationship: true,
        address_line_1: true,
        address_line_2: true,
        mobile_number: true,
        employee: true,
    },
    employee_id_range: {
        id: true,
        start: true,
        end: true,
        number_of_digit: true,
        employee_type: true,
    },
    employee_loan_repayment: {
        id: true,
        repayment_amount: true,
        total_amount: true,
        employee_id: true,
        salary_component: true,
    },
    employee_pay_frequency: {
        id: true,
        expected_working_hrs: true,
        employee: true,
        payroll_frequency_type: true,
    },
    employee_paygrade: {
        id: true,
        employee: true,
        paygrade: true,
    },
    employee_salary_component: {
        id: true,
        amount: true,
        employee: true,
        salary_component: true,
    },
    experience: {
        id: true,
        company: true,
        job_title: true,
        salary: true,
        comment: true,
        employee: true,
    },
    leave_assignment: {
        id: true,
        is_half_day: true,
        leave_assignment_type: true,
        leave_request_status: true,
        action_date: true,
        delegated_user_name: true,
        employee: true,
        attendance_abscence_type: true,
    },
    leave_entitlement: {
        id: true,
        employee: true,
        attendance_abscence_type: true,
    },
    leave_transfer: {
        id: true,
        from_year: true,
        to_year: true,
        number_of_days: true,
        leave_request_status: true,
        remark: true,
        action_date: true,
        delegated_user_name: true,
        employee: true,
    },
    license: {
        id: true,
        license_number: true,
        issued_date: true,
        expiry_date: true,
        license_type: true,
        employee: true,
    },
    org_assignment: {
        id: true,
        employee_group: true,
        location: true,
        employee_action: true,
        job_title: true,
        business_unit: true,
    },
    service_allowance_pay: {
        id: true,
        allowance_pay: true,
        employee: true,
    },
    shift_assignment: {
        id: true,
        shift_schedule_hdr_id: true,
        employee: true,
    },
};
const allFilters = {
    address: {
        id: "number",
        address_line_1: "string",
        address_line_2: "string",
        region: "string",
        city: "string",
        mobile_number: "string",
        house_number: "string",
        postal_box: "string",
        email: "string",
        employee_id: "number",
        address_type_id: "number",
    },
    attachment: {
        id: "number",
        description: "string",
        type: "string",
        name: "string",
        size: "number",
        path: "string",
        employee_id: "number",
    },
    dependent: {
        id: "number",
        fullname: "string",
        relationship: "number",
        employee_id: "number",
    },
    discipline: {
        id: "number",
        case_description: "string",
        attachment_id: "number",
        case_type_id: "number",
        employee_id: "number",
    },
    education: {
        id: "number",
        duration: "number",
        score: "string",
        field_of_study_id: "number",
        duration_measure_id: "number",
        training_type_id: "number",
        employee_id: "number",
    },
    employee: {
        id: "number",
        id_number: "number",
        first_name: "string",
        middle_name: "string",
        last_name: "string",
        gender: "number",
        marital_status: "number",
        place_of_birth: "string",
        photo: "string",
        is_employee_active: "boolean",
        type: "string",
        prev_employment_leave_days: "Float?",
        bank_account_number: "string",
        document_ref: "string",
        pension_ref: "string",
        nationality_id: "number",
        country_id: "number",
        language_id: "number",
        title_id: "number",
        religion_id: "number",
        employee_type_id: "number",
    },
    employee_action: {
        id: "number",
        employee_status: "number",
        attachment_id: "number",
        employee_id: "number",
        action_reason_id: "number",
    },
    employee_attachment: {
        id: "number",
        description: "string",
        path: "string",
        employee_id: "number",
    },
    employee_commitment: {
        id: "number",
        commitment_type_id: "number",
        employee_id: "number",
        remark: "string",
    },
    employee_contact: {
        id: "number",
        name: "string",
        relationship: "string",
        address_line_1: "string",
        address_line_2: "string",
        mobile_number: "string",
        employee_id: "number",
    },
    employee_id_range: {
        id: "number",
        start: "number", //[0+],
        end: "number", //[0+],
        number_of_digit: "number",
        employee_type_id: "number",
    },
    employee_loan_repayment: {
        id: "number",
        repayment_amount: "number", //[0+],
        total_amount: "number", //[0+],
        employee_id: "number",
        salary_component_id: "number",
    },
    employee_pay_frequency: {
        id: "number",
        expected_working_hrs: "number",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    employee_paygrade: {
        id: "number",
        employee_id: "number",
        paygrade_id: "number",
    },
    employee_salary_component: {
        id: "number",
        amount: "Float?",
        employee_id: "number",
        salary_component_id: "number",
    },
    experience: {
        id: "number",
        company: "string",
        job_title: "string",
        salary: "Float?",
        comment: "string",
        employee_id: "number",
    },
    leave_assignment: {
        id: "number",
        is_half_day: "boolean",
        leave_assignment_type: "number",
        leave_request_status: "number",
        delegated_user_name: "string",
        employee_id: "number",
        attendance_abscence_type_id: "number",
    },
    leave_entitlement: {
        id: "number",
        employee_id: "number",
        attendance_abscence_type_id: "number",
    },
    leave_transfer: {
        id: "number",
        from_year: "number",
        to_year: "number",
        number_of_days: "number",
        leave_request_status: "number",
        remark: "string",
        action_date: "string",
        delegated_user_name: "string",
        employee_id: "number",
    },
    license: {
        id: "number",
        license_number: "string",
        license_type_id: "number",
        employee_id: "number",
    },
    org_assignment: {
        id: "number",
        employee_group_id: "number",
        location_id: "number",
        employee_action_id: "number",
        job_title_id: "number",
        business_unit_id: "number",
    },
    service_allowance_pay: {
        id: "number",
        allowance_pay: "number", //[0+]
        employee_id: "number",
    },
    shift_assignment: {
        id: "number",
        shift_schedule_hdr_id: "number",
        employee_id: "number",
    },
};
const allSorts = {
    address: {
        id: "number",
        address_line_1: "number",
        address_line_2: "number",
        region: "number",
        city: "number",
        mobile_number: "number",
        house_number: "number",
        postal_box: "number",
        email: "number",
        employee_id: "number",
        address_type_id: "number",
        //needs address_type
    },
    attachment: {
        id: "number",
        description: "number",
        type: "number",
        name: "number",
        size: "number",
        path: "number",
        employee_id: "number",
        //needs employee
    },
    dependent: {
        id: "number",
        fullname: "number",
        relationship: "number",
        dependent_date_of_birth: "number",
        employee_id: "number",
        //needs employee
    },
    discipline: {
        id: "number",
        case_description: "number",
        attachment_id: "number",
        case_type_id: "number",
        employee_id: "number",
        //needs employee
        //needs discipline_case_type
        //needs attachment
    },
    education: {
        id: "number",
        duration: "number",
        score: "number",
        field_of_study_id: "number",
        duration_measure_id: "number",
        training_type_id: "number",
        employee_id: "number",
        //needs training_type
        //needs employee
        //needs duration_measure
        //needs field_of_study
    },
    employee: {
        id: "number",
        id_number: "number",
        first_name: "number",
        middle_name: "number",
        last_name: "number",
        gender: "number",
        date_of_birth: "number",
        employment_start_date: "number",
        date_of_joining: "number",
        marital_status: "number",
        marital_since: "number",
        place_of_birth: "number",
        photo: "number",
        is_employee_active: "number",
        type: "number",
        prev_employment_leave_days: "number",
        bank_account_number: "number",
        document_ref: "number",
        pension_ref: "number",
        nationality_id: "number",
        country_id: "number",
        language_id: "number",
        title_id: "number",
        religion_id: "number",
        employee_type_id: "number",
        //needs employee_type
        //needs nationality
        //needs country
        //needs language
        //needs title
        //needs religion
    },
    employee_action: {
        id: "number",
        employee_status: "number",
        attachment_id: "number",
        employee_id: "number",
        action_reason_id: "number",
        //needs employee
    },
    employee_attachment: {
        id: "number",
        description: "number",
        path: "number",
        employee_id: "number",
        //needs employee
    },
    employee_commitment: {
        id: "number",
        commitment_type_id: "number",
        employee_id: "number",
        remark: "number",
        //needs employee
        //needs commitment_type
    },
    employee_contact: {
        id: "number",
        name: "number",
        relationship: "number",
        address_line_1: "number",
        address_line_2: "number",
        mobile_number: "number",
        employee_id: "number",
        //needs employee
    },
    employee_id_range: {
        id: "number",
        start: "number",
        end: "number",
        number_of_digit: "number",
        employee_type_id: "number",
        //needs employee_type
    },
    employee_loan_repayment: {
        id: "number",
        repayment_amount: "number",
        total_amount: "number",
        employee_id: "number",
        salary_component_id: "number",
        //needs employee
        //needs salary_component -- inside hcm/payroll
    },
    employee_pay_frequency: {
        id: "number",
        expected_working_hrs: "number",
        employee_id: "number",
        payroll_frequency_type_id: "number",
        //needs employee
        //needs payroll_frequency_type -- inside hcm/payroll
    },
    employee_paygrade: {
        id: "number",
        employee_id: "number",
        paygrade_id: "number",
        //needs employee
        //needs paygrade -- inside hcm/payroll
    },
    employee_salary_component: {
        id: "number",
        amount: "number",
        employee_id: "number",
        salary_component_id: "number",
        //needs salary_component -- inside hcm/payroll
        //needs employee
    },
    experience: {
        id: "number",
        company: "number",
        job_title: "number",
        salary: "number",
        comment: "number",
        employee_id: "number",
        //needs employee
    },
    leave_assignment: {
        id: "number",
        is_half_day: "number",
        leave_assignment_type: "number",
        leave_request_status: "number",
        action_date: "number",
        delegated_user_name: "number",
        employee_id: "number",
        attendance_abscence_type_id: "number",
        //needs employee
        //needs attendance_abscence_type -- inside hcm/timeandleave
    },
    leave_entitlement: {
        id: "number",
        employee_id: "number",
        attendance_abscence_type_id: "number",
        //needs employee
        //needs attendance_abscence_type -- inside hcm/timeandleave
    },
    leave_transfer: {
        id: "number",
        from_year: "number",
        to_year: "number",
        number_of_days: "number",
        leave_request_status: "number",
        remark: "number",
        action_date: "number",
        delegated_user_name: "number",
        employee_id: "number",
        //needs employee
    },
    license: {
        id: "number",
        license_number: "number",
        issued_date: "number",
        expiry_date: "number",
        license_type_id: "number",
        employee_id: "number",
        //needs employee
        //needs license_type
    },
    org_assignment: {
        id: "number",
        employee_group_id: "number",
        location_id: "number",
        employee_action_id: "number",
        job_title_id: "number",
        business_unit_id: "number",
        //needs business_unit -- inside hcm/company_structure
        //needs job_title -- inside hcm/job_positions
        //needs employee_action
        //needs employee_group
        //needs location -- inside hcm/company_structure
    },
    service_allowance_pay: {
        id: "number",
        allowance_pay: "number",
        employee_id: "number",
        //needs employee
    },
    shift_assignment: {
        id: "number",
        shift_schedule_hdr_id: "number",
        employee_id: "number",
        //needs employee
        //needs shift_schedule_hdr -- inside hcm/timeandleave
    },
};
const allRoutes = [
    "/address",
    "/dependent",
    "/discipline",
    "/education",
    "/employee_action",
    "/employee_commitment",
    "/employee_contact",
    "/employee_id_range",
    "/employee_loan_repayment",
    "/employee_pay_frequency",
    "/employee_paygrade",
    "/employee_salary_component",
    "/experience",
    "/leave_assignment",
    "/leave_entitlement",
    "/leave_transfer",
    "/license",
    "/org_assignment",
    "/service_allowance_pay",
    "/shift_assignment",
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
