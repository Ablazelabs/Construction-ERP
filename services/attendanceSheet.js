const { allModels } = require("../config/config");
const {
    checkForHoliday,
    getEmployeeShiftSchedule,
} = require("./approval/leaveDays");
const { getEmployeeDepartment } = require("./payrollControl");
const {
    attendance_abscence_type,
    attendance_payroll,
    leave_assignment,
    employee,
} = allModels;
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
 * @param {{date:Date, business_unit_id:number, employee_id:number}} param0
 */
const getCreate = async ({ date, business_unit_id, employee_id }) => {
    let totalWorkedHour = "";
    let attendancePayrollId = "";
    let isApproved = false;
    let isAbsence = false;
    let attendanceSheetList = [];
    newWhere = {};
    if (employee_id) {
        newWhere = { id: employee_id };
    }
    if (business_unit_id) {
        newWhere = {
            ...newWhere,
            employee_action: {
                some: {
                    org_assignment: {
                        some: {
                            business_unit_id,
                        },
                    },
                },
            },
        };
    }
    // const empAttendancePayrollList = await attendance_payroll.findMany({
    //     where: {
    //         ...newWhere,
    //     },
    //     include: { attendance_abscence_type: true, employee: true },
    // });
    const employees = await employee.findMany({
        where: {
            ...newWhere,
        },
        include: {
            attendance_payroll: {
                include: {
                    attendance_abscence_type: true,
                },
            },
        },
    });
    const employeesWithFilteredDate = employees.map((elem) => {
        attendanceOnDate = elem.attendance_payroll.find(
            (apayroll) =>
                apayroll.date.getFullYear() === date.getFullYear() &&
                apayroll.date.getMonth() === date.getMonth() &&
                apayroll.date.getDate() === date.getDate()
        );
        return {
            ...elem,
            aaType: attendanceOnDate,
        };
    });
    // const aaTypeList = getDistinctAAType(
    //     startDate,
    //     endDate,
    //     employee_id,
    //     empAttendancePayrollList
    // );
    // const targetHours = attendanceSheetList[0].targetHours;
    // const actualHours = attendanceSheetList[0].actualHours;
    // const AADateHours = attendanceSheetList.map(
    //     ({ AADateHours: aaDateHours, AAType }) => {
    //         return { days: aaDateHours, AAType };
    //     }
    // );
    return { employees: employeesWithFilteredDate };
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
 * It returns an object with a message property if the employee is on leave or day off, otherwise it
 * returns an object with the employee's shift schedule.
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
        return element.date >= startDate && element.date <= endDate;
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
 * @param {Array<{id:number, employee: number, date:Date}>} attendanceList
 * @param {number} creator
 */
const postCreate = async (delegated_username, attendanceList, creator) => {
    for (let i in attendanceList) {
        const attendance = attendanceList[i];
        const employee_id = attendance.employee;
        const aaTypeRegular = await attendance_abscence_type.findFirst({
            where: { id: attendance.id, is_regular_attendance: true },
        });
        const attendanceExists = await attendance_abscence_type.findFirst({
            where: { id: attendance.id },
        });
        // if (aaTypeRegular) {
        //     console.log("i dont like regular");
        //     continue;
        // }
        let prevAttendance = await attendance_payroll.findFirst({
            where: {
                employee_id,
                date: {
                    gte: new Date(
                        attendance.date.getFullYear(),
                        attendance.date.getMonth(),
                        attendance.date.getDate()
                    ),
                    lt: new Date(
                        attendance.date.getFullYear(),
                        attendance.date.getMonth(),
                        attendance.date.getDate() + 1
                    ),
                },
            },
        });
        if (prevAttendance) {
            if (
                prevAttendance.attendance_status == 5 &&
                prevAttendance.attendance_status == 3 &&
                prevAttendance.attendance_status == 3
            )
                continue;
            if (!attendanceExists) {
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
                        total_worked_hours: attendanceExists.worked_time,
                        delegated_username,
                    },
                });
            }
        } else {
            if (attendanceExists) {
                await attendance_payroll.create({
                    data: {
                        startDate: new Date(),
                        endDate: new Date("9999/12/31"),
                        createdBy: String(creator),
                        revisedBy: String(creator),
                        employee_id,
                        date: attendance.date,
                        total_worked_hours: attendanceExists.worked_time,
                        attendance_status: 1,
                        attendance_abscence_type_id: attendance.id,
                        delegated_username,
                    },
                });
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
