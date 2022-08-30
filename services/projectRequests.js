const {
    allModels: {
        project_request,
        project_edit_request,
        user,
        project_participation_request,
    },
    error,
    allModels,
} = require("../config/config");
const { get: mGet } = require("./mostCRUD/mostCRUD");
/**
 *
 * @param {any} reqBody filtered request body for the model of *operation data type* parameter
 * @param {object[]} request
 * @param {number} creator
 * @param {Function} next
 * @returns
 */
const post = async (reqBody, request, creator, next) => {
    if (reqBody.approval_status === 0) {
    } else {
        reqBody.approval_status = 1;
    }
    console.log(reqBody);
    if (reqBody.request_type === 1 || reqBody.request_type === 2) {
        let vat_amount = 0;
        let sub_total = 0;
        for (let i in request) {
            if (request[i].returnable && !request[i].return_date) {
                error("return_date", "please send return date", next);
                return false;
            }
            sub_total += request[i].unit_rate * request[i].quantity;
            if (request[i].vat) {
                vat_amount += sub_total * 0.15;
            }
        }
        reqBody = {
            ...reqBody,
            vat_amount,
            sub_total,
            total_amount: vat_amount + sub_total,
        };
    }
    const userData = await user.findUnique({ where: { id: creator } });
    if (!userData) {
        error("accessToken", "User not found", next, 401);
        return false;
    }
    if (!userData.employee_id) {
        error("user", "User isn't registered as an employee", next);
        return false;
    }
    reqBody.prepared_by_id = userData.employee_id;
    await project_request.create({
        data: {
            ...reqBody,
            createdBy: String(creator),
            revisedBy: String(creator),
            individual_requests: {
                createMany: {
                    data: request.map((elem) => ({
                        ...elem,
                        createdBy: String(creator),
                        revisedBy: String(creator),
                    })),
                    skipDuplicates: true,
                },
            },
        },
    });
    return { success: true };
};
/**
 *
 * @param {{requester_id: number,project_id: number}} param0
 * @param {*} creator
 * @param {*} next
 * @returns
 */
const postEditRequest = async ({ requester_id, project_id, reason }, next) => {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prevReq = await project_edit_request.findFirst({
        where: {
            requester_id,
            project_id,
            requested_date: {
                gt: yesterday,
            },
        },
    });
    if (prevReq) {
        error(
            "request_id",
            "you already have requested within the last 24 hours",
            next
        );
        return;
    }
    await project_edit_request.create({
        data: {
            requester_id,
            project_id,
            reason,
        },
    });
    return { success: true };
};

/**
 *
 * @param {{requester_id: number,project_id: number}} param0
 * @param {*} creator
 * @param {*} next
 * @returns
 */
const postParticipationRequest = async (
    { requester_id, project_id, remark },
    next
) => {
    const prevReq = await project_participation_request.findFirst({
        where: { requester_id, project_id },
    });
    if (prevReq) {
        error(
            "request_id",
            "you already have requested for this project",
            next
        );
        return;
    }
    await project_participation_request.create({
        data: { requester_id, project_id, remark, requested_date: new Date() },
    });
    return { success: true };
};

/**
 *
 * @param {boolean} all
 * @returns
 */
const getEditRequest = async (all = false) => {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const whereData = all
        ? {}
        : {
              requested_date: {
                  gt: yesterday,
              },
              approval_status: 1,
          };
    return await project_edit_request.findMany({
        where: whereData,
        include: {
            requester: true,
        },
    });
};

/**
 *
 * @param {boolean} all
 * @returns
 */
const getParticipationRequest = async (creator) => {
    return await project_participation_request.findMany({
        where: {
            project: {
                createdBy: String(creator),
            },
        },
        include: {
            requester: true,
        },
    });
};

/**
 *
 * @param {number} user_id
 * @param {number} project_id
 * @param {Function} next
 * @returns
 */
const statusEditRequest = async (user_id, project_id) => {
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const data = await project_edit_request.findFirst({
        where: {
            requested_date: {
                gt: yesterday,
            },
            requester_id: user_id,
            project_id,
        },
    });
    return {
        canUserRequest: !Boolean(data),
        isUserApproved: data ? data.approval_status === 2 : false,
    };
};

const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType
) => {
    return mGet(
        queryFilter,
        querySort,
        limit,
        skip,
        projection,
        operationDataType
    );
};
const deleter = async (id) => {
    await allModels.project_request.update({
        where: { id },
        data: { status: 1 },
    });
};
module.exports = {
    post,
    get,
    postEditRequest,
    getEditRequest,
    statusEditRequest,
    deleter,
    getParticipationRequest,
    postParticipationRequest,
};
