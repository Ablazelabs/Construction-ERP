const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const {
    chart_of_account,
    account_type_financial_statement_section,
    bank_reconcilation,
    estimated_total_production_unit,
    recurring_journal_occurrence,
    budget,
    budget_account,
    budget_account_period,
    budget_control_action,
    general_journal_header,
    general_ledger,
    journal_comment,
    number_tracker,
    transaction_lock,
    opening_balance,
    reconcilation_transaction,
    asset,
    general_journal_detail,
    recurring_general_journal,
} = new PrismaClient();

const allModels = {
    chart_of_account,
    account_type_financial_statement_section,
    bank_reconcilation,
    estimated_total_production_unit,
    recurring_journal_occurrence,
    budget,
    budget_account,
    budget_account_period,
    budget_control_action,
    general_journal_header,
    general_ledger,
    journal_comment,
    number_tracker,
    transaction_lock,
    opening_balance,
    reconcilation_transaction,
    asset,
    general_journal_detail,
    recurring_general_journal,
};
const uniqueValues = {
    chart_of_account: [],
    account_type_financial_statement_section: [],
    bank_reconcilation: [],
    estimated_total_production_unit: [],
    recurring_journal_occurrence: [],
    budget: [],
    budget_account: [],
    budget_account_period: [],
    budget_control_action: [],
    general_journal_header: [],
    general_ledger: [],
    journal_comment: [],
    number_tracker: [],
    transaction_lock: [],
    opening_balance: [],
    reconcilation_transaction: [],
    asset: [],
    general_journal_detail: [],
    recurring_general_journal: [],
};
const post = async (reqBody, operationDataType, creator, next) => {
    for (let i in uniqueValues[operationDataType]) {
        const uniqueKey = uniqueValues[operationDataType][i];
        let whereData = {};
        whereData[uniqueKey] = reqBody[uniqueKey];
        const queryData = await allModels[operationDataType].findUnique({
            where: {
                ...whereData,
            },
            select: {
                status: true,
            },
        });
        if (queryData) {
            if (queryData.deleted_status == 1) {
                await allModels[operationDataType].update({
                    where: { ...whereData },
                    data: {
                        status: 0,
                        startDate: reqBody.startDate,
                        endDate: reqBody.endDate,
                    },
                });
                return { success: true };
            }
            error(`${uniqueKey}`, `${operationDataType} already exists`, next);
            return false;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    try {
        await allModels[operationDataType].create({
            data: {
                ...defaultData,
                ...reqBody,
            },
        });
        //   console.log(data);
        return { success: true };
    } catch (e) {
        if (e.meta.field_name) {
            const fieldModel = e.meta.field_name
                .replace("_id", "")
                .replace(/_/g, " ");
            error(
                e.meta.field_name,
                `no ${fieldModel} exists with this id`,
                next
            );
            return false;
        }
    }
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType
) => {
    const data = await allModels[operationDataType].findMany({
        where: {
            ...queryFilter,
            status: 0,
        },
        orderBy: {
            ...querySort,
        },
        take: limit,
        skip,
        select: {
            ...projection,
        },
    });
    return data;
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    next
) => {
    const myModel = await allModels[operationDataType].findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myModel) {
        error("id", `${operationDataType} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error(
            "id",
            `this ${operationDataType} is protected against edit`,
            next
        );
        return false;
    }
    for (let i in uniqueValues[operationDataType]) {
        const key = uniqueValues[operationDataType][i];
        if (updateData[key]) {
            if (updateData[key] === myModel[key]) {
                updateData[key] = undefined;
            } else {
                let whereData = {};
                whereData[key] = updateData[key];
                const data = await allModels[operationDataType].findUnique({
                    select: { id: true },
                    where: { ...whereData },
                });
                if (data) {
                    error(key, "already exists", next);
                    return false;
                }
            }
        }
    }
    try {
        await allModels[operationDataType].update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name) {
            const fieldModel = e.meta.field_name
                .replace("_id", "")
                .replace(/_/g, " ");
            error(
                e.meta.field_name,
                `no ${fieldModel} exists with this id`,
                next
            );
            return false;
        }
    }
    return { success: true };
};
const deleter = async ({ id }, operationDataType) => {
    try {
        await allModels[operationDataType].update({
            where: { id },
            data: { status: 1, endDate: new Date() },
        });
    } catch (e) {
        console.log(e);
        return { success: false };
    }
    return { success: true };
};

module.exports = {
    post,
    get,
    patch,
    deleter,
};
