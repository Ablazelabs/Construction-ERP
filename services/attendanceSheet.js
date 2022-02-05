const { allModels } = require("../config/config");
const {
    checkForHoliday,
    getEmployeeShiftSchedule,
} = require("./approval/leaveDays");
const { getEmployeeDepartment } = require("./payrollControl");
const { attendance_abscence_type, attendance_payroll, leave_assignment } =
    allModels;
const getRelease = async ({
    startDate,
    endDate,
    business_unit_id,
    employee_id,
    isReleaseSelected,
}) => {
    let attendanceList;
    if (isReleaseSelected) {
        attendanceList = await attendance_payroll.findMany({
            include: {
                employee: true,
                attendance_abscence_type: true,
            },
            where: {
                OR: [
                    { attendance_status: 1 },
                    { attendance_status: 4 },
                    { attendance_status: 2 },
                ],
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: "asc" },
        });
    } else {
        attendanceList = await attendance_payroll.findMany({
            include: {
                employee: true,
                attendance_abscence_type: true,
            },
            where: {
                OR: [{ attendance_status: 1 }, { attendance_status: 4 }],
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { date: "asc" },
        });
    }

    let returned;
    if (!business_unit_id) returned = attendanceList;
    else
        returned = await filterAttendanceByBU(attendanceList, business_unit_id);

    if (employee_id) {
        return returned.filter((e) => e.employee_id == employee_id);
    }
    return returned;
};
const filterAttendanceByBU = async (attendanceList, business_unit_id) => {
    let filteredAttendanceList = [];
    for (let i in attendanceList) {
        const attendance = attendanceList[i];
        let employeeBUnit = await getEmployeeDepartment(attendance.employee_id);
        if (employeeBUnit == business_unit_id)
            filteredAttendanceList.push(attendance);
    }
    return filteredAttendanceList;
};
/**
 *
 * @param {string} delegated_username
 * @param {Array<number>} hcmReleaseList
 * @param {boolean} isRelease
 * @param {number} creator
 */
const postRelease = async (
    delegated_username,
    hcmReleaseList,
    isRelease,
    creator
) => {
    let releaseUpdate = {};
    if (isRelease) {
        releaseUpdate.attendance_status = 2;
    }
    const approvals = await attendance_payroll.updateMany({
        where: {
            OR: hcmReleaseList.map((id) => {
                return { id };
            }),
        },
        data: {
            action_date: new Date(),
            status: 0,
            revisedBy: String(creator),
            delegated_username,
            ...releaseUpdate,
        },
    });
    return { success: Boolean(approvals.count) };
};
const getAAtype = async () => {
    return await attendance_abscence_type.findMany({
        where: {
            is_with_entitlement: false,
            is_with_quota: false,
            is_regular_attendance: false,
            aa_type: 1,
        },
    });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, employee_id:number}} param0
 */
const getCreate = async ({ startDate, endDate, employee_id }) => {
    let totalWorkedHour = "";
    let attendancePayrollId = "";
    let isApproved = false;
    let isAbsence = false;
    let attendanceSheetList = [];
    const empAttendancePayrollList = await attendance_payroll.findMany({
        where: { employee_id },
        include: { attendance_abscence_type: true },
    });
    const aaTypeList = getDistinctAAType(
        startDate,
        endDate,
        employee_id,
        empAttendancePayrollList
    );
    for (let r = 0; r < 6; r++) {
        let attendanceSheet = {};
        if (aaTypeList != null && aaTypeList.Count > 0 && aaTypeList.Count > r)
            attendanceSheet.AAType = `${aaTypeList[r]}`;

        attendanceSheet.AADateHours = [];
        attendanceSheet.targetHours = [];
        attendanceSheet.actualHours = [];

        let sDate = startDate;
        let i = 0;
        const diffDays = (endDate - startDate) / (1000 * 3600 * 24);
        while (i <= diffDays) {
            if (r == 0) {
                //get target hours
                attendanceSheet.targetHours.push({
                    date: dateAndMonth(sDate),
                    hours: await getAttendanceTarget(employee_id, sDate),
                });
                attendanceSheet.actualHours.push({
                    date: dateAndMonth(sDate),
                    hours: getAttendanceActual(
                        employee_id,
                        sDate,
                        empAttendancePayrollList
                    ),
                });
            }
            totalWorkedHour = "";
            attendancePayrollId = "";
            isApproved = false;
            isAbsence = false;

            if (attendanceSheet.AAType) {
                var prevAttendance = empAttendancePayrollList.find(
                    ({ date, attendance_abscence_type_id }) => {
                        return (
                            payrollDate.getFullYear() === date.getFullYear() &&
                            payrollDate.getMonth() === date.getMonth() &&
                            payrollDate.getDate() === date.getDate() &&
                            attendance_abscence_type_id === aaTypeList[r]
                        );
                    }
                );
                if (prevAttendance) {
                    if (prevAttendance.attendance_abscence_type.aa_type == 2)
                        isAbsence = true;

                    totalWorkedHour = `${prevAttendance.total_worked_hours}`;
                    attendancePayrollId = `${prevAttendance.id}`;
                    isApproved =
                        prevAttendance.attendance_status == 3 ||
                        prevAttendance.attendance_status == 2 ||
                        prevAttendance.attendance_status == 5;
                }

                var regularAAType = await attendance_abscence_type.findFirst({
                    where: {
                        status: 0,
                        id: aaTypeList[r],
                        is_regular_attendance: true,
                    },
                });
                if (regularAAType) isApproved = true;
            }
            attendanceSheet.AADateHours.push({
                date: sDate,
                isAbsence,
                hours: totalWorkedHour,
                attendance_payroll_id: attendancePayrollId,
                isApproved,
            });

            sDate.setDate(sDate.getDate() + 1);
            i++;
        }
        attendanceSheetList.push(attendanceSheet);
    }
    return attendanceSheetList;
};
/**
 *
 * @param {number} employee_id
 * @param {Date} date
 * @param {Array<import("@prisma/client").attendance_payroll & {attendance_abscence_type:import("@prisma/client").attendance_abscence_type}>} empAttendancePayrollList
 */
const getAttendanceActual = (employee_id, date, empAttendancePayrollList) => {
    const attendances = empAttendancePayrollList.filter(
        ({ date: payrollDate }) =>
            payrollDate.getFullYear() === date.getFullYear() &&
            payrollDate.getMonth() === date.getMonth() &&
            payrollDate.getDate() === date.getDate()
    );
    if (attendances && employee_id) {
        let actual = 0;
        for (let i in attendances) {
            const aa = attendances[i];
            if (aa.attendance_abscence_type.aa_type == 2)
                actual -= aa.total_worked_hours;
            else actual += aa.total_worked_hours;
        }
        return actual;
    }
    return 0;
};
/**
 *
 * @param {number} employee_id
 * @param {Date} date
 */
const getAttendanceTarget = async (employee_id, date) => {
    const attendance = await getEmployeeShiftSchedule2(employee_id, date);
    if (attendance && attendance.isWorkingDate) {
        let target = attendance.MinWorkingHrs * 60;
        if (attendance.IsHalfDay) target = target / 2 + 60; //add one hour
        return (target /= 60);
    }
    return 0;
};
/**
 *
 * @param {number} employee_id
 * @param {Date} date
 */
const getEmployeeShiftSchedule2 = async (employee_id, date) => {
    const holiday = await checkForHoliday(date);
    const shiftSchedule = await getEmployeeShiftSchedule(date, employee_id);
    const leaveTaken = await leave_assignment.findFirst({
        where: {
            employee_id,
            startDate: { lte: date },
            endDate: { gte: date },
            leave_request_status: 2,
        },
    });
    let empShiftResponse = {};
    if (!shiftSchedule) {
        return {
            message: "No shift schedule, the employee is on day off",
        };
    } else if (leaveTaken && leaveTaken.is_half_day == false) {
        return {
            message: "employee is on leave",
        };
    } else if (holiday && shiftSchedule) {
        //ignore half day holiday, half day shift
        //ignore full day holiday, full day shift
        //ignore full day holiday, half day shift

        if (holiday.is_half_day && !shiftSchedule.is_half_day) {
            //half day holiday, full shift
            if (leaveTaken?.is_half_day == true)
                empShiftResponse.isHalfDay = true;
        }
    } else if (!holiday && shiftSchedule) {
        if (shiftSchedule.is_half_day) {
            //half day shift
            if (leaveTaken?.is_half_day == true) {
                return {
                    message: "Employee is on leave",
                };
            }
        } //full day shift
        else {
            if (leaveTaken?.is_half_day == true)
                empShiftResponse.isHalfDay = true;
        }
    } //neither holiday nor working day=> day off
    else {
        return {
            message: "Employee is on day off",
        };
    }

    empShiftResponse.isWorkingDate = true;
    empShiftResponse.AttendanceDate = date;
    empShiftResponse.EmployeeId = `${employee_id}`;
    empShiftResponse.StartTime = [date, shiftSchedule.clock_in];
    empShiftResponse.EndTime = [date, shiftSchedule.clock_out];
    empShiftResponse.MinWorkingHrs = shiftSchedule.min_working_hours;

    return empShiftResponse;
};
const dateAndMonth = (date) => {
    let str = date.toDateString().split(" ");
    return `${str[1]}, ${str[2]}`;
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} employee_id
 * @param {Array<import("@prisma/client").attendance_payroll & {attendance_abscence_type:import("@prisma/client").attendance_abscence_type}>} empAttendancePayrollList
 */
const getDistinctAAType = (
    startDate,
    endDate,
    employee_id,
    empAttendancePayrollList
) => {
    const tempArray = empAttendancePayrollList.filter((element) => {
        return element.date > startDate && element.date <= endDate;
    });
    const aaTypes = tempArray.map((elem) => elem.attendance_abscence_type_id);
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    const uniqueIds = aaTypes.filter(onlyUnique);
    return uniqueIds;
};
/**
 *
 * @param {string} delegated_username
 * @param {Array<{id:number, aaDateHours:Array<{attendance_payroll_id:number, date:Date, hours:number}>}>} attendanceList
 * @param {number} employee_id
 * @param {number} creator
 */
const postCreate = async (
    delegated_username,
    attendanceList,
    employee_id,
    creator
) => {
    for (let i in attendanceList) {
        const attendance = attendanceList[i];
        const aaTypeRegular = await attendance_abscence_type.findFirst({
            where: { id: attendance.id, is_regular_attendance: true },
        });
        const attendanceExists = await attendance_abscence_type.findFirst({
            where: { id: attendance.id },
            select: { id: true },
        });
        if (aaTypeRegular) {
            continue;
        }
        for (let k in attendance.aaDateHours) {
            const dateHoursVal = attendance.aaDateHours[k];
            let prevAttendance;
            if (dateHoursVal.attendance_payroll_id) {
                prevAttendance = await attendance_payroll.findUnique({
                    where: { id: dateHoursVal.attendance_payroll_id },
                });
            }
            if (prevAttendance) {
                if (
                    prevAttendance.attendance_status == 5 &&
                    prevAttendance.attendance_status == 3 &&
                    prevAttendance.attendance_status == 3
                )
                    continue;
                if (dateHoursVal.hours <= 0 || !attendanceExists) {
                    await attendance_payroll.delete({
                        where: { id: prevAttendance.id },
                    });
                } else {
                    await attendance_payroll.update({
                        where: {
                            id: prevAttendance.id,
                        },
                        data: {
                            revisedBy: String(creator),
                            status: 0,
                            attendance_abscence_type_id: attendance.id,
                            total_worked_hours: dateHoursVal.hours,
                            delegated_username,
                        },
                    });
                }
            } else {
                if (attendanceExists && dateHoursVal.hours > 0) {
                    await attendance_payroll.create({
                        data: {
                            startDate: new Date(),
                            endDate: new Date("9999/12/31"),
                            createdBy: String(creator),
                            revisedBy: String(creator),
                            employee_id,
                            date: dateHoursVal.date,
                            attendance_status: 1,
                            attendance_abscence_type_id: attendance.id,
                            delegated_username,
                        },
                    });
                }
            }
        }
    }
    return { success: true };
};
module.exports = {
    getRelease,
    postRelease,
    getCreate,
    postCreate,
    getAAtype,
};
