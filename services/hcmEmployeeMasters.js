const {
    allModels: { commitment },
} = require("../config/config");
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
    next,
    sendId = false
) => {
    if (operationDataType === "employee_commitment") {
        const commitmentMonths = await commitment.findUnique({
            where: {
                id: reqBody.commitment_id,
            },
        });
        if (commitmentMonths) {
            let endDay = new Date(employeeCommitmentReqBody.startDate);
            endDay.setMonth(endDay.getMonth() + commitmentMonths.period || 0);
            employeeCommitmentReqBody.endDate = endDay;
        }
    }
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
module.exports = {
    post,
    get,
    patch,
};
// same as the others
