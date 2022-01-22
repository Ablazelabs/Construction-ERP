const { allModels, error } = require("../../config/config");
const {
    attendance_abscence_type,
    employee,
    leave_period,
    leave_assignment,
    shift_assignment,
    shift_schedule_dtl,
    holiday_calendar,
    leave_entitlement,
    leave_transfer,
} = allModels;
const getLeaveBalance = async (employeeId, leaveTypeId, startDate, next) => {
    const leaveType = await attendance_abscence_type.findFirst({
        where: {
            id: leaveTypeId,
        },
    });
    if (!leaveType) {
        error("leave_type_id", "no attendance leave type exists", next);
        return false;
    }
    const employeeOne = await employee.findFirst({
        where: {
            id: employeeId,
        },
    });
    if (!employeeOne) {
        error("employee", "no employee exists", next);
        return false;
    }
    if (await isLeaveWithQuota(leaveType)) {
        return Infinity;
    }
    const leaveTakenDays = await getLeaveTakenDays(
        employeeOne,
        leaveType,
        startDate,
        next
    );
    if (leaveTakenDays === false) {
        return false;
    }
    const leaveEntitlementDays = await getLeaveEntitlementDays(
        employeeOne,
        leaveType,
        startDate,
        next
    );
    if (leaveTakenDays === false) {
        return false;
    }
    let usedLeaveTransferDays = 0,
        gainedLeaveTransferDays = 0,
        totalBalanceDays = 0;
    if (leaveType.is_annual_leave) {
        const usedLeaveTransfer = await leave_transfer.findMany({
            where: {
                employee_id: employeeOne.id,
                from_year: startDate.getFullYear(),
                leave_request_status: 2,
            },
            select: {
                number_of_days: true,
            },
        });
        for (let i in usedLeaveTransfer) {
            usedLeaveTransferDays += usedLeaveTransfer[i].number_of_days;
        }
        const gainedLeaveTransfer = await leave_transfer.findMany({
            where: {
                employee_id: employeeOne.id,
                to_year: startDate.getFullYear(),
                leave_request_status: 2,
            },
            select: {
                number_of_days: true,
            },
        });
        for (let i in gainedLeaveTransfer) {
            gainedLeaveTransferDays += gainedLeaveTransfer[i].number_of_days;
        }
        totalBalanceDays =
            leaveEntitlementDays +
            gainedLeaveTransferDays -
            (leaveTakenDays + usedLeaveTransferDays);
    }
    return totalBalanceDays;
};
const getLeaveEntitlementDays = async (
    employee,
    leaveType,
    startDate,
    next
) => {
    let totalEntitlement = 0;
    if (leaveType.is_with_entitlement) {
        const leaveEntitlement = await leave_entitlement.findFirst({
            where: {
                employee_id: employee.id,
                attendance_abscence_type_id: leaveType.id,
            },
        });
        if (!leaveEntitlement) {
            error(
                "employee_id",
                `Employee is not entitled for this leave type ${leaveType.id},${employee.id}`,
                next
            );
            return false;
        }
    }
    if (leaveType.is_annual_leave) {
        let serviceMonths = getEmployeeServiceMonth(employee, startDate);
        let serviceYears = getEmployeeServiceYear(employee, startDate);
        if (serviceMonths > 0) {
            serviceYears += 1;
        }
        if (serviceYears > 0) {
            serviceYears -= 1;
        }
        let numberOfInc = 1;
        if (leaveType.number_of_increment_each_year !== undefined) {
            numberOfInc = leaveType.number_of_increment_each_year;
        }
        totalEntitlement =
            leaveType.number_of_days + serviceYears * numberOfInc;
    } else {
        totalEntitlement = leaveType.number_of_days;
    }
    return totalEntitlement;
};
const isLeaveWithQuota = async (leaveType) => {
    return Boolean(leaveType?.is_with_quota);
};
const getEmployeeServiceMonth = (employee, compDate) => {
    if (compDate < employee.startDate) {
        return 0;
    } else {
        let months = compDate.getMonth() - employee.startDate.getMonth();
        if (months < 0) {
            months += 12;
        }
        return months;
    }
};
const getEmployeeServiceYear = (employee, compDate) => {
    if (compDate <= employee.StartDate) {
        return 0;
    } else {
        var years = compDate.getYear() - employee.startDate.getYear();
        return years + employee.prev_employment_leave_days;
    }
};
const getLeaveTakenDays = async (employee, leaveType, startDate, next) => {
    let leavePeriod = await leave_period.findFirst();
    let totalLeaveTakenDays = 0;
    if (!leavePeriod) {
        error("leave_type", "doesn't exist", next);
    }
    leavePeriod.startDate = new Date(startDate);
    leavePeriod.endDate = new Date(
        `${startDate.getFullYear()}/${
            leavePeriod.endDate.getMonth() + 1
        }/${leavePeriod.endDate.getDate()}`
    );
    const leaveAssignments = await leave_assignment.findMany({
        where: {
            startDate: {
                gte: leavePeriod.startDate,
            },
            endDate: {
                lte: leavePeriod.endDate,
            },
            employee_id: employee.id,
            attendance_abscence_type_id: leaveType.id,
            leave_request_status: 2,
        },
    });
    for (let i in leaveAssignments) {
        const leaveAssignment = leaveAssignments[i];
        for (
            let i = new Date(leaveAssignment.startDate);
            i < leaveAssignment.endDate;
            i.setDate(i.getDate() + 1)
        ) {
            const shiftSchedule = await getEmployeeShiftSchedule(
                i,
                employee.id
            );
            //checkforholiday
            const holiday = await checkForHoliday(i);

            if (!shiftSchedule) {
                continue; //day off
            } else if (
                leaveAssignment.attendance_abscence_type
                    .is_absence_includes_day_off
            ) {
                if (leaveAssignment.is_half_day) {
                    totalLeaveTakenDays += 0.5;
                } else {
                    totalLeaveTakenDays += 1;
                }
            } else if (holiday && shiftSchedule) {
                if (holiday.is_half_day && !shiftSchedule.is_half_day) {
                    if (!leaveAssignment.is_half_day) {
                        totalLeaveTakenDays += 0.5;
                    }
                }
            } else if (!holiday && shiftSchedule) {
                if (shiftSchedule.is_half_day) {
                    totalLeaveTakenDays += 0.5;
                } else {
                    if (leaveAssignment.is_half_day) {
                        totalLeaveTakenDays += 0.5;
                    } else {
                        totalLeaveTakenDays += 1;
                    }
                }
            } else {
                continue;
            }
        }
    }
    return totalLeaveTakenDays;
};
const checkForHoliday = async (date) => {
    const holidayCalendar = await holiday_calendar.findFirst({
        where: {
            startDate: {
                gte: date,
                lt: new Date(date).setDate(date.getDate() + 1),
            },
            status: 0,
        },
    });
    if (holidayCalendar) {
        return holidayCalendar;
    }
    const holidayList = await holiday_calendar.findMany({
        where: {
            holiday: {
                isRecurring: true,
                staus: 0,
            },
        },
    });
    if (holidayList.length) {
        for (let i in holidayList) {
            let recurringHoliday = holidayList[i];
            if (
                date.getFullYear() % 4 == 3 &&
                date.getMonth() >= 8 &&
                date.getDate() >= 12
            ) {
                if (
                    !(
                        (recurringHoliday.date.getFullYear() % 4 == 3 &&
                            recurringHoliday.date.getMonth() >= 8 &&
                            recurringHoliday.date.getDate() >= 12) ||
                        (recurringHoliday.date.getFullYear() % 4 == 0 &&
                            recurringHoliday.date.getMonth() >= 0 &&
                            recurringHoliday.date.getMonth() < 2)
                    )
                ) {
                    recurringHoliday.date.setDate(
                        recurringHoliday.date.getDate() + 1
                    );
                }
            } else if (
                (recurringHoliday.date.getFullYear() % 4 == 3 &&
                    recurringHoliday.date.getMonth() >= 8 &&
                    recurringHoliday.date.getDate() >= 12) ||
                (recurringHoliday.date.getFullYear() % 4 == 0 &&
                    recurringHoliday.date.getMonth() >= 0 &&
                    recurringHoliday.date.getMonth() <= 1)
            ) {
                if (
                    !(
                        (date.getFullYear() % 4 == 3 &&
                            date.getMonth() >= 08 &&
                            date.getDay() >= 12) ||
                        (date.getFullYear() % 4 == 0 &&
                            date.getMonth() >= 0 &&
                            date.getMonth() <= 1)
                    )
                ) {
                    recurringHoliday.date.setDate(
                        recurringHoliday.date.getDate() - 1
                    );
                }
            }
            recurringHoliday.date = new Date(
                `${date.getFullYear()}/${
                    recurringHoliday.date.getMonth() + 1
                }/${recurringHoliday.date.getDate()}`
            );
            if (datesAreEqual(recurringHoliday.date, date)) {
                return recurringHoliday;
            }
        }
    }
};
const datesAreEqual = (date1, date2) => {
    return (
        date1.getFullYear() == date2.getFullYear() &&
        date1.getMonth() == date2.getMonth() &&
        date1.getDate() == date2.getDate()
    );
};
/**
 *
 * @param {Date} date
 * @param {number} employeeId
 */
const getEmployeeShiftSchedule = async (date, employeeId) => {
    const shiftAssignment = await shift_assignment.findFirst({
        where: {
            startDate: {
                lte: date,
            },
            endDate: {
                gte: date,
            },
            employee_id: employeeId,
        },
    });
    if (!shiftAssignment) {
        return undefined;
    }
    const shiftSchedules = await shift_schedule_dtl.findMany({
        where: {
            shift_schedule_hdr_id: shiftAssignment.shift_schedule_hdr_id,
        },
        include: {
            shift_schedule_hdr: {
                include: {
                    sub_shift_group: true,
                },
            },
        },
    });
    for (let i in shiftSchedules) {
        const shiftSchedule = shiftSchedules[i];
        if (checkShiftDay(date, shiftSchedule)) {
            return shiftSchedule;
        }
    }
    //continue from here
};
/**
 *
 * @param {Date} date
 * @param {import("@prisma/client").shift_schedule_dtl} shiftSchedule
 */
const checkShiftDay = (date, shiftSchedule) => {
    const fDay = date.getDay() + 1;
    const lDay = shiftSchedule.working_day;
    if (fDay === lDay) {
        return true;
    }
    return false;
};
/**
 *
 * @param {Date} date
 * @param {import("@prisma/client").shift_schedule_dtl} shiftSchedule
 */
const getShiftDay = (date, shiftSchedule) => {
    const status = checkShiftDay(date, shiftSchedule);
    if (status) {
        if (shiftSchedule.is_half_day) {
            return 0.5;
        }
        return 1;
    } else {
        return 0;
    }
};
//users leavedays, payrollcontrol
module.exports = {
    getLeaveBalance,
    getEmployeeShiftSchedule,
    getShiftDay,
    checkForHoliday,
};
