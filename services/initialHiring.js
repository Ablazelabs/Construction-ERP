const { hash } = require("bcrypt");
const {
    allModels,
    error,
    randomConcurrencyStamp,
    sendEmail,
    COMPANY_NAME,
} = require("../config/config");
const { post: mPost, patch: mPatch } = require("./mostCRUD/mostCRUD");
const {
    employee,
    employee_id_range,
    vacancy_applicant,
    attachment,
    user,
    commitment,
    employee_type,
} = allModels;
module.exports = async (
    { employeeReqBody, uniqueEmployee },
    { orgAssignmentReqBody, uniqueOrg },
    { employeeActionReqBody, uniqueAction },
    { employeeCommitmentReqBody, uniqueCommitment },
    { accountReqBody },
    reqBody,
    creator,
    next
) => {
    if (accountReqBody.email) {
        const email = accountReqBody.email;
        const data = await user.findUnique({ where: { email } });
        if (data) {
            error("email", "email already exists! please use another", next);
            return false;
        }
    }
    const actionReason = await allModels.action_reason.findFirst({
        where: {
            action_type_code: "Hiring",
        },
    });
    if (!actionReason) {
        error(
            "action reason",
            "please add hiring as one of the action reasons!",
            next
        );
        return false;
    }
    const commitmentMonths = await commitment.findUnique({
        where: {
            id: employeeCommitmentReqBody.commitment_type_id,
        },
    });
    if (commitmentMonths) {
        let endDay = new Date(employeeCommitmentReqBody.startDate);
        endDay.setMonth(endDay.getMonth() + commitmentMonths.period || 0);
        employeeCommitmentReqBody.endDate = endDay;
        employeeReqBody.startDate = new Date(
            employeeCommitmentReqBody.startDate
        );
        employeeReqBody.endDate = new Date(employeeCommitmentReqBody.endDate);
    }
    //check if employee exists and generate id
    const emp = await employee.findFirst({
        where: {
            first_name: employeeReqBody.first_name,
            middle_name: employeeReqBody.middle_name,
            last_name: employeeReqBody.last_name,
            employee_type_id: employeeReqBody.employee_type_id,
        },
        select: {
            id: true,
        },
    });
    if (emp) {
        error(
            "first_name",
            "Employee with the same name and employeement type already exists",
            next
        );
        return false;
    }
    employeeReqBody.id_number = await generateId(
        employeeReqBody.id_number,
        employeeReqBody.employee_type_id,
        next
    );
    if (!employeeReqBody.id_number) {
        return;
    }
    const empdata = await mPost(
        employeeReqBody,
        "employee",
        creator,
        uniqueEmployee,
        next,
        true
    );
    if (!empdata) {
        return false;
    }
    if (reqBody.vacancy_applicant_id) {
        const vacancyApplicant = await vacancy_applicant.findUnique({
            where: {
                id: reqBody.vacancy_applicant_id,
            },
            select: {
                external_applicant: true,
            },
        });
        if (vacancyApplicant) {
            await mPatch(
                {
                    application_status: true,
                },
                { id: reqBody.vacancy_applicant_id },
                {
                    application_status: 3,
                },
                "vacancy_applicant",
                creator,
                [],
                next
            );
        }
        if (vacancyApplicant?.external_applicant?.file) {
            const data = await attachment.create({
                data: {
                    description: String(
                        employeeActionReqBody.employee_status || ""
                    ),
                    employee_id: empdata.id,
                    name: vacancyApplicant?.external_applicant?.name,
                    type: vacancyApplicant?.external_applicant?.type,
                    path: vacancyApplicant?.external_applicant?.file,
                    createdBy: String(creator),
                },
            });
            employeeActionReqBody.attachment_id = data.id;
        }
    }
    const actionData = await mPost(
        {
            ...employeeActionReqBody,
            employee_id: empdata.id,
            action_reason_id: actionReason.id,
        },
        "employee_action",
        creator,
        uniqueAction,
        next,
        true
    );
    if (!actionData) {
        return false;
    }
    const commitmentData = await mPost(
        { ...employeeCommitmentReqBody, employee_id: empdata.id },
        "employee_commitment",
        creator,
        uniqueCommitment,
        next,
        true
    );
    if (!commitmentData) {
        return false;
    }
    const orgAss = await mPost(
        { ...orgAssignmentReqBody, employee_action_id: actionData.id },
        "org_assignment",
        creator,
        uniqueOrg,
        next
    );
    // if (accountReqBody.password) {
    //     const empUser = await user.create({
    //         data: {
    //             code: Number(employeeReqBody.id_number),
    //             concurrency_stamp: randomConcurrencyStamp(),
    //             password: await hash(accountReqBody.password, 10),
    //             email: employeeReqBody.id_number,
    //             first_login: true,
    //             email_confirmed: true,
    //             employee_id: empdata.id,
    //             username: accountReqBody.username,
    //         },
    //     });
    // }
    if (accountReqBody.email) {
        const fullName = accountReqBody.username;
        const email = accountReqBody.email;
        const password = "password"; //for testing
        await user.create({
            data: {
                code: 123434,
                concurrency_stamp: randomConcurrencyStamp(),
                password: await hash(password, 10),
                email,
                first_login: true,
                email_confirmed: true,
                employee_id: empdata.id,
                username: fullName,
            },
        });
        try {
            await sendEmail(
                email,
                `Hello, Employee from ${COMPANY_NAME}`,
                `${COMPANY_NAME} Account Creation`,
                `<div>
                    <h1>Hello ${fullName},</h1>This is your temporary password from your account on erp.elhadar.com
                    Please login and change your password!
                    <div>
                        login email: ${email}
                        <br />
                        login Password: ${password}
                    </div>
                </div>`
            );
        } catch (e) {
            console.log(e);
            //that's all just continue
        }
    }

    return {
        success: true,
        employee: await employee.findUnique({ where: { id: empdata.id } }),
    };
};

const generateId = async (id_number, employee_type_id, next) => {
    const employeeType = await employee_type.findUnique({
        where: {
            id: employee_type_id,
        },
    });
    const prefix =
        employeeType?.description[0]?.toUpperCase() ||
        "E" + employeeType?.description[1]?.toUpperCase() ||
        "L" + "-";
    const idRange = await employee_id_range.findFirst();
    if (!idRange) {
        error(
            "employee_type_id",
            "No ID Range Record Found for the EmployeeType!!",
            next
        );
        return false;
    }
    if (id_number) {
        id_number = parseInt(id_number);
        if (!isNaN(id_number)) {
            id_number = String(id_number);
            return getFormattedIdNumber(id_number, idRange.number_of_digit);
        }
    }
    const lastEmp = await employee.findFirst({
        where: {
            employee_type_id,
        },
        orderBy: {
            id: "desc",
        },
    });
    if (lastEmp && lastEmp.id_number) {
        let lastIdNumber = parseInt(lastEmp.id_number);
        //removing the prefix, which is by default EL-
        if (isNaN(lastIdNumber)) {
            let splitValArr = lastEmp.id_number.split("");
            splitValArr.shift();
            splitValArr.shift();
            splitValArr.shift();
            let splitVal = splitValArr.join("");
            lastIdNumber = parseInt(splitVal);
        }
        const nextIdNumber = lastIdNumber + 1;
        if (nextIdNumber > idRange.end) {
            error(
                "id_number",
                `IdNumber OverFlow, Increase the End IDRange for This Employee Type!!(last id number is ${lastIdNumber})`,
                next
            );
            return false;
        }
        return (
            prefix +
            getFormattedIdNumber(String(nextIdNumber), idRange.number_of_digit)
        );
    } else {
        const nextIdNumber = idRange.start;
        return (
            prefix +
            getFormattedIdNumber(String(nextIdNumber), idRange.number_of_digit)
        );
    }
};
/**
 *
 * @param {string} id_number
 * @param {number} range
 * @returns
 */
const getFormattedIdNumber = (id_number, range) => {
    let formattedIdNumber = id_number;
    if (formattedIdNumber.length < range) {
        let appendableDigit = "";
        for (let i = 0; i < range - formattedIdNumber.length; i++) {
            appendableDigit += "0";
        }
        formattedIdNumber = appendableDigit + formattedIdNumber;
    } else if (formattedIdNumber.length > range) {
        formattedIdNumber.slice(0, range);
    }
    return formattedIdNumber;
};
