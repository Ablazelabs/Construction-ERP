const { allModels } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
const { project } = allModels;
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    if (operationDataType === "project") {
        const before = await project.findFirst({
            orderBy: { project_id: "desc" },
            select: { project_id: true },
        });
        if (before) {
            let toBeSet = `${parseInt(before.project_id) + 1}`;
            const len = toBeSet.length;
            for (let i = 0; i < 6 - len; i++) {
                toBeSet = "0" + toBeSet;
            }
            reqBody.project_id = toBeSet;
        } else {
            reqBody.project_id = "000001";
        }
    }
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
module.exports = {
    post,
    get,
    patch,
};
// same as the others
