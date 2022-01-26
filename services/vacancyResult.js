const { allModels, error } = require("../config/config");

const { vacancy_applicant } = allModels;
/**
 *
 * @param {number} id
 * @param {Function} next
 */
module.exports = async (id, next) => {
    const vac = await vacancy_applicant.findUnique({ where: { id } });
    if (!vac) {
        error("id", "vacancy applicant isn't registered with this id", next);
        return false;
    }
    if (vac.application_status === 3 || vac.application_status === 4) {
        error("id", "can't assign result if applicant hired or accepted", next);
        return false;
    }
    return { success: true };
};
