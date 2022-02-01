const { allModels } = require("../config/config");
const { getEmployeeDepartment } = require("./payrollControl");
const { attendance_abscence_type, attendance_payroll } = allModels;
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

    return returned.filter((e) => e.employee_id == employee_id);
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
const getCreate = async ({ startDate, endDate, employee_id }) => {
    return [];
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
};
