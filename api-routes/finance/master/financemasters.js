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
} = require("../../../services/financemasters");

const defaultDateValues = ["startDate", "endDate"];
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
    account_category: {
        code: "string",
    },
    account_type: {
        code: "string",
        type: "string",
        account_category_id: "number",
        //needs account_category
    },
    closing_note: {
        closing_type: "number", //["both", "month_end", "year_end"],
        title: "string",
        consideration: "number", // ["closing_note", "closing_effect"],
    },
    financial_statement_section: {
        name: "string",
        sequence_on_report: "number",
        financial_statement_type: "number", // ["income_statement","balance_sheet","cash_flow_statement","owners_equity",],
    },
    bank: {
        account_type: "number", //["bank", "credit_card"],
        account_name: "string",
        currency_id: "number",
        //needs currency
    },
    contact: {
        contact_type: "number", //["customer", "vendor"],
        company_name: "string",
        contact_display_name: "string",
    },
    contact_address: {
        address_type: "number", //["billing_address", "shipping_address"],
    },
    contact_person: {
        first_name: "string",
    },
    cost_center: {
        cost_center_code: "string",
    },
    cost_center_accounts: {
        chart_of_account_id: "number",
        cost_center_id: "number",
    },
    payment_term: {},
    exchange_rate: {
        rate: "number",
        date: "string",
        currency_id: "number",
    },
    company_address: {
        address1: "string",
        organization_profile_id: "number",
    },
    date_format_type: {
        id: "number",
        date_format: "string",
        date_format_type_category: "number", // ["short", "medium", "long"],
    },
    financial_settings: {
        id: "number",
        report_basis: "number", //["accrual","cash","both"],
        fiscal_year: "number", //["january_december","february_january","march_february","april_march","may_april","june_may","july_june","august_july","september_august","october_september","november_october","december_november"],
        closing_type: "number", //["both","month_end","year_end"],
        base_currency_id: "number",
    },
    industry: {
        name: "string",
    },
    journal_users: {},
    primary_contact: {
        name: "string",
        email: "string",
    },
    foot_note: {
        title: "string",
    },
    associated_tax_group: {
        tax_id: "number",
        tax_group_id: "number",
    },
    tax: {
        tax_name: "string",
        tax_percentage: "number",
        tax_authority_id: "number",
    },
    tax_authority: {
        name: "string",
    },
    tax_exemption: {
        code: "string",
        tax_exemption_type: "number", // ["customer", "item"],
    },
    tax_group: {
        tax_group_name: "string",
        tax_group_percentage: "number",
    },
    tax_rule: {
        operator: "number", //["greater_than","less_than","equals_to","greater_than_or_equals_to","less_than_equals_to"],
        amount: "number",
        tax_id: "number",
        //needs tax
    },
    accounting_period: {
        months: "number", //["january","february","march","april","may","june","july","augest","september","october","november","december","other"],
        period_number: "number",
        accounting_period_status: "number", //["open","closed","future","access_locked"],
        is_current_posting_period: "boolean",
        is_year_end_closing: "boolean",
        period_starting_date: "string",
        period_ending_date: "string",
    },
    journal_type: {
        type: "string",
    },
};
const enums = {
    account_category: {},
    account_type: {},
    closing_note: {
        closing_type: ["both", "month_end", "year_end"],
        consideration: ["closing_note", "closing_effect"],
    },
    financial_statement_section: {
        financial_statement_type: [
            "income_statement",
            "balance_sheet",
            "cash_flow_statement",
            "owners_equity",
        ],
    },
    bank: {
        account_type: ["bank", "credit_card"],
    },
    contact: {
        contact_type: ["customer", "vendor"],
    },
    contact_address: {
        address_type: ["billing_address", "shipping_address"],
    },
    contact_person: {},
    cost_center: {},
    cost_center_accounts: {},
    payment_term: {},
    exchange_rate: {},
    company_address: {},
    date_format_type: {
        date_format_type_category: ["short", "medium", "long"],
    },
    financial_settings: {
        report_basis: ["accrual", "cash", "both"],
        fiscal_year: [
            "january_december",
            "february_january",
            "march_february",
            "april_march",
            "may_april",
            "june_may",
            "july_june",
            "august_july",
            "september_august",
            "october_september",
            "november_october",
            "december_november",
        ],
        closing_type: ["both", "month_end", "year_end"],
        company_id: [
            "ACN",
            "BN",
            "CN",
            "CPR",
            "CVR",
            "DIW",
            "KT",
            "ORG",
            "SEC",
            "company_id",
        ],
        tax_id: ["ABN", "BN", "CST", "ORG", "TAX", "VST", "tax_id"],
    },
    industry: {},
    journal_users: {
        access_name: ["manual_journal", "recurring_journal"],
    },
    primary_contact: {},
    foot_note: {
        financial_statement_type: [
            "income_statement",
            "balance_sheet",
            "cash_flow_statement",
            "owners_equity",
        ],
    },
    associated_tax_group: {},
    tax: {
        tax_type: ["tax", "compound_tax"],
    },
    tax_authority: {},
    tax_exemption: {
        tax_exemption_type: ["customer", "item"],
    },
    tax_group: {},
    tax_rule: {
        operator: [
            "greater_than",
            "less_than",
            "equals_to",
            "greater_than_or_equals_to",
            "less_than_equals_to",
        ],
        sales_type: ["product", "service"],
    },
    accounting_period: {
        months: [
            "january",
            "february",
            "march",
            "april",
            "may",
            "june",
            "july",
            "augest",
            "september",
            "october",
            "november",
            "december",
            "other",
        ],
        accounting_period_status: ["open", "closed", "future", "access_locked"],
    },
    journal_type: {},
};
const allOptionalInputfilters = {
    account_category: {
        description: "string",
        is_debit: "string",
    },
    account_type: {
        description: "string",
        can_be_sub_account: "boolean",
        contain_account_number: "boolean",
        contain_currency: "boolean",
        tool_tip_description: "string",
        can_have_more_than_one_chart_of_account: "boolean",
    },
    closing_note: {
        note: "string",
    },
    financial_statement_section: {
        description: "string",
    },
    bank: {
        account_number: "string",
        account_code: "string",
        IBAN: "string",
        bank_name: "string",
        description: "string",
        is_primary: "boolean",
    },
    contact: {
        remark: "string",
        chart_of_account_id: "number",
        currency_id: "number",
        payment_term_id: "number",
    },
    contact_address: {
        attention: "string",
        street1: "string",
        street2: "string",
        city: "string",
        state: "string",
        phone: "string",
        fax: "string",
        zip_code: "string",
        contact_id: "number",
        country_id: "number",
    },
    contact_person: {
        last_name: "string",
        work_phone: "string",
        mobile: "string",
        email: "string",
        designation: "string",
        department: "string",
        is_primary_contact: "boolean",
        contact_id: "number",
        title_id: "number",
    },
    cost_center: {
        section_name: "string",
        remark: "string",
    },
    cost_center_accounts: {
        remark: "string",
    },
    payment_term: {
        show_it_as: "string",
        number_of_days: "number",
    },
    exchange_rate: {},
    company_address: {
        address2: "string",
        city: "string",
        state_or_province: "string",
        zip_or_portal_code: "string",
        phone: "string",
        fax: "string",
        website: "string",
    },
    date_format_type: {},
    financial_settings: {
        timezone: "string",
        company_id: "number", //["ACN","BN","CN","CPR","CVR","DIW","KT","ORG","SEC","company_id"],
        tax_id: "number", //["ABN","BN","CST","ORG","TAX","VST","tax_id"],
        tax_id_number: "string",
        auto_generate_journal_preference: "boolean",
        is_acc_code_mandatory: "boolean",
        enter_unique_acc_code: "boolean",
        is_profile_tax_applied: "boolean",
        is_legal_reserve_applied: "boolean",
        profit_tax: "number",
        legal_reserve: "number",
        company_id_number: "string",
        time_format_id: "number",
        language_id: "number",
    },
    industry: {
        description: "string",
    },
    journal_users: {
        access_name: "number", //["manual_journal", "recurring_journal"],
        user_id: "number",
    },
    primary_contact: {
        organization_profile_id: "number",
    },
    foot_note: {
        description: "string",
        financial_statement_type: "number", //["income_statement","balance_sheet","cash_flow_statement","owners_equity"],
    },
    associated_tax_group: {},
    tax: {
        is_value_added: "boolean",
        is_editable: "boolean",
        is_default_tax: "boolean",
        tax_type: "number", //["tax","compound_tax"],
        chart_of_account_debit_id: "number",
        chart_of_account_credit_id: "number",
    },
    tax_authority: {
        description: "string",
    },
    tax_exemption: {
        tax_exemption_reason: "string",
        description: "string",
    },
    tax_group: {},
    tax_rule: {
        remark: "string",
        sales_type: "number", //["product", "service"],
    },
    accounting_period: {},
    journal_type: {
        description: "string",
    },
};
const dateValues = {
    account_category: [...defaultDateValues],
    account_type: [...defaultDateValues],
    closing_note: [...defaultDateValues],
    financial_statement_section: [...defaultDateValues],
    bank: [...defaultDateValues],
    contact: [...defaultDateValues],
    contact_address: [...defaultDateValues],
    contact_person: [...defaultDateValues],
    cost_center: [...defaultDateValues],
    cost_center_accounts: [...defaultDateValues],
    payment_term: [...defaultDateValues],
    exchange_rate: [...defaultDateValues, "date"],
    company_address: [...defaultDateValues],
    date_format_type: [...defaultDateValues],
    financial_settings: [...defaultDateValues],
    industry: [...defaultDateValues],
    journal_users: [...defaultDateValues],
    primary_contact: [...defaultDateValues],
    foot_note: [...defaultDateValues],
    associated_tax_group: [...defaultDateValues],
    tax: [...defaultDateValues],
    tax_authority: [...defaultDateValues],
    tax_exemption: [...defaultDateValues],
    tax_group: [...defaultDateValues],
    tax_rule: [...defaultDateValues],
    accounting_period: [
        ...defaultDateValues,
        "period_starting_date",
        "period_ending_date",
    ],
    journal_type: [...defaultDateValues],
};
const phoneValues = {
    account_category: [],
    account_type: [],
    closing_note: [],
    financial_statement_section: [],
    bank: [],
    contact: [],
    contact_address: [],
    contact_person: ["work_phone", "mobile"],
    cost_center: [],
    cost_center_accounts: [],
    payment_term: [],
    exchange_rate: [],
    company_address: ["phone"],
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
const emailValues = {
    account_category: [],
    account_type: [],
    closing_note: [],
    financial_statement_section: [],
    bank: [],
    contact: [],
    contact_address: [],
    contact_person: ["email"],
    cost_center: [],
    cost_center_accounts: [],
    payment_term: [],
    exchange_rate: [],
    company_address: [],
    date_format_type: [],
    financial_settings: [],
    industry: [],
    journal_users: [],
    primary_contact: ["email"],
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
const allProjections = {
    account_category: {
        id: true,
        code: true,
        description: true,
        is_debit: true,
        ...auditLogProjection,
    },
    account_type: {
        id: true,
        code: true,
        type: true,
        description: true,
        can_be_sub_account: true,
        contain_account_number: true,
        contain_currency: true,
        tool_tip_description: true,
        can_have_more_than_one_chart_of_account: true,
        account_category: true,
        ...auditLogProjection,
    },
    closing_note: {
        id: true,
        closing_type: true,
        title: true,
        note: true,
        consideration: true,
        ...auditLogProjection,
    },
    financial_statement_section: {
        id: true,
        name: true,
        description: true,
        sequence_on_report: true,
        financial_statement_type: true,
        ...auditLogProjection,
    },
    bank: {
        id: true,
        account_type: true,
        account_name: true,
        account_number: true,
        account_code: true,
        IBAN: true,
        bank_name: true,
        description: true,
        is_primary: true,
        currency: true,
        ...auditLogProjection,
    },
    contact: {
        id: true,
        contact_type: true,
        company_name: true,
        contact_display_name: true,
        remark: true,
        chart_of_account_id: true,
        currency: true,
        payment_term: true,
        ...auditLogProjection,
    },
    contact_address: {
        id: true,
        address_type: true,
        attention: true,
        street1: true,
        street2: true,
        city: true,
        state: true,
        phone: true,
        fax: true,
        zip_code: true,
        contact: true,
        country: true,
        ...auditLogProjection,
    },
    contact_person: {
        id: true,
        first_name: true,
        last_name: true,
        work_phone: true,
        mobile: true,
        email: true,
        designation: true,
        department: true,
        is_primary_contact: true,
        contact: true,
        title: true,
        ...auditLogProjection,
    },
    cost_center: {
        id: true,
        cost_center_code: true,
        section_name: true,
        remark: true,
        ...auditLogProjection,
    },
    cost_center_accounts: {
        id: true,
        remark: true,
        chart_of_account: true,
        cost_center: true,
        ...auditLogProjection,
    },
    payment_term: {
        id: true,
        show_it_as: true,
        number_of_days: true,
        ...auditLogProjection,
    },
    exchange_rate: {
        id: true,
        rate: true,
        date: true,
        currency: true,
        ...auditLogProjection,
    },
    company_address: {
        id: true,
        address1: true,
        address2: true,
        city: true,
        state_or_province: true,
        zip_or_portal_code: true,
        phone: true,
        fax: true,
        website: true,
        organization_profile: true,
        ...auditLogProjection,
    },
    date_format_type: {
        id: true,
        date_format: true,
        date_format_type_category: true,
        ...auditLogProjection,
    },
    financial_settings: {
        id: true,
        report_basis: true,
        fiscal_year: true,
        closing_type: true,
        timezone: true,
        company_id: true,
        tax_id: true,
        tax_id_number: true,
        auto_generate_journal_preference: true,
        is_acc_code_mandatory: true,
        enter_unique_acc_code: true,
        is_profile_tax_applied: true,
        is_legal_reserve_applied: true,
        profit_tax: true,
        legal_reserve: true,
        company_id_number: true,
        time_format: true,
        language: true,
        base_currency: true,
        ...auditLogProjection,
    },
    industry: {
        id: true,
        name: true,
        description: true,
        ...auditLogProjection,
    },
    journal_users: {
        id: true,
        access_name: true,
        user: true,
        ...auditLogProjection,
    },
    primary_contact: {
        id: true,
        name: true,
        email: true,
        organization_profile: true,
        ...auditLogProjection,
    },
    foot_note: {
        id: true,
        title: true,
        description: true,
        financial_statement_type: true,
        ...auditLogProjection,
    },
    associated_tax_group: {
        id: true,
        tax: true,
        tax: true,
        ...auditLogProjection,
    },
    tax: {
        id: true,
        tax_name: true,
        tax_percentage: true,
        is_value_added: true,
        is_editable: true,
        is_default_tax: true,
        tax_type: true,
        chart_of_account_debit: true,
        chart_of_account_credit: true,
        tax_authority: true,
        ...auditLogProjection,
    },
    tax_authority: {
        id: true,
        name: true,
        description: true,
        ...auditLogProjection,
    },
    tax_exemption: {
        id: true,
        tax_exemption_reason: true,
        code: true,
        description: true,
        tax_exemption_type: true,
        ...auditLogProjection,
    },
    tax_group: {
        id: true,
        tax_group_name: true,
        tax_group_percentage: true,
        ...auditLogProjection,
    },
    tax_rule: {
        id: true,
        operator: true,
        amount: true,
        remark: true,
        sales_type: true,
        tax: true,
        ...auditLogProjection,
    },
    accounting_period: {
        id: true,
        months: true,
        period_number: true,
        accounting_period_status: true,
        is_current_posting_period: true,
        is_year_end_closing: true,
        period_starting_date: true,
        period_ending_date: true,
        ...auditLogProjection,
    },
    journal_type: {
        id: true,
        type: true,
        description: true,
        ...auditLogProjection,
    },
};
const allFilters = {
    account_category: {
        code: "string",
        description: "string",
        is_debit: "string",
    },
    account_type: {
        code: "string",
        type: "string",
        description: "string",
        account_category_id: "number",
    },
    closing_note: {
        title: "string",
        note: "string",
    },
    financial_statement_section: {
        name: "string",
        description: "string",
    },
    bank: {
        account_name: "string",
        account_number: "string",
        account_code: "string",
        IBAN: "string",
        bank_name: "string",
        description: "string",
        currency_id: "Number",
    },
    contact: {
        company_name: "string",
        contact_display_name: "string",
        remark: "string",
        chart_of_account_id: "number",
        currency_id: "number",
        payment_term_id: "number",
    },
    contact_address: {
        attention: "string",
        street1: "string",
        street2: "string",
        city: "string",
        state: "string",
        phone: "string",
        fax: "string",
        zip_code: "string",
        contact_id: "number",
        country_id: "number",
    },
    contact_person: {
        first_name: "string",
        last_name: "string",
        work_phone: "string",
        mobile: "string",
        email: "string",
        designation: "string",
        department: "string",
        contact_id: "number",
        title_id: "number",
    },
    cost_center: {
        cost_center_code: "string",
        section_name: "string",
        remark: "string",
    },
    cost_center_accounts: {
        remark: "string",
        chart_of_account_id: "number",
        cost_center_id: "number",
    },
    payment_term: {
        show_it_as: "string",
    },
    exchange_rate: {
        currency_id: "number",
    },
    company_address: {
        address1: "string", //only this required(from address data)
        address2: "string",
        city: "string",
        state_or_province: "string",
        zip_or_portal_code: "string",
        phone: "string",
        fax: "string",
        website: "string",
        organization_profile_id: "number",
    },
    date_format_type: {
        date_format: "string",
    },
    financial_settings: {
        timezone: "string",
        tax_id_number: "string",
        company_id_number: "string",
        base_currency_id: "number",
        time_format_id: "number",
        language_id: "number",
    },
    industry: {
        name: "string",
        description: "string",
    },
    journal_users: {
        user_id: "number",
    },
    primary_contact: {
        name: "string",
        email: "string",
        organization_profile_id: "number",
    },
    foot_note: {
        title: "string",
        description: "string",
    },
    associated_tax_group: {
        tax_id: "number",
        tax_group_id: "number",
    },
    tax: {
        tax_authority_id: "number",
        tax_name: "string",
        chart_of_account_debit_id: "number",
        chart_of_account_credit_id: "number",
    },
    tax_authority: {
        name: "string",
        description: "string",
    },
    tax_exemption: {
        tax_exemption_reason: "string",
        code: "string",
        description: "string",
    },
    tax_group: {
        tax_group_name: "string",
    },
    tax_rule: {
        remark: "string",
        tax_id: "number",
    },
    accounting_period: {},
    journal_type: {
        type: "string",
        description: "string",
    },
};
const allSorts = {
    account_category: {
        id: "number",
        code: "number",
        description: "number",
        is_debit: "number",
        ...auditLogSort,
    },
    account_type: {
        id: "number",
        code: "number",
        type: "number",
        description: "number",
        can_be_sub_account: "number",
        contain_account_number: "number",
        contain_currency: "number",
        tool_tip_description: "number",
        can_have_more_than_one_chart_of_account: "number",
        account_category_id: "number",
        ...auditLogSort,
    },
    closing_note: {
        id: "number",
        closing_type: "number",
        title: "number",
        note: "number",
        consideration: "number",
        ...auditLogSort,
    },
    financial_statement_section: {
        id: "number",
        name: "number",
        description: "number",
        sequence_on_report: "number",
        financial_statement_type: "number",
        ...auditLogSort,
    },
    bank: {
        id: "number",
        account_type: "number",
        account_name: "number",
        account_number: "number",
        account_code: "number",
        IBAN: "number",
        bank_name: "number",
        description: "number",
        is_primary: "number",
        currency_id: "number",
        ...auditLogSort,
    },
    contact: {
        id: "number",
        contact_type: "number",
        company_name: "number",
        contact_display_name: "number",
        remark: "number",
        chart_of_account_id: "number",
        currency_id: "number",
        payment_term_id: "number",
        ...auditLogSort,
    },
    contact_address: {
        id: "number",
        address_type: "number",
        attention: "number",
        street1: "number",
        street2: "number",
        city: "number",
        state: "number",
        phone: "number",
        fax: "number",
        zip_code: "number",
        contact_id: "number",
        country_id: "number",
        ...auditLogSort,
    },
    contact_person: {
        id: "number",
        first_name: "number",
        last_name: "number",
        work_phone: "number",
        mobile: "number",
        email: "number",
        designation: "number",
        department: "number",
        is_primary_contact: "number",
        contact_id: "number",
        title_id: "number",
        ...auditLogSort,
    },
    cost_center: {
        id: "number",
        cost_center_code: "number",
        section_name: "number",
        remark: "number",
        ...auditLogSort,
    },
    cost_center_accounts: {
        id: "number",
        remark: "number",
        chart_of_account_id: "number",
        cost_center_id: "number",
        ...auditLogSort,
    },
    payment_term: {
        id: "number",
        show_it_as: "number",
        number_of_days: "number",
        ...auditLogSort,
    },
    exchange_rate: {
        id: "number",
        rate: "number",
        date: "number",
        currency_id: "number",
        ...auditLogSort,
    },
    company_address: {
        id: "number",
        address1: "number",
        address2: "number",
        city: "number",
        state_or_province: "number",
        zip_or_portal_code: "number",
        phone: "number",
        fax: "number",
        website: "number",
        organization_profile_id: "number",
        ...auditLogSort,
    },
    date_format_type: {
        id: "number",
        date_format: "number",
        date_format_type_category: "number",
        ...auditLogSort,
    },
    financial_settings: {
        id: "number",
        report_basis: "number",
        fiscal_year: "number",
        closing_type: "number",
        timezone: "number",
        company_id: "number",
        tax_id: "number",
        tax_id_number: "number",
        auto_generate_journal_preference: "number",
        is_acc_code_mandatory: "number",
        enter_unique_acc_code: "number",
        is_profile_tax_applied: "number",
        is_legal_reserve_applied: "number",
        profit_tax: "number",
        legal_reserve: "number",
        company_id_number: "number",
        time_format_id: "number",
        language_id: "number",
        base_currency_id: "number",
        ...auditLogSort,
    },
    industry: {
        id: "number",
        name: "number",
        description: "number",
        ...auditLogSort,
    },
    journal_users: {
        id: "number",
        access_name: "number",
        user_id: "number",
        ...auditLogSort,
    },
    primary_contact: {
        id: "number",
        name: "number",
        email: "number",
        organization_profile_id: "number",
        ...auditLogSort,
    },
    foot_note: {
        id: "number",
        title: "number",
        description: "number",
        financial_statement_type: "number",
        ...auditLogSort,
    },
    associated_tax_group: {
        id: "number",
        tax_id: "number",
        tax_group_id: "number",
        ...auditLogSort,
    },
    tax: {
        id: "number",
        tax_name: "number",
        tax_percentage: "number",
        is_value_added: "number",
        is_editable: "number",
        is_default_tax: "number",
        tax_type: "number",
        chart_of_account_debit_id: "number",
        chart_of_account_credit_id: "number",
        tax_authority_id: "number",
        ...auditLogSort,
    },
    tax_authority: {
        id: "number",
        name: "number",
        description: "number",
        ...auditLogSort,
    },
    tax_exemption: {
        id: "number",
        tax_exemption_reason: "number",
        code: "number",
        description: "number",
        tax_exemption_type: "number",
        ...auditLogSort,
    },
    tax_group: {
        id: "number",
        tax_group_name: "number",
        tax_group_percentage: "number",
        ...auditLogSort,
    },
    tax_rule: {
        id: "number",
        operator: "number",
        amount: "number",
        remark: "number",
        sales_type: "number",
        tax_id: "number",
        ...auditLogSort,
    },
    accounting_period: {
        id: "number",
        months: "number",
        period_number: "number",
        accounting_period_status: "number",
        is_current_posting_period: "number",
        is_year_end_closing: "number",
        period_starting_date: "number",
        period_ending_date: "number",
        ...auditLogSort,
    },
    journal_type: {
        id: "number",
        type: "number",
        description: "number",
        ...auditLogSort,
    },
};
const allRoutes = [
    "/account_category",
    "/account_type",
    "/closing_note",
    "/financial_statement_section",
    "/bank",
    "/contact",
    "/contact_address",
    "/contact_person",
    "/cost_center",
    "/cost_center_accounts",
    "/payment_term",
    "/exchange_rate",
    "/company_address",
    "/date_format_type",
    "/financial_settings",
    "/industry",
    "/journal_users",
    "/primary_contact",
    "/foot_note",
    "/associated_tax_group",
    "/tax",
    "/tax_authority",
    "/tax_exemption",
    "/tax_group",
    "/tax_rule",
    "/accounting_period",
    "/journal_type",
];

router.post(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/").pop();
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputfilters[operationDataType];
    try {
        reqBody = inputFilter(
            {
                startDate: "string",
                endDate: "string",
                ...requiredInputFilter,
            },
            { isProtectedForEdit: "boolean", ...optionalInputFilter },
            req.body,
            2
        );
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
                startDate: "string",
                endDate: "string",
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
