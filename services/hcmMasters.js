const {
    post: mPost,
    get: mGet,
    patch: mPatch,
    deleter: mDelete,
} = require("./mostCRUD/mostCRUD");
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    return mPost(reqBody, operationDataType, creator, uniqueValues, next);
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType
) => {
    return mGet(
        queryFilter,
        querySort,
        limit,
        skip,
        projection,
        operationDataType
    );
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    return mPatch(
        updateDataProjection,
        reqBody,
        updateData,
        operationDataType,
        creator,
        uniqueValues,
        next
    );
};
const deleter = async ({ id }, operationDataType) => {
    return mDelete(id, operationDataType);
};

module.exports = {
    post,
    get,
    patch,
    deleter,
};
// same as the others
