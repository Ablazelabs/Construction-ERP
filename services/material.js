const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { material } = new PrismaClient();

const post = async (reqBody, creator, next) => {
    const queryData = await material.findUnique({
        where: {
            name: reqBody.name,
        },
        select: {
            status: true,
        },
    });
    if (queryData) {
        if (queryData.status == 1) {
            await material.update({
                where: { name: reqBody.name },
                data: { status: 0 },
            });
            return { success: true };
        }
        error("name", "material already exists", next);
        return false;
    }
    try {
        const defaultData = {
            createdBy: String(creator),
            revisedBy: String(creator),
            status: 0,
        };
        const data = await material.create({
            data: {
                name: reqBody.name,
                description: reqBody.description,
                unit: reqBody.unit,
                material_category: {
                    connect: {
                        id: reqBody.material_category_id,
                    },
                },
                startDate: reqBody.startDate,
                endDate: reqBody.endDate,
                isProtectedForEdit: reqBody.isProtectedForEdit,
                ...defaultData,
            },
        });
        //   console.log(data);
        return { success: true };
    } catch (e) {
        if (e.meta.cause) {
            error(
                "material_category_id",
                "no material category exists with this id",
                next
            );
            return false;
        }
    }
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await material.findMany({
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
    creator,
    next
) => {
    const myMaterial = await material.findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myMaterial) {
        error("id", "material doesn't exist", next);
        return false;
    }
    if (myMaterial.isProtectedForEdit) {
        error("id", `this material is protected against edit`, next);
        return false;
    }
    if (updateData.name) {
        if (updateData.name === myMaterial.name) {
            updateData.name = undefined;
        } else {
            const data = await material.findUnique({
                select: { name: true },
                where: { name: updateData.name },
            });
            if (data) {
                error("name", "already exists", next);
                return false;
            }
        }
    }
    try {
        await material.update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name == "material_category_id") {
            error(
                "material_category_id",
                "no material category exists with this id",
                next
            );
            return false;
        }
    }
    return { success: true };
};
const deleter = async ({ id }) => {
    try {
        await material.update({
            where: { id },
            data: { status: 1 },
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
