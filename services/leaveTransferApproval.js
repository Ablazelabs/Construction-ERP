const { error, allModels } = require("../config/config");
const getLeaveBalance = require("./approval/leaveDays");
const { patch: updateLeaveTransfer } = require("./hcmEmployeeMasters");
const {
    action_type,
    employee_action,
    org_assignment,
    leave_period,
    leave_transfer,
    attendance_abscence_type,
} = allModels;
module.exports = async (leaveList, creator, next) => {
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
        await updateLeaveTransfer(
            updateDataProjection,
            leaveList[i],
            updateData,
            "leave_transfer",
            creator,
            [],
            next
        );
        success = true;
    }
    return { success };
};
