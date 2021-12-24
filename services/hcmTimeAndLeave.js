const uniqueValues = {
    attendance_abscence_type: ["aa_description"],
    attendance_captured: [],
    attendance_payroll: [],
    device_id_mapping: ["finger_print_id", "employee_id"],
    holiday: ["holiday_name"],
    holiday_character: ["date", "holiday_id"],
    leave_period: [],
    leave_plan: ["employee_id"],
    punch: [],
    punch_device: ["device_name"],
    punch_log: [],
    punch_manual_import: [],
    punch_time: [],
    shift_schedule_dtl: [],
    shift_schedule_hdr: ["shift_name"],
    sub_shift_group: ["sub_shift_name"],
};
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
    deleter: mDelete,
} = require("./mostCRUD/mostCRUD");
const post = async (reqBody, operationDataType, creator, next) => {
    return mPost(
        reqBody,
        operationDataType,
        creator,
        uniqueValues[operationDataType],
        next
    );
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
    next
) => {
    return mPatch(
        updateDataProjection,
        reqBody,
        updateData,
        operationDataType,
        creator,
        uniqueValues[operationDataType],
        next
    );
};
const deleter = async ({ id }, operationDataType) => {
    return mDelete(id, operationDataType);
};

module.exports = {
    post,
    get,
    patch,
    deleter,
};
