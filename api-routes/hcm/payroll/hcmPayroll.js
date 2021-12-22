const express = require("express");
const router = express.Router();
const { error } = require("../../../config/config");
const inputFilter = require("../../../validation/inputFilter");
const validation = require("../../../validation/validation");
const { post, get, patch, deleter } = require("../../../services/hcmPayroll");

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
    employee_back_penality_deduction: {
        transaction_date: "string",
        employee_id: "number",
    },
    employee_pay_scale: { scale: "number", employee_id: "number" },
    employee_penality: {
        penality_date: "string",
        case_description: "string",
        employee_id: "number",
    },
    employee_penality_detail_mst: {
        level: "number",
        penality_description: "string",
        penality_days: "number",
        employee_penality_type_id: "number",
    },
    employee_penality_type: {
        ref_number: "string",
        description: "string",
    },
    employee_tax: {
        start: "number",
        end: "number",
        percent: "number",
    },
    global_payroll_account_mapping: {
        chart_of_account_id: "number",
        business_unit_id: "number",
    },
    overtime: {
        date: "string",
        hours: "number",
        remark: "string",
        employee_id: "number",
        overtime_status: "number",
    },
    overtime_rate: { description: "string", rate: "number" },
    paygrade: {
        paygrade_name: "string",
        min_salary: "number",
        max_salary: "number",
    },
    paygrade_salary_component: {
        paygrade_id: "number",
        salary_component_id: "number",
    },
    paygrade_scale: { scale: "number", paygrade_id: "number" },
    payroll_detail: {
        payroll_summary_id: "number",
        payroll_component: "number",
    },
    payroll_detail_history: {
        payroll_summary_history_id: "number",
        description: "string",
        total_amount: "number",
    },
    payroll_frequency_type: { payroll_frequency_desc: "string" },
    payroll_location_setting: { location_id: "number" },
    payroll_log: {
        period: "number",
        year: "number",
        employee_id: "number",
    },
    payroll_log_employee: {
        start_period: "string",
        end_period: "string",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen: {
        period_id: "string",
        start_period: "string",
        end_period: "string",
        year: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen_log: { year: "number" },
    payroll_period_template: {
        period_id: "string",
        start_period: "string",
        end_period: "string",
        payroll_frequency_type_id: "number",
    },
    payroll_posting_log: { log_message: "string" },
    payroll_processing_log: { log_message: "string" },
    payroll_summary: {
        expected_working_hours: "number",
        total_worked_hours: "number",
    },
    payroll_summary_history: {
        expected_working_hours: "number",
        total_worked_hours: "number",
    },
    pay_scale_history_log: {
        scale: "number",
        amount: "number",
        paygrade_id: "number",
    },
    salary_adjustment: {
        amount: "number",
        salary_component_id: "number",
        employee_id: "number",
    },
    salary_component: {
        name: "string",
        chart_of_account_id: "number",
    },
    salary_component_account_mapping: {
        chart_of_account_id: "number",
        business_unit_id: "number",
        salary_component_id: "number",
    },
};
const enums = {
    employee_back_penality_deduction: {},
    employee_pay_scale: {},
    employee_penality: {},
    employee_penality_detail_mst: {},
    employee_penality_type: {},
    employee_tax: {},
    global_payroll_account_mapping: {
        payroll_account_type: [
            "SALARY_EXPENSE",
            "LOST_TIME_DEDUCTION",
            "OVER_TIME_EXPENSE",
            "NET_PAY_CONTROL",
            "EMPLOYEE_PENALITY",
        ],
    },
    overtime: {
        overtime_status: [
            "Pending",
            "Approved",
            "Rejected",
            "Released",
            "Locked",
        ],
    },
    overtime_rate: {},
    paygrade: {},
    paygrade_salary_component: {},
    paygrade_scale: {},
    payroll_detail: {
        payroll_component: [
            "Basic",
            "Earning",
            "Deduction",
            "Loan",
            "IncomeTax",
            "OverTime",
            "EmployeerPension",
            "EarningAdj",
            "DeductionAdj",
            "EmployeePension",
            "LostTime",
            "NetPay",
            "Penality",
        ],
        payroll_posting_entry_type: [
            "Gross",
            "IncomeTax",
            "OtherDeduction",
            "EmployeerTax",
        ],
    },
    payroll_detail_history: {
        payroll_component: [
            "Basic",
            "Earning",
            "Deduction",
            "Loan",
            "IncomeTax",
            "OverTime",
            "EmployeerPension",
            "EarningAdj",
            "DeductionAdj",
            "EmployeePension",
            "LostTime",
            "NetPay",
            "Penality",
        ],
        payroll_posting_entry_type: [
            "Gross",
            "IncomeTax",
            "OtherDeduction",
            "EmployeerTax",
        ],
    },
    payroll_frequency_type: {},
    payroll_location_setting: {},
    payroll_log: {},
    payroll_log_employee: {},
    payroll_period_autogen: {},
    payroll_period_autogen_log: {},
    payroll_period_template: {},
    payroll_posting_log: {},
    payroll_processing_log: {},
    payroll_summary: {},
    payroll_summary_history: {},
    pay_scale_history_log: {},
    salary_adjustment: {},
    salary_component: {
        salary_component_type: ["earning", "deduction"],
        value_type: ["percent", "fixed"],
    },
    salary_component_account_mapping: {},
};
const allOptionalInputfilters = {
    employee_back_penality_deduction: {
        remaining_deduction: "number",
        currently_deducted_amount: "number",
        payroll_frequency_type_id: "number",
    },
    employee_pay_scale: {},
    employee_penality: { employee_penality_detail_mst_id: "number" },
    employee_penality_detail_mst: {},
    employee_penality_type: {},
    employee_tax: {},
    global_payroll_account_mapping: { payroll_account_type: "number" },
    overtime: {
        action_date: "string",
        delegated_username: "string",
        overtime_rate_id: "number",
    },
    overtime_rate: {},
    paygrade: {},
    paygrade_salary_component: {},
    paygrade_scale: { amount: "number" },
    payroll_detail: {
        description: "string",
        total_amount: "number",
        payroll_component: "number",
        payroll_posting_entry_type: "number",
        salary_component_id: "number",
    },
    payroll_detail_history: {
        salary_component_id: "number",
        payroll_posting_entry_type: "number",
    },
    payroll_frequency_type: {},
    payroll_location_setting: {},
    payroll_log: { message: "string" },
    payroll_log_employee: { message: "string" },
    payroll_period_autogen: {},
    payroll_period_autogen_log: {},
    payroll_period_template: {},
    payroll_posting_log: {},
    payroll_processing_log: {},
    payroll_summary: {
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    payroll_summary_history: {
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    pay_scale_history_log: { effective_date: "string" },
    salary_adjustment: { payroll_date: "string" },
    salary_component: {
        salary_component_type: "number",
        value_type: "number",
        value: "number",
    },
    salary_component_account_mapping: {},
};
const allRangeValues = {
    employee_tax: {
        start: [0, Infinity],
        end: [0, Infinity],
        percent: [0, Infinity],
    },
    overtime: {
        hours: [0.5, 24],
    },
    overtime_rate: {
        rate: [0.5, 5],
    },
    paygrade: {
        min_salary: [0, Infinity],
        max_salary: [0, Infinity],
    },
    pay_scale_history_log: {
        scale: [1, 11],
    },
};
const phoneValues = {
    employee_back_penality_deduction: [],
    employee_pay_scale: [],
    employee_penality: [],
    employee_penality_detail_mst: [],
    employee_penality_type: [],
    employee_tax: [],
    global_payroll_account_mapping: [],
    overtime: [],
    overtime_rate: [],
    paygrade: [],
    paygrade_salary_component: [],
    paygrade_scale: [],
    payroll_detail: [],
    payroll_detail_history: [],
    payroll_frequency_type: [],
    payroll_location_setting: [],
    payroll_log: [],
    payroll_log_employee: [],
    payroll_period_autogen: [],
    payroll_period_autogen_log: [],
    payroll_period_template: [],
    payroll_posting_log: [],
    payroll_processing_log: [],
    payroll_summary: [],
    payroll_summary_history: [],
    pay_scale_history_log: [],
    salary_adjustment: [],
    salary_component: [],
    salary_component_account_mapping: [],
};
const emailValues = phoneValues;
const dateValues = {
    employee_back_penality_deduction: ["transaction_date"],
    employee_pay_scale: [],
    employee_penality: ["penality_date"],
    employee_penality_detail_mst: [],
    employee_penality_type: [],
    employee_tax: [],
    global_payroll_account_mapping: [],
    overtime: ["date", "action_date"],
    overtime_rate: [],
    paygrade: [],
    paygrade_salary_component: [],
    paygrade_scale: [],
    payroll_detail: [],
    payroll_detail_history: [],
    payroll_frequency_type: [],
    payroll_location_setting: [],
    payroll_log: [],
    payroll_log_employee: ["start_period", "end_period"],
    payroll_period_autogen: ["start_period", "end_period"],
    payroll_period_autogen_log: [],
    payroll_period_template: ["start_period", "end_period"],
    payroll_posting_log: [],
    payroll_processing_log: [],
    payroll_summary: [],
    payroll_summary_history: [],
    pay_scale_history_log: ["effective_date"],
    salary_adjustment: ["payroll_date"],
    salary_component: [],
    salary_component_account_mapping: [],
};
const allProjections = {
    employee_back_penality_deduction: {
        ...auditLogProjection,
        id: true,
        transaction_date: true,
        remaining_deduction: true,
        currently_deducted_amount: true,
        is_payroll_posted: true,
        employee: true,
        payroll_frequency_type: true,
    },
    employee_pay_scale: {
        ...auditLogProjection,
        id: true,
        scale: true,
        employee: true,
    },
    employee_penality: {
        ...auditLogProjection,
        id: true,
        penality_date: true,
        case_description: true,
        employee_penality_detail_mst: true,
        employee: true,
        is_applied_for_payroll: true,
    },
    employee_penality_detail_mst: {
        ...auditLogProjection,
        id: true,
        level: true,
        penality_description: true,
        penality_days: true,
        employee_penality_type: true,
    },
    employee_penality_type: {
        ...auditLogProjection,
        id: true,
        ref_number: true,
        description: true,
    },
    employee_tax: {
        ...auditLogProjection,
        id: true,
        start: true,
        end: true,
        percent: true,
    },
    global_payroll_account_mapping: {
        ...auditLogProjection,
        id: true,
        chart_of_account: true,
        business_unit: true,
        payroll_account_type: true,
    },
    overtime: {
        ...auditLogProjection,
        id: true,
        date: true,
        hours: true,
        remark: true,
        overtime_status: true,
        action_date: true,
        delegated_username: true,
        employee: true,
        overtime_rate: true,
    },
    overtime_rate: {
        ...auditLogProjection,
        id: true,
        description: true,
        rate: true,
    },
    paygrade: {
        ...auditLogProjection,
        id: true,
        paygrade_name: true,
        min_salary: true,
        max_salary: true,
    },
    paygrade_salary_component: {
        ...auditLogProjection,
        id: true,
        paygrade: true,
        salary_component: true,
    },
    paygrade_scale: {
        ...auditLogProjection,
        id: true,
        scale: true,
        amount: true,
        paygrade: true,
    },
    payroll_detail: {
        ...auditLogProjection,
        id: true,
        description: true,
        total_amount: true,
        payroll_component: true,
        isEmployerPart: true,
        isEarning: true,
        payroll_posting_entry_type: true,
        payroll_summary: true,
        salary_component: true,
    },
    payroll_detail_history: {
        ...auditLogProjection,
        id: true,
        payroll_summary_history: true,
        description: true,
        total_amount: true,
        payroll_component: true,
        salary_component: true,
        is_employer_part: true,
        is_earning: true,
        payroll_posting_entry_type: true,
    },
    payroll_frequency_type: {
        ...auditLogProjection,
        id: true,
        payroll_frequency_desc: true,
    },
    payroll_location_setting: {
        ...auditLogProjection,
        id: true,
        location: true,
    },
    payroll_log: {
        ...auditLogProjection,
        id: true,
        period: true,
        year: true,
        message: true,
        employee: true,
    },
    payroll_log_employee: {
        ...auditLogProjection,
        id: true,
        start_period: true,
        end_period: true,
        message: true,
        employee: true,
        payroll_frequency_type: true,
    },
    payroll_period_autogen: {
        ...auditLogProjection,
        id: true,
        period: true,
        start_period: true,
        end_period: true,
        year: true,
        is_payroll_processed: true,
        payroll_frequency_type: true,
        is_payroll_posted: true,
        is_processing_started: true,
        is_payroll_interfaced_to_FI: true,
        is_payroll_locked: true,
    },
    payroll_period_autogen_log: {
        ...auditLogProjection,
        id: true,
        year: true,
        is_period_generated: true,
    },
    payroll_period_template: {
        ...auditLogProjection,
        id: true,
        period: true,
        start_period: true,
        end_period: true,
        payroll_frequency_type: true,
    },
    payroll_posting_log: { ...auditLogProjection, id: true, log_message: true },
    payroll_processing_log: {
        ...auditLogProjection,
        id: true,
        log_message: true,
    },
    payroll_summary: {
        ...auditLogProjection,
        id: true,
        expected_working_hours: true,
        total_worked_hours: true,
        total_worked_OT_hours: true,
        total_worked_OT_amount: true,
        total_absent_hours: true,
        total_absent_amount: true,
        total_amount: true,
        payroll_frequency_type: true,
        employee: true,
        business_unit: true,
    },
    payroll_summary_history: {
        ...auditLogProjection,
        id: true,
        expected_working_hours: true,
        total_worked_hours: true,
        total_worked_OT_hours: true,
        total_worked_OT_amount: true,
        total_absent_hours: true,
        total_absent_amount: true,
        total_amount: true,
        is_payroll_posted: true,
        payroll_frequency_type: true,
        employee: true,
        business_unit: true,
    },
    pay_scale_history_log: {
        ...auditLogProjection,
        id: true,
        scale: true,
        effective_date: true,
        amount: true,
        paygrade: true,
    },
    salary_adjustment: {
        ...auditLogProjection,
        id: true,
        payroll_date: true,
        amount: true,
        salary_component: true,
        employee: true,
    },
    salary_component: {
        ...auditLogProjection,
        id: true,
        name: true,
        salary_component_type: true,
        value_type: true,
        value: true,
        taxable: true,
        chart_of_account: true,
    },
    salary_component_account_mapping: {
        ...auditLogProjection,
        id: true,
        chart_of_account: true,
        business_unit: true,
        salary_component: true,
    },
};
const allFilters = {
    employee_back_penality_deduction: {
        id: "number",
        remaining_deduction: "number",
        currently_deducted_amount: "number",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    employee_pay_scale: {
        id: "number",
        scale: "number",
        employee_id: "number",
    },
    employee_penality: {
        id: "number",
        case_description: "string",
        employee_penality_detail_mst_id: "number",
        employee_id: "number",
    },
    employee_penality_detail_mst: {
        id: "number",
        level: "number",
        penality_description: "string",
        penality_days: "number",
        employee_penality_type_id: "number",
    },
    employee_penality_type: {
        id: "number",
        ref_number: "string",
        description: "string",
    },
    employee_tax: {
        id: "number",
        start: "number",
        end: "number",
        percent: "number",
    },
    global_payroll_account_mapping: {
        id: "number",
        chart_of_account_id: "number",
        business_unit_id: "number",
        payroll_account_type: "number",
    },
    overtime: {
        id: "number",
        hours: "number",
        remark: "string",
        overtime_status: "number",
        delegated_username: "string",
        employee_id: "number",
        overtime_rate_id: "number",
    },
    overtime_rate: {
        id: "number",
        description: "string",
        rate: "number",
    },
    paygrade: {
        id: "number",
        paygrade_name: "string",
        min_salary: "number",
        max_salary: "number",
    },
    paygrade_salary_component: {
        id: "number",
        paygrade_id: "number",
        salary_component_id: "number",
    },
    paygrade_scale: {
        id: "number",
        scale: "number",
        amount: "number",
        paygrade_id: "number",
    },
    payroll_detail: {
        id: "number",
        description: "string",
        total_amount: "number",
        payroll_component: "number",
        payroll_posting_entry_type: "number",
        payroll_summary_id: "number",
        salary_component_id: "number",
    },
    payroll_detail_history: {
        id: "number",
        payroll_summary_history_id: "number",
        description: "string",
        total_amount: "number",
        payroll_component: "number",
        salary_component_id: "number",
        payroll_posting_entry_type: "number",
    },
    payroll_frequency_type: {
        id: "number",
        payroll_frequency_desc: "string",
    },
    payroll_location_setting: { id: "number", location_id: "number" },
    payroll_log: {
        id: "number",
        period: "number",
        year: "number",
        message: "string",
        employee_id: "number",
    },
    payroll_log_employee: {
        id: "number",
        message: "string",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen: {
        id: "number",
        period_id: "string",
        year: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen_log: { id: "number", year: "number" },
    payroll_period_template: {
        id: "number",
        period_id: "string",
        payroll_frequency_type_id: "number",
    },
    payroll_posting_log: { id: "number", log_message: "string" },
    payroll_processing_log: { id: "number", log_message: "string" },
    payroll_summary: {
        id: "number",
        expected_working_hours: "number",
        total_worked_hours: "number",
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    payroll_summary_history: {
        id: "number",
        expected_working_hours: "number",
        total_worked_hours: "number",
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    pay_scale_history_log: {
        id: "number",
        scale: "number",
        amount: "number",
        paygrade_id: "number",
    },
    salary_adjustment: {
        id: "number",
        amount: "number",
        salary_component_id: "number",
        employee_id: "number",
    },
    salary_component: {
        id: "number",
        name: "string",
        salary_component_type: "number",
        value_type: "number",
        value: "number",
        chart_of_account_id: "number",
    },
    salary_component_account_mapping: {
        id: "number",
        chart_of_account_id: "number",
        business_unit_id: "number",
        salary_component_id: "number",
    },
};
const allSorts = {
    employee_back_penality_deduction: {
        ...auditLogSort,
        id: "number",
        remaining_deduction: "number",
        currently_deducted_amount: "number",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    employee_pay_scale: {
        ...auditLogSort,
        id: "number",
        scale: "number",
        employee_id: "number",
    },
    employee_penality: {
        ...auditLogSort,
        id: "number",
        case_description: "string",
        employee_penality_detail_mst_id: "number",
        employee_id: "number",
    },
    employee_penality_detail_mst: {
        ...auditLogSort,
        id: "number",
        level: "number",
        penality_description: "string",
        penality_days: "number",
        employee_penality_type_id: "number",
    },
    employee_penality_type: {
        ...auditLogSort,
        id: "number",
        ref_number: "string",
        description: "string",
    },
    employee_tax: {
        ...auditLogSort,
        id: "number",
        start: "number",
        end: "number",
        percent: "number",
    },
    global_payroll_account_mapping: {
        ...auditLogSort,
        id: "number",
        chart_of_account_id: "number",
        business_unit_id: "number",
        payroll_account_type: "number",
    },
    overtime: {
        ...auditLogSort,
        id: "number",
        hours: "number",
        remark: "string",
        overtime_status: "number",
        delegated_username: "string",
        employee_id: "number",
        overtime_rate_id: "number",
    },
    overtime_rate: {
        ...auditLogSort,
        id: "number",
        description: "string",
        rate: "number",
    },
    paygrade: {
        ...auditLogSort,
        id: "number",
        paygrade_name: "string",
        min_salary: "number",
        max_salary: "number",
    },
    paygrade_salary_component: {
        ...auditLogSort,
        id: "number",
        paygrade_id: "number",
        salary_component_id: "number",
    },
    paygrade_scale: {
        ...auditLogSort,
        id: "number",
        scale: "number",
        amount: "number",
        paygrade_id: "number",
    },
    payroll_detail: {
        ...auditLogSort,
        id: "number",
        description: "string",
        total_amount: "number",
        payroll_component: "number",
        payroll_posting_entry_type: "number",
        payroll_summary_id: "number",
        salary_component_id: "number",
    },
    payroll_detail_history: {
        ...auditLogSort,
        id: "number",
        payroll_summary_history_id: "number",
        description: "string",
        total_amount: "number",
        payroll_component: "number",
        salary_component_id: "number",
        payroll_posting_entry_type: "number",
    },
    payroll_frequency_type: {
        ...auditLogSort,
        id: "number",
        payroll_frequency_desc: "string",
    },
    payroll_location_setting: {
        ...auditLogSort,
        id: "number",
        location_id: "number",
    },
    payroll_log: {
        ...auditLogSort,
        id: "number",
        period: "number",
        year: "number",
        message: "string",
        employee_id: "number",
    },
    payroll_log_employee: {
        ...auditLogSort,
        id: "number",
        message: "string",
        employee_id: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen: {
        ...auditLogSort,
        id: "number",
        period_id: "string",
        year: "number",
        payroll_frequency_type_id: "number",
    },
    payroll_period_autogen_log: {
        ...auditLogSort,
        id: "number",
        year: "number",
    },
    payroll_period_template: {
        ...auditLogSort,
        id: "number",
        period_id: "string",
        payroll_frequency_type_id: "number",
    },
    payroll_posting_log: {
        ...auditLogSort,
        id: "number",
        log_message: "string",
    },
    payroll_processing_log: {
        ...auditLogSort,
        id: "number",
        log_message: "string",
    },
    payroll_summary: {
        ...auditLogSort,
        id: "number",
        expected_working_hours: "number",
        total_worked_hours: "number",
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    payroll_summary_history: {
        ...auditLogSort,
        id: "number",
        expected_working_hours: "number",
        total_worked_hours: "number",
        total_worked_OT_hours: "number",
        total_worked_OT_amount: "number",
        total_absent_hours: "number",
        total_absent_amount: "number",
        total_amount: "number",
        payroll_frequency_type_id: "number",
        employee_id: "number",
        business_unit_id: "number",
    },
    pay_scale_history_log: {
        ...auditLogSort,
        id: "number",
        scale: "number",
        amount: "number",
        paygrade_id: "number",
    },
    salary_adjustment: {
        ...auditLogSort,
        id: "number",
        amount: "number",
        salary_component_id: "number",
        employee_id: "number",
    },
    salary_component: {
        ...auditLogSort,
        id: "number",
        name: "string",
        salary_component_type: "number",
        value_type: "number",
        value: "number",
        chart_of_account_id: "number",
    },
    salary_component_account_mapping: {
        ...auditLogSort,
        id: "number",
        chart_of_account_id: "number",
        business_unit_id: "number",
        salary_component_id: "number",
    },
};
const allRoutes = [
    "/salary_component",
    "/payroll_frequency_type",
    "/paygrade",
    "/employee_back_penality_deduction",
    "/employee_pay_scale",
    "/employee_penality",
    "/employee_penality_detail_mst",
    "/employee_penality_type",
    "/employee_tax",
    "/global_payroll_account_mapping",
    "/overtime",
    "/overtime_rate",
    "/paygrade_salary_component",
    "/paygrade_scale",
    "/payroll_detail",
    "/payroll_detail_history",
    "/payroll_location_setting",
    "/payroll_log",
    "/payroll_log_employee",
    "/payroll_period_autogen",
    "/payroll_period_autogen_log",
    "/payroll_period_template",
    "/payroll_posting_log",
    "/payroll_processing_log",
    "/payroll_summary",
    "/payroll_summary_history",
    "/pay_scale_history_log",
    "/salary_adjustment",
    "/salary_component_account_mapping",
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
