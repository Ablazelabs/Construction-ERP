const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const {
    account_category,
    account_type,
    closing_note,
    financial_statement_section,
    bank,
    contact,
    contact_address,
    contact_person,
    cost_center,
    cost_center_accounts,
    payment_term,
    exchange_rate,
    company_address,
    date_format_type,
    financial_settings,
    industry,
    journal_users,
    primary_contact,
    foot_note,
    associated_tax_group,
    tax,
    tax_authority,
    tax_exemption,
    tax_group,
    tax_rule,
    journal_type,
} = new PrismaClient();

const allModels = {
    account_category,
    account_type,
    closing_note,
    financial_statement_section,
    bank,
    contact,
    contact_address,
    contact_person,
    cost_center,
    cost_center_accounts,
    payment_term,
    exchange_rate,
    company_address,
    date_format_type,
    financial_settings,
    industry,
    journal_users,
    primary_contact,
    foot_note,
    associated_tax_group,
    tax,
    tax_authority,
    tax_exemption,
    tax_group,
    tax_rule,
    journal_type,
};
const uniqueValues = {
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
            if (queryData.status == 1) {
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
