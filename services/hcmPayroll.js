const { allModels, error } = require("../config/config");
const { overtime } = allModels;
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
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
    if (operationDataType == "overtime") {
        const ot = await overtime.findUnique({
            where: {
                id: reqBody.id,
            },
            select: {
                overtime_status: true,
            },
        });
        if (ot) {
            if (ot.overtime_status === 2 || ot.overtime_status === 5) {
                error(
                    "overtime_status",
                    "You can not edit approved overtime",
                    next
                );
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
const deleteLogic = async (id, operationDataType, next) => {
    if (operationDataType == "overtime") {
        const ot = await overtime.findUnique({
            where: {
                id: id,
            },
            select: {
                overtime_status: true,
            },
        });
        if (ot) {
            if (ot.overtime_status === 2 || ot.overtime_status === 5) {
                error(
                    "overtime_status",
                    "You can not delete approved overtime",
                    next
                );
                return false;
            }
        }
    }
    return true;
};
module.exports = {
    post,
    get,
    patch,
    deleteLogic,
};
// same as the others
