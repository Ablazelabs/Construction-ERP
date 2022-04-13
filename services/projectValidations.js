const { allModels, error, snakeToPascal } = require("../config/config");

/**
 *
 * @param {number} id
 * @param {2|3} approval_status
 * @param {string} modelName
 * @param {Function} next
 * @returns
 */
const patch = async (id, approval_status, modelName, next) => {
    const myModel = await allModels[modelName].findUnique({
        select: { approval_status: true, isProtectedForEdit: true },
        where: { id: id },
    });
    if (!myModel) {
        error("id", `${snakeToPascal(modelName)} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error(
            "id",
            `this ${snakeToPascal(modelName)} is protected against edit`,
            next
        );
        return false;
    }
    if (myModel.approval_status !== 1) {
        error(
            "id",
            `this ${snakeToPascal(modelName)} has already been ${
                ["", "", "approved", "rejected"][myModel.approval_status]
            }`,
            next
        );
        return false;
    }
    //if any error happens its totally 500!
    await allModels[modelName].update({
        data: {
            approval_status,
        },
        where: { id: id },
    });
    return { success: true };
};
module.exports = {
    patch,
};
