const {
    allModels: { project_request, project_edit_request },
    error,
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
    reqBody.approval_status = 1;
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

    await project_request.create({
        data: {
            ...reqBody,
            createdBy: String(creator),
            revisedBy: String(creator),
            individual_requests: {
                //delete persons when u can!
                createMany: {
                    data: request.map((elem) => ({
                        persons: "a",
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
const postEditRequest = async ({ requester_id, project_id }, creator, next) => {
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
        },
    });
    return { success: true };
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

module.exports = {
    post,
    get,
    postEditRequest,
};
