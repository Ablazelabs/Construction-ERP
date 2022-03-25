const { allModels } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
    deleter: mDelete,
} = require("./mostCRUD/mostCRUD");
const { leave_plan } = allModels;
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
    if (operationDataType === "leave_plan") {
        const leave = await leave_plan.findUnique({
            where: { id: reqBody.id },
        });
        if (leave) {
            if (leave.leave_request_status == 2) {
                error("id", "You can not edit approved leave", next);
                return false;
            }
        }
    }
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
