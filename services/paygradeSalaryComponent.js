const { allModels } = require("../config/config");
const { paygrade_salary_component } = allModels;
const defaultData = {
    startDate: new Date(),
    endDate: new Date("9999/12/31"),
};
module.exports = async (salaryComponents, paygrade_id, creator) => {
    await paygrade_salary_component.deleteMany({
        where: {
            paygrade_id,
        },
    });
    const createData = salaryComponents.map((element) => {
        return {
            ...defaultData,
            salary_component_id: element,
            paygrade_id,
            createdBy: String(creator),
            revisedBy: String(creator),
        };
    });
    const data = await paygrade_salary_component.createMany({
        data: createData,
        skipDuplicates: true,
    });
    return data;
};
