const { error, allModels } = require("../config/config");
const {
    getLeaveBalance,
    isLeaveInTheSamePeriod,
    getLeaveBalance2,
} = require("./approval/leaveDays");
const { patch: updateLeaveTransfer } = require("./hcmEmployeeMasters");
const {
    leave_period,
    leave_transfer,
    attendance_abscence_type,
    leave_assignment,
    leave_plan,
    attendance_payroll,
    overtime,
} = allModels;
const transferApproval = async (leaveList, creator, next) => {
    const leavePeriod = await leave_period.findFirst({ where: { status: 0 } });
    if (!leavePeriod) {
        error("leave_period", "leave period isn't defined", next);
        return false;
    }
    const leaveType = await attendance_abscence_type.findFirst({
        where: {
            is_annual_leave: true,
            status: 0,
        },
        select: {
            id: true,
        },
    });
    if (!leaveType) {
        error("leave_type", "annual leave type isn't declared", next);
        return false;
    }
    let success = false;
    for (let i in leaveList) {
        let updateData = {
            action_date: new Date(),
            status: 0,
        };
        let updateDataProjection = {
            action_date: true,
            status: true,
            leave_request_status: true,
        };
        const leaveTransfer = await leave_transfer.findUnique({
            where: {
                id: leaveList[i].id,
            },
        });
        if (!leaveTransfer) {
            continue;
        }
        if (leaveList[i].approve) {
            const leaveDays = await getLeaveBalance(
                leaveTransfer.employee_id,
                leaveType.id,
                new Date(
                    `${leaveTransfer.from_year}/${
                        leavePeriod.startDate.getMonth() + 1
                    }/${leavePeriod.startDate.getDate()}`
                ),
                next
            );
            if (leaveDays === false) {
                return false;
            }
            if (leaveDays >= leaveTransfer.number_of_days) {
                updateData.leave_request_status = 2;
            } else {
                error(
                    "number_of_days",
                    `total days to be transfered ${leaveTransfer.number_of_days} can't be less than remaining leave balance ${leaveDays}`,
                    next
                );
                return false;
            }
        } else {
            updateData.leave_request_status = 3;
        }
        const result = await updateLeaveTransfer(
            updateDataProjection,
            leaveList[i],
            updateData,
            "leave_transfer",
            creator,
            [],
            next
        );
        if (result == false) return;
        success = true;
    }
    return { success };
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number, delegated_username:string}} param0
 */
const getLeaveTransfer = async ({
    startDate,
    endDate,
    employee_id,
    delegated_username: delegated_user_name,
}) => {
    let employeeFilter = {};
    if (employee_id) {
        employeeFilter.employee_id = employee_id;
    }
    return await leave_transfer.findMany({
        where: {
            delegated_user_name,
            creationDate: {
                gte: startDate,
                lte: endDate,
            },
            ...employeeFilter,
            OR: [{ leave_request_status: 1 }, { leave_request_status: 4 }],
        },
        include: {
            employee: true,
        },
    });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number, delegated_username:string}} param0
 */
const getLeaveAssignment = async ({
    startDate,
    endDate,
    employee_id,
    delegated_username: delegated_user_name,
}) => {
    let employeeFilter = {};
    if (employee_id) {
        employeeFilter.employee_id = employee_id;
    }
    return await leave_assignment.findMany({
        where: {
            delegated_user_name,
            creationDate: {
                gte: startDate,
                lte: endDate,
            },
            ...employeeFilter,
            OR: [{ leave_request_status: 1 }, { leave_request_status: 4 }],
        },
        include: {
            attendance_abscence_type: {
                select: {
                    is_absence_includes_day_off: true,
                    aa_description: true,
                },
            },
            employee: true,
        },
    });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number, delegated_username:string}} param0
 */
const getAttendance = async ({
    startDate,
    endDate,
    employee_id,
    delegated_username,
}) => {
    let employeeFilter = {};
    if (employee_id) {
        employeeFilter.employee_id = employee_id;
    }
    return await attendance_payroll.findMany({
        where: {
            delegated_username,
            date: {
                gte: startDate,
                lte: endDate,
            },
            ...employeeFilter,
            attendance_status: 2,
        },
        include: {
            attendance_abscence_type: true,
            employee: true,
        },
    });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number, delegated_username:string}} param0
 */
const getLeavePlan = async ({
    startDate,
    endDate,
    employee_id,
    delegated_username,
}) => {
    let employeeFilter = {};
    if (employee_id) {
        employeeFilter.employee_id = employee_id;
    }
    return await leave_plan.findMany({
        where: {
            delegated_username,
            creationDate: {
                gte: startDate,
                lte: endDate,
            },
            ...employeeFilter,
            OR: [{ leave_request_status: 1 }, { leave_request_status: 4 }],
        },
        include: {
            employee: true,
        },
    });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number, delegated_username:string}} param0
 */
const getOvertime = async ({
    startDate,
    endDate,
    employee_id,
    delegated_username,
}) => {
    let employeeFilter = {};
    if (employee_id) {
        employeeFilter.employee_id = employee_id;
    }
    return await overtime.findMany({
        where: {
            delegated_username,
            OR: [{ overtime_status: 1 }, { overtime_status: 4 }],
            date: {
                gte: startDate,
                lte: endDate,
            },
            ...employeeFilter,
        },
        include: {
            employee: true,
            overtime_rate: true,
        },
    });
};
/**
 *
 * @param {Array<{id:number,approve:boolean}>} leaveList
 * @param {number} creator
 * @param {Function} next
 */
const attendanceApproval = async (leaveList, creator, next) => {
    for (let i in leaveList) {
        const result = await updateLeaveTransfer(
            {},
            leaveList[i],
            {
                action_date: new Date(),
                status: 0,
                attendance_status: leaveList[i].approve ? 3 : 4,
            },
            "attendance_payroll",
            creator,
            [],
            next
        );
        if (result == false) return;
    }
    return { success: true };
};
/**
 *
 * @param {Array<{id:number,approve:boolean}>} leaveList
 * @param {number} creator
 * @param {Function} next
 */
const overtimeApproval = async (leaveList, creator, next) => {
    for (let i in leaveList) {
        const result = await updateLeaveTransfer(
            {},
            leaveList[i],
            {
                action_date: new Date(),
                status: 0,
                overtime_status: leaveList[i].approve ? 2 : 3,
            },
            "overtime",
            creator,
            [],
            next
        );
        if (result == false) return;
    }
    return { success: true };
};
/**
 *
 * @param {Array<{id:number,approve:boolean}>} leaveList
 * @param {number} creator
 * @param {Function} next
 */
const assignmentApproval = async (leaveList, creator, next) => {
    const leavePeriod = await leave_period.findFirst({ where: { status: 0 } });
    if (!leavePeriod) {
        error("leave_period", "leave period isn't defined", next);
        return false;
    }
    const leaveType = await attendance_abscence_type.findFirst({
        where: {
            is_annual_leave: true,
            status: 0,
        },
        select: {
            id: true,
        },
    });
    if (!leaveType) {
        error("leave_type", "annual leave type isn't declared", next);
        return false;
    }
    let success = false;
    for (let i in leaveList) {
        let updateData = {
            action_date: new Date(),
            status: 0,
        };
        let updateDataProjection = {
            action_date: true,
            status: true,
            leave_request_status: true,
        };
        const leaveAssignment = await leave_assignment.findUnique({
            where: {
                id: leaveList[i].id,
            },
        });
        if (!leaveAssignment) {
            continue;
        }
        if (leaveList[i].approve) {
            updateData.leave_request_status = 2;
            const days = Math.round(
                (leaveAssignment.endDate - leaveAssignment.startDate) /
                    (1000 * 3600 * 24)
            );
            if (days > 100) {
                error(
                    "leaveAssignment",
                    "Total number of days per leave request can not be greater that 100 days",
                    next
                );
                return false;
            }
            const leaveIsInTheSamePeriod = await isLeaveInTheSamePeriod(
                leaveAssignment.startDate,
                leaveAssignment.endDate
            );
            if (!leaveIsInTheSamePeriod) {
                error(
                    "leavePlan",
                    "Date range in the leave must be in the same leave period",
                    next
                );
            }
            const leaveDays = await getLeaveBalance2(
                leaveAssignment.employee_id,
                leaveType.id,
                new Date(
                    `${leaveAssignment.from_year}/${
                        leavePeriod.startDate.getMonth() + 1
                    }/${leavePeriod.startDate.getDate()}`
                ),
                leaveAssignment.endDate,
                leaveAssignment.is_half_day,
                next
            );
            if (leaveDays === "error") {
                return false;
            }
            if (leaveDays) {
                const prevLeaveAssignment = await leave_assignment.findFirst({
                    where: {
                        OR: [
                            {
                                startDate: { lte: leaveAssignment.endDate },
                                endDate: { gte: leaveAssignment.startDate },
                            },
                            {
                                startDate: { gte: leaveAssignment.endDate },
                                endDate: { lte: leaveAssignment.startDate },
                            },
                        ],
                        id: { not: leaveAssignment.id },
                        employee_id: leaveAssignment.employee_id,
                    },
                });
                if (prevLeaveAssignment) {
                    error(
                        "leave_assignment",
                        "Overlapping record exist, please change the date and try again at row " +
                            i,
                        next
                    );
                    return false;
                }
                updateData.leave_request_status = 2;
            } else {
                error(
                    "leave_assignment",
                    "employee does not have sufficient days for the selected leave type! at row " +
                        i,
                    next
                );
                return false;
            }
        } else {
            updateData.leave_request_status = 3;
        }
        const result = await updateLeaveTransfer(
            updateDataProjection,
            leaveList[i],
            updateData,
            "leave_assignment",
            creator,
            [],
            next
        );
        if (result == false) return;
        success = true;
    }
    return { success };
};
/**
 *
 * @param {Array<{id:number,approve:boolean}>} leaveList
 * @param {number} creator
 * @param {Function} next
 */
const planApproval = async (leaveList, creator, next) => {
    const leavePeriod = await leave_period.findFirst({ where: { status: 0 } });
    if (!leavePeriod) {
        error("leave_period", "leave period isn't defined", next);
        return false;
    }
    const leaveType = await attendance_abscence_type.findFirst({
        where: {
            is_annual_leave: true,
            status: 0,
        },
        select: {
            id: true,
        },
    });
    if (!leaveType) {
        error("leave_type", "annual leave type isn't declared", next);
        return false;
    }
    let success = false;
    for (let i in leaveList) {
        let updateData = {
            action_date: new Date(),
            status: 0,
        };
        let updateDataProjection = {
            action_date: true,
            status: true,
            leave_request_status: true,
        };
        const leavePlan = await leave_plan.findUnique({
            where: {
                id: leaveList[i].id,
            },
        });
        if (!leavePlan) {
            continue;
        }
        if (leaveList[i].approve) {
            updateData.leave_request_status = 2;
            const days = Math.round(
                (leavePlan.endDate - leavePlan.startDate) / (1000 * 3600 * 24)
            );
            if (days > 100) {
                error(
                    "leavePlan",
                    "Total number of days per leave request can not be greater that 100 days",
                    next
                );
                return false;
            }
            const leaveIsInTheSamePeriod = await isLeaveInTheSamePeriod(
                leavePlan.startDate,
                leavePlan.endDate
            );
            if (!leaveIsInTheSamePeriod) {
                error(
                    "leavePlan",
                    "Date range in the leave must be in the same leave period",
                    next
                );
                return false;
            }
            const leaveDays = await getLeaveBalance2(
                leavePlan.employee_id,
                leaveType.id,
                new Date(
                    `${leavePlan.from_year}/${
                        leavePeriod.startDate.getMonth() + 1
                    }/${leavePeriod.startDate.getDate()}`
                ),
                leavePlan.endDate,
                leavePlan.is_half_day,
                next
            );
            if (leaveDays === "error") {
                return false;
            }
            if (leaveDays) {
                const prevLeaveAssignment = await leave_assignment.findFirst({
                    where: {
                        OR: [
                            {
                                startDate: { lte: leavePlan.endDate },
                                endDate: { gte: leavePlan.startDate },
                            },
                            {
                                startDate: { gte: leavePlan.endDate },
                                endDate: { lte: leavePlan.startDate },
                            },
                        ],
                        employee_id: leavePlan.employee_id,
                    },
                });
                if (prevLeaveAssignment) {
                    error(
                        "leave_assignment",
                        "Overlapping leave assignment record exist, please change the date and try again at row " +
                            i,
                        next
                    );
                    return false;
                }
                await leave_assignment.create({
                    data: {
                        startDate: leavePlan.startDate,
                        attendance_abscence_type_id: leaveType.id,
                        endDate: leavePlan.endDate,
                        employee_id: leavePlan.employee_id,
                        leave_assignment_type: 3,
                        is_half_day: leavePlan.is_half_day,
                        delegated_user_name: leavePlan.delegated_username,
                        action_date: leavePlan.action_date,
                        leave_request_status: 2,
                        createdBy: String(creator),
                        revisedBy: String(creator),
                    },
                });
            } else {
                error(
                    "number_of_days",
                    "employee does not have sufficient days for the selected leave type! at row " +
                        i,
                    next
                );
                return false;
            }
        } else {
            updateData.leave_request_status = 3;
        }
        const result = await updateLeaveTransfer(
            updateDataProjection,
            leaveList[i],
            updateData,
            "leave_plan",
            creator,
            [],
            next
        );
        if (result == false) return;
        success = true;
    }
    return { success };
};
module.exports = {
    transferApproval,
    planApproval,
    assignmentApproval,
    getLeaveTransfer,
    getLeaveAssignment,
    getLeavePlan,
    getAttendance,
    attendanceApproval,
    getOvertime,
    overtimeApproval,
};
