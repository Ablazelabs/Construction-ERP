const { allModels } = require("../config/config");

const {
    project,
    project_edit_request,
    payment_request,
    user,
    project_request,
    project_participation_request,
} = allModels;

const indexService = async (creator) => {
    const userData = await user.findUnique({
        where: { id: creator },
        include: { role: { include: { privileges: true } } },
    });
    const participationRequests = await project_participation_request.findMany({
        where: {
            project: {
                createdBy: String(creator),
            },
            approval_status: 1,
        },
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
    const paymentRequestForFinance = userData?.role?.privileges?.find((elem) =>
        elem.action.match(/FINANCE_ONE/)
    )
        ? await allModels.project_request.count({
              where: {
                  approval_status: {
                      in: [2, 4],
                  },
                  request_type: 1,
              },
          })
        : 0;
    const paymentRequestForStore = userData?.role?.privileges?.find((elem) =>
        elem.action.match(/STORE_ONE/)
    )
        ? await allModels.project_request.count({
              where: {
                  approval_status: {
                      in: [2, 4],
                  },
                  request_type: 3,
              },
          })
        : 0;
    for (let i in filters) {
        requests[requestModels[filters[i]]] = await allModels[
            "project_request"
        ].count({
            where: {
                OR: [
                    { approval_status: 1 },
                    { approval_status: 4 },
                    { approval_status: 2, checked_by_id: null },
                ],
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
            if (
                userData?.role?.privileges?.find((elem) =>
                    elem.action.match(/(PROJECT_ONE|admin|super|HEAD)/)
                )
            ) {
                total += requests[requestModels[filters[i]]];
            } else {
                delete requests[requestModels[filters[i]]];
            }
        }
    }
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const projectEditRequestLength = userData?.role?.privileges?.find((elem) =>
        elem.action.match(/(PROJECT_ONE|admin|super|HEAD)/)
    )
        ? await project_edit_request.count({
              where: {
                  requested_date: {
                      gt: yesterday,
                  },
                  approval_status: 1,
              },
          })
        : 0;
    const pvRequestLength = userData?.role?.privileges?.find((elem) =>
        elem.action.match(/(FINANCE_ONE|admin|super|HEAD)/)
    )
        ? await payment_request.count({
              where: {
                  approval_status: {
                      in: [1, 4],
                  },
              },
          })
        : 0;
    requests["total"] =
        total +
        projectEditRequestLength +
        pvRequestLength +
        participationRequests.length +
        paymentRequestForFinance;
    requests = {
        ...requests,
        project_edit_request: projectEditRequestLength,
        pv_request: pvRequestLength,
        project_participation_request: participationRequests.length,
        payment_request_for_finance: paymentRequestForFinance,
        payment_request_for_store: paymentRequestForStore,
    };
    console.log({
        requests,
    });
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
