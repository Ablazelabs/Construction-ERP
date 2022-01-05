const {
    error,
    randomConcurrencyStamp,
    allModels,
} = require("../config/config");

const { privilege } = allModels;

const post = async (reqBody, next) => {
    const queryResult = await privilege.findUnique({
        where: {
            action: reqBody.action,
        },
    });
    if (queryResult) {
        if (queryResult.deleted_status == 1) {
            await privilege.update({
                where: { action: reqBody.action },
                data: { deleted_status: 0 },
            });
            return { success: true };
        }
        error("action", "privilege already exists", next);
        return false;
    }
    await privilege.create({
        data: {
            action: reqBody.action,
            description: reqBody.description,
            concurrency_stamp: randomConcurrencyStamp(),
        },
    });
    return { success: true };
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await privilege.findMany({
        where: {
            ...queryFilter,
            deleted_status: 0,
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
const patch = async (updateDataProjection, reqBody, updateData, next) => {
    const myPrivilege = await privilege.findUnique({
        select: { ...updateDataProjection, concurrency_stamp: true },
        where: { id: reqBody.id },
    });
    if (!myPrivilege) {
        error("id", "privilege doesn't exist", next);
        return false;
    }
    if (myPrivilege.concurrency_stamp !== reqBody.concurrency_stamp) {
        error("concurrency_stamp", "privilege already updated, refresh", next);
        return false;
    }
    if (updateData.action) {
        if (updateData.action === myPrivilege.action) {
            updateData.action = undefined;
        } else {
            const data = await privilege.findUnique({
                select: { action: true },
                where: { action: updateData.action },
            });
            if (data) {
                error("name", "already exists", next);
                return false;
            }
        }
    }
    await privilege.update({
        data: { ...updateData, concurrency_stamp: randomConcurrencyStamp() },
        where: { id: reqBody.id },
    });
    return { success: true };
};
const deleter = async ({ id }) => {
    try {
        const deletedPrivilege = await privilege.findUnique({ where: { id } });
        await privilege.delete({ where: { id } });
        await privilege.create({
            data: { ...deletedPrivilege, deleted_status: 1 },
        });
    } catch {
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
