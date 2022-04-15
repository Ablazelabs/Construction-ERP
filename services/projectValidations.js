const {
    allModels: { project_request, project },
    error,
} = require("../config/config");

/**
 *
 * @param {number} id
 * @param {2|3} approval_status
 * @param {string} modelName
 * @param {Function} next
 * @returns
 */
const patch = async (id, approval_status, action_note, next) => {
    const myModel = await project_request.findUnique({
        select: {
            approval_status: true,
            isProtectedForEdit: true,
            request_type: true,
            project_id: true,
        },
        where: { id },
    });
    const displayRequestType = [
        "",
        "Payment Request",
        "Manpower Request",
        "Store Request",
    ][myModel.request_type];
    if (!myModel) {
        error("id", `${displayRequestType} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error(
            "id",
            `this ${displayRequestType} is protected against edit`,
            next
        );
        return false;
    }
    if (myModel.approval_status !== 1) {
        error(
            "id",
            `this ${displayRequestType} has already been ${
                ["", "", "approved", "rejected"][myModel.approval_status]
            }`,
            next
        );
        return false;
    }
    //if any error happens its totally 500!
    const { project_manager_id } = (await project.findUnique({
        where: { id: myModel.project_id },
        select: { project_manager_id: true },
    })) || { project_manager_id: null };
    await project_request.update({
        data: {
            approval_status,
            action_note,
            action_taken_date: new Date(),
            approved_by_id: project_manager_id,
        },
        where: { id: id },
    });
    return { success: true };
};
module.exports = {
    patch,
};
