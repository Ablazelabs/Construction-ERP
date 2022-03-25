const { allModels } = require("../config/config");
const { vacancy_examiner } = allModels;
/**
 *
 * @param {Array<number>} examiners
 * @param {number} vacancy_id
 * @param {number} creator
 */
module.exports = async (examiners, vacancy_id, creator) => {
    await vacancy_examiner.deleteMany({
        where: { vacancy_id },
    });
    const count = await vacancy_examiner.createMany({
        data: examiners.map((id) => {
            return {
                employee_id: id,
                vacancy_id,
                createdBy: String(creator),
                revisedBy: String(creator),
                startDate: new Date(),
                endDate: new Date("9999/12/31"),
            };
        }),
        skipDuplicates: true,
    });
    return { success: Boolean(count.count) };
};
