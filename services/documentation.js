const { error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const { documentation } = new PrismaClient();

const post = async (reqBody, creator, next) => {
    const queryData = await documentation.findUnique({
        where: {
            name: reqBody.name,
        },
        select: {
            status: true,
        },
    });
    if (queryData) {
        if (queryData.status == 1) {
            await documentation.update({
                where: { name: reqBody.name },
                data: {
                    status: 0,
                    endDate: reqBody.endDate,
                    startDate: reqBody.startDate,
                },
            });
            return { success: true };
        }
        error("name", "documentation already exists", next);
        return false;
    }
    try {
        const defaultData = {
            createdBy: String(creator),
            revisedBy: String(creator),
            status: 0,
        };
        const data = await documentation.create({
            data: {
                name: reqBody.name,
                description: reqBody.description,
                document_category: {
                    connect: {
                        id: reqBody.document_category_id,
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
                "document_category_id",
                "no document category exists with this id",
                next
            );
            return false;
        }
    }
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await documentation.findMany({
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
    const myDocumentation = await documentation.findUnique({
        select: { ...updateDataProjection, isProtectedForEdit: true },
        where: { id: reqBody.id },
    });
    if (!myDocumentation) {
        error("id", "material doesn't exist", next);
        return false;
    }
    if (myDocumentation.isProtectedForEdit) {
        error("id", `this material is protected against edit`, next);
        return false;
    }
    if (updateData.name) {
        if (updateData.name === myDocumentation.name) {
            updateData.name = undefined;
        } else {
            const data = await documentation.findUnique({
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
        await documentation.update({
            data: {
                ...updateData,
                revisedBy: String(creator),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        console.log(e);
        if (e.meta.field_name == "document_category_id") {
            error(
                "document_category_id",
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
        await documentation.update({
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
