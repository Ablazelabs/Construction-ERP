const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const {
    equipment,
    evaluation,
    instruction,
    manpower,
    material_category,
    phase,
    priority,
    work_category,
    document_category,
} = new PrismaClient();
const masterDataModels = {
    equipment,
    evaluation,
    instruction,
    manpower,
    material_category,
    phase,
    priority,
    work_category,
    document_category,
};
const post = async (reqBody, creator, masterDataType, next) => {
    const queryData = await masterDataModels[masterDataType].findUnique({
        where: {
            name: reqBody.name,
        },
        select: {
            status: true,
        },
    });
    if (queryData) {
        if (queryData.status == 1) {
            await role.update({
                where: { name: reqBody.name },
                data: {
                    status: 0,
                    startDate: reqBody.startDate,
                    endDate: reqBody.endDate,
                },
            });
            return { success: true };
        }
        error("name", `${masterDataType} already exists`, next);
        return false;
    }
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    await masterDataModels[masterDataType].create({
        data: {
            name: reqBody.name,
            color: masterDataType == "priority" ? reqBody.color : undefined,
            description: reqBody.description,
            startDate: reqBody.startDate,
            endDate: reqBody.endDate,
            isProtectedForEdit: reqBody.isProtectedForEdit,
            ...defaultData,
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
    masterDataType
) => {
    const data = await masterDataModels[masterDataType].findMany({
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
    masterDataType,
    creator,
    next
) => {
    const myMasterData = await masterDataModels[masterDataType].findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myMasterData) {
        error("id", `${masterDataType} doesn't exist`, next);
        return false;
    }
    if (myMasterData.isProtectedForEdit) {
        error("id", `this ${masterDataType} is protected against edit`, next);
        return false;
    }
    if (updateData.name) {
        if (updateData.name === myMasterData.name) {
            updateData.name = undefined;
        } else {
            const data = await masterDataModels[masterDataType].findUnique({
                select: { name: true },
                where: { name: updateData.name },
            });
            if (data) {
                error("name", "already exists", next);
                return false;
            }
        }
    }
    await masterDataModels[masterDataType].update({
        data: {
            ...updateData,
            revisedBy: String(creator),
        },
        where: { id: reqBody.id },
    });

    return { success: true };
};
const deleter = async ({ id }, masterDataType) => {
    try {
        await masterDataModels[masterDataType].update({
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
