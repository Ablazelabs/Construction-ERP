const {
    allModels: { project_request, payment_request },
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
const projectRequestApprove = async (
    id,
    approval_status,
    approved_by_id,
    action_note,
    next
) => {
    const myModel = await project_request.findUnique({
        where: { id },
    });
    const displayRequestType = "Project Request";
    if (!myModel) {
        error("id", `${displayRequestType} doesn't exist`, next);
        return false;
    }
    if (myModel.approval_status !== 2) {
        error(
            "id",
            `this ${displayRequestType} hasn't already been approved`,
            next
        );
        return false;
    }
    if (myModel.finance_approval_status !== 1) {
        error(
            "id",
            `this ${displayRequestType} has already been ${
                ["", "", "approved", "rejected"][myModel.approval_status]
            } by finance`,
            next
        );
        return false;
    }
    //if any error happens its totally 500!
    await project_request.update({
        data: {
            finance_approval_status: approval_status,
            finance_action_note: action_note,
            action_taken_date: new Date(),
            finance_approved_by_id: approved_by_id,
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
const paymentRequestApprove = async (
    id,
    approval_status,
    approved_by_id,
    action_note,
    next
) => {
    const myModel = await payment_request.findUnique({
        where: { id },
    });
    const displayRequestType = "Payment Request";
    if (!myModel) {
        error("id", `${displayRequestType} doesn't exist`, next);
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
    await payment_request.update({
        data: {
            approval_status,
            action_note,
            approved_by_id,
        },
        where: { id: id },
    });
    return { success: true };
};
module.exports = {
    projectRequestApprove,
    paymentRequestApprove,
};
