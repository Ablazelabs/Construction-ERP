const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { accounting_period } = new PrismaClient();
const post = async (reqBody, creator, enums, next) => {
    const allowedAccountingPeriodStatus = [2, 3];
    if (
        allowedAccountingPeriodStatus.indexOf(
            reqBody.accounting_period_status
        ) == -1
    ) {
        error(
            "accounting_period_status",
            `can only be one of ${String(allowedAccountingPeriodStatus)} from ${
                enums["accounting_period_status"]
            }`
        );
        return;
    }
    // tomorrow job, more on business logic of accounting period specially patch
    try {
        const defaultData = {
            createdBy: String(creator),
            revisedBy: String(creator),
            status: 0,
        };
        const data = await accounting_period.create({
            data: {
                ...reqBody,
                ...defaultData,
            },
        });
        //   console.log(data);
        return { success: true };
    } catch (e) {
        if (e.meta.cause) {
            error(
                "document_category_id",
                "no document category exists with this id",
                next
            );
            return false;
        }
    }
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await accounting_period.findMany({
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
    creator,
    next
) => {
    const myDocumentation = await accounting_period.findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myDocumentation) {
        error("id", "material doesn't exist", next);
        return false;
    }
    if (myDocumentation.isProtectedForEdit) {
        error("id", `this material is protected against edit`, next);
        return false;
    }
    if (updateData.name) {
        if (updateData.name === myDocumentation.name) {
            updateData.name = undefined;
        } else {
            const data = await accounting_period.findUnique({
                select: { name: true },
                where: { name: updateData.name },
            });
            if (data) {
                error("name", "already exists", next);
                return false;
            }
        }
    }
    try {
        await accounting_period.update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name == "document_category_id") {
            error(
                "document_category_id",
                "no material category exists with this id",
                next
            );
            return false;
        }
    }
    return { success: true };
};
const deleter = async ({ id }) => {
    try {
        await accounting_period.update({
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
