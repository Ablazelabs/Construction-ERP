const {
    allModels: { project_request, project, project_edit_request },
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
/**
 *
 * @param {number} id
 * @param {number} approval_status
 * @param {Function} next
 * @returns
 */
const editRequest = async (id, approval_status, next) => {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const myModel = await project_edit_request.update({ where: { id } });
    if (!myModel) {
        error("id", `project edit request doesn't exist`, next);
        return false;
    }
    if (myModel.approval_status !== 1) {
        error(
            "id",
            `this project edit request has already been ${
                ["", "", "approved", "rejected"][myModel.approval_status]
            }`,
            next
        );
        return false;
    }
    if (myModel.requested_date < yesterday) {
        error("id", "this project edit request has expired", next);
        return false;
    }
    await project_edit_request.update({
        where: { id },
        data: { approval_status },
    });
    return { success: true };
};
module.exports = {
    patch,
    editRequest,
};
