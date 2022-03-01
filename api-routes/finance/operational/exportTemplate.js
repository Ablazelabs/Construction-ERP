//#region enumDefs
const allModuleFields = {
    chart_of_account: [
        "account_name",
        "account_code",
        "add_to_dashboard_watch_list",
        "account_type_id",
        "account_number",
        "is_active",
        "description",
        "attachment_path",
        "is_sub_account",
        "is_default",
        "is_employee_account",
        "has_opening_balance",
        "is_bank_account",
        "parent_account_id",
        "head_account_id",
        "currency_id",
    ],
    account_type_financial_statement_section: [
        "account_type_id",
        "financial_statement_section_id",
    ],
    bank_reconcilation: [
        "chart_of_account_id",
        "from_date",
        "to_date",
        "closing_amount",
    ],
    reconcilation_transaction: ["bank_reconcilation_id", "general_ledger_id"],
    asset: [
        "name",
        "tag_number",
        "description",
        "economic_value",
        "depreciation_methods",
        "useful_life",
        "current_value",
        "asset_type",
        "scrap_value",
        "currency_id",
        "asset_account_id",
        "depreciation_account_id",
        "acquisition_date",
        "asset_status",
        "estimated_total_production",
        "estimated_total_production_unit_id",
        "recurring_journal_occurrence_id",
    ],
    estimated_total_production_unit: ["unit_name", "unit_symbol"],
    recurring_journal_occurrence: [
        "repeat_every_label",
        "name",
        "repeat_every_number",
    ],
    budget: [
        "budget_reason",
        "name",
        "project_name",
        "cost_center_id",
        "fiscal_year",
    ],
    budget_account: ["budget_total_amount", "budget_id", "chart_of_account_id"],
    budget_account_period: [
        "budget_amount",
        "period_month",
        "budget_account_id",
    ],
    budget_control_action: [
        "type",
        "action_accumulated_monthly_budget_exceeded",
    ],
    general_journal_detail: [
        "debit_or_credit",
        "reference_code",
        "general_journal_header_id",
        "cost_center_id",
        "chart_of_account_id",
        "description",
        "tax_group_id",
        "amount_credit",
        "amount_debit",
        "tax_id",
        "contact_id",
    ],
    general_journal_header: [
        "posting_reference",
        "journal_date",
        "notes",
        "currency_id",
        "posting_responsible_user_id",
        "reference_number",
        "journal_status",
        "report_basis",
        "journal_source",
        "journal_posting_status",
        "journal_type_reference",
        "total_amount",
        "journal_type_id",
        "recurring_general_journal_id",
    ],
    general_ledger: [
        "ledger_status",
        "journal_date",
        "currency_id",
        "chart_of_account_id",
        "amount_credit",
        "amount_debit",
        "description",
        "tax_id",
        "tax_group_id",
        "general_journal_header_id",
    ],
    journal_comment: [
        "comment",
        "application_user_id",
        "contact_id",
        "general_journal_header_id",
        "recurring_general_journal_id",
    ],
    number_tracker: ["starting_number", "next_number", "prefix", "reason"],
    recurring_general_journal: [
        "profile_name",
        "start_on",
        "end_on",
        "never_expires",
        "depreciable_value",
        "recurring_general_journal_status",
        "asset_id",
        "recurring_journal_occurrence_id",
    ],
    transaction_lock: ["lock_date", "reason", "enable_transaction_locking"],
    opening_balance: [
        "opening_balance_date",
        "month",
        "price_precision",
        "amount",
    ],
    cash_payment_custom: [
        "date",
        "customer",
        "amount",
        "tin_number",
        "tax",
        "withholding",
        "merchant_record_card_code",
        "number",
    ],
    cash_payment_voucher: [
        "date",
        "paid_to",
        "amount",
        "description",
        "check_number",
        "pv_number",
        "remaining_balance",
        "cpv_bank_id",
        "prepared_by_id",
        "checked_by_id",
        "project_id",
        "cpv_type_id",
        "request_payment_id",
    ],
    cpv_bank: ["name", "description"],
    cpv_payment_request: [
        "date",
        "amount",
        "description",
        "check_number",
        "remaining_balance",
        "from_id",
        "project_id",
        "prepared_by_id",
        "checked_by_id",
        "approved_by_id",
        "cash_payment_voucher_id",
    ],
    cpv_receipt: [
        "date",
        "company_name",
        "tin_number",
        "amount",
        "vat",
        "withholding",
        "machine_code",
        "receipt_number",
        "cash_payment_voucher_id",
    ],
    cpv_type: ["name", "description", "cpv_types"],
    petty_cash: [
        "date",
        "pcpv",
        "remark",
        "description",
        "debit",
        "credit",
        "balance",
        "project_id",
        "issued_by_id",
        "cash_payment_voucher_id",
    ],
    crv_payment: [
        "date",
        "name",
        "customer_name",
        "description",
        "amount_before_vat",
        "vat",
        "amount_with_vat",
        "payment_description",
        "withholding",
        "check_amount",
        "cash_amount",
        "project_id",
        "crv_type_id",
    ],
    crv_type: ["name", "description", "crv_types"],
    opening_balance_account: [
        "debit_or_credit",
        "opening_balance_id",
        "amount_credit",
        "amount_debit",
        "currency_id",
        "chart_of_account_id",
    ],
    exchange_rate: ["id", "rate", "date", "currency"],
};
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
router.get("/export_template/column", async (req, res, next) => {
    res.json({
        columns:
            allModuleFields[
                enums["export_template"].module_name[req?.body?.module_name - 1]
            ],
    });
});
module.exports = router;
