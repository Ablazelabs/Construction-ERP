const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const {
    attendance_abscence_type,
    attendance_captured,
    attendance_payroll,
    device_id_mapping,
    holiday,
    holiday_character,
    leave_period,
    leave_plan,
    punch,
    punch_device,
    punch_log,
    punch_manual_import,
    punch_time,
    shift_schedule_dtl,
    shift_schedule_hdr,
    sub_shift_group,
} = new PrismaClient();

const allModels = {
    attendance_abscence_type,
    attendance_captured,
    attendance_payroll,
    device_id_mapping,
    holiday,
    holiday_character,
    leave_period,
    leave_plan,
    punch,
    punch_device,
    punch_log,
    punch_manual_import,
    punch_time,
    shift_schedule_dtl,
    shift_schedule_hdr,
    sub_shift_group,
};
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
const post = async (reqBody, operationDataType, creator, next) => {
    for (let i in uniqueValues[operationDataType]) {
        const uniqueKey = uniqueValues[operationDataType][i];
        if (
            !reqBody[uniqueKey] &&
            reqBody[uniqueKey] != 0 &&
            reqBody[uniqueKey] != false
        )
            continue;
        let whereData = {};
        whereData[uniqueKey] = reqBody[uniqueKey];
        const queryData = await allModels[operationDataType].findUnique({
            where: {
                ...whereData,
            },
            select: {
                status: true,
            },
        });
        if (queryData) {
            if (queryData.status == 1) {
                await allModels[operationDataType].update({
                    where: { ...whereData },
                    data: {
                        status: 0,
                        startDate: reqBody.startDate,
                        endDate: reqBody.endDate,
                    },
                });
                return { success: true };
            }
            error(`${uniqueKey}`, `${operationDataType} already exists`, next);
            return false;
        }
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    try {
        await allModels[operationDataType].create({
            data: {
                ...defaultData,
                ...reqBody,
            },
        });
        //   console.log(data);
        return { success: true };
    } catch (e) {
        console.log(e);
        if (e.meta.field_name) {
            const fieldModel = e.meta.field_name
                .replace("_id", "")
                .replace(/_/g, " ");
            error(
                e.meta.field_name,
                `no ${fieldModel} exists with this id`,
                next
            );
            return false;
        }
    }
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType
) => {
    const data = await allModels[operationDataType].findMany({
        where: {
            ...queryFilter,
            status: 0,
        },
        orderBy: {
            ...querySort,
        },
        take: limit,
        skip,
        select: {
            ...projection,
        },
    });
    return data;
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    next
) => {
    const myModel = await allModels[operationDataType].findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myModel) {
        error("id", `${operationDataType} doesn't exist`, next);
        return false;
    }
    if (myModel.isProtectedForEdit) {
        error(
            "id",
            `this ${operationDataType} is protected against edit`,
            next
        );
        return false;
    }
    for (let i in uniqueValues[operationDataType]) {
        const key = uniqueValues[operationDataType][i];
        if (
            updateData[key] ||
            updateData[key] == 0 ||
            updateData[key] == false
        ) {
            if (updateData[key] === myModel[key]) {
                updateData[key] = undefined;
            } else {
                let whereData = {};
                whereData[key] = updateData[key];
                const data = await allModels[operationDataType].findUnique({
                    select: { id: true },
                    where: { ...whereData },
                });
                if (data) {
                    error(key, "already exists", next);
                    return false;
                }
            }
        }
    }
    try {
        await allModels[operationDataType].update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name) {
            const fieldModel = e.meta.field_name
                .replace("_id", "")
                .replace(/_/g, " ");
            error(
                e.meta.field_name,
                `no ${fieldModel} exists with this id`,
                next
            );
            return false;
        }
    }
    return { success: true };
};
const deleter = async ({ id }, operationDataType) => {
    try {
        await allModels[operationDataType].update({
            where: { id },
            data: { status: 1, endDate: new Date() },
        });
    } catch (e) {
        console.log(e);
        return { success: false };
    }
    return { success: true };
};

module.exports = {
    post,
    get,
    patch,
    deleter,
};
