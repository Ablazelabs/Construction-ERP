const { allModels } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
const { vacancy_applicant } = allModels;
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next,
    sendId = false
) => {
    return mPost(
        reqBody,
        operationDataType,
        creator,
        uniqueValues,
        next,
        sendId
    );
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
/**
 *
 * @param {number} id
 */
const deleteFn = async (id) => {
    await vacancy_applicant.update({
        where: { id },
        data: {
            external_applicant: {
                update: {
                    status: 0,
                },
            },
        },
    });
};
module.exports = {
    post,
    get,
    patch,
    deleteFn,
};
// same as the others
