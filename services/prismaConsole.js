require("dotenv").config();
const { allModels, sendEmail, COMPANY_NAME } = require("../config/config");

const { accounting_period, user, project } = allModels;
const prisma = allModels;
const test = async (fiscalYearType, creator, dateTime) => {
    let accountingPeriods = [];
    let fiscalYearStartMonth = 0;
    const fiscalYearEnum = [
        "january_december",
        "february_january",
        "march_february",
        "april_march",
        "may_april",
        "june_may",
        "july_june",
        "august_july",
        "september_august",
        "october_september",
        "november_october",
        "december_november",
    ];
    const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];
    const monthArray = fiscalYearEnum[fiscalYearType - 1].split("_");

    if (monthArray.length) fiscalYearStartMonth = months.indexOf(monthArray[0]);

    let startDate = new Date(dateTime.getFullYear(), fiscalYearStartMonth, 1);
    startDate.setMinutes(
        startDate.getMinutes() - startDate.getTimezoneOffset()
    );
    const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 11,
        startDate.getDate()
    );
    let index = 1;
    for (
        let day = new Date(startDate);
        fiscalYearStartMonth <= endDate.getMonth();
        day.setMonth(day.getMonth() + 1)
    ) {
        const month = day.getMonth() + 1;
        accountingPeriods.push({
            months: month,
            accounting_period_status: index == 1 ? 1 : 3,
            period_number: index,
            period_starting_date: new Date(day),
            period_ending_date: new Date(
                day.getFullYear(),
                day.getMonth() + 1,
                0,
                23,
                59,
                59
            ),
            is_current_posting_period: index == 1,
            is_year_end_closing: fiscalYearStartMonth === 11,
            isProtectedForEdit: true,
            status: 0,
            startDate: new Date(),
            createdBy: String(creator),
            revisedBy: String(creator),
            endDate: new Date("9999/12/31"),
        });
        fiscalYearStartMonth += 1;
        index++;
    }

    if (accountingPeriods.length > 0) {
        await accounting_period.createMany({
            skipDuplicates: true,
            data: accountingPeriods,
        });
        await accounting_period.updateMany({
            where: {
                period_starting_date: {
                    gte: new Date(startDate.getFullYear() - 1, 0, 1),
                    lt: new Date(startDate.getFullYear(), 0, 1),
                },
            },
            data: {
                status: 1,
            },
        });
        console.log(true);
    }

    console.log(false);
};
// test(1, "seed", new Date(2022, 01, 01));

const prismaNullFilter = async () => {
    const data = await user.findMany({
        include: {
            role: true,
        },
    });
    console.log(data);
};
// prismaNullFilter();
const stringToBuffer = async () => {
    const data = "this is the awesomest person ever";
    const newData = Buffer.from(data, "ascii");
    require("fs").writeFileSync("./abebe.txt", newData, "ascii");
};
// stringToBuffer();
const projectIdSetter = async () => {
    const projects = await project.findMany({ orderBy: { id: "asc" } });
    for (let i in projects) {
        const singlePro = projects[i];
        let toBeSet = `${singlePro.id}`;
        const len = toBeSet.length;
        for (let i = 0; i < 6 - len; i++) {
            toBeSet = "0" + toBeSet;
        }
        await project.update({
            where: {
                id: singlePro.id,
            },
            data: {
                project_id: toBeSet,
            },
        });
    }
};
// projectIdSetter();
const prismaIntegratedFn = async () => {
    const a = new Date();
    await user.findFirst({
        where: { roleId: { not: null } },
        include: { role: true },
    });
    console.log("taken time - ", 1, " - ", new Date() - a);
};

const promiseAll = async () => {
    const data = await Promise.all([
        user.update({ where: { id: 1 }, data: { username: "yolo" } }),
        user.update({ where: { id: 1 }, data: { normalized_username: 4 } }),
    ]);
    console.table(data);
};

const dropProjects = async () => {
    await allModels.daily_work_log.deleteMany();
};

const primsaConnectFailureMessage = async () => {
    const role = await prisma.role.findFirst();
    if (!role) {
        console.log("no role!");
        return;
    }
    console.log(role);
    const connected = await prisma.role.update({
        where: {
            id: role.id,
        },
        data: {
            description: "this role should stay deleted",
            privileges: {
                connect: 1,
            },
        },
    });
    //for some reason this doesn't work! figure it out later
    console.log(connected);
};

// primsaConnectFailureMessage();

const { calculateAttendanceTime } = require("./payrollControl");

const employeeTimeCalculator = async () => {
    const data = await calculateAttendanceTime(
        new Date("2022/05/01 00:00:00"),
        new Date("2022/05/05 00:00:00"),
        2,
        false
    );
    console.log(data);
};
// employeeTimeCalculator();
const add = async () => 1 + 1;

const temp2 = async () => {
    console.log(await user.findFirst());
};
// temp2();
const sendMailTest = async () => {
    const fullName = "Yared Terefe Gebresellasie";
    const email = "yaredterefeg@gmail.com";
    const password = "password";
    await sendEmail(
        email,
        `Hello, Employee from ${COMPANY_NAME}`,
        `${COMPANY_NAME} Account Creation`,

        `<div>
            Hello ${fullName}, This is your temporary password from your account from erp.elhadar.com
            Please login and change your password!
            <div>
                login email: ${email}
                login Password: ${password}
            </div>
            </div>`
    );
};
// sendMailTest();
const transactionOnPrisma = async () => {
    const abebe = prisma.bank.create({
        data: {
            account_name: "Abebe1",
            account_type: 1,
            createdBy: "1",
            revisedBy: "1",
            endDate: new Date(),
            startDate: new Date(),
            account_code: "some code",
            account_number: "what does this even mean",
            IBAN: "still no idea",
            bank_name: "Awash Bank",
            currency_id: 1,
        },
    });
    const errorCreate = (async () => {
        throw "error";
    })().catch((_e) => "error");
    const data = await errorCreate;
    // const data = await Promise.all([abebe, errorCreate]);
    console.log(data);
    // const never = data[1];
    // console.log(never)
};
const prismatest = async () => {
    console.log(await prisma.user.findFirst());
};
prismatest();
