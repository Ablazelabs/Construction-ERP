const { allModels, error } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
    deleter,
} = require("./mostCRUD/mostCRUD");
const { financial_statement_section } = allModels;

/**
 *
 * @param {{
 *   name: string,
 *   sequence_on_report: number,
 *   financial_statement_type: number,
 *   description: string,
 *   startDate: Date,
 *   endDate:Date
 *}} reqBody
 * @param {'financial_statement_section'} operationDataType
 * @param {number} creator
 * @param {['name']} uniqueValues
 * @param {Function} next
 * @returns
 */
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    const prev = await financial_statement_section.findUnique({
        where: { name: reqBody.name },
    });
    if (!prev) {
        if (reqBody.sequence_on_report > 0) {
            await financial_statement_section.updateMany({
                where: {
                    status: 0,
                    financial_statement_type: reqBody.financial_statement_type,
                    sequence_on_report: { gte: reqBody.sequence_on_report },
                },
                data: {
                    sequence_on_report: {
                        increment: 1,
                    },
                },
            });
        }
        return mPost(reqBody, operationDataType, creator, uniqueValues, next);
    } else {
        const oldIndex = prev.sequence_on_report;
        const newIndex = reqBody.sequence_on_report;
        const financialStatementType = prev.financial_statement_type;
        const financialStatementSectionExist =
            await financial_statement_section.findFirst({
                where: {
                    status: 0,
                    financial_statement_type: financialStatementType,
                    sequence_on_report: newIndex,
                },
            });
        if (financialStatementSectionExist) {
            if (oldIndex < newIndex) {
                await financial_statement_section.updateMany({
                    where: {
                        status: 0,
                        financial_statement_type: financialStatementType,
                        sequence_on_report: { gt: oldIndex, lte: newIndex },
                    },
                    data: {
                        sequence_on_report: { decrement: 1 },
                    },
                });
            } else {
                await financial_statement_section.updateMany({
                    where: {
                        status: 0,
                        financial_statement_type: financialStatementType,
                        sequence_on_report: { gte: newIndex, lt: oldIndex },
                    },
                    data: {
                        sequence_on_report: { increment: 1 },
                    },
                });
            }
        }
        await financial_statement_section.update({
            where: {
                id: prev.id,
            },
            data: {
                status: 0,
                sequence_on_report: reqBody.sequence_on_report,
            },
        });
        return { success: true };
    }
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType,
    enums
) => {
    return mGet(
        queryFilter,
        querySort,
        limit,
        skip,
        projection,
        operationDataType,
        enums
    );
};
/**
 *
 * @param {{
 *   name: string,
 *   sequence_on_report: number,
 *   financial_statement_type: number,
 *   description: string,
 *   startDate: Date,
 *   endDate:Date
 *}} updateData
 * @param {'financial_statement_section'} operationDataType
 * @param {{id:number}} reqBody
 * @param {number} creator
 * @param {['name']} uniqueValues
 * @param {Function} next
 * @returns
 */
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    const prev = await financial_statement_section.findUnique({
        where: {
            id: reqBody.id,
        },
    });
    if (!prev) {
        error("id", "financial statement section doesn't exist", next);
        return false;
    }
    const oldSequence = prev.sequence_on_report;
    if (oldSequence != updateData.sequence_on_report) {
        const oldIndex = oldSequence;
        const newIndex = updateData.sequence_on_report;
        const financialStatementType = updateData.financial_statement_type;
        const financialStatementSectionExist =
            await financial_statement_section.findFirst({
                where: {
                    status: 0,
                    financial_statement_type: financialStatementType,
                    sequence_on_report: newIndex,
                },
            });
        if (financialStatementSectionExist) {
            if (oldIndex < newIndex) {
                await financial_statement_section.updateMany({
                    where: {
                        status: 0,
                        financial_statement_type: financialStatementType,
                        sequence_on_report: { gt: oldIndex, lte: newIndex },
                    },
                    data: {
                        sequence_on_report: { decrement: 1 },
                    },
                });
            } else {
                await financial_statement_section.updateMany({
                    where: {
                        status: 0,
                        financial_statement_type: financialStatementType,
                        sequence_on_report: { gte: newIndex, lt: oldIndex },
                    },
                    data: {
                        sequence_on_report: { increment: 1 },
                    },
                });
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
/**
 *
 * @param {number} id
 */
const mDelete = async (id) => {
    const returned = await deleter(id, "financial_statement_section");
    if (returned && returned.success === false) {
        return returned;
    }
    const deleted = await financial_statement_section.findUnique({
        where: { id },
    });
    await financial_statement_section.updateMany({
        where: {
            status: 0,
            financial_statement_type: deleted.financial_statement_type,
            sequence_on_report: { gte: deleted.sequence_on_report },
        },
        data: {
            sequence_on_report: {
                decrement: 1,
            },
        },
    });
    return returned;
};
module.exports = {
    post,
    get,
    patch,
    mDelete,
};
// same as the others
