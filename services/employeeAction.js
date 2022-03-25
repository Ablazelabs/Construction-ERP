const { error, allModels } = require("../config/config");
const { action_type, employee_action, org_assignment } = allModels;
const { patch } = require("./hcmEmployeeMasters");
const postLogic = async (reqBody) => {
    if (reqBody.action_type_id) {
        const employeeStatus = await action_type.findFirst({
            where: { id: reqBody.action_type_id, status: 0 },
            select: { employee_status: true },
        });
        if (employeeStatus) {
            reqBody.employee_status = employeeStatus.employee_status;
        }
        reqBody.action_type_id = undefined;
    }
    //context.EmployeeAction.Where(a => a.EmployeeId == employeeAction.EmployeeId && a.StartDate.Date == employeeAction.StartDate.Date && a.EndDate.Date == employeeAction.EndDate.Date).FirstOrDefault();
    await org_assignment.updateMany({
        where: {
            employee_action: {
                employee_id: 1,
                startDate: {
                    gte: reqBody.startDate,
                    lt: new Date(
                        new Date(reqBody.startDate).setDate(
                            reqBody.startDate.getDate() + 1
                        )
                    ),
                },
                endDate: {
                    gte: reqBody.endDate,
                    lt: new Date(
                        new Date(reqBody.endDate).setDate(
                            reqBody.endDate.getDate() + 1
                        )
                    ),
                },
                status: 0,
            },
        },
        data: {
            status: 1,
        },
    });
    await employee_action.updateMany({
        where: {
            employee_id: reqBody.employee_id,
            startDate: {
                gte: reqBody.startDate,
                lt: new Date(
                    new Date(reqBody.startDate).setDate(
                        reqBody.startDate.getDate() + 1
                    )
                ),
            },
            endDate: {
                gte: reqBody.endDate,
                lt: new Date(
                    new Date(reqBody.endDate).setDate(
                        reqBody.endDate.getDate() + 1
                    )
                ),
            },
            status: 0,
        },
        data: {
            status: 1,
        },
    });

    /**
     *  var prevValidFromDate = context.EmployeeAction.Where(a => a.EmployeeId == employeeAction.EmployeeId).Max(a => (DateTime?)a.StartDate ?? null);
	    var prevValidToDate = context.EmployeeAction.Where(a => a.EmployeeId == employeeAction.EmployeeId).Max(a => (DateTime?)a.EndDate ?? null);
     */

    const prevMaxStartDate = await employee_action.findFirst({
        where: {
            employee_id: reqBody.employee_id,
            status: 0,
        },
        orderBy: {
            startDate: "desc",
        },
        select: {
            startDate: true,
        },
    });
    const prevMaxEndDate = await employee_action.findFirst({
        where: {
            employee_id: reqBody.employee_id,
            status: 0,
        },
        orderBy: {
            endDate: "desc",
        },
        select: {
            endDate: true,
        },
    });
    const getCsDate = (date) =>
        `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/`;
    if (prevMaxStartDate && prevMaxEndDate) {
        if (
            prevMaxStartDate.startDate > reqBody.startDate ||
            getCsDate(prevMaxStartDate.startDate) ===
                getCsDate(reqBody.startDate)
        ) {
            await org_assignment.updateMany({
                where: {
                    employee_action: {
                        employee_id: reqBody.employee_id,
                        OR: [
                            {
                                endDate: {
                                    gte: reqBody.endDate,
                                    lt: new Date(
                                        new Date(reqBody.endDate).setDate(
                                            reqBody.endDate.getDate() + 1
                                        )
                                    ),
                                },
                            },
                            {
                                endDate: {
                                    gte: reqBody.startDate,
                                },
                            },
                        ],
                        status: 0,
                    },
                },
                data: {
                    status: 1,
                },
            });
            await employee_action.updateMany({
                where: {
                    employee_id: reqBody.employee_id,
                    OR: [
                        {
                            endDate: {
                                gte: reqBody.endDate,
                                lt: new Date(
                                    new Date(reqBody.endDate).setDate(
                                        reqBody.endDate.getDate() + 1
                                    )
                                ),
                            },
                        },
                        {
                            endDate: {
                                gte: reqBody.startDate,
                            },
                        },
                    ],
                    status: 0,
                },
                data: {
                    status: 1,
                },
            });
        } else if (prevMaxStartDate.startDate < reqBody.startDate) {
            let dateToBeSet = new Date(reqBody.startDate);
            dateToBeSet.setDate(dateToBeSet.getDate() - 1);
            await employee_action.updateMany({
                where: {
                    employee_id: reqBody.employee_id,
                    startDate: {
                        gte: reqBody.startDate,
                        lt: new Date(
                            new Date(reqBody.startDate).setDate(
                                reqBody.startDate.getDate() + 1
                            )
                        ),
                    },
                    endDate: {
                        gte: reqBody.endDate,
                        lt: new Date(
                            new Date(reqBody.endDate).setDate(
                                reqBody.endDate.getDate() + 1
                            )
                        ),
                    },
                    status: 0,
                },
                data: {
                    endDate: dateToBeSet,
                },
            });
        }
    }
    return reqBody;
};
const patchLogic = async (
    { id },
    updateDataEmp,
    updateDataProjectionEmp,
    updateDataOrg,
    updateDataProjectionOrg,
    creator,
    next
) => {
    const employeeId = await employee_action.findUnique({
        where: {
            id,
        },
        select: {
            employee_id: true,
            org_assignment: true,
        },
    });
    let count = 0;
    if (employeeId)
        count = await employee_action.count({
            where: {
                employee_id: employeeId.employee_id,
                status: 0,
            },
        });
    else {
        error("id", "no employee action exists with this id", next);
        return;
    }
    if (count > 1) {
        return { success: false };
    }
    const updatedOrg = employeeId.org_assignment[0];
    const empData = await patch(
        updateDataProjectionEmp,
        { id },
        updateDataEmp,
        "employee_action",
        creator,
        [],
        next
    );
    if (!empData) {
        return;
    }
    const orgData = await patch(
        updateDataProjectionOrg,
        { id: updatedOrg.id },
        updateDataOrg,
        "org_assignment",
        creator,
        [],
        next
    );
    if (!orgData) {
        return;
    }
    return orgData;
};
module.exports = {
    postLogic,
    patchLogic,
};
