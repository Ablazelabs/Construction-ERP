const {
    allModels: { commitment, user },
    allModels,
} = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
/**
 * If the operationDataType is employee_commitment, then find the commitment_id in the commitment
 * table, and if it exists, then set the endDate to the startDate plus the period of the commitment.
 * @param reqBody - The request body
 * @param operationDataType - The name of the table you want to insert into
 * @param creator - the user who is creating the record
 * @param uniqueValues - an array of strings that are the names of the columns that are unique in the
 * table.
 * @param next - is the next function in the middleware chain
 * @param [sendId=false] - boolean - if true, the id of the created object will be sent back to the
 * client
 * @returns the result of the mPost function.
 */
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next,
    sendId = false
) => {
    if (operationDataType === "employee_commitment") {
        const commitmentMonths = await commitment.findUnique({
            where: {
                id: reqBody.commitment_id,
            },
        });
        if (commitmentMonths) {
            let endDay = new Date(employeeCommitmentReqBody.startDate);
            endDay.setMonth(endDay.getMonth() + commitmentMonths.period || 0);
            employeeCommitmentReqBody.endDate = endDay;
        }
    }
    return mPost(
        reqBody,
        operationDataType,
        creator,
        uniqueValues,
        next,
        sendId
    );
};
/**
 * It returns a promise that resolves to the result of calling the function mGet with the same
 * arguments.
 * @param queryFilter - This is the filter object that you pass to the mongoose find() method.
 * @param querySort - { _id: -1 }
 * @param limit - The number of documents to return.
 * @param skip - The number of documents to skip.
 * @param projection - {
 * @param operationDataType - This is the name of the collection you want to query.
 * @returns The function mGet is being returned.
 */
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType,
    creator = 0
) => {
    let insideQuery = {};
    if (operationDataType === "announcement" && creator) {
        const acc = await user.findUnique({
            where: {
                id: creator,
            },
            include: {
                employee: {
                    include: {
                        employee_action: true,
                    },
                },
            },
        });

        if (acc.employee_id) {
            const actionId = acc.employee.employee_action
                .sort(
                    (a, b) =>
                        a.creationDate.getTime() - b.creationDate.getTime()
                )
                .pop()?.id;
            //filter if this user has any annoncements!!
            //#region the way it works to fetch if the annoncement concerns the user
            // await allModels.announcement.findMany({
            //     where: {
            //         OR: [
            //             {
            //                 all_employees: true,
            //             },
            //             {
            //                 employees: {
            //                     some: {
            //                         id: acc.employee_id,
            //                     },
            //                 },
            //             },
            //             {
            //                 business_unit: {
            //                     some: {
            //                         org_assignment: {
            //                             some: {
            //                                 employee_action: {
            //                                     id: actionId,
            //                                 },
            //                             },
            //                         },
            //                     },
            //                 },
            //             },
            //             {
            //                 job_title: {
            //                     some: {
            //                         org_assignment: {
            //                             some: {
            //                                 employee_action: {
            //                                     id: actionId,
            //                                 },
            //                             },
            //                         },
            //                     },
            //                 },
            //             },
            //         ],
            //     },
            // });
            //#endregion
            insideQuery = {
                OR: [
                    {
                        all_employees: true,
                    },
                    {
                        employees: {
                            some: {
                                id: acc.employee_id,
                            },
                        },
                    },
                    {
                        business_unit: {
                            some: {
                                org_assignment: {
                                    some: {
                                        employee_action: {
                                            id: actionId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    {
                        job_title: {
                            some: {
                                org_assignment: {
                                    some: {
                                        employee_action: {
                                            id: actionId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            };
        }
    }
    return mGet(
        { ...queryFilter, ...insideQuery },
        querySort,
        limit,
        skip,
        projection,
        operationDataType
    );
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    return mPatch(
        updateDataProjection,
        reqBody,
        updateData,
        operationDataType,
        creator,
        uniqueValues,
        next
    );
};
module.exports = {
    post,
    get,
    patch,
};
// same as the others
