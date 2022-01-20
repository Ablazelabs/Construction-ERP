const { allModels } = require("../config/config");
const { salary_component_account_mapping, global_payroll_account_mapping } =
    allModels;
const salaryMapping = async (accountMapping, creator) => {
    const defaultData = {
        startDate: new Date(),
        endDate: new Date("9999/12/31"),
        createdBy: String(creator),
        revisedBy: String(creator),
    };
    const createMany = accountMapping.filter((element) =>
        element.id ? false : true
    );
    const updateMany = accountMapping.filter((element) =>
        element.id ? true : false
    );
    for (let i in updateMany) {
        const updateAcc = { ...updateMany[i], id: undefined };
        const { id } = updateMany[i];
        try {
            await salary_component_account_mapping.upsert({
                where: { id },
                update: updateAcc,
                create: {
                    ...updateAcc,
                    ...defaultData,
                },
            });
        } catch {}
        //even if error(no such foreign key, leave it because it's multiple update and create)
    }
    const createData = createMany.map((element) => {
        return {
            ...defaultData,
            ...element,
        };
    });
    if (createData.length) {
        await salary_component_account_mapping.createMany({
            data: createData,
            skipDuplicates: true,
        });
    }
    return { success: true };
};
const otherMapping = async (accountMapping, creator) => {
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
    };
    const createMany = accountMapping.filter((element) =>
        element.id ? false : true
    );
    const updateMany = accountMapping.filter((element) =>
        element.id ? true : false
    );
    for (let i in updateMany) {
        const updateAcc = { ...updateMany[i], id: undefined };
        const { id } = updateMany[i];
        try {
            await global_payroll_account_mapping.upsert({
                where: { id },
                update: updateAcc,
                create: {
                    ...updateAcc,
                    ...defaultData,
                },
            });
        } catch {}
        //even if error(no such foreign key, leave it because it's multiple update and create)
    }
    const createData = createMany.map((element) => {
        return {
            ...defaultData,
            ...element,
        };
    });
    if (createData.length) {
        await global_payroll_account_mapping.createMany({
            data: createData,
            skipDuplicates: true,
        });
    }
    return { success: true };
};

module.exports = {
    salaryMapping,
    otherMapping,
};
