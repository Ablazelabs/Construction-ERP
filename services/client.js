const { error, randomConcurrencyStamp } = require("../config/config");
const { PrismaClient } = require("@prisma/client");

const validation = require("../validation/validation");
const { client } = new PrismaClient();

const post = async (reqBody, creator, next) => {
    reqBody.startDate = new Date();
    reqBody.endDate = new Date("9999/12/31");
    const defaultData = {
        createdBy: String(creator),
        revisedBy: String(creator),
        status: 0,
    };
    const uniqueValues = {
        tradeName: reqBody.tradeName,
        tel: reqBody.tel,
        tinNumber: reqBody.tinNumber,
        contactPersonEmail: reqBody.contactPersonEmail,
        contactPersonPhone: reqBody.contactPersonPhone,
        email: reqBody.email,
    };
    try {
        await client.create({
            data: {
                name: reqBody.name,
                tradeName: reqBody.tradeName,
                address: reqBody.address,
                tel: reqBody.tel,
                tinNumber: reqBody.tinNumber,
                contactPersonName: reqBody.contactPersonName,
                contactPersonPhone: reqBody.contactPersonPhone,
                contactPersonEmail: reqBody.contactPersonEmail,
                email: reqBody.email,
                subCity: reqBody.subCity,
                woreda: reqBody.woreda,
                city: reqBody.city,
                startDate: reqBody.startDate,
                endDate: reqBody.endDate,
                isProtectedForEdit: reqBody.isProtectedForEdit,
                ...defaultData,
            },
        });
        return { success: true, message: "client created successfully" };
    } catch (e) {
        const data = await client.findFirst({
            where: {
                ...uniqueValues,
            },
            select: {
                status: true,
            },
        });
        if (data && data.status == 1) {
            await client.update({
                where: {
                    tradeName: reqBody.tradeName,
                },
                data: {
                    status: 0,
                    endDate: reqBody.endDate,
                    startDate: reqBody.startDate,
                },
            });
            return { success: true, message: "client created successfully" };
        } else {
            const key = e.meta.target.split("_")[1]; //this works if the unique keys don't have underscore
            error(key, "client already exists", next);
            return false;
        }
    }
};
const get = async (queryFilter, querySort, limit, skip, projection) => {
    const data = await client.findMany({
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
    const myClient = await client.findUnique({
        select: { ...updateDataProjection },
        where: { id: reqBody.id },
    });

    if (!myClient) {
        error("id", "account doesn't exist", next);
        return false;
    }
    if (updateData.email) {
        if (updateData.email === myClient.email) {
            updateData.email = undefined;
        } else {
            if (!validation.checkEmail(updateData.email, next)) {
                return false;
            }
            const data = await user.findUnique({
                select: { email: true },
                where: { email: updateData.email },
            });
            if (data) {
                error("email", "already exists", next);
                return false;
            }
        }
    }
    if (updateData.tradeName) {
        if (updateData.tradeName === myClient.tradeName) {
            updateData.tradeName = undefined;
        } else {
            const data = await user.findUnique({
                select: { tradeName: true },
                where: { tradeName: updateData.tradeName },
            });
            if (data) {
                error("tradeName", "already exists", next);
                return false;
            }
        }
    }
    if (updateData.tinNumber) {
        if (updateData.tinNumber === myClient.tinNumber) {
            updateData.tinNumber = undefined;
        } else {
            const data = await user.findUnique({
                select: { tinNumber: true },
                where: { tinNumber: updateData.tinNumber },
            });
            if (data) {
                error("tinNumber", "already exists", next);
                return false;
            }
        }
    }
    if (updateData.contactPersonEmail) {
        if (updateData.contactPersonEmail === myClient.contactPersonEmail) {
            updateData.contactPersonEmail = undefined;
        } else {
            if (
                !validation.checkEmail(
                    updateData.contactPersonEmail,
                    next,
                    "contactPersonEmail"
                )
            ) {
                return false;
            }
            const data = await user.findUnique({
                select: { contactPersonEmail: true },
                where: { contactPersonEmail: updateData.contactPersonEmail },
            });
            if (data) {
                error("contactPersonEmail", "already exists", next);
                return false;
            }
        }
    }
    if (updateData.tel) {
        if (updateData.tel === myClient.tel) {
            updateData.tel = undefined;
        } else {
            if (!validation.checkPhoneNumber(updateData.tel, next, "tel")) {
                return false;
            }
            const data = await client.findUnique({
                select: { tel: true },
                where: { tel: updateData.tel },
            });
            if (data) {
                error("tel", "already exists", next);
                return false;
            }
        }
    }
    await client.update({
        data: { ...updateData, revisedBy: String(creator) },
        where: { id: reqBody.id },
    });
    return { success: true };
};
const deleter = async (reqBody) => {
    try {
        await client.update({
            where: { id: reqBody.id },
            data: { status: 1, endDate: new Date() },
        });
    } catch {
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
