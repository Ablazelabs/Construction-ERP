const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const {
    accounting_period,
    chart_of_account,
    chart_of_account_files,
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
    general_journal_files,
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
    chart_of_account_files,
    general_journal_files,
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
const generatedStrings = {
    chart_of_account: {},
    account_type_financial_statement_section: {},
    bank_reconcilation: {},
    chart_of_account_files: {},
    reconcilation_transaction: {},
    asset: {},
    estimated_total_production_unit: {},
    recurring_journal_occurrence: {},
    budget: {},
    budget_account: {},
    budget_account_period: {},
    budget_control_action: {},
    general_journal_detail: {
        posting_reference: "PR", //needs its own implementation :( sequential string
    },
    general_journal_files: {},
    general_journal_header: {
        posting_reference: "PR", //needs its own implementation :( sequential string
    },
    general_ledger: {
        posting_reference: "PR", //needs its own implementation :( sequential string
        group_posting_reference: "PR", //needs its own implementation :( sequential string
    },
    journal_comment: {},
    number_tracker: {},
    recurring_general_journal: {},
    transaction_lock: {},
    opening_balance: {},
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
const checkAgainstAccPeriod = {
    chart_of_account: [],
    account_type_financial_statement_section: [],
    bank_reconcilation: [],
    reconcilation_transaction: [],
    asset: ["acquisition_date"],
    estimated_total_production_unit: [],
    recurring_journal_occurrence: [],
    budget: [],
    budget_account: [],
    budget_account_period: [],
    budget_control_action: [],
    general_journal_detail: [],
    general_journal_header: ["journal_date"],
    general_ledger: ["journal_date"],
    journal_comment: [],
    number_tracker: [],
    recurring_general_journal: ["start_on", "end_on"],
    transaction_lock: [],
    opening_balance: ["opening_balance_date"],
};
const post = async (reqBody, operationDataType, creator, next) => {
    const accPeriodDate = checkAgainstAccPeriod[operationDataType];
    const generatedKeys = generatedStrings[operationDataType];
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

    const allowedDate = await accounting_period.findFirst({
        where: {
            accounting_period_status: 1,
        },
        select: {
            period_ending_date: true,
            period_starting_date: true,
        },
    });
    for (let i in accPeriodDate) {
        const key = accPeriodDate[i];
        if (reqBody[key]) {
            if (!allowedDate) {
                error(
                    key,
                    "all accounting periods are closed or locked please open one to continue",
                    next
                );
                return false;
            }
            if (
                reqBody[key] >= allowedDate.period_starting_date &&
                reqBody[key] <= allowedDate.period_ending_date
            ) {
            } else {
                error(
                    key,
                    "account period date is either closed or locked",
                    next
                );
                return false;
            }
        }
    }

    for (let i in generatedKeys) {
        let sort = {};
        sort[i] = "desc";
        let projection = {};
        projection[i] = true;
        let filter = {};
        filter[i] = { contains: generatedKeys[i] };
        const data = await allModels[operationDataType].findMany({
            orderBy: {
                ...sort,
            },
            take: 1,
            where: {
                ...filter,
            },
            select: {
                ...projection,
            },
        });
        let foundNumber = -1;
        if (data.length == 0) {
            foundNumber = -1;
        } else {
            foundNumber = Math.floor(Number(data[0][i].split("-")[1]));
        }
        foundNumber += 1;
        reqBody[i] = `${generatedKeys[i]}-${foundNumber}`;
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
    const accPeriodDate = checkAgainstAccPeriod[operationDataType];
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
    const allowedDate = await accounting_period.findFirst({
        where: {
            accounting_period_status: 1,
        },
        select: {
            period_ending_date: true,
            period_starting_date: true,
        },
    });
    for (let i in accPeriodDate) {
        const key = accPeriodDate[i];
        if (updateData[key]) {
            if (!allowedDate) {
                error(
                    key,
                    "all accounting periods are closed or locked please open one to continue",
                    next
                );
                return false;
            }
            if (
                updateData[key] >= allowedDate.period_starting_date &&
                updateData[key] <= allowedDate.period_ending_date
            ) {
            } else {
                error(
                    key,
                    "account period date is either closed or locked",
                    next
                );
                return false;
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
