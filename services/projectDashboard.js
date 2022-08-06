const { allModels } = require("../config/config");

const {
    project,
    project_edit_request,
    payment_request,
    user,
    project_request,
} = allModels;

const indexService = async (creator) => {
    const userData = await user.findUnique({
        where: { id: creator },
        include: { role: { include: { privileges: true } } },
    });

    const totalProjectsLength = await project.count();
    const completedProjectsLenth = await project.count({
        where: { project_end_date: { lte: new Date() } },
    });
    const onGoingProjects = await project.findMany({
        where: { project_end_date: { gt: new Date() } },
    });
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
                OR: [{ approval_status: 1 }, { approval_status: 4 }],
                status: 0,
                request_type: filters[i],
            },
        });
        if (requestModels[filters[i]] === "store_request") {
            if (
                userData?.role?.privileges?.find((elem) =>
                    elem.action.match(/(STORE_TWO|admin|super|HEAD)/)
                )
            ) {
                total += requests[requestModels[filters[i]]];
            } else {
                delete requests[requestModels[filters[i]]];
            }
        } else {
            total += requests[requestModels[filters[i]]];
        }
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
    const pvRequestLength = userData?.role?.privileges?.find((elem) =>
        elem.action.match(/(FINANCE_TWO|admin|super|HEAD)/)
    )
        ? await payment_request.count({
              where: {
                  approval_status: 1,
              },
          })
        : 0;
    requests["total"] = total + projectEditRequestLength + pvRequestLength;
    requests = {
        ...requests,
        project_edit_request: projectEditRequestLength,
        pv_request: pvRequestLength,
    };
    return {
        totalProjectsLength,
        onGoingProjects,
        completedProjectsLenth,
        inCompleteProjectsLength,
        requests,
    };
};

module.exports = {
    indexService,
};
