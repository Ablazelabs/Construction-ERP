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
} = require("../../../services/rest_finance_operational");

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
    chart_of_account: {
        account_name: "string",
        account_code: "string",
        add_to_dashboard_watch_list: "boolean",
        account_type_id: "number",
    },
    account_type_financial_statement_section: {
        account_type_id: "number",
        financial_statement_section_id: "number",
    },
    bank_reconcilation: {
        chart_of_account_id: "number",
    },

    reconcilation_transaction: {
        bank_reconcilation_id: "number",
        general_ledger_id: "number",
    },
    asset: {
        name: "string",
        tag_number: "string",
        description: "string",
        economic_value: "number",
        depreciation_methods: "number", //["StraightLineDepreciation","UnitsOfProductionDepreciation","Null"],
        useful_life: "string", //this is a date
        current_value: "number",
        asset_type: "number", //["online","offline"],
        scrap_value: "number",
        currency_id: "number",
        asset_account_id: "number",
        depreciation_account_id: "number",
    },

    estimated_total_production_unit: {
        unit_name: "string",
        unit_symbol: "string",
    },
    recurring_journal_occurrence: {
        repeat_every_label: "number", //["days","weeks","months","years"],
        name: "string",
    },

    budget: {
        budget_reason: "number", //["cost_center","project"],
    },

    budget_account: {
        budget_total_amount: "number",
    },

    budget_account_period: {
        budget_amount: "number",
        period_month: "number", //["january","february","march","april","may","june","july","august","september","october","november","december","other"],
    },

    budget_control_action: {
        id: "number",
        type: "number", //["material_request","purchase_request","booking_actual_expense"],
        action_accumulated_monthly_budget_exceeded: "number", //["stop","warning","ignore"]
    },
    general_journal_detail: {
        debit_or_credit: "number", //["credit","debit"],
        //"posting_reference":"String @unique",//needs its own implementation :( sequential string
        reference_code: "string",
        general_journal_header_id: "number",
        cost_center_id: "number",
        chart_of_account_id: "number",
    },

    general_journal_header: {
        //"posting_reference":"String @unique",//needs its own implementation :( sequential string
        journal_date: "string",
        notes: "string",
        currency_id: "number",
        posting_responsible_user_id: "number",
    },

    general_ledger: {
        ledger_status: "number", //["active", "reversed", "deleted","void"],
        //"posting_reference":"String @unique",//needs its own implementation :( sequential string
        //"group_posting_reference":"String @unique",//needs its own implementation :( sequential string
        journal_date: "string", //this is in the allowed unlocked transaction
        currency_id: "number",
        chart_of_account_id: "number",
    },

    journal_comment: {
        comment: "string",
        application_user_id: "number",
    },

    number_tracker: {
        starting_number: "number",
        next_number: "number",
    },

    recurring_general_journal: {
        profile_name: "string",
    },

    transaction_lock: {
        lock_date: "string",
        reason: "string",
    },

    opening_balance: {
        opening_balance_date: "string",
        month: "number", //["january","february","march","april","may","june","july","august","september","october","november","december","other"]
    },
};
const enums = {
    chart_of_account: {},
    account_type_financial_statement_section: {},
    bank_reconcilation: {},
    reconcilation_transaction: {},
    asset: {
        depreciation_methods: [
            "StraightLineDepreciation",
            "UnitsOfProductionDepreciation",
            "Null",
        ],
        asset_type: ["online", "offline"],
        asset_status: ["received?", "work_order_created?"],
    },
    estimated_total_production_unit: {},
    recurring_journal_occurrence: {
        repeat_every_label: ["days", "weeks", "months", "years"],
    },
    budget: {
        budget_reason: ["cost_center", "project"],
    },
    budget_account: {},
    budget_account_period: {
        period_month: [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
            "other",
        ],
    },
    budget_control_action: {
        type: [
            "material_request",
            "purchase_request",
            "booking_actual_expense",
        ],
        action_accumulated_monthly_budget_exceeded: [
            "stop",
            "warning",
            "ignore",
        ],
    },
    general_journal_detail: {
        debit_or_credit: ["credit", "debit"],
    },
    general_journal_header: {
        journal_status: ["active", "reversed", "deleted", "void"],
        report_basis: ["accrual", "cash", "both"],
        journal_source: [
            "manual_journal",
            "interfaced_journal",
            "uploaded",
            "auto",
        ],
        journal_posting_status: ["POSTED", "DRAFT", "SCHEDULED", "VOID"],
    },
    general_ledger: {
        ledger_status: ["active", "reversed", "deleted", "void"],
    },
    journal_comment: {},
    number_tracker: {
        reason: [
            "GeneralJournalHeader",
            "GeneralJournalDetail",
            "CashReceiptsJournal",
            "CashPaymentsJournal",
            "SalesJournal",
            "SalesReturnsJournal",
            "PurchasesJournal",
            "PurchasesReturnsJournal",
            "GeneralJournal",
            "SalesInvoice",
        ],
    },
    recurring_general_journal: {
        recurring_general_journal_status: ["active", "stopped", "expired"],
    },
    transaction_lock: {},
    opening_balance: {
        month: [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "august",
            "september",
            "october",
            "november",
            "december",
            "other",
        ],
    },
};
const allOptionalInputfilters = {
    chart_of_account: {
        account_number: "string",
        is_active: "boolean",
        description: "string",
        attachment_path: "number",
        is_sub_account: "boolean",
        is_default: "boolean",
        is_employee_account: "boolean",
        has_opening_balance: "boolean",
        is_bank_account: "boolean",
        parent_account_id: "number",
        head_account_id: "number",
        currency_id: "number",
    },
    account_type_financial_statement_section: {},
    bank_reconcilation: {
        from_date: "string",
        to_date: "string",
    },
    reconcilation_transaction: {},
    asset: {
        acquisition_date: "string",
        asset_status: "number", //["received?","work_order_created?"],
        estimated_total_production: "number",
        estimated_total_production_unit_id: "number",
        recurring_journal_occurrence_id: "number",
    },
    estimated_total_production_unit: {},
    recurring_journal_occurrence: {
        repeat_every_number: "number",
    },
    budget: {
        name: "string",
        project_name: "string",
        cost_center_id: "number",
    },
    budget_account: {
        budget_id: "number",
        chart_of_account_id: "number",
    },
    budget_account_period: {
        budget_account_id: "number",
    },
    budget_control_action: {},
    general_journal_detail: {
        description: "string",
        tax_group_id: "number",
        amount_credit: "number",
        amount_debit: "number",
        tax_id: "number",
        contact_id: "number",
    },
    general_journal_header: {
        reference_number: "string",
        journal_status: "number", //["active", "reversed", "deleted","void"],//optional
        report_basis: "number", //["accrual","cash","both"],//optional
        journal_source: "number", //["manual_journal","interfaced_journal","uploaded","auto"],//optional
        journal_posting_status: "number", // ["POSTED", "DRAFT", "SCHEDULED", "VOID"], //optional
        journal_type_reference: "string",
        total_amount: "number",
        journal_type_id: "number",
        recurring_general_journal_id: "number",
    },
    general_ledger: {
        amount_credit: "number",
        amount_debit: "number",
        description: "string",
        tax_id: "number",
        tax_group_id: "number",
        general_journal_header_id: "number",
    },
    journal_comment: {
        contact_id: "number",
        general_journal_header_id: "number",
        recurring_general_journal_id: "number",
    },
    number_tracker: {
        prefix: "string",
        reason: "number", //["GeneralJournalHeader","GeneralJournalDetail","CashReceiptsJournal","CashPaymentsJournal","SalesJournal","SalesReturnsJournal","PurchasesJournal","PurchasesReturnsJournal","GeneralJournal","SalesInvoice"],//optional
    },
    recurring_general_journal: {
        start_on: "string",
        end_on: "string",
        never_expires: "boolean",
        depreciable_value: "number",
        recurring_general_journal_status: "number", //["active","stopped","expired"],//optional
        asset_id: "number",
        recurring_journal_occurrence_id: "number",
    },
    transaction_lock: {
        enable_transaction_locking: "boolean",
    },
    opening_balance: {
        price_precision: "number",
        amount: "number",
    },
};
const dateValues = {
    chart_of_account: [],
    account_type_financial_statement_section: [],
    bank_reconcilation: ["from_date", "to_date"],
    reconcilation_transaction: [],
    asset: ["useful_life", "acquisition_date"],
    estimated_total_production_unit: [],
    recurring_journal_occurrence: [],
    budget: ["fiscal_year"],
    budget_account: [],
    budget_account_period: [],
    budget_control_action: [],
    general_journal_detail: [],
    general_journal_header: ["journal_date"],
    general_ledger: ["journal_date"],
    journal_comment: [],
    number_tracker: [],
    recurring_general_journal: ["start_on", "end_on"],
    transaction_lock: ["lock_date"],
    opening_balance: ["opening_balance_date"],
};
const phoneValues = {
    chart_of_account: [],
    account_type_financial_statement_section: [],
    bank_reconcilation: [],
    reconcilation_transaction: [],
    asset: [],
    estimated_total_production_unit: [],
    recurring_journal_occurrence: [],
    budget: [],
    budget_account: [],
    budget_account_period: [],
    budget_control_action: [],
    general_journal_detail: [],
    general_journal_header: [],
    general_ledger: [],
    journal_comment: [],
    number_tracker: [],
    recurring_general_journal: [],
    transaction_lock: [],
    opening_balance: [],
};
const emailValues = phoneValues;
const allProjections = {
    chart_of_account: {
        id: true,
        account_name: true,
        account_code: true,
        account_number: true,
        is_active: true,
        description: true,
        add_to_dashboard_watch_list: true,
        attachment_path: true,
        is_sub_account: true,
        is_default: true,
        is_employee_account: true,
        has_opening_balance: true,
        is_bank_account: true,
        parent_account: true,
        head_account: true,
        currency: true,
        account_type: true,
        ...auditLogProjection,
    },
    account_type_financial_statement_section: {
        id: true,
        account_type: true,
        financial_statement_section: true,
        ...auditLogProjection,
    },
    bank_reconcilation: {
        id: true,
        from_date: true,
        to_date: true,
        closing_amount: true,
        chart_of_account: true,
        ...auditLogProjection,
    },
    reconcilation_transaction: {
        id: true,
        bank_reconcilation: true,
        general_ledger: true,
        ...auditLogProjection,
    },
    asset: {
        id: true,
        name: true,
        tag_number: true,
        acquisition_date: true,
        description: true,
        economic_value: true,
        depreciation_methods: true,
        useful_life: true,
        current_value: true,
        asset_type: true,
        asset_status: true,
        estimated_total_production: true,
        scrap_value: true,
        currency: true,
        estimated_total_production_unit: true,
        asset_account: true,
        depreciation_account: true,
        recurring_journal_occurrence: true,
        ...auditLogProjection,
    },
    estimated_total_production_unit: {
        id: true,
        unit_name: true,
        unit_symbol: true,
        ...auditLogProjection,
    },
    recurring_journal_occurrence: {
        id: true,
        repeat_every_number: true,
        repeat_every_label: true,
        name: true,
        ...auditLogProjection,
    },
    budget: {
        id: true,
        name: true,
        fiscal_year: true,
        budget_reason: true,
        project_name: true,
        cost_center: true,
        ...auditLogProjection,
    },
    budget_account: {
        id: true,
        budget_total_amount: true,
        budget: true,
        chart_of_account: true,
        ...auditLogProjection,
    },
    budget_account_period: {
        id: true,
        budget_amount: true,
        period_month: true,
        budget_account: true,
        ...auditLogProjection,
    },
    budget_control_action: {
        id: true,
        type: true,
        action_accumulated_monthly_budget_exceeded: true,
        ...auditLogProjection,
    },
    general_journal_detail: {
        id: true,
        description: true,
        debit_or_credit: true,
        tax_group_id: true,
        amount_credit: true,
        posting_reference: true,
        reference_code: true,
        amount_debit: true,
        tax_id: true,
        contact_id: true,
        general_journal_header: true,
        cost_center: true,
        chart_of_account: true,
        ...auditLogProjection,
    },
    general_journal_header: {
        id: true,
        journal_date: true,
        posting_reference: true,
        reference_number: true,
        journal_status: true,
        notes: true,
        report_basis: true,
        journal_source: true,
        journal_posting_status: true,
        journal_type_reference: true,
        total_amount: true,
        journal_type: true,
        recurring_general_journal: true,
        currency: true,
        posting_responsible_user: true,
        ...auditLogProjection,
    },
    general_ledger: {
        id: true,
        amount_credit: true,
        amount_debit: true,
        ledger_status: true,
        posting_reference: true,
        group_posting_reference: true,
        description: true,
        journal_date: true,
        posting_date: true,
        currency: true,
        tax: true,
        tax_group: true,
        general_journal_header: true,
        chart_of_account: true,
        ...auditLogProjection,
    },
    journal_comment: {
        id: true,
        commented_date: true,
        comment: true,
        application_user: true,
        contact: true,
        general_journal_header: true,
        recurring_general_journal: true,
        ...auditLogProjection,
    },
    number_tracker: {
        Id: true,
        prefix: true,
        starting_number: true,
        next_number: true,
        reason: true,
        ...auditLogProjection,
    },
    recurring_general_journal: {
        id: true,
        profile_name: true,
        start_on: true,
        end_on: true,
        never_expires: true,
        depreciable_value: true,
        recurring_general_journal_status: true,
        asset: true,
        recurring_journal_occurrence: true,
        ...auditLogProjection,
    },
    transaction_lock: {
        id: true,
        lock_date: true,
        reason: true,
        enable_transaction_locking: true,
        ...auditLogProjection,
    },
    opening_balance: {
        id: true,
        opening_balance_date: true,
        price_precision: true,
        amount: true,
        month: true,
        ...auditLogProjection,
    },
};
const allFilters = {
    chart_of_account: {
        id: "number",
        account_name: "number",
        account_code: "number",
        account_number: "number",
        is_active: "boolean",
        description: "number",
        add_to_dashboard_watch_list: "boolean",
        attachment_path: "number",
        is_sub_account: "boolean",
        is_default: "boolean",
        is_employee_account: "boolean",
        has_opening_balance: "boolean",
        is_bank_account: "boolean",
        parent_account_id: "number",
        head_account_id: "number",
        currency_id: "number",
        account_type_id: "number",
    },
    account_type_financial_statement_section: {
        id: "number",
        account_type_id: "number",
        financial_statement_section_id: "number",
        //needs account_type
    },
    bank_reconcilation: {
        id: "number",
        closing_amount: "number",
        chart_of_account_id: "number",
    },
    reconcilation_transaction: {
        id: "number",
        bank_reconcilation_id: "number",
        general_ledger_id: "number",
    },
    asset: {
        id: "number",
        name: "string",
        tag_number: "string",
        description: "string",
        economic_value: "number",
        depreciation_methods: "number",
        asset_type: "number",
        asset_status: "number",
        estimated_total_production: "number",
        scrap_value: "number",
        currency_id: "number",
        estimated_total_production_unit_id: "number",
        asset_account_id: "number",
        depreciation_account_id: "number",
        recurring_journal_occurrence_id: "number",
    },
    estimated_total_production_unit: {
        id: "number",
        unit_name: "string",
        unit_symbol: "string",
    },
    recurring_journal_occurrence: {
        id: "number",
        repeat_every_number: "number",
        repeat_every_label: "number",
        name: "string",
    },
    budget: {
        id: "number",
        name: "string",
        budget_reason: "number",
        project_name: "string",
        cost_center_id: "number",
    },
    budget_account: {
        id: "number",
        budget_total_amount: "number",
        budget_id: "number",
        chart_of_account_id: "number",
    },
    budget_account_period: {
        id: "number",
        budget_amount: "number",
        period_month: "number",
        budget_account_id: "number",
    },
    budget_control_action: {
        id: "number",
        type: "number",
        action_accumulated_monthly_budget_exceeded: "number",
    },
    general_journal_detail: {
        id: "number",
        description: "string",
        debit_or_credit: "number",
        tax_group_id: "number",
        amount_credit: "number",
        posting_reference: "string",
        reference_code: "string",
        amount_debit: "number",
        tax_id: "number",
        contact_id: "number",
        general_journal_header_id: "number",
        cost_center_id: "number",
        chart_of_account_id: "number",
    },
    general_journal_header: {
        id: "number",
        posting_reference: "string",
        reference_number: "string",
        journal_status: "number",
        notes: "string",
        report_basis: "number",
        journal_source: "number",
        journal_posting_status: "number",
        journal_type_reference: "string",
        total_amount: "number",
        journal_type_id: "number",
        recurring_general_journal_id: "number",
        currency_id: "number",
        posting_responsible_user_id: "number",
    },
    general_ledger: {
        id: "number",
        amount_credit: "number",
        amount_debit: "number",
        ledger_status: "number",
        posting_reference: "string",
        group_posting_reference: "string",
        description: "string",
        currency_id: "number",
        tax_id: "number",
        tax_group_id: "number",
        general_journal_header_id: "number",
        chart_of_account_id: "number",
    },
    journal_comment: {
        id: "number",
        comment: "string",
        application_user_id: "number",
        contact_id: "number",
        general_journal_header_id: "number",
        recurring_general_journal_id: "number",
    },
    number_tracker: {
        Id: "number",
        prefix: "string",
        starting_number: "number",
        next_number: "number",
        reason: "number",
    },
    recurring_general_journal: {
        id: "number",
        profile_name: "string",
        never_expires: "boolean",
        depreciable_value: "number",
        recurring_general_journal_status: "number",
        asset_id: "number",
        recurring_journal_occurrence_id: "number",
    },
    transaction_lock: {
        id: "number",
        reason: "string",
    },
    opening_balance: {
        id: "number",
        price_precision: "number",
        amount: "number",
        month: "number",
    },
};
const allSorts = {
    chart_of_account: {
        id: "number",
        account_name: "number",
        account_code: "number",
        account_number: "number",
        is_active: "number",
        description: "number",
        add_to_dashboard_watch_list: "number",
        attachment_path: "number",
        is_sub_account: "number",
        is_default: "number",
        is_employee_account: "number",
        has_opening_balance: "number",
        is_bank_account: "number",
        parent_account_id: "number",
        head_account_id: "number",
        currency_id: "number",
        account_type_id: "number",
        ...auditLogSort,
    },
    account_type_financial_statement_section: {
        id: "number",
        account_type_id: "number",
        financial_statement_section_id: "number",
        ...auditLogSort,
    },
    bank_reconcilation: {
        id: "number",
        from_date: "number",
        to_date: "number",
        closing_amount: "number",
        chart_of_account_id: "number",
        ...auditLogSort,
    },
    reconcilation_transaction: {
        id: "number",
        bank_reconcilation_id: "number",
        general_ledger_id: "number",
        ...auditLogSort,
    },
    asset: {
        id: "number",
        name: "number",
        tag_number: "number",
        acquisition_date: "number",
        description: "number",
        economic_value: "number",
        depreciation_methods: "number",
        useful_life: "number",
        current_value: "number",
        asset_type: "number",
        asset_status: "number",
        estimated_total_production: "number",
        scrap_value: "number",
        currency_id: "number",
        estimated_total_production_unit_id: "number",
        asset_account_id: "number",
        depreciation_account_id: "number",
        recurring_journal_occurrence_id: "number",
        ...auditLogSort,
    },
    estimated_total_production_unit: {
        id: "number",
        unit_name: "number",
        unit_symbol: "number",
        ...auditLogSort,
    },
    recurring_journal_occurrence: {
        id: "number",
        repeat_every_number: "number",
        repeat_every_label: "number",
        name: "number",
        ...auditLogSort,
    },
    budget: {
        id: "number",
        name: "number",
        fiscal_year: "number",
        budget_reason: "number",
        project_name: "number",
        cost_center_id: "number",
        ...auditLogSort,
    },
    budget_account: {
        id: "number",
        budget_total_amount: "number",
        budget_id: "number",
        chart_of_account_id: "number",
        ...auditLogSort,
    },
    budget_account_period: {
        id: "number",
        budget_amount: "number",
        period_month: "number",
        budget_account_id: "number",
        ...auditLogSort,
    },
    budget_control_action: {
        id: "number",
        type: "number",
        action_accumulated_monthly_budget_exceeded: "number",
        ...auditLogSort,
    },
    general_journal_detail: {
        id: "number",
        description: "number",
        debit_or_credit: "number",
        tax_group_id: "number",
        amount_credit: "number",
        posting_reference: "number",
        reference_code: "number",
        amount_debit: "number",
        tax_id: "number",
        contact_id: "number",
        general_journal_header_id: "number",
        cost_center_id: "number",
        chart_of_account_id: "number",
        ...auditLogSort,
    },
    general_journal_header: {
        id: "number",
        journal_date: "number",
        posting_reference: "number",
        reference_number: "number",
        journal_status: "number",
        notes: "number",
        report_basis: "number",
        journal_source: "number",
        journal_posting_status: "number",
        journal_type_reference: "number",
        total_amount: "number",
        journal_type_id: "number",
        recurring_general_journal_id: "number",
        currency_id: "number",
        posting_responsible_user_id: "number",
        ...auditLogSort,
    },
    general_ledger: {
        id: "number",
        amount_credit: "number",
        amount_debit: "number",
        ledger_status: "number",
        posting_reference: "number",
        group_posting_reference: "number",
        description: "number",
        journal_date: "number",
        posting_date: "number",
        currency_id: "number",
        tax_id: "number",
        tax_group_id: "number",
        general_journal_header_id: "number",
        chart_of_account_id: "number",
        ...auditLogSort,
    },
    journal_comment: {
        id: "number",
        commented_date: "number",
        comment: "number",
        application_user_id: "number",
        contact_id: "number",
        general_journal_header_id: "number",
        recurring_general_journal_id: "number",
        ...auditLogSort,
    },
    number_tracker: {
        Id: "number",
        prefix: "number",
        starting_number: "number",
        next_number: "number",
        reason: "number",
        ...auditLogSort,
    },
    recurring_general_journal: {
        id: "number",
        profile_name: "number",
        start_on: "number",
        end_on: "number",
        never_expires: "number",
        depreciable_value: "number",
        recurring_general_journal_status: "number",
        asset_id: "number",
        recurring_journal_occurrence_id: "number",
        ...auditLogSort,
    },
    transaction_lock: {
        id: "number",
        lock_date: "number",
        reason: "number",
        enable_transaction_locking: "number",
        ...auditLogSort,
    },
    opening_balance: {
        id: "number",
        opening_balance_date: "number",
        price_precision: "number",
        amount: "number",
        month: "number",
        ...auditLogSort,
    },
};
const allRoutes = [
    "/chart_of_account",
    "/account_type_financial_statement_section",
    "/bank_reconcilation",
    // "/chart_of_account_files",
    "/estimated_total_production_unit",
    "/recurring_journal_occurrence",
    "/budget",
    "/budget_account",
    "/budget_account_period",
    "/budget_control_action",
    "/general_journal_header",
    "/general_ledger",
    "/journal_comment",
    "/number_tracker",
    "/transaction_lock",
    "/opening_balance",
    "/reconcilation_transaction",
    "/asset",
    "/general_journal_detail",
    // "/general_journal_files",
    "/recurring_general_journal",
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
            2
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
        if (typeof filter[i] != "string")
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
