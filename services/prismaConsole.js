const { allModels } = require("../config/config");

const { accounting_period } = allModels;

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
test(1, "seed", new Date(2022, 01, 10));
