const { allModels, error } = require("../config/config");
const {
    payroll_period_autogen,
    payroll_frequency_type,
    general_ledger,
    employee,
    hcm_configuration,
    payroll_summary,
    payroll_detail,
    payroll_log,
    payroll_processing_log,
    employee_back_penality_deduction,
    employee_pay_scale,
    paygrade_scale,
    payroll_location_setting,
    employee_action,
    leave_assignment,
    attendance_payroll,
    overtime,
    employee_salary_component,
    paygrade_salary_component,
    salary_adjustment,
} = allModels;
const {
    getEmployeeShiftSchedule,
    getShiftDay,
    checkForHoliday,
} = require("./approval/leaveDays");
/**
 *
 * @param {Function} next express next middleware function
 * @param {"run"|"lock"} runOrLock either run or lock
 */
const getLockandRun = async (next, runOrLock) => {
    const payrollPeriod = await payroll_period_autogen.findMany({
        where: { is_processing_started: true },
    });
    if (payrollPeriod.length) {
        error(
            "payroll",
            `You can not ${runOrLock} payroll right now, an already started processing is not completed and it is still running`,
            next
        );
        return false;
    }
    //TODO this is cool but make a route add this as a middleware cause the get of payroll frequency type already allows filter and stuff
    return await payroll_frequency_type.findMany({ where: { status: 0 } });
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0 reqbody
 * @param {number} creator creator id
 * @param {Function} next express next middleware function
 * @returns object | false
 */
const postLock = async (
    { startDate, endDate, payroll_frequency_type_id },
    creator,
    next
) => {
    const payrollPeriod = await payroll_period_autogen.findFirst({
        where: {
            startDate: {
                gte: startDate,
                lt: new Date(
                    new Date(startDate).setDate(startDate.getDate() + 1)
                ),
            },
            endDate: {
                gte: endDate,
                lt: new Date(new Date(endDate).setDate(endDate.getDate() + 1)),
            },
            payroll_frequency_type_id: payroll_frequency_type_id,
        },
        select: {
            is_payroll_locked: true,
            is_payroll_posted: true,
            payroll_frequency_type: true,
            id: true,
        },
        orderBy: [{ startDate: "asc" }],
    });
    if (!payrollPeriod) {
        error(
            "payroll_period_autogen",
            "payroll period doesn't exist, please adjust ur search criteria",
            next
        );
        return false;
    }
    if (payrollPeriod.is_payroll_locked) {
        error(
            "payroll_period_autogen",
            "Payroll data is locked for the selected period",
            next
        );
        return false;
    }
    if (!payrollPeriod.is_payroll_posted) {
        const postingRef = `${
            payrollPeriod.payroll_frequency_type.payroll_frequency_desc
        }/${startDate.toLocaleDateString()}/${endDate.toLocaleDateString()}`;
        const gl = await general_ledger.findFirst({
            where: { description: postingRef },
        });
        if (gl) {
            await payroll_period_autogen.update({
                where: { id: payrollPeriod.id },
                data: { is_payroll_posted: true },
            });
            //remove the await if it takes too much time(but its async so it wont hold other requests!)
            await lockAttendanceOverTime(
                startDate,
                endDate,
                payroll_frequency_type_id,
                creator
            );
            return { success: true };
        }
    }
    error(
        "payroll_period_autogen",
        "Payroll is not run/posted for the selected period",
        next
    );
    return false;
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0 reqbody
 * @param {number} creator creator id
 * @param {boolean} reprocess if sent from prompt(yes)
 * @param {Function} next express next middleware function
 * @returns object | false
 */
const postRun = async (
    { startDate, endDate, payroll_frequency_type_id },
    creator,
    reprocess,
    next
) => {
    const hcmConfig = await hcm_configuration.findFirst();
    if (!hcmConfig) {
        next(
            "hcm_configuration",
            "HCM Configuration Must be maintained first",
            next
        );
        return false;
    }
    const payrollPeriod = await payroll_period_autogen.findFirst({
        where: {
            startDate: {
                gte: startDate,
                lt: new Date(
                    new Date(startDate).setDate(startDate.getDate() + 1)
                ),
            },
            endDate: {
                gte: endDate,
                lt: new Date(new Date(endDate).setDate(endDate.getDate() + 1)),
            },
            payroll_frequency_type_id: payroll_frequency_type_id,
        },
        select: {
            is_payroll_locked: true,
            is_payroll_posted: true,
            payroll_frequency_type: true,
            id: true,
            is_payroll_processed: true,
            is_payroll_interfaced_to_FI: true,
        },
        orderBy: [{ startDate: "asc" }],
    });
    if (!payrollPeriod) {
        error(
            "payroll_period_autogen",
            "payroll period doesn't exist, please adjust ur search criteria",
            next
        );
        return false;
    }
    if (!payrollPeriod.is_payroll_posted) {
        const postingRef = `${
            payrollPeriod.payroll_frequency_type.payroll_frequency_desc
        }/${startDate.toLocaleDateString()}/${endDate.toLocaleDateString()}`;
        const gl = await general_ledger.findFirst({
            where: { description: postingRef },
        });
        if (gl) {
            await payroll_period_autogen.update({
                where: { id: payrollPeriod.id },
                data: { is_payroll_posted: true },
            });
            //means payroll is already processed
            error(
                "payroll_period_autogen",
                "Payroll is already proccessed and posted to GL for the selected period",
                next
            );
            return false;
        }
    }
    if (
        payrollPeriod.is_payroll_processed ||
        payrollPeriod.is_payroll_interfaced_to_FI
    ) {
        if (!reprocess) {
            return {
                success: false,
                message:
                    "Payroll is already proccessed, do you want to re-process for the selected period?",
            };
        }
    }
    if (reprocess || !payrollPeriod.is_payroll_processed) {
        await processPayroll(
            { startDate, endDate, payroll_frequency_type_id },
            payrollPeriod,
            creator
        );
    }
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0
 * @param {number} creator
 */
const lockAttendanceOverTime = async (
    { startDate, endDate, payroll_frequency_type_id },
    creator
) => {
    const employees = await employee.findMany({
        where: {
            employee_pay_frequency: {
                some: {
                    payroll_frequency_type_id: payroll_frequency_type_id,
                    startDate: {
                        lte: startDate,
                    },
                    endDate: {
                        gte: endDate,
                    },
                },
            },
        },
        select: {
            id: true,
        },
    });
    for (let i in employees) {
        const currentEmp = employees[i];
        await employee.update({
            where: {
                id: currentEmp.id,
            },
            data: {
                attendance_payroll: {
                    updateMany: {
                        where: {
                            startDate: {
                                gte: startDate,
                            },
                            endDate: {
                                lte: endDate,
                            },
                            attendance_status: 3,
                        },
                        data: {
                            revisedBy: String(creator),
                            attendance_status: 5,
                        },
                    },
                },
                overtime: {
                    updateMany: {
                        where: {
                            startDate: {
                                gte: startDate,
                            },
                            endDate: {
                                lte: endDate,
                            },
                            overtime_status: 2,
                        },
                        data: {
                            revisedBy: String(creator),
                            overtime_status: 5,
                        },
                    },
                },
                employee_back_penality_deduction: {
                    updateMany: {
                        where: {
                            startDate: {
                                gte: startDate,
                                lt: new Date(
                                    new Date(startDate).setDate(
                                        startDate.getDate() + 1
                                    )
                                ),
                            },
                            endDate: {
                                gte: endDate,
                                lt: new Date(
                                    new Date(endDate).setDate(
                                        endDate.getDate() + 1
                                    )
                                ),
                            },
                            is_payroll_posted: false,
                        },
                        data: {
                            revisedBy: String(creator),
                            is_payroll_posted: true,
                        },
                    },
                },
            },
        });
    }
    return { success: true };
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0
 * @param {import("@prisma/client").payroll_period_autogen} payrollPeriod
 * @param {import("@prisma/client").hcm_configuration} hcmConfig
 * @param {number} creator
 */
const processPayroll = async (
    { startDate, endDate, payroll_frequency_type_id },
    payrollPeriod,
    hcmConfig,
    creator
) => {
    await payroll_period_autogen.update({
        where: {
            id: payrollPeriod.id,
        },
        data: {
            is_processing_started: true,
        },
    });

    const payrollSummaries = (
        await payroll_summary.findMany({ select: { id: true } })
    ).map(({ id }) => {
        return { payroll_summary_id: id };
    });
    await payroll_detail.deleteMany({
        where: {
            OR: payrollSummaries,
        },
    });
    await payroll_summary.deleteMany();
    await payroll_log.deleteMany();
    await payroll_processing_log.deleteMany();
    await employee_back_penality_deduction.deleteMany({
        where: {
            is_payroll_posted: false,
            startDate: {
                gte: startDate,
                lt: new Date(
                    new Date(startDate).setDate(startDate.getDate() + 1)
                ),
            },
            endDate: {
                gte: endDate,
                lt: new Date(new Date(endDate).setDate(endDate.getDate() + 1)),
            },
        },
    });
    const message = await computeEmployeeSalary(
        { startDate, endDate, payroll_frequency_type_id },
        hcmConfig,
        creator,
        next
    );
    //jumped here computeemployeesalary
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0
 * @param {import("@prisma/client").hcm_configuration} hcmConfig
 * @param {Function} next
 */
const computeEmployeeSalary = async (
    { startDate, endDate, payroll_frequency_type_id },
    hcmConfig,
    creator,
    next
) => {
    const employerPension = hcmConfig.employer_pension / 100,
        employeePension = hcmConfig.employee_pension / 100,
        employeePayScales = await employee_pay_scale.findMany(),
        paygradeScales = await paygrade_scale.findMany(),
        payrollLocationSettings = await payroll_location_setting.findMany(),
        employees = await employee.findMany({
            where: {
                employee_action: {
                    some: {
                        employee_status: 1,
                        startDate: {
                            lte: startDate,
                        },
                        endDate: {
                            gte: endDate,
                        },
                    },
                },
            },
            select: {
                id: true,
                id_number: true,
                employee_action: {
                    orderBy: { endDate: "asc" },
                    include: {
                        org_assignment: {
                            orderBy: { endDate: "desc" },
                            include: {
                                job_title: { include: { paygrade: true } },
                                location: true,
                            },
                        },
                    },
                },
                employee_pay_frequency: {
                    where: {
                        OR: [
                            {
                                startDate: { lte: startDate },
                                endDate: { gte: startDate },
                            },
                            {
                                startDate: { lte: endDate },
                                endDate: { gte: endDate },
                            },
                        ],
                    },
                },
            },
        });
    const employeeCount = await employee.count();
    const processingStartTime = new Date();
    for (let i in employees) {
        const emp = employees[i],
            { employee_action: actions } = employees[i];
        let totalEmployeeEarningAmount = 0,
            totalEmployeeDeductionAmount = 0,
            totalWorkingHoursProrationFactor = 0,
            skipEmployeePayrollProcessing = false;

        let prevActionEndDate = new Date(0),
            currentActionEndDate = new Date(0),
            isValidAction = true;
        let employeePayFrequency;
        if (actions.length > 1) {
            for (let i in actions) {
                const action = action[i];
                currentActionEndDate = action.endDate;
                if (i != 0) {
                    if (currentActionEndDate <= prevActionEndDate) {
                        isValidAction = false;
                        break;
                    }
                }
                prevActionEndDate = action.endDate;
            }
        }
        if (isValidAction) {
            continue;
        }
        let payrollSummaryData = {};
        let payrollDetails = [];
        for (let i in actions) {
            const action = actions[i];
            let basicPay = 0.0,
                taxableEarning = 0.0,
                incomeTax = 0.0,
                totalAbsentAmount = 0.0,
                totalAbsentHours = 0.0,
                employeeCurentSalaryAmount = 0.0,
                portionWorkingHoursProrationFactor = 0.0,
                prorationFactor = 0.0,
                isProrationRequired = false;
            const actionStartDate =
                    action.startDate < startDate ? startDate : action.startDate,
                actionEndDate =
                    action.endDate > endDate ? endDate : action.endDate;
            const orgAss = action.org_assignment.shift();
            if (!orgAss) {
                break;
            }
            if (payrollLocationSettings.length) {
                const employeeLocation = payrollLocationSettings
                    .filter(
                        (element) => element.location_id == orgAss.location_id
                    )
                    .shift();
                if (!employeeLocation) {
                    skipEmployeePayrollProcessing = true;
                    break;
                }
            }
            //#region check if proration is required

            if (!(action.startDate <= startDate && action.endDate >= endDate)) {
                if (totalWorkingHoursProrationFactor <= 0) {
                    totalWorkingHoursProrationFactor = calculateWorkingHours(
                        startDate,
                        endDate,
                        emp.id,
                        true
                    );
                }
                portionWorkingHoursProrationFactor = calculateWorkingHours(
                    actionStartDate,
                    actionEndDate,
                    emp.id,
                    true
                );
                isProrationRequired = true;
            }
            if (isProrationRequired) {
                if (
                    portionWorkingHoursProrationFactor == 0.0 ||
                    totalWorkingHoursProrationFactor == 0.0
                ) {
                    break;
                }
                prorationFactor =
                    portionWorkingHoursProrationFactor /
                    totalWorkingHoursProrationFactor;
            }

            //#endregion

            //#region check payroll frequency

            if (i == 0) {
                employeePayFrequency = emp.employee_pay_frequency[0];
            }
            if (!employeePayFrequency) {
                skipEmployeePayrollProcessing = true;
                break;
            } else if (
                employeePayFrequency.payroll_frequency_type_id !=
                payroll_frequency_type_id
            ) {
                skipEmployeePayrollProcessing = true;
                break;
            }
            //#endregion

            //#region get employee paygrade info

            const employeePayGrade = orgAss.job_title.paygrade;
            if (!employeePayGrade) {
                skipEmployeePayrollProcessing = true;
                break;
            }

            //#endregion

            //#region get employee department

            const empBusUnit = await getEmployeeDepartment(emp.id);
            if (!empBusUnit) {
                skipEmployeePayrollProcessing = 0;
                break;
            }

            //#endregion

            //#region calculate total expected/worked hours

            const payrollEmployeeTime = await calculateAttendanceTime(
                actionStartDate,
                actionEndDate,
                emp.id,
                true
            );
            if (
                payrollEmployeeTime.totalExpectedHours == 0 ||
                payrollEmployeeTime.totalWorkedHours == 0
            ) {
                skipEmployeePayrollProcessing = true;
                break;
            }

            //#endregion
            //#region calculating overtime
            const hourlyRate =
                employeePayGrade.min_salary /
                employeePayFrequency.expected_working_hrs;
            const payrollTotalOTWorked = getTotalOverTimeHour(
                emp.id,
                actionStartDate,
                actionEndDate,
                hourlyRate
            );
            //#endregion

            //#region calculating basic
            employeeCurentSalaryAmount = 0;
            if (employeePayScales.length && paygradeScales.length) {
                const employeeScale = employeePayScales.filter(
                    (element) => element.employee_id === emp.id
                )[0];
                if (employeeScale) {
                    const paygradeScale = paygradeScales.filter(
                        (element) =>
                            element.paygrade_id === employeePayGrade.id &&
                            element.scale === employeeScale.scale
                    )[0];
                    if (paygradeScale) {
                        employeeCurentSalaryAmount = paygradeScale.amount;
                    }
                }
            }

            if (employeeCurentSalaryAmount > 0)
                basicPay = employeeCurentSalaryAmount;
            else basicPay = employeePayGrade.min_salary;

            if (isProrationRequired) basicPay = basicPay * prorationFactor;

            if (
                payrollEmployeeTime.totalWorkedHours <
                payrollEmployeeTime.totalExpectedHours
            ) {
                totalAbsentHours =
                    payrollEmployeeTime.totalExpectedHours -
                    payrollEmployeeTime.totalWorkedHours;
                totalAbsentAmount = totalAbsentHours * hourlyRate;
            }

            //#endregion

            //#region Calculating Earning and Deductions

            const earning = await getEmployeeEarning(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay,
                employeePayGrade.id
            );
            const payAdjustmentEarning = await getPayAdjustmentEarning(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay
            );

            const deduction = await getEmployeeDeduction(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay,
                employeePayGrade.id
            );

            const payAdjustmentDeduction = await getPayAdjustmentDeduction(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay
            );
            //#endregion

            //#region saving summary

            payrollSummaryData.employee_id = emp.id;
            payrollSummaryData.startDate = startDate;
            payrollSummaryData.endDate = endDate;
            payrollSummaryData.payroll_frequency_type_id =
                payroll_frequency_type_id;
            payrollSummaryData.expected_working_hrs =
                payrollSummaryData.expected_working_hrs ||
                0 + payrollEmployeeTime.totalExpectedHours;
            payrollSummaryData.total_worked_hours =
                payrollSummaryData.total_worked_hours ||
                0 + payrollEmployeeTime.totalWorkedHours;
            payrollSummaryData.total_worked_OT_hours =
                payrollSummaryData.total_worked_OT_hours ||
                0 + payrollTotalOTWorked.totalHour;
            payrollSummaryData.total_worked_OT_amount =
                payrollSummaryData.total_worked_OT_amount ||
                0 + payrollTotalOTWorked.totalAmount;
            payrollSummaryData.total_absent_amount =
                payrollSummaryData.total_absent_amount || 0 + totalAbsentAmount;
            payrollSummaryData.total_absent_hours =
                payrollSummaryData.total_absent_hours || 0 + totalAbsentHours;
            payrollSummaryData.business_unit_id = empBusUnit;
            payrollSummaryData.createdBy = String(creator);
            payrollSummaryData.revisedBy = String(creator);
            //#endregion

            //#region Saving Basic Pay and Overtime
            if (payrollSummaryData.total_worked_OT_amount) {
                let payrollDetail = {};
                payrollDetail.is_earning = true;
                payrollDetail.total_amount = payrollTotalOTWorked.totalAmount;
                payrollDetail.description = `"Over Time" ${payrollTotalOTWorked.totalHour} Hrs`;
                ///////
                //stopped herre!!!!!!!!!!
                ///////
                payrollDetail.PayrollComponent = payrollComonent.OverTime;
                payrollDetail.PayrollPostingEntryType =
                    PayrollPostingEntryType.Gross;
                payrollDetails.Add(payrollDetail);

                totalPayrollAmount += payrollDetail.TotalAmount;
                totalEmployeeEarningAmount += payrollDetail.TotalAmount;
            }

            if (basicPay != 0) {
                payrollDetail = new PayrollDetailForAggregate();
                payrollDetail.TotalAmount = basicPay;
                payrollDetail.Description = "Basic Pay";
                payrollDetail.IsEarning = true;
                payrollDetail.PayrollComponent = PayrollComponent.Basic;
                payrollDetail.PayrollPostingEntryType =
                    PayrollPostingEntryType.Gross;
                payrollDetails.Add(payrollDetail);

                totalPayrollAmount += payrollDetail.TotalAmount;
                totalEmployeeEarningAmount += payrollDetail.TotalAmount;

                payrollDetail = new PayrollDetailForAggregate();
                payrollDetail.TotalAmount = basicPay * employeerPension;
                payrollDetail.Description = "Employeer Pension";
                payrollDetail.PayrollComponent =
                    PayrollComponent.EmployeerPension;
                payrollDetail.PayrollPostingEntryType =
                    PayrollPostingEntryType.EmployeerTax;
                payrollDetail.IsEmployeerPart = true;
                payrollDetail.IsEarning = false;
                payrollDetails.Add(payrollDetail);

                totalPayrollAmount += payrollDetail.TotalAmount;

                payrollDetail = new PayrollDetailForAggregate();
                payrollDetail.TotalAmount = basicPay * employeePension;
                payrollDetail.Description = "Employee Pension";
                payrollDetail.PayrollComponent =
                    PayrollComponent.EmployeePension;
                payrollDetail.PayrollPostingEntryType =
                    PayrollPostingEntryType.OtherDeduction;
                payrollDetail.IsEarning = false;
                payrollDetails.Add(payrollDetail);

                totalPayrollAmount += payrollDetail.TotalAmount;
                totalEmployeeDeductionAmount += payrollDetail.TotalAmount;
            }
            //#endregion
        }
    }
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {number} basicPay
 */
const getPayAdjustmentDeduction = async (
    startDate,
    endDate,
    empId,
    basicPay
) => {
    const deductions = await salary_adjustment.findMany({
        where: {
            employee_id: empId,
            salary_component: {
                salary_component_type: 2,
            },
            payroll_date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: { salary_component: true },
    });
    if (deductions.length) {
        deductions.forEach((deduction) => {
            if (deduction.salary_component.value_type == 2) {
                return {
                    amount: deduction.amount,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                };
            } else {
                return {
                    amount: (basicPay * deduction.amount) / 100,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                };
            }
        });
    }
    return {};
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {number} basicPay
 * @param {number} paygradeId
 */
const getEmployeeDeduction = async (
    startDate,
    endDate,
    empId,
    basicPay,
    paygradeId
) => {
    const deductionsPayGrade = await paygrade_salary_component.findMany({
        where: {
            paygrade_id: paygradeId,
            salary_component: {
                salary_component_type: 2,
            },
            startDate: {
                lte: startDate,
            },
            endDate: {
                gte: endDate,
            },
        },
        select: {
            salary_component_id: true,
            salary_component: true,
        },
    });
    const deductionsEmployee = await employee_salary_component.findMany({
        where: {
            employee_id: empId,
            salary_component: {
                salary_component_type: 2,
            },
            startDate: {
                lte: startDate,
            },
            endDate: {
                gte: endDate,
            },
        },
        select: {
            salary_component_id: true,
            salary_component: true,
        },
    });
    const deductions = deductionsPayGrade.concat(deductionsEmployee);
    if (deductions.length) {
        deductions.forEach((deduction) => {
            if (deduction.salary_component.value_type == 2) {
                return {
                    amount: deduction.salary_component.value,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                };
            } else {
                return {
                    amount: (basicPay * deduction.salary_component.value) / 100,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                };
            }
        });
    }
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {number} basicPay
 */
const getPayAdjustmentEarning = async (startDate, endDate, empId, basicPay) => {
    const earnings = await salary_adjustment.findMany({
        where: {
            employee_id: empId,
            salary_component: {
                salary_component_type: 1,
            },
            payroll_date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: { salary_component: true },
    });
    if (earnings.length) {
        earnings.forEach((earning) => {
            if (earning.salary_component.value_type == 2) {
                return {
                    amount: earning.amount,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                };
            } else {
                return {
                    amount: (basicPay * earning.amount) / 100,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                };
            }
        });
    }
    return {};
};

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {number} basicPay
 * @param {number} paygradeId
 */
const getEmployeeEarning = async (
    startDate,
    endDate,
    empId,
    basicPay,
    paygradeId
) => {
    const earningsEmployee = await employee_salary_component.findMany({
        where: {
            employee_id: empId,
            salary_component: {
                salary_component_type: 1,
            },
            startDate: {
                lte: startDate,
            },
            endDate: {
                gte: endDate,
            },
        },
        select: {
            salary_component: true,
            salary_component_id: true,
        },
    });
    const earningsPaygrade = await paygrade_salary_component.findMany({
        where: {
            paygrade_id: paygradeId,
            salary_component: {
                salary_component_type: 1,
            },
            startDate: {
                lte: startDate,
            },
            endDate: {
                gte: endDate,
            },
        },
        select: {
            salary_component: true,
            salary_component_id: true,
        },
    });
    const earnings = earningsEmployee.concat(earningsPaygrade);
    if (earnings.length) {
        earnings.forEach((earning) => {
            if (earning.salary_component.value_type == 2) {
                return {
                    amount: earning.salary_component.value,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                };
            } else {
                return {
                    amount: (basicPay * earning.salary_component.value) / 100,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                };
            }
        });
    }
    return {};
};
/**
 *
 * @param {number} empId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} hourlyRate
 * @returns
 */
const getTotalOverTimeHour = (empId, startDate, endDate, hourlyRate) => {
    const overt = await overtime.findMany({
        where: {
            employee_id: empId,
            date: {
                gte: startDate,
                lte: endDate,
            },
            overtime_status: 2,
        },
        include: {
            overtime_rate: true,
        },
    });
    let totalHour = 0;
    let totalAmount = 0;
    if (overt.length) {
        for (let i in overt) {
            const over = overt[i];
            totalHour += over.hours;
            totalAmount += over.hours * hourlyRate * over.overtime_rate.rate;
        }
    }
    return { totalHour, totalAmount };
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {boolean} isApproved
 */
const calculateAttendanceTime = async (
    startDate,
    endDate,
    empId,
    isApproved
) => {
    let shiftDayOnOff = 0.0,
        totalWorkedHours = 0,
        totalExpectedHours = 0,
        minutesHours = 0.0,
        tempTotalWorkedHours = 0,
        tempTotalExpectedHours = 0;
    for (
        let i = new Date(startDate);
        i < endDate || i.getTime() == endDate.getTime();
        i.setDate(i.getDate() + 1)
    ) {
        const shiftScheduleDtl = await getEmployeeShiftSchedule(i, empId);
        if (!shiftScheduleDtl) continue;

        const shiftDayOnOff = getShiftDay(i, shiftScheduleDtl);
        if (!shiftDayOnOff) continue;

        const holiday = await checkForHoliday(i);
        minutesHours = shiftScheduleDtl.min_working_hours;
        const leaveAssignment = await leave_assignment.findFirst({
            where: {
                employee_id: empId,
                leave_request_status: 2,
                startDate: { lte: i },
                endDate: { gte: i },
            },
            include: {
                attendance_abscence_type: true,
            },
        });
        if (!holiday) {
            //#region no leave no holiday
            if (!leaveAssignment) {
                if (shiftDayOnOff == 1) {
                    tempTotalWorkedHours = getEmployeeWorkedTime(
                        i,
                        shiftScheduleDtl,
                        empId,
                        isApproved
                    );
                    tempTotalExpectedHours =
                        shiftScheduleDtl.min_working_hours + minutesHours;
                    totalExpectedHours += tempTotalExpectedHours;
                    totalWorkedHours += Math.min(
                        tempTotalWorkedHours,
                        tempTotalExpectedHours
                    );
                } else {
                    tempTotalWorkedHours =
                        getEmployeeWorkedTime(
                            i,
                            shiftScheduleDtl,
                            empId,
                            isApproved
                        ) / 2;
                    tempTotalExpectedHours =
                        (shiftScheduleDtl.min_working_hours + minutesHours) / 2;

                    totalExpectedHours += tempTotalExpectedHours;

                    totalWorkedHours += Math.min(
                        tempTotalWorkedHours,
                        tempTotalExpectedHours
                    );
                }
            }

            //#endregion
            //#region consider leave
            else {
                if (!leaveAssignment.attendance_abscence_type.is_with_pay) {
                    //unpaid leave
                    if (leaveAssignment.is_half_day) {
                        //check if employee worked for the rest half day

                        tempTotalExpectedHours =
                            (shiftScheduleDtl.min_working_hours +
                                minutesHours) /
                            2;
                        totalExpectedHours += tempTotalExpectedHours;

                        if (shiftDayOnOff == 1.0) {
                            //to check (half leave, half attendance)
                            tempTotalWorkedHours =
                                getEmployeeWorkedTime(
                                    i,
                                    shiftScheduleDtl,
                                    empId,
                                    isApproved
                                ) / 2;
                            if (tempTotalWorkedHours > tempTotalExpectedHours) {
                                totalWorkedHours += tempTotalExpectedHours;
                            } else {
                                totalWorkedHours += tempTotalWorkedHours;
                            }
                        }
                    } else {
                        //full day unpaid leave/employee absent from work
                        totalExpectedHours +=
                            shiftScheduleDtl.min_working_hours + minutesHours;
                    }
                } //paid leave
                else {
                    if (leaveAssignment.is_half_day) {
                        //half day leave
                        tempTotalExpectedHours =
                            (shiftScheduleDtl.min_working_hours +
                                minutesHours) /
                            2;
                        totalExpectedHours += tempTotalExpectedHours;

                        if (shiftDayOnOff == 1.0) {
                            //to check (half leave, half attendance)
                            tempTotalWorkedHours =
                                getEmployeeWorkedTime(
                                    i,
                                    shiftScheduleDtl,
                                    empId,
                                    isApproved
                                ) / 2;

                            if (tempTotalWorkedHours > tempTotalExpectedHours) {
                                totalWorkedHours += tempTotalExpectedHours;
                            } else {
                                totalWorkedHours += tempTotalWorkedHours;
                            }
                        }
                    } else {
                        //full leave, no need to check attendance
                    }
                }
            }

            //#endregion
        } else {
            //#region holiday
            if (holiday.IsHalfDay) {
                //half day holiday
                if (leaveAssignment != null) {
                    //consider unpaid leave, full day work schedule
                    if (
                        !leaveAssignment.attendance_abscence_type.is_with_pay &&
                        shiftDayOnOff == 1
                    ) {
                        tempTotalExpectedHours =
                            (shiftScheduleDtl.min_working_hours +
                                minutesHours) /
                            2; //half day holiday, half day unpaid, no attendance & work
                        totalExpectedHours += tempTotalExpectedHours;
                    }
                } else {
                    tempTotalExpectedHours =
                        (shiftScheduleDtl.min_working_hours + minutesHours) / 2;
                    totalExpectedHours += tempTotalExpectedHours;
                    if (shiftDayOnOff == 1.0) {
                        //to check (half holiday, half attendance)
                        tempTotalWorkedHours =
                            getEmployeeWorkedTime(
                                i,
                                shiftScheduleDtl,
                                empId,
                                isApproved
                            ) / 2;
                        totalWorkedHours += Math.min(
                            tempTotalWorkedHours,
                            tempTotalExpectedHours
                        );
                    }
                }
            } else {
                /*full holiday, no need to check attendance*/
            }

            //#endregion
        }
    }
    return { totalExpectedHours, totalWorkedHours };
};
/**
 *
 * @param {Date} date
 * @param {import("@prisma/client").shift_schedule_dtl &{
 *          shift_schedule_hdr: import("@prisma/client").shift_schedule_hdr &{
 *              sub_shift_group: import("@prisma/client").sub_shift_group}}} shiftSchedule
 * @param {number} empId
 * @param {boolean} isApproved
 */
const getEmployeeWorkedTime = (date, shiftSchedule, empId, isApproved) => {
    let attendanceHrs = 0.0,
        absenceHrs = 0.0;
    const attendances = await attendance_payroll.findMany({
        where: {
            employee_id: empId,
            date: {
                gte: date,
                lt: new Date(new Date(date).setDate(date.getDate() + 1)),
            },
            attendance_status: isApproved
                ? 3
                : {
                      not: 4,
                  },
        },
        include: {
            attendance_abscence_type: true,
        },
    });
    if (!attendances.length) return 0;
    for (let i in attendances) {
        const attendance = attendances[i];
        if (attendance.attendance_abscence_type.aa_type == 1) {
            attendanceHrs += attendance.total_worked_hours;
        } else {
            if (attendance.attendance_abscence_type.is_with_pay) {
                attendanceHrs + attendance.total_worked_hours;
            } else {
                absenceHrs += attendance.total_worked_hours;
            }
        }
    }
    let targetHrs =
        shiftSchedule.min_working_hours +
        (shiftSchedule.min_working_hours * 60 -
            shiftSchedule.shift_schedule_hdr.sub_shift_group
                .tolerance_minutes) /
            60;
    let actualHrs = attendanceHrs - absenceHrs;
    if (actualHrs) {
        return Math.max(actualHrs, targetHrs);
    } else {
        targetHrs *= -1;
        return Math.max(actualHrs, targetHrs);
    }
};
/**
 *
 * @param {number} empId
 */
const getEmployeeDepartment = async (empId) => {
    const action = await employee_action.findFirst({
        where: {
            employee_id: empId,
            employee_status: 1,
        },
        select: {
            org_assignment: {
                select: {
                    business_unit_id: true,
                },
            },
        },
    });
    if (action && action.org_assignment.length) {
        return action.org_assignment[0].business_unit_id;
    }
    return 0;
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} empId
 * @param {boolean} isApproved
 */
const calculateWorkingHours = (startDate, endDate, empId, isApproved) => {
    let totalExpectedHours = 0,
        minutesHours = 0.0,
        tempTotalExpectedHours = 0;
    for (
        let i = new Date(startDate);
        i < endDate || i.getTime() == endDate.getTime();
        i.setDate(i.getDate() + 1)
    ) {
        const shiftScheduleDtl = await getEmployeeShiftSchedule(i, empId);
        if (!shiftScheduleDtl) {
            continue;
        }
        const shiftDayOnOff = getShiftDay(i, shiftScheduleDtl);
        const holiday = await checkForHoliday(i);
        if (!shiftDayOnOff) {
            continue;
        }
        minutesHours = shiftScheduleDtl.min_working_hours;
        if (!holiday) {
            if (shiftDayOnOff == 1) {
                tempTotalExpectedHours = shiftScheduleDtl.min_working_hours;
                totalExpectedHours += tempTotalExpectedHours;
            } else {
                tempTotalExpectedHours =
                    (shiftScheduleDtl.min_working_hours + minutesHours) / 2;
                totalExpectedHours += tempTotalExpectedHours;
            }
        } else if (holiday.is_half_day) {
            if (shiftDayOnOff == 1) {
                tempTotalExpectedHours =
                    (shiftScheduleDtl.min_working_hours + minutesHours) / 2;
                totalExpectedHours += tempTotalExpectedHours;
            }
        }
    }
    return totalExpectedHours;
};
module.exports = {
    getLockandRun,
    postLock,
    postRun,
};
