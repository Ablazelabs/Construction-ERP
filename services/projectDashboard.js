const { allModels } = require("../config/config");

const { project, project_edit_request } = allModels;

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
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const projectEditRequestLength = await project_edit_request.count({
        where: {
            requested_date: {
                gt: yesterday,
            },
            approval_status: 1,
        },
    });
    requests["total"] = total + projectEditRequestLength;
    requests = { ...requests, project_edit_request: projectEditRequestLength };
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
