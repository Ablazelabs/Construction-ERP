const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { client } = new PrismaClient();

const uniqueValues = [
    "tradeName",
    "tel",
    "tinNumber",
    "contactPersonEmail",
    "contactPersonPhone",
    "email",
];

const post = async (reqBody, creator, next) => {
    for (let i in uniqueValues) {
        const uniqueKey = uniqueValues[i];
        if (
            !reqBody[uniqueKey] &&
            reqBody[uniqueKey] != 0 &&
            reqBody[uniqueKey] != false
        )
            continue;
        let whereData = {};
        whereData[uniqueKey] = reqBody[uniqueKey];
        const queryData = await client.findUnique({
            where: {
                ...whereData,
            },
            select: {
                status: true,
            },
        });
        if (queryData) {
            if (queryData.status == 1) {
                await client.update({
                    where: { ...whereData },
                    data: {
                        status: 0,
                        startDate: reqBody.startDate,
                        endDate: reqBody.endDate,
                    },
                });
                return { success: true };
            }
            error(`${uniqueKey}`, `client already exists`, next);
            return false;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    try {
        await client.create({
            data: {
                ...defaultData,
                ...reqBody,
            },
        });
        //   console.log(data);
        return { success: true };
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
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await client.findMany({
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
    const myModel = await client.findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myModel) {
        error("id", `client doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error("id", `this client is protected against edit`, next);
        return false;
    }
    for (let i in uniqueValues) {
        const key = uniqueValues[i];
        if (
            updateData[key] ||
            updateData[key] == 0 ||
            updateData[key] == false
        ) {
            if (updateData[key] === myModel[key]) {
                updateData[key] = undefined;
            } else {
                let whereData = {};
                whereData[key] = updateData[key];
                const data = await client.findUnique({
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
        await client.update({
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
const deleter = async (reqBody) => {
    try {
        await client.update({
            where: { id: reqBody.id },
            data: { status: 1, endDate: new Date() },
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
