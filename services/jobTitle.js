const { allModels } = require("../config/config");
const { post } = require("./mostCRUD/mostCRUD");
const { job_safety_equipment } = allModels;
/**
 *
 * @param {Array<number>} equipments
 * @param {object} jobReqBody
 * @param {Array<string>} jobUnique
 * @param {number} creator
 * @param {Function} next
 */
module.exports = async (equipments, jobReqBody, jobUnique, creator, next) => {
    const jobTitle = await post(
        jobReqBody,
        "job_title",
        creator,
        jobUnique,
        next,
        true
    );
    if (jobTitle == false) {
        return false;
    }
    const count = await job_safety_equipment.createMany({
        skipDuplicates: true,
        data: equipments.map((id) => {
            return {
                job_title_id: jobTitle.id,
                safety_equipment_id: id,
                startDate: jobReqBody.startDate,
                endDate: jobReqBody.startDate,
                createdBy: String(creator),
                revisedBy: String(creator),
            };
        }),
    });
    return { success: Boolean(count.count) };
};
