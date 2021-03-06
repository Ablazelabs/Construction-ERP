const {
    error,
    confirmCredential,
    randomConcurrencyStamp,
    allModels,
} = require("../config/config");

const { user, refresh_tokens } = allModels;

const { genSalt, hash } = require("bcrypt");
const validation = require("../validation/validation");

const post = async (identifier, identifierKey, reqBody, otherData, next) => {
    const queryResult = await user.findUnique({
        where: { ...identifier },
        select: {
            deleted_status: true,
        },
    });
    if (queryResult) {
        if (queryResult.deleted_status == 1) {
            await user.update({
                where: { ...identifier },
                data: { deleted_status: 0 },
            });
            return { success: true };
        }
        error(identifierKey, "account already registered", next);
        return false;
    }

    if (otherData.email) {
        if (!validation.checkEmail(otherData.email, next)) {
            return false;
        }
        const data = await user.findUnique({
            select: { email: true },
            where: { email: otherData.email },
        });
        if (data) {
            error("email", "already exists", next);
            return false;
        }
    }
    if (otherData.phone_number) {
        if (!validation.checkPhoneNumber(otherData.phone_number, next)) {
            return false;
        }
        const data = await user.findUnique({
            select: { phone_number: true },
            where: { phone_number: otherData.phone_number },
        });
        if (data) {
            error("phone_number", "already exists", next);
            return false;
        }
    }

    const salt = await genSalt(10);
    const hashPassword = await hash(reqBody.password, salt);

    //create a random number to send to user so that they can confirm it, put in a static code for easier testing
    //TODO remove the 123456 number
    const randomValue = 123456 || Math.random() * 100000;
    await confirmCredential(identifier[identifierKey], randomValue);

    await user.create({
        data: {
            ...otherData, //this should come first
            ...identifier,
            password: hashPassword,
            code: randomValue,
            concurrency_stamp: randomConcurrencyStamp(),
            first_login: true,
        },
    });
    return { success: true };
};
const get = async (queryFilter, querySort, role, limit, skip, projection) => {
    let data = await user.findMany({
        where: {
            ...queryFilter,
            ...role,
            deleted_status: 0,
        },
        orderBy: [...querySort],
        take: limit,
        skip,
        select: {
            ...projection,
            id: true,
        },
    });
    if (data.length === 1) {
        const priv = await user.findUnique({
            where: {
                id: data[0].id,
            },
            select: {
                role: {
                    select: {
                        privileges: true,
                    },
                },
            },
        });
        data[0].actions =
            priv?.role?.privileges.map((elem) => elem.action) || [];
    }
    return data;
};
const patch = async (updateDataProjection, reqBody, updateData, next) => {
    const myUser = await user.findUnique({
        select: { ...updateDataProjection, concurrency_stamp: true },
        where: { id: reqBody.id },
    });

    if (!myUser) {
        error("id", "account doesn't exist", next);
        return false;
    }
    if (myUser.concurrency_stamp !== reqBody.concurrency_stamp) {
        error("concurrency_stamp", "account already updated, refresh", next);
        return false;
    }
    if (updateData.email) {
        if (updateData.email === myUser.email) {
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
                error("email", "email already exists", next);
                return false;
            }
        }
    }
    if (updateData.phone_number) {
        if (updateData.phone_number === myUser.phone_number) {
            updateData.phone_number = undefined;
        } else {
            if (!validation.checkPhoneNumber(updateData.phone_number, next)) {
                return false;
            }
            const data = await user.findUnique({
                select: { phone_number: true },
                where: { phone_number: updateData.phone_number },
            });
            if (data) {
                error("phone_number", "phone number already exists", next);
                return false;
            }
        }
    }
    try {
        await user.update({
            data: {
                ...updateData,
                concurrency_stamp: randomConcurrencyStamp(),
            },
            where: { id: reqBody.id },
        });
    } catch (e) {
        // console.log(e);
        if (e.meta.field_name == "roleId") {
            error("role", "role doesn't exist", next);
            return false;
        }
    }
    return { success: true };
};

const deleter = async (reqBody) => {
    try {
        await user.update({
            where: { id: reqBody.id },
            data: { deleted_status: 1 },
        });
        await refresh_tokens.deleteMany({
            where: {
                user_id: reqBody.id,
            },
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
