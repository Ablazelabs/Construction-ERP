const { allModels } = require("../config/config");
const { post, get: mGet, patch: mPatch } = require("./mostCRUD/mostCRUD");
const { job_safety_equipment, job_title } = allModels;
/**
 *
 * @param {Array<number>} equipments
 * @param {object} jobReqBody
 * @param {Array<string>} jobUnique
 * @param {number} creator
 * @param {Function} next
 */
const jobEquipAdder = async (
    equipments,
    jobReqBody,
    jobUnique,
    creator,
    next
) => {
    const jobTitle = await post(
        {
            ...jobReqBody,
            job_safety_equipment: {
                createMany: {
                    skipDuplicates: true,
                    data: equipments.map((id) => {
                        return {
                            safety_equipment_id: id,
                            startDate: jobReqBody.startDate,
                            endDate: jobReqBody.startDate,
                            createdBy: String(creator),
                            revisedBy: String(creator),
                        };
                    }),
                },
            },
        },
        "job_title",
        creator,
        jobUnique,
        next,
        true
    );
    if (jobTitle == false) {
        return false;
    }
    return { success: true };
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
        {
            ...projection,
            job_safety_equipment: {
                select: {
                    safety_equipment: true,
                },
            },
        },
        operationDataType
    );
};
/**
 *
 * @param {object} updateDataProjection
 * @param {object} reqBody
 * @param {object} updateData
 * @param {string} operationDataType
 * @param {number} creator
 * @param {object} uniqueValues
 * @param {Array<number>} safetyEquipments
 * @param {Function} next
 * @returns object
 */
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    safetyEquipments,
    next
) => {
    return mPatch(
        updateDataProjection,
        reqBody,
        {
            ...updateData,
            job_safety_equipment: {
                deleteMany: {},
                createMany: {
                    data: safetyEquipments.map((id) => {
                        return {
                            safety_equipment_id: id,
                            startDate: new Date(),
                            endDate: new Date("9999/12/31"),
                            createdBy: String(creator),
                            revisedBy: String(creator),
                        };
                    }),
                    skipDuplicates: true,
                },
            },
        },
        operationDataType,
        creator,
        uniqueValues,
        next
    );
};
module.exports = {
    jobEquipAdder,
    get,
    patch,
};
