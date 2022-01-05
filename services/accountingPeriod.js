const { error, allModels } = require("../config/config");

const { accounting_period, transaction_lock } = allModels;
const post = async (reqBody, creator, enums, next) => {
    const allowedAccountingPeriodStatus = [2, 3];
    if (
        allowedAccountingPeriodStatus.indexOf(
            reqBody.accounting_period_status
        ) == -1
    ) {
        error(
            "accounting_period_status",
            `can only be one of ${allowedAccountingPeriodStatus} from ${enums["accounting_period_status"]}`,
            next
        );
        return;
    }
    if (reqBody.is_current_posting_period) {
        const current = await accounting_period.findFirst({
            where: {
                is_current_posting_period: true,
            },
            select: {
                id: true,
                months: true,
            },
        });
        if (current) {
            error(
                "is_current_posting_period",
                `there's already a current posting period ie ${
                    enums["months"][current.months - 1]
                }`,
                next
            );
            return;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    await accounting_period.create({
        data: {
            ...reqBody,
            ...defaultData,
        },
    });
    //   console.log(data);
    return { success: true };
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await accounting_period.findMany({
        where: {
            ...queryFilter,
            status: 0,
        },
        orderBy: [...querySort],
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
    enums,
    next
) => {
    const myAccountingPeriod = await accounting_period.findUnique({
        select: {
            ...updateDataProjection,
            isProtectedForEdit: true,
            is_current_posting_period: true,
            period_ending_date: true,
            accounting_period_status: true,
        },
        where: { id: reqBody.id },
    });
    if (!myAccountingPeriod) {
        error("id", "material doesn't exist", next);
        return false;
    }
    if (myAccountingPeriod.isProtectedForEdit) {
        error("id", `this accounting period is protected against edit`, next);
        return false;
    }
    if (updateData.is_current_posting_period) {
        if (
            updateData.is_current_posting_period ===
            myAccountingPeriod.is_current_posting_period
        ) {
            updateData.is_current_posting_period = undefined;
        } else {
            const data = await accounting_period.findFirst({
                select: { is_current_posting_period: true, months: true },
                where: { is_current_posting_period: true },
            });
            if (data) {
                error(
                    "is_current_posting_period",
                    `there's already a current posting period ie ${
                        enums["months"][data.months - 1]
                    }`,
                    next
                );
                return false;
            }
        }
    }
    if (updateData.accounting_period_status) {
        //if update is to close or make it future, if current is open we need to check stuff
        if (
            updateData.accounting_period_status == 2 ||
            updateData.accounting_period_status == 3
        ) {
            //check if transaction is locked
            if (
                myAccountingPeriod.accounting_period_status == 1 ||
                myAccountingPeriod.accounting_period_status == 4
            ) {
                const locked = await transaction_lock.findFirst({
                    where: {
                        lock_date: myAccountingPeriod.period_ending_date,
                    },
                    select: {
                        lock_date: true,
                    },
                });
                if (!locked) {
                    error(
                        "accounting_period_status",
                        `please lock transaction at end date of the period ur trying to close ie ${myAccountingPeriod.period_ending_date}`,
                        next
                    );
                    return false;
                }
            }
            //if current was closed or future the update isn't disallowed
        } else {
            //update data sent is to open
            if (
                myAccountingPeriod.accounting_period_status == 2 ||
                myAccountingPeriod.accounting_period_status == 3
            ) {
                //check here if everyother period is closed
                const data = await accounting_period.findFirst({
                    where: {
                        OR: [
                            { accounting_period_status: 1 },
                            { accounting_period_status: 4 },
                        ],
                    },
                    select: {
                        months: true,
                    },
                });
                if (data) {
                    error(
                        "accounting_period_status",
                        `there is already a period that's open ie ${
                            enums["months"][data.months - 1]
                        }`,
                        next
                    );
                    return false;
                }
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
