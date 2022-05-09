const { error, allModels, snakeToPascal } = require("../../config/config");
/**
 * It takes an object, a model name, a creator id, a list of unique keys, a next function, and a
 * boolean, and returns false or an object
 * @param {object} reqBody object to be posted
 * @param {string} modelName name of the model to post the obj to
 * @param {number} creator id of the user posting
 * @param {Array<string>} uniqueValues list of keys that shouldn't have a duplicate in db
 * @param {function} next if this is called the fn returns false and sends an error to client
 * @param {boolean} sendId if this is true returns id of posted data with success message
 * @returns false|object
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
            data = await post(
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
            error(
                `${uniqueKey}`,
                `${snakeToPascal(modelName)} already exists`,
                next
            );
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
        console.log(e);
        if (e.meta.field_name) {
            const fieldModel = snakeToPascal(
                e.meta.field_name.replace("_id", "")
            );
            error(
                e.meta.field_name,
                `no ${fieldModel} exists with this id`,
                next
            );
            return false;
        }
    }
};
/**
 * It takes in a bunch of arguments and returns a promise that resolves to an array of objects.
 * @param queryFilter - {
 * @param querySort - [{ id: "desc" }]
 * @param limit - number of records to return
 * @param skip - number of records to skip
 * @param projection - {
 * @param modelName - The name of the model you want to query.
 * @returns An array of objects.
 */
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
/**
 * It takes a bunch of arguments, and then it updates a database record
 * @param updateDataProjection - the projection of the data that you want to update
 * @param reqBody - the request body
 * @param updateData - the data that will be updated
 * @param modelName - the name of the model you're updating
 * @param creator - the user who is making the request
 * @param uniqueValues - an array of strings that are the names of the fields that are unique in the
 * model
 * @param next - the next function in the express route
 * @returns an object with a key of success and a value of true.
 */
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
        error("id", `${snakeToPascal(modelName)} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error(
            "id",
            `this ${snakeToPascal(modelName)} is protected against edit`,
            next
        );
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
                    error(key, `${snakeToPascal(key)} already exists`, next);
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
            const fieldModel = snakeToPascal(
                e.meta.field_name.replace("_id", "")
            );
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
/**
 * This function takes an id and a model name, and then updates the status and endDate of the record
 * with the given id in the given model.
 * @param id - the id of the record to be deleted
 * @param modelName - The name of the model you want to delete from.
 * @returns { success: true }
 */
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
