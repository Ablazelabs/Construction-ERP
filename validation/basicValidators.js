const inputFilter = require("./inputFilter");
const validation = require("./validation");
const { error } = require("../config/config");
const auditLogProjection = {
    startDate: true,
    endDate: true,
    creationDate: true,
    createdBy: true,
    revisionDate: true,
    revisedBy: true,
    isProtectedForEdit: true,
};
const auditLogSort = {
    startDate: "number",
    endDate: "number",
    creationDate: "number",
    createdBy: "number",
    revisionDate: "number",
    revisedBy: "number",
    isProtectedForEdit: "number",
};
/**
 *
 * @param {object} reqBody the object to be processed
 * @param {{phoneValue:Array<string>,emailValue:Array<string>,dateValue:Array<string>,requiredInputFilter:any, optionalInputFilter:any,myEnums:any,rangeValues:any}} param1
 * @param {Function} next
 * @returns
 */
const returnReqBody = (
    reqBody,
    {
        requiredInputFilter: {},
        optionalInputFilter: {},
        phoneValue: [],
        emailValue: [],
        dateValue: [],
        myEnums: {},
        rangeValues: {},
    },
    next
) => {
    try {
        reqBody = inputFilter(
            {
                ...requiredInputFilter,
            },
            { isProtectedForEdit: "boolean", ...optionalInputFilter },
            reqBody,
            1
        );
        if (!reqBody.startDate) {
            reqBody.startDate = new Date();
        }
        if (!reqBody.endDate) {
            reqBody.endDate = new Date("9999/12/31");
        }
        for (let i in dateValue) {
            if (!reqBody[dateValue[i]]) {
                continue;
            }
            reqBody[dateValue[i]] = new Date(reqBody[dateValue[i]]);
            if (!reqBody[dateValue[i]].getTime()) {
                throw {
                    key: dateValue[i],
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
        for (let i in myEnums) {
            const key = i;
            const myArray = myEnums[i];
            if (!reqBody[key] && reqBody[key] != 0) {
                continue;
            } else {
                if (reqBody[key] < 1 || reqBody[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    reqBody[key] = Math.floor(reqBody[key]);
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    for (let i in rangeValues) {
        if (!reqBody[i] && reqBody[i] != 0) {
            continue;
        }
        if (reqBody[i] < rangeValues[i][0] || reqBody[i] > rangeValues[i][1]) {
            error(i, `must be in range ${rangeValues[i]}`, next);
            return false;
        }
    }
    for (let i in phoneValue) {
        if (reqBody[phoneValue[i]])
            if (
                !validation.checkPhoneNumber(
                    reqBody[phoneValue[i]],
                    next,
                    phoneValue[i]
                )
            )
                return;
    }
    for (let i in emailValue) {
        if (reqBody[emailValue[i]])
            if (
                !validation.checkEmail(
                    reqBody[emailValue[i]],
                    next,
                    emailValue[i]
                )
            )
                return;
    }
    return reqBody;
};
const returnGetData = (reqBody, { filters, sorts, projections }, next) => {
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    try {
        inputFilter(
            { limit: "number" },
            { skip: "number", filter: "object", sort: "object" },
            reqBody
        );
        limit = reqBody.limit;
        skip = reqBody.skip || 0;
        if (reqBody.filter) {
            filter = inputFilter(
                {},
                { ...filters, all: "string" },
                reqBody.filter
            );
        }
        if (reqBody.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    ...sorts,
                    ...auditLogSort,
                },
                reqBody.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    const projection = {
        ...projections,
        ...auditLogProjection,
    };
    let queryFilter = {};
    for (let i in filter) {
        if (i === "all") {
            continue;
        }
        if (typeof filter[i] == "number")
            queryFilter[i] = { equals: filter[i] };
        else queryFilter[i] = { contains: filter[i] };
    }
    if (filter.all) {
        queryFilter["OR"] = [];
        for (let i in filters) {
            if (filters[i] === "string") {
                let temp = {};
                temp[i] = { contains: filter.all };
                queryFilter["OR"].push({ ...temp });
            }
        }
    }
    let querySort = [];
    for (let i in sort) {
        let pushedObj = {};
        pushedObj[i] = sort[i] ? "asc" : "desc";
        querySort.push(pushedObj);
    }
    return { queryFilter, querySort, limit, skip, projection };
};
const returnPatchData = (
    reqBody,
    {
        requiredInputFilter,
        optionalInputFilter,
        phoneValue,
        emailValue,
        dateValue,
        myEnums,
        rangeValues,
    },
    next
) => {
    let updateData = {};
    try {
        inputFilter({ id: "number", updateData: "object" }, {}, reqBody);

        updateData = inputFilter(
            {},
            {
                ...requiredInputFilter,
                ...optionalInputFilter,
                isProtectedForEdit: "boolean",
            },
            reqBody.updateData
        );

        // if date values sent in update data, transform them into a date value, if wrong format detected throw an error

        for (let i in dateValue) {
            const key = dateValue[i];
            if (updateData[key]) {
                updateData[key] = new Date(updateData[key]);
                if (!updateData[key].getTime()) {
                    throw {
                        key: key,
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        }
        for (let i in myEnums) {
            const key = i;
            const myArray = myEnums[i];
            if (!updateData[key] && updateData[key] != 0) {
                continue;
            } else {
                if (updateData[key] < 1 || updateData[key] > myArray.length) {
                    throw {
                        key,
                        message: `please send a number between 1 and ${
                            myArray.length
                        }, as it identifies the following ${String(myArray)}`,
                    };
                } else {
                    updateData[key] = Math.floor(updateData[key]);
                }
            }
        }
        for (let i in rangeValues) {
            if (!updateData[i] && updateData[i] != 0) {
                continue;
            }
            if (
                updateData[i] < rangeValues[i][0] ||
                updateData[i] > rangeValues[i][1]
            ) {
                error(i, `must be in range ${rangeValues[i]}`, next);
                return false;
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }
    //if phone or email values given in update data validate it.
    for (let i in phoneValue) {
        if (updateData[phoneValue[i]])
            if (!validation.checkPhoneNumber(updateData[phoneValue[i]], next))
                return;
    }

    for (let i in emailValue) {
        if (updateData[emailValue[i]])
            if (!validation.checkEmail(updateData[emailValue[i]], next)) return;
    }
    let updateDataProjection = {};
    for (let i in updateData) {
        if (updateData[i]) {
            updateDataProjection[i] = true;
        }
    }
    return { updateData, updateDataProjection };
};
module.exports = {
    returnReqBody,
    returnGetData,
    returnPatchData,
};
