const { allModels } = require("../config/config");

const { project } = allModels;

const indexService = async () => {
    const totalProjectsLength = await project.count();
    const completedProjects = await project.findMany({
        where: { project_end_date: { lte: new Date() } },
    });
    const completedProjectsLenth = completedProjects.length;
    const inCompleteProjectsLength =
        totalProjectsLength - completedProjectsLenth;
    const requestModels = [
        "manpower_requirement",
        "required_equipment",
        "required_material",
        "request",
        "required_document",
        "request_payment",
    ];
    let requests = {};
    total = 0;
    for (let i in requestModels) {
        requests[requestModels[i]] = await allModels[requestModels[i]].count({
            where: {
                approval_status: 1,
            },
        });
        total += requests[requestModels[i]];
    }
    requests["total"] = total;
    return {
        totalProjectsLength,
        completedProjects,
        completedProjectsLenth,
        inCompleteProjectsLength,
        requests,
    };
};

module.exports = {
    indexService,
};
