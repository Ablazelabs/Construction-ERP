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
    employee_tax,
    employee_loan_repayment,
    employee_penality,
    general_journal_header,
    general_journal_detail,
    journal_comment,
    company,
    chart_of_account,
} = allModels;
const {
    getEmployeeShiftSchedule,
    getShiftDay,
    checkForHoliday,
} = require("./approval/leaveDays");
/**
 *
 * @param {"run"|"lock"} runOrLock either run or lock
 * @param {Function} next express next middleware function
 */
const getLockandRun = async (runOrLock, next) => {
    const payrollPeriod = await payroll_period_autogen.findFirst({
        where: { is_processing_started: true },
    });
    if (!payrollPeriod) {
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
 * @param {number} id
 * @param {Function} next express next middleware function
 */
const getPost = async (id, next) => {
    const period = await payroll_period_autogen.findFirst({
        where: { id },
        include: { payroll_frequency_type: true },
    });
    if (!period) {
        error("id", "no payroll period autogen with this id", next);
        return false;
    }
    if (!period.is_payroll_processed) {
        error("id", "Payroll is not processed for the selected period!", next);
        return false;
    } else if (period.is_payroll_posted) {
        error("id", "Payroll is already posted to GL!", next);
        return false;
    }
    return period;
};
/**
 *
 * @param {number} id
 * @param {number} creator
 * @param {function} next returns false if next called(means error raiseds)
 * @returns
 */
const postPost = async (id, creator, next) => {
    const payrollPeriod = await payroll_period_autogen.findFirst({
        where: { id },
        include: { payroll_frequency_type: true },
    });
    if (!payrollPeriod) {
        error("id", "no payroll period autogen with this id", next);
        return false;
    }
    if (!payrollPeriod.is_payroll_posted) {
        const postingRef = `${
            payrollPeriod.payroll_frequency_type.payroll_frequency_desc
        }/${payrollPeriod.startDate.toLocaleDateString()}/${payrollPeriod.endDate.toLocaleDateString()}`;
        const gl = await general_ledger.findFirst({
            where: { description: postingRef },
        });
        if (gl) {
            await payroll_period_autogen.update({
                where: { id: payrollPeriod.id },
                data: { is_payroll_posted: true },
            });
            error("id", "Payroll is already posted to GL!", next);
            return false;
        }
    }
    const payrollConfig = await hcm_configuration.findFirst();
    if (!payrollConfig) {
        error(
            "id",
            "HCM Configurations required for payroll processing are not maintained",
            next
        );
        return false;
    }
    const postingUser = String(creator);
    //TODO this isn't the correct string!!!(hashed user mnamn)
    const processResult = await processPostingToGl(
        {
            startDate: payrollPeriod.startDate,
            endDate: payrollPeriod.endDate,
            payroll_frequency_type_id: payrollPeriod.payroll_frequency_type_id,
        },
        creator,
        postingUser,
        next
    );
    //jumped here processPostingToGl
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0
 * @param {number} creator
 * @param {string} hashedUserId
 * @param {Function} next
 */
const processPostingToGl = async (
    { startDate, endDate, payroll_frequency_type_id },
    creator,
    hashedUserId,
    next
) => {
    const payrollPeriod = await payroll_period_autogen.findFirst({
        where: {
            payroll_frequency_type_id,
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
    if (payrollPeriod) {
        await payroll_period_autogen.update({
            where: { id: payrollPeriod.id },
            data: { is_processing_started: true },
        });
    }
    const payrollFreq = await payroll_period_autogen.findFirst({
        where: { payroll_frequency_type_id },
        include: { payroll_frequency_typet: true },
    });
    if (!payrollFreq) {
        error("payroll_frequency_id", "Unknown Payroll frequency...", next);
        return false;
    }
    const postingRef = `${
        payrollPeriod.payroll_frequency_type.payroll_frequency_desc
    }/${payrollPeriod.startDate.toLocaleDateString()}/${payrollPeriod.endDate.toLocaleDateString()}`;
    //#region remove all prev posting for the current period
    const gl = await general_ledger.findFirst({
        where: { description: postingRef },
    });
    if (gl) {
        error("payroll_frequency_id", "Unknown Payroll frequency...", next);
        return false;
    }
    const prevJsHeaders = await general_journal_header.findMany({
        where: { posting_reference: postingRef },
        select: { id },
    });
    if (prevJsHeaders.length) {
        await general_journal_detail.deleteMany({
            where: {
                OR: prevJsHeaders.map(({ id }) => {
                    return { general_journal_header_id: id };
                }),
            },
        });
        await journal_comment.deleteMany({
            where: {
                OR: prevJsHeaders.map(({ id }) => {
                    return { general_journal_header_id: id };
                }),
            },
        });
    }
    //#endregion
    const message = await summarizePayrollAndPostToGl(
        startDate,
        endDate,
        payroll_frequency_type_id
    );
    //jumped summarizePayrollAndPostToGl
};
/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} payroll_frequency_type_id
 */
const summarizePayrollAndPostToGl = async (
    startDate,
    endDate,
    payroll_frequency_type_id
) => {
    let isPostingProcessHasError = false;
    const processStartTime = new Date();
    let payrollEntryList = [];
    const hcmConfig = await hcm_configuration.findFirst();
    const comp = await company.findFirst();
    let errorMessages = [];
    if (hcmConfig && comp) {
        //#region
        const employeeIncomeControlAccount = await chart_of_account.findUnique({
            where: {
                id: hcmConfig.income_tax_payable_id,
            },
        });
        if (!employeeIncomeControlAccount) {
            errorMessages.push(
                "HCM Configuration->Employee Tax Control Account is not found"
            );
            isPostingProcessHasError = true;
        }
        const employeerPensionAccount = await chart_of_account.findUnique({
            where: {
                id: hcmConfig.employer_tax_id,
            },
        });
        if (!employeerPensionAccount) {
            errorMessages.push(
                "HCM Configuration->Employeer Pension Expense(11%) is not found"
            );
            isPostingProcessHasError = true;
        }
        const employeerPensionControlAccount =
            await chart_of_account.findUnique({
                where: {
                    id: hcmConfig.employer_tax_control_id,
                },
            });
        if (!employeerPensionControlAccount) {
            errorMessages.push(
                "HCM Configuration->Employeer Pension Payable(11%) is not found"
            );
            isPostingProcessHasError = true;
        }
        const employeePensionAccount = await chart_of_account.findUnique({
            where: {
                id: hcmConfig.employer_pension_account_id, //wrong key(consider this as employee_pension_account_id)(employer=>employee)
            },
        });
        if (!employeePensionAccount) {
            errorMessages.push(
                "HCM Configuration->Employee Pension Payable(7%) is not found"
            );
            isPostingProcessHasError = true;
        }
        //#endregion
        if (!isPostingProcessHasError) {
            //#region aggregate values
            const payrollHdr = await payroll_summary.findMany({
                where: {
                    payroll_frequency_type_id,
                    startDate: {
                        gte: startDate,
                        lt: new Date(
                            new Date(startDate).setDate(startDate.getDate() + 1)
                        ),
                    },
                    endDate: {
                        gte: endDate,
                        lt: new Date(
                            new Date(endDate).setDate(endDate.getDate() + 1)
                        ),
                    },
                },
                include: {
                    payroll_frequency_type: true,
                    business_unit: true,
                    employee: true,
                },
            });
            for (let i in payrollHdr) {
                const hdr = payrollHdr[i];
                //paused here, let me finish the others and get back here(this is taking a very long time)
            }
            //#endregion
        }
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
    await payroll_period_autogen.update({
        where: {
            id: payrollPeriod.id,
        },
        data: {
            is_payroll_processed: message.success,
        },
    });
    //jumped here computeemployeesalary
};
/**
 *
 * @param {{startDate:Date, endDate:Date, payroll_frequency_type_id:number}} param0
 * @param {import("@prisma/client").hcm_configuration} hcmConfig
 * @param {number} creator
 * @param {Function} next
 */
const computeEmployeeSalary = async (
    { startDate, endDate, payroll_frequency_type_id },
    hcmConfig,
    creator
) => {
    let totalPayrollAmount = 0;
    const employerPension = hcmConfig.employer_pension / 100,
        employeePension = hcmConfig.employee_pension / 100,
        employeePayScales = await employee_pay_scale.findMany(),
        paygradeScales = await paygrade_scale.findMany(),
        payrollLocationSettings = await payroll_location_setting.findMany();
    const employees = await employee.findMany({
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
    // const employeeCount = await employee.count();
    // const processingStartTime = new Date();
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
                    totalWorkingHoursProrationFactor =
                        await calculateWorkingHours(
                            startDate,
                            endDate,
                            emp.id,
                            true
                        );
                }
                portionWorkingHoursProrationFactor =
                    await calculateWorkingHours(
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
            const payrollTotalOTWorked = await getTotalOverTimeHour(
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

            const earnings = await getEmployeeEarning(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay,
                employeePayGrade.id
            );
            const payAdjustmentEarnings = await getPayAdjustmentEarning(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay
            );

            const deductions = await getEmployeeDeduction(
                actionStartDate,
                actionEndDate,
                emp.id,
                basicPay,
                employeePayGrade.id
            );

            const payAdjustmentDeductions = await getPayAdjustmentDeduction(
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
                payrollDetail.isEarning = true;
                payrollDetail.total_amount = payrollTotalOTWorked.totalAmount;
                payrollDetail.description = `"Over Time" ${payrollTotalOTWorked.totalHour} Hrs`;
                payrollDetail.payroll_component = 6;
                payrollDetail.payroll_posting_entry_type = 1;
                payrollDetails.push(payrollDetail);

                totalPayrollAmount += payrollDetail.total_amount;
                totalEmployeeEarningAmount += payrollDetail.total_amount;
            }

            if (basicPay != 0) {
                let payrollDetail = {};

                payrollDetail.total_amount = basicPay;
                payrollDetail.description = "Basic Pay";
                payrollDetail.isEarning = true;
                payrollDetail.payroll_component = 1;
                payrollDetail.payroll_posting_entry_type = 1;
                payrollDetails.push({ ...payrollDetail });

                totalPayrollAmount += payrollDetail.total_amount;
                totalEmployeeEarningAmount += payrollDetail.total_amount;

                payrollDetail = {};
                payrollDetail.total_amount = basicPay * employerPension;
                payrollDetail.description = "Employer Pension";
                payrollDetail.payroll_component = 10;
                payrollDetail.payroll_posting_entry_type = 4;
                payrollDetail.isEmployeerPart = true;
                payrollDetail.isEarning = false;
                payrollDetails.push({ ...payrollDetail });

                totalPayrollAmount += payrollDetail.total_amount;

                payrollDetail = {};
                payrollDetail.total_amount = basicPay * employeePension;
                payrollDetail.description = "Employee Pension";
                payrollDetail.payroll_component = 10;
                payrollDetail.payroll_posting_entry_type = 3;
                payrollDetail.isEarning = false;
                payrollDetails.push(payrollDetail);

                totalPayrollAmount += payrollDetail.total_amount;
                totalEmployeeDeductionAmount += payrollDetail.total_amount;
            }
            //#endregion
            //#region Saving Earning
            earnings.forEach((earning) => {
                if (earning.amount != 0) {
                    if (isProrationRequired)
                        earning.amount = earning.amount * prorationFactor;

                    if (earning.isTaxable) taxableEarning += earning.amount;

                    let payrollDetail = {};
                    payrollDetail.isEarning = true;
                    payrollDetail.total_amount = earning.Amount;
                    payrollDetail.description = earning.description;
                    payrollDetail.payroll_component = 2;
                    payrollDetail.payroll_posting_entry_type = 1;
                    payrollDetail.salary_component_id =
                        earning.salary_component_id;
                    payrollDetails.push(payrollDetail);

                    totalPayrollAmount += payrollDetail.total_amount;
                    totalEmployeeEarningAmount += earning.amount;
                }
            });
            payAdjustmentEarnings.forEach((earning) => {
                if (earning.amount != 0) {
                    if (earning.IsTaxable) taxableEarning += earning.amount;

                    let payrollDetail = {};
                    payrollDetail.isEarning = true;
                    payrollDetail.total_amount = earning.Amount;
                    payrollDetail.description = earning.description;
                    payrollDetail.payroll_component = 8;
                    payrollDetail.payroll_posting_entry_type = 1;
                    payrollDetail.salary_component_id =
                        earning.salary_component_id;
                    payrollDetails.push(payrollDetail);

                    totalPayrollAmount += payrollDetail.total_amount;
                    totalEmployeeEarningAmount += earning.amount;
                }
            });
            //#endregion
            //#region Calculating and Saving Income Tax
            incomeTax = await calcualteIncomeTax(
                basicPay + taxableEarning + payrollTotalOTWorked.totalAmount
            );
            if (incomeTax != 0) {
                let payrollDetail = {};
                payrollDetail.isEarning = false;
                payrollDetail.total_amount = incomeTax;
                payrollDetail.description = "Income Tax";
                payrollDetail.payroll_component = 5;
                payrollDetail.payroll_posting_entry_type = 2;
                payrollDetails.push(payrollDetail);

                totalPayrollAmount += payrollDetail.total_amount;
                totalEmployeeDeductionAmount += incomeTax;
            }
            //#endregion
            //#region Saving Deductions

            if (totalAbsentAmount != 0) {
                let payrollDetail = {};
                payrollDetail.isEarning = false;
                payrollDetail.total_amount = totalAbsentAmount;
                payrollDetail.description = `Lost Time Deduction ${totalAbsentHours} Hrs`;
                payrollDetail.payroll_component = 11;
                payrollDetail.payroll_posting_entry_type = 3;
                payrollDetails.push(payrollDetail);

                totalPayrollAmount += payrollDetail.total_amount;
                totalEmployeeDeductionAmount += totalAbsentAmount;
            }

            deductions.forEach((deduction) => {
                if (deduction.Amount != 0) {
                    let payrollDetail = {};
                    payrollDetail.isEarning = false;
                    payrollDetail.total_amount = deduction.amount;
                    payrollDetail.description = deduction.description;
                    payrollDetail.payroll_component = 3;
                    payrollDetail.payroll_posting_entry_type = 3;
                    payrollDetail.salary_component_id =
                        deduction.salary_component_id;
                    payrollDetails.push(payrollDetail);

                    totalPayrollAmount += payrollDetail.total_amount;
                    totalEmployeeDeductionAmount += deduction.amount;
                }
            });
            payAdjustmentEarnings.forEach((deduction) => {
                if (deduction.Amount != 0) {
                    let payrollDetail = {};
                    payrollDetail.isEarning = false;
                    payrollDetail.total_amount = deduction.amount;
                    payrollDetail.description = deduction.description;
                    payrollDetail.payroll_component = 8;
                    payrollDetail.payroll_posting_entry_type = 3;
                    payrollDetail.salary_component_id =
                        deduction.salary_component_id;
                    payrollDetails.push(payrollDetail);

                    totalPayrollAmount += payrollDetail.total_amount;
                    totalEmployeeDeductionAmount += deduction.amount;
                }
            });
            //#endregion
        }
        if (!skipEmployeePayrollProcessing && payrollDetails.length) {
            // #region save aggregated payroll summery and detail
            let createdPayrollSummary = await payroll_summary.create({
                data: payrollSummaryData,
            });
            let payrollDetails = groupByFn(
                [
                    "description",
                    "isEarning",
                    "isEmployerPart",
                    "payroll_component",
                    "payroll_posting_entry_type",
                    "salary_component_id",
                ],
                payrollDetails,
                ["total_amount"],
                true
            );
            await payroll_detail.createMany({
                data: payrollDetails,
                skipDuplicates: true,
            });
            // #endregion
            //#region loan repayment
            const loanRepayments = await employee_loan_repayment.findMany({
                where: {
                    employee_id: emp.id,
                    startDate: { lte: endDate },
                    endDate: { gte: startDate },
                },
                include: {
                    salary_component: true,
                },
            });
            if (loanRepayments.length) {
                let tempPayrollDetail = [];
                loanRepayments.forEach((loanRepayment) => {
                    if (loanRepayment.repayment_amount > 0) {
                        tempPayrollDetail.push({
                            isEarning: false,
                            total_amount: loanRepayment.repayment_amount,
                            description: loanRepayment.salary_component.name,
                            salary_component_id:
                                loanRepayment.salary_component_id,
                            payroll_component: 4,
                            payroll_posting_entry_type: 3,
                            payroll_summary_id: createdPayrollSummary.id,
                        });
                    }
                });
                await payroll_detail.createMany({
                    data: tempPayrollDetail,
                });
            }
            //#endregion
            //#region calculate penality
            /*
             *	if an employee is penalized 3 days salary, and his basic pay is 10,000
             *	penalityDeduction = 10000/25*3=1153.85 will be deducted from the employee net salary
             *	Note: penality deduction can not be greather than 1/3 of the employee net salary
             */

            const employeeNetPay =
                totalEmployeeEarningAmount - totalEmployeeDeductionAmount;
            let totalPrevRemainingPenality = 0.0,
                totalRemainingPenality = 0.0,
                totalCurrentMonthPenality = 0.0,
                penalityForCurrentMonthDeduction = 0.0;
            const employeePenalities = await employee_penality.findMany({
                where: {
                    employee_id: emp.id,
                    penality_date: { gte: startDate, lte: endDate },
                },
                include: {
                    employee_penality_detail_mst: {
                        include: {
                            employee_penality_type: true,
                        },
                    },
                },
            });
            if (employeePenalities.length) {
                let totalPenalityDays = 0;
                employeePenalities.forEach((employeePenality) => {
                    if (
                        employeePenality.employee_penality_detail_mst
                            .penality_days > 0
                    ) {
                        totalPenalityDays =
                            totalPenalityDays +
                            employeePenality.employee_penality_detail_mst
                                .penality_days;
                    }
                });
                if (totalPenalityDays > 0) {
                    if (totalPenalityDays > 26) totalPenalityDays = 26;
                    totalCurrentMonthPenality =
                        (employeeNetPay / 26) * totalPenalityDays;
                }
            }
            const prevBackPenality =
                await employee_back_penality_deduction.findFirst({
                    where: {
                        employee_id: emp.id,
                        is_payroll_posted: true,
                        remaining_deduction: { gt: 0 },
                    },
                    orderBy: { transaction_date: "desc" },
                    select: { remaining_deduction: true },
                });
            if (prevBackPenality) {
                totalPrevRemainingPenality =
                    prevBackPenality.remaining_deduction;
            }
            let isPenalityApplicable = false;

            totalRemainingPenality =
                totalPrevRemainingPenality + totalCurrentMonthPenality;
            if (totalRemainingPenality > 0) {
                if (employeeNetPay > 0) {
                    isPenalityApplicable = true;
                    let oneThirdNetPay = employeeNetPay / 3; //check if deductions can not exceed 1 /3 of the employee net salary
                    if (totalRemainingPenality >= oneThirdNetPay) {
                        penalityForCurrentMonthDeduction = oneThirdNetPay;
                        totalRemainingPenality =
                            totalRemainingPenality - oneThirdNetPay;
                    } else {
                        penalityForCurrentMonthDeduction =
                            totalRemainingPenality;
                        totalRemainingPenality = 0;
                    }
                    await payroll_detail.create({
                        data: {
                            isEarning: false,
                            total_amount: penalityForCurrentMonthDeduction,
                            description: "Employee Penality",
                            payroll_component: 13,
                            payroll_posting_entry_type: 3,
                            payroll_summary_id: createdPayrollSummary.id,
                        },
                    });
                    totalPayrollAmount += penalityForCurrentMonthDeduction;
                    totalEmployeeDeductionAmount +=
                        penalityForCurrentMonthDeduction;
                }
            }
            if (isPenalityApplicable) {
                //create new record
                await employee_back_penality_deduction.create({
                    data: {
                        employee_id: emp.id,
                        transaction_date: new Date(),
                        remaining_deduction: totalRemainingPenality,
                        currently_deducted_amount:
                            penalityForCurrentMonthDeduction,
                        startDate,
                        endDate,
                        payroll_frequency_type_id,
                        is_payroll_posted: false,
                        createdBy: String(creator),
                    },
                });
            }
            //#endregion
        }
    }
    if (totalPayrollAmount) {
        return { success: true, message: "Payroll sucessfully processed" };
    } else {
        return {
            success: false,
            message: "Payroll processing completed with error",
        };
    }
};
/**
 *
 * @param {Array<string>} keys
 * @param {Array<object>} array the objects should have keys defined in the keys array, also other keys
 * @param {Array<string>} otherKeys length should be 1 if specific true
 */
const groupByFn = (keys, array, otherKeys, specific = false) => {
    let setObj = {};
    array.forEach((element) => {
        let groupKey = "";
        let otherKeysObj = {};

        for (let i in keys) {
            groupKey += element[keys[i]];
        }
        if (!setObj[groupKey]) {
            setObj[groupKey] = {};
        }
        for (let i in keys) {
            setObj[groupKey][keys[i]] = element[keys[i]];
        }
        for (let i in otherKeys) {
            otherKeysObj[otherKeys[i]] = element[otherKeys[i]];
        }
        if (setObj[groupKey].otherKeys) {
            setObj[groupKey].otherKeys.push(otherKeysObj);
        } else {
            setObj[groupKey].otherKeys = [otherKeysObj];
        }
    });
    if (!specific) {
        return setObj;
    }
    let setArray = [];
    for (let i in setObj) {
        let otherKeysSum = 0;
        for (let k in setObj[i].otherKeys) {
            otherKeysSum += setObj[i].otherKeys[k][otherKeys[0]];
        }
        delete setObj[i].otherKeys;
        let addedObj = {};
        addedObj[otherKeys[0]] = otherKeysSum;
        setArray.push({ ...setObj[i], ...addedObj });
    }
    return setArray;
};
/**
 * @param {number} netIncome
 */
const calcualteIncomeTax = async (netIncome) => {
    const employeeTax = await employee_tax.findMany({
        orderBy: {
            percent: "asc",
        },
    });
    let taxToBePaid = 0.0,
        taxDeduction = 0.0,
        prevTaxRate = 0.0,
        prevTaxEnding = 0.0;
    for (let i in employeeTax) {
        const tax = employeeTax[i];
        let taxRateDiff = tax.percent - prevTaxRate;
        taxDeduction = taxDeduction + prevTaxEnding * (taxRateDiff / 100);
        prevTaxRate = tax.percent;
        prevTaxEnding = tax.end;
        if (netIncome >= tax.start && netIncome <= tax.end) break;
    }
    taxToBePaid = netIncome * (prevTaxRate / 100) - taxDeduction;
    return taxToBePaid;
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
    let returnedMessage = [];
    if (deductions.length) {
        deductions.forEach((deduction) => {
            if (deduction.salary_component.value_type == 2) {
                returnedMessage.push({
                    amount: deduction.amount,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                });
            } else {
                returnedMessage.push({
                    amount: (basicPay * deduction.amount) / 100,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                });
            }
        });
    }
    return returnedMessage;
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
    let returnedMessage = [];
    const deductions = deductionsPayGrade.concat(deductionsEmployee);
    if (deductions.length) {
        deductions.forEach((deduction) => {
            if (deduction.salary_component.value_type == 2) {
                returnedMessage.push({
                    amount: deduction.salary_component.value,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                });
            } else {
                returnedMessage.push({
                    amount: (basicPay * deduction.salary_component.value) / 100,
                    isTaxable: false,
                    salaryComponentId: deduction.salary_component_id,
                    description: deduction.salary_component.name,
                });
            }
        });
    }
    return returnedMessage;
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
    let returnedMessage = [];
    if (earnings.length) {
        earnings.forEach((earning) => {
            if (earning.salary_component.value_type == 2) {
                returnedMessage.push({
                    amount: earning.amount,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                });
            } else {
                returnedMessage.push({
                    amount: (basicPay * earning.amount) / 100,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                });
            }
        });
    }
    return returnedMessage;
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
    let returnedMessage = [];
    const earnings = earningsEmployee.concat(earningsPaygrade);
    if (earnings.length) {
        earnings.forEach((earning) => {
            if (earning.salary_component.value_type == 2) {
                returnedMessage.push({
                    amount: earning.salary_component.value,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                });
            } else {
                returnedMessage.push({
                    amount: (basicPay * earning.salary_component.value) / 100,
                    isTaxable: earning.salary_component.taxable,
                    salaryComponentId: earning.salary_component_id,
                    description: earning.salary_component.name,
                });
            }
        });
    }
    return returnedMessage;
};
/**
 *
 * @param {number} empId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {number} hourlyRate
 * @returns
 */
const getTotalOverTimeHour = async (empId, startDate, endDate, hourlyRate) => {
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
                    tempTotalWorkedHours = await getEmployeeWorkedTime(
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
                        (await getEmployeeWorkedTime(
                            i,
                            shiftScheduleDtl,
                            empId,
                            isApproved
                        )) / 2;
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
                                (await getEmployeeWorkedTime(
                                    i,
                                    shiftScheduleDtl,
                                    empId,
                                    isApproved
                                )) / 2;
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
                                (await getEmployeeWorkedTime(
                                    i,
                                    shiftScheduleDtl,
                                    empId,
                                    isApproved
                                )) / 2;

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
                            (await getEmployeeWorkedTime(
                                i,
                                shiftScheduleDtl,
                                empId,
                                isApproved
                            )) / 2;
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
const getEmployeeWorkedTime = async (
    date,
    shiftSchedule,
    empId,
    isApproved
) => {
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
const calculateWorkingHours = async (startDate, endDate, empId, isApproved) => {
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
    getPost,
    postPost,
};
