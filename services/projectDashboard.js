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
        "",
        "payment_request",
        "manpower_request",
        "store_request",
    ];
    filters = [1, 2, 3];
    let requests = {};
    total = 0;
    for (let i in filters) {
        requests[requestModels[filters[i]]] = await allModels[
            "project_request"
        ].count({
            where: {
                approval_status: 1,
                request_type: filters[i],
            },
        });
        total += requests[requestModels[filters[i]]];
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
