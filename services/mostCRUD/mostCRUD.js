const { error, allModels } = require("../../config/config");
/**
 *
 * @param {object} reqBody object to be posted
 * @param {string} modelName name of the model to post the obj to
 * @param {number} creator id of the user posting
 * @param {Array<string>} uniqueValues list of keys that shouldn't have a duplicate in db
 * @param {function} next if this is called the fn returns false and sends an error to client
 * @param {boolean} sendId if this is true returns id of posted data with success message
 * @returns boolean|object
 */
const post = async (
    reqBody,
    modelName,
    creator,
    uniqueValues,
    next,
    sendId = false
) => {
    if (reqBody.list && Array.isArray(reqBody.list)) {
        let data;
        for (let i in reqBody.list) {
            data = post(
                reqBody.list[i],
                modelName,
                creator,
                uniqueValues,
                next,
                sendId
            );
            if (data == false) {
                return false;
            }
        }
        return data;
    }
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
        const queryData = await allModels[modelName].findUnique({
            where: {
                ...whereData,
            },
            select: {
                status: true,
            },
        });
        if (queryData) {
            if (queryData.status == 1) {
                const data = await allModels[modelName].update({
                    where: { ...whereData },
                    data: {
                        status: 0,
                        startDate: reqBody.startDate,
                        endDate: reqBody.endDate,
                    },
                });
                return { success: true, id: sendId ? data.id : undefined };
            }
            error(`${uniqueKey}`, `${modelName} already exists`, next);
            return false;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    try {
        const data = await allModels[modelName].create({
            data: {
                ...defaultData,
                ...reqBody,
            },
        });
        //   console.log(data);
        return { success: true, id: sendId ? data.id : undefined };
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
    modelName
) => {
    const data = await allModels[modelName].findMany({
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
    modelName,
    creator,
    uniqueValues,
    next
) => {
    const myModel = await allModels[modelName].findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myModel) {
        error("id", `${modelName} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error("id", `this ${modelName} is protected against edit`, next);
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
                const data = await allModels[modelName].findUnique({
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
        await allModels[modelName].update({
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
const deleter = async (id, modelName) => {
    try {
        await allModels[modelName].update({
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
