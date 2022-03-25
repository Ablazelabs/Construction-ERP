const {
    allModels,
    error,
    sendEmail,
    COMPANY_NAME,
} = require("../config/config");

const {
    employee,
    employee_action,
    payroll_summary_history,
    payroll_detail_history,
    address,
} = allModels;
/**
 *
 * @param {{pdf: Buffer,employee_id: string}[]} constructedPdf
 * @param {Date} fromDate
 * @param {Date} toDate
 */
const sendSlip = async (constructedPdf, fromDate, toDate) => {
    const addresses = await address.findMany({
        where: {
            employee: {
                OR: constructedPdf.map(({ employee_id }) => {
                    return { id_number: employee_id };
                }),
            },
        },
        select: {
            employee: true,
            email: true,
        },
    });
    for (let i in constructedPdf) {
        const empAddress = addresses.find(
            ({ employee: emp }) =>
                emp.id_number == constructedPdf[i].employee_id
        );
        const fullName = `${empAddress.employee.first_name?.toUpperCase()} ${empAddress.employee.middle_name?.toUpperCase()} ${
            empAddress.employee.last_name?.toUpperCase() || ""
        }`;
        const body =
            `<b>Dear ${fullName}</b></br>` +
            `<p>Attached herewith, Please Find Your Salary Slip for ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}. </p><br>` +
            `<p>This Payslip is brought to you by the customer</br></p>` +
            `<p>This is an Auto generated e-mail by ${COMPANY_NAME}. Please don't reply.</p></br>` +
            `<p>Regards,</p></br>` +
            `<p>Payroll Manager</p></br>`;
        return await sendEmail(
            empAddress.email,
            "Payroll Slip",
            `SALARY SLIP - ${empAddress.employee.id_number} - ${fullName}.`,
            body,
            {
                fileName: `SALARY SLIP - ${empAddress.employee.id_number} - ${fullName}.pdf`,
                file: constructedPdf[i].pdf,
            }
        );
    }
};
/**
 *
 * @param {Array<number>} selectedEmps
 * @param {Date} fromDate
 * @param {Date} toDate
 * @param {boolean} activeEmployees
 */
const getSlip = async (
    selectedEmps,
    fromDate,
    toDate,
    activeEmployees = false
) => {
    let stringBuilders = [];
    let activeFilter = {};
    if (activeEmployees) {
        activeFilter = { is_employee_active: true };
    }
    const selectedEmployees = await employee.findMany({
        where: {
            ...activeFilter,
            OR: selectedEmps.map((emp) => {
                return { id: emp };
            }),
        },
    });
    const employeeActions = await employee_action.findMany({
        where: {
            OR: selectedEmployees.map(({ id }) => {
                return { employee_id: id };
            }),
        },
        include: {
            org_assignment: {
                include: {
                    business_unit: true,
                    job_title: { select: { paygrade: true } },
                    location: true,
                },
            },
        },
    });
    const payrollSummaryHistories = await payroll_summary_history.findMany({
        where: {
            OR: selectedEmployees.map(({ id }) => {
                return { employee_id: id };
            }),
            startDate: {
                gte: fromDate,
                lt: new Date(
                    new Date(fromDate).setDate(fromDate.getDate() + 1)
                ),
            },
            endDate: {
                gte: toDate,
                lt: new Date(new Date(toDate).setDate(toDate.getDate() + 1)),
            },
        },
        include: { employee: true },
    });
    const payrollDetailHistories = await payroll_detail_history.findMany({
        where: {
            OR: payrollSummaryHistories.map(({ id }) => {
                return { payroll_summary_history_id: id };
            }),
        },
    });
    if (payrollSummaryHistories.length) {
        let rows = [];
        for (let i in payrollSummaryHistories) {
            const payrollSummary = payrollSummaryHistories[i];
            const seletedEmpAction = employeeActions.find(
                (item) => item.employee_id == payrollSummary.employee_id
            );
            const orgAssignment = seletedEmpAction.org_assignment.find(
                (item) => item.employee_action_id === seletedEmpAction.id
            );
            let slipHeadDetails = {
                name: `${payrollSummary.employee.first_name?.toUpperCase()} ${payrollSummary.employee.middle_name?.toUpperCase()} ${
                    payrollSummary.employee.last_name?.toUpperCase() || ""
                }`,
                employeeNo: payrollSummary.employee.id_number,
                dateOfJoining: payrollSummary.employee.employment_start_date,
                dateMonth: new Date(),
                department: orgAssignment.business_unit?.name?.toUpperCase(),
                designation:
                    orgAssignment?.job_title?.title_name?.toUpperCase(),
                grade: orgAssignment?.job_title?.paygrade?.paygrade_name,
                officeLocation:
                    orgAssignment?.location?.location_name?.toUpperCase(),
                payableDays: parseInt(
                    (payrollSummary.endDate - payrollSummary.startDate) /
                        (1000 * 1000 * 60 * 60 * 24) +
                        1
                ),
            };
            let earnings = [];
            let deductions = [];
            for (let i in payrollDetailHistories) {
                const payrollDetailHistory = payrollDetailHistories[i];
                if (!payrollDetailHistory.is_employer_part) {
                    if (
                        payrollDetailHistory.is_earning &&
                        payrollDetailHistory.total_amount > 0
                    ) {
                        earnings.push(payrollDetailHistory);
                    } else if (
                        !payrollDetailHistory.is_earning &&
                        payrollDetailHistory.total_amount > 0
                    ) {
                        deductions.push(payrollDetailHistory);
                    }
                }
            }
            let count = Math.max(earnings.length, deductions.length);
            for (let i = 0; i < count; i++) {
                let earnName = "";
                let earnValue = 0;
                let deductName = "";
                let deductValue = 0;

                if (i < earnings.length) {
                    //dt.Rows.Add(payrolldetailhistory.Description, payrolldetailhistory.TotalAmount, null, null);
                    earnName = earnings[i].description;
                    earnValue = earnings[i].total_amount;
                }
                if (i < deductions.length) {
                    deductName = deductions[i].description;
                    deductValue = deductions[i].total_amount;
                }
                rows.push({ earnName, earnValue, deductName, deductValue });
            }
            const constructedHTML = constructHTML(
                slipHeadDetails,
                rows,
                fromDate,
                toDate
            );
            stringBuilders.push({
                html: constructedHTML,
                EmployeeId: payrollSummary.employee.id_number,
                id: payrollSummary.employee.id,
                first_name: payrollSummary.employee.first_name,
                middle_name: payrollSummary.employee.middle_name,
                last_name: payrollSummary.employee.last_name,
            });
        }
    }
    return stringBuilders;
};
/**
 *
 * @param {{
 *   name: string;
 *   employeeNo: string;
 *   dateOfJoining: Date;
 *   dateMonth: Date;
 *   department: string;
 *   designation: any;
 *   grade: string;
 *   officeLocation: string;
 *   payableDays: number;
 *   }} slipHeadDetails
 * @param {Array<{
 *   earnName: string;
 *  earnValue: number;
 *  deductName: string;
 *  deductValue: number;
 *}>} dt
 * @param {Date} fromDate
 * @param {Date} toDate
 * @returns
 */
const constructHTML = (slipHeadDetails, dt, fromDate, toDate) => {
    const columns = [
        "Earnings Head",
        "Earnings",
        "Deductions Head",
        "Deductions",
    ];
    const keyColumns = ["earnName", "earnValue", "deductName", "deductValue"];
    let sb = "";

    // #region Generate Slip Header Region

    //Generate Invoice (Bill) Header.
    sb += "<table width='100%' cellspacing='0' cellpadding='2'>";
    sb +=
        "<tr><td align='center' style='background-color: #18B5F0' colspan = '2'><b>PAY SLIP FOR  " +
        fromDate.toLocaleDateString() +
        " - " +
        toDate.toLocaleDateString() +
        "</b></td></tr>";

    sb += "<tr><td colspan = '2'></td></tr>";
    sb += "<tr><td><b>Employee No: </b>";
    sb += slipHeadDetails.employeeNo || "";
    sb += "</td><td align = 'left'><b>Date: </b>";
    sb += new Date().toLocaleDateString();
    sb += " </td></tr>";

    sb += "<tr><td colspan = '2'></td></tr>";
    sb += "<tr><td><b>Name: </b>";
    sb += slipHeadDetails.name || "";
    sb += "</td><td align = 'left'><b>Payable Days: </b>";
    sb += slipHeadDetails.payableDays || "";
    sb += " </td></tr>";

    sb += "<tr><td colspan = '2'></td></tr>";
    sb += "<tr><td><b>Depatment: </b>";
    sb += slipHeadDetails.department || "";
    sb += "</td><td align = 'left'><b>Grade: </b>";
    sb += slipHeadDetails.grade || "";
    sb += " </td></tr>";

    sb += "<tr><td colspan = '2'></td></tr>";
    sb += "<tr><td><b>Date Of Joining: </b>";
    sb += slipHeadDetails.dateOfJoining?.toLocaleDateString() || "";
    sb += "</td><td align = 'left'><b>Currency: </b>";
    sb += slipHeadDetails.currency || "";
    sb += " </td></tr>";

    sb += "<tr><td colspan = '2'></td></tr>";
    sb += "<tr><td><b>Office Location: </b>";
    sb += slipHeadDetails.officeLocation || "";
    sb += "</td><td align = 'left'><b>Designation: </b>";
    sb += slipHeadDetails.designation || "";
    sb += " </td></tr>";

    //sb+=("<tr><td colspan = '2'><b>Bank Account No: </b>");
    //sb+=(slipHeadDetails.bankAccoutNo);

    //sb+=("<tr><td colspan = '2'><b>Designation: </b>");
    //sb+=(slipHeadDetails.acc);

    sb += "</td></tr>";
    sb += "</table>";
    sb += "<br />";

    // #endregion

    //Generate Invoice (Bill) Items Grid.
    sb += "<table border = '1'>";
    sb += "<tr>";

    for (let i in columns) {
        const column = columns[i];
        sb +=
            "<th style = 'background-color: #D20B0C;color:#000000';width:'10%'> <b>";
        sb += column;
        sb += "</b></th>";
    }
    sb += "</tr>";

    for (let i in dt) {
        const row = dt[i];
        sb += "<tr>";
        for (let i in keyColumns) {
            const keyColumn = keyColumns[i];
            sb += "<td width:'10%'>";
            sb += row[keyColumn];
            sb += "</td>";
        }
        sb += "</tr>";
    }

    sb += "<tr><td align = 'right'";
    //sb+=(dt.Columns.Count - 1);
    sb += ">Total Earnings</td>";
    sb += "<td>";
    let earningsSum = 0;
    let deductsSum = 0;
    dt.forEach(({ earnValue, deductValue }) => {
        earningsSum += earnValue;
        deductsSum += deductValue;
    });
    sb += earningsSum;
    sb += "</td>";

    sb += "<tr><td align = 'right'";
    //sb+=(dt.Columns.Count - 1);
    sb += ">Total Deductions</td>";
    sb += "<td>";
    sb += deductsSum;
    sb += "</td></tr>";

    sb += "<tr><td align = 'left' colspan = '";
    sb += columns.length;
    sb += "'>NET SALARY: <b>";
    const netSalary = earningsSum - deductsSum;
    const fractionNumber = Number(String(netSalary).split(".")[1]) || 0;
    sb +=
        netSalary +
        "   " +
        numberToWords(parseInt(netSalary)) +
        (fractionNumber > 0 ? "/" + fractionNumber : "");
    //next time do number to words
    sb += "</b></td>";
    sb += "</tr>";

    sb += "</table>";

    sb += "<br/>";
    sb +=
        "<p align='center'><b> THIS PAYSLIP IS BROUGHT TO YOU BY THE CUSTOMER ! </b></p>";

    return sb;
};
/**
 *
 * @param {number} number
 * @returns {string}
 */
const numberToWords = (number) => {
    if (number == 0) return "ZERO";
    if (number < 0) return "MINUS " + numberToWords(Math.abs(number));
    let words = "";
    if (number > 1000000) {
        words += numberToWords(parseInt(number / 1000000)) + " MILLION ";
        number %= 1000000;
    }
    if (number > 1000) {
        words += numberToWords(parseInt(number / 1000)) + " THOUSAND ";
        number %= 1000;
    }
    if (number > 100) {
        words += numberToWords(parseInt(number / 100)) + " HUNDRED ";
        number %= 100;
    }
    if (number > 0) {
        if (words != "") words += " AND ";

        const unitsMap = [
            "ZERO",
            "ONE",
            "TWO",
            "THREE",
            "FOUR",
            "FIVE",
            "SIX",
            "SEVEN",
            "EIGHT",
            "NINE",
            "TEN",
            "ELEVEN",
            "TWELVE",
            "THIRTEEN",
            "FOURTEEN",
            "FIVTEEN",
            "SIXTEEN",
            "SEVENTEEN",
            "EIGHTEEN",
            "NINETEEN",
        ];
        const tensMap = [
            "ZERO",
            "TEN",
            "TWENTY",
            "THIRTY",
            "FORTY",
            "FIFTY",
            "SIXTY",
            "SEVENTY",
            "EIGHTY",
            "NINETY",
        ];

        if (number < 20) words += unitsMap[number];
        else {
            words += tensMap[number / 10];
            if (number % 10 > 0) words += "-" + unitsMap[number % 10];
        }
    }
    return words;
};
module.exports = {
    getSlip,
    sendSlip,
};
