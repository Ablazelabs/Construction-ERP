const {
    allModels: {
        project_request,
        project,
        project_edit_request,
        user,
        project_participation_request,
    },
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
const patch = async (id, approval_status, action_note, creator, next) => {
    const approver = await user.findUnique({
        where: { id: creator },
        include: { employee: true, role: { include: { privileges: true } } },
    });
    if (!approver) {
        return error("user", "user not found!", next, 401);
    }
    if (!approver.employee) {
        return error("user", "user isn't registered as an employee", next, 401);
    }
    const myModel = await project_request.findUnique({
        select: {
            approval_status: true,
            isProtectedForEdit: true,
            request_type: true,
            project_id: true,
            checked_by_id: true,
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
    if (
        myModel.approval_status !== 1 &&
        myModel.approval_status !== 4 &&
        !(myModel.approval_status === 2 && myModel.checked_by_id === null)
    ) {
        console.log(myModel.approval_status, myModel.checked_by_id);
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
    const approverEmpId = approver.employee_id;
    let approvedOrChecked = {};
    const userPrivileges = approver?.role?.privileges?.map(
        (elem) => elem.action
    );
    if (!userPrivileges) {
        return error(
            "user",
            "you don't have enough privileges to approve, check or reject this request!"
        );
    }
    const foundPrivilege = userPrivileges.find(
        (elem) =>
            elem === "PROJECT_ONE" ||
            elem === "HEAD" ||
            elem === "admin" ||
            elem === "super"
    );
    if (!foundPrivilege) {
        return error(
            "user",
            "you don't have enough privileges to approve, check or reject this request!",
            next
        );
    }
    approvedOrChecked =
        foundPrivilege === "PROJECT_ONE"
            ? {
                  checked_by_id: approverEmpId,
                  checker_action_note: action_note,
                  approval_status:
                      approval_status === 3
                          ? 3
                          : myModel.approval_status === 2
                          ? 2
                          : 4,
              }
            : {
                  action_note,
                  approved_by_id: approverEmpId,
                  approval_status: approval_status,
              };
    await project_request.update({
        data: {
            action_taken_date: new Date(),
            ...approvedOrChecked,
        },
        where: { id },
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
    const myModel = await project_edit_request.findUnique({ where: { id } });
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

/**
 *
 * @param {number} id
 * @param {number} approval_status
 * @param {Function} next
 * @returns
 */
const participationRequest = async (id, approval_status, next) => {
    const myModel = await project_participation_request.findUnique({
        where: { id },
    });
    if (!myModel) {
        error("id", `project participation request doesn't exist`, next);
        return false;
    }
    if (myModel.approval_status !== 1) {
        error(
            "id",
            `this project participation request has already been ${
                ["", "", "approved", "rejected"][myModel.approval_status]
            }`,
            next
        );
        return false;
    }
    await project_participation_request.update({
        where: { id },
        data: { approval_status },
    });
    return { success: true };
};

module.exports = {
    patch,
    editRequest,
    participationRequest,
};
