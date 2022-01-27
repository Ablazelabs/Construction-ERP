const { allModels } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
    deleter: mDelete,
} = require("./mostCRUD/mostCRUD");
const { leave_plan, shift_schedule_dtl } = allModels;
const post = async (
    shiftScheduleHdr,
    shiftScheduleDtls,
    creator,
    uniqueValues,
    next
) => {
    const hdrId = await mPost(
        shiftScheduleHdr,
        "shift_schedule_hdr",
        creator,
        uniqueValues,
        next,
        true
    );
    if (hdrId == false) {
        return false;
    }
    const count = await shift_schedule_dtl.createMany({
        data: shiftScheduleDtls.map((element) => {
            return {
                ...element,
                shift_schedule_hdr_id: hdrId.id,
                createdBy: String(creator),
                revisedBy: String(creator),
                status: 0,
            };
        }),
    });
    return { success: Boolean(count.count) };
};
/**
 *
 * @param {number} shiftScheduleHdrId
 * @param {Array<any>} shiftScheduleDtls
 * @param {Number} creator
 * @returns
 */
const put = async (shiftScheduleHdrId, shiftScheduleDtls, creator) => {
    const shiftSchedules = await shift_schedule_dtl.findMany({
        where: { shift_schedule_hdr_id: shiftScheduleHdrId },
    });
    let createdShifts = [];
    let updatedShifts = [];
    shiftScheduleDtls.forEach((detail) => {
        const updated = shiftSchedules.find(
            (shiftS) =>
                detail.working_day && shiftS.working_day === detail.working_day
        );
        // console.log(updated, shiftSchedules);
        updated
            ? updatedShifts.push({
                  id: updated.id,
                  data: {
                      ...detail,
                      revisedBy: String(creator),
                      startDate: undefined,
                      endDate: undefined,
                  },
              })
            : createdShifts.push({
                  ...detail,
                  createdBy: String(creator),
                  revisedBy: String(creator),
                  status: 0,
                  shift_schedule_hdr_id: shiftScheduleHdrId,
              });
    });
    const count = await shift_schedule_dtl.createMany({ data: createdShifts });
    let updatedd = false;
    for (let i in updatedShifts) {
        updatedd = true;
        await shift_schedule_dtl.update({
            where: { id: updatedShifts[i].id },
            data: updatedShifts[i].data,
        });
    }
    return { success: Boolean(count.count) || updatedd };
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
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    if (operationDataType === "leave_plan") {
        const leave = await leave_plan.findUnique({
            where: { id: reqBody.id },
        });
        if (leave) {
            if (leave.leave_request_status == 2) {
                error("id", "You can not edit approved leave", next);
                return false;
            }
        }
    }
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
const deleter = async ({ id }, operationDataType) => {
    return mDelete(id, operationDataType);
};

module.exports = {
    post,
    get,
    put,
    patch,
    deleter,
};
// same as the others
