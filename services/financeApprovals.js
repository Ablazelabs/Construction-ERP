const {
    allModels: { project_request, payment_request },
    error,
} = require("../config/config");

/**
 *
 * @param {number[]} ids
 * @param {2|3} approval_status
 * @param {Function} next
 * @returns
 */
const projectRequestApprove = async (
    ids,
    approval_status,
    approved_by_id,
    action_note,
    next
) => {
    const myModels = await project_request.findMany({
        where: {
            OR: ids.map((elem) => ({ id: elem })),
        },
    });
    for (let i in myModels) {
        const myModel = myModels[i];
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
    }
    //if any error happens its totally 500!
    await project_request.updateMany({
        where: {
            OR: ids.map((elem) => ({ id: elem })),
        },
        data: {
            finance_approval_status: approval_status,
            finance_action_note: action_note,
            finance_approved_by_id: approved_by_id,
        },
    });
    return { success: true };
};
/**
 *
 * @param {number[]} ids
 * @param {2|3} approval_status
 * @param {Function} next
 * @returns
 */
const paymentRequestApprove = async (
    ids,
    approval_status,
    approved_by_id,
    action_note,
    next
) => {
    const myModels = await payment_request.findMany({
        where: {
            OR: ids.map((elem) => ({ id: elem })),
        },
    });
    for (let i in myModels) {
        const myModel = myModels[i];
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
    }
    //if any error happens its totally 500!
    await payment_request.updateMany({
        data: {
            approval_status,
            action_note,
            approved_by_id,
        },
        where: {
            OR: ids.map((elem) => ({ id: elem })),
        },
    });
    return { success: true };
};
module.exports = {
    projectRequestApprove,
    paymentRequestApprove,
};
