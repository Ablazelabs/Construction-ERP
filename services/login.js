const { compare } = require("bcrypt");
const { error, allModels } = require("../config/config");
const { user, refresh_tokens } = allModels;
const { sign } = require("jsonwebtoken");
module.exports = async (identifier, reqBody, next) => {
    const queryResult = await user.findUnique({
        where: { ...identifier },
        select: {
            password: true,
            id: true,
            access_failed_count: true,
            first_login: true,
        },
    });
    let key;
    for (let i in identifier) {
        key = i;
        break;
    }
    if (!queryResult) {
        error(key, "account doesn't exist", next);
        return false;
    }
    if (queryResult.access_failed_count >= 5) {
        error("access", "denied", next, 423);
        return false;
    }
    const correctPassword = await compare(
        reqBody.password,
        queryResult.password
    );
    if (!correctPassword) {
        await user.update({
            where: { ...identifier },
            data: {
                access_failed_count: {
                    increment: 1,
                },
            },
        });
        error("password", "Wrong password", next);
        return false;
    }
    const accessToken = sign(
        {
            id: queryResult.id,
        },
        process.env.ACCESS_KEY,
        { expiresIn: "10h" }
    );
    const refreshToken = sign(
        {
            id: queryResult.id,
        },
        process.env.REFRESH_KEY
    );
    if (!queryResult.first_login) {
        await refresh_tokens.create({
            data: {
                refresh_token: refreshToken,
                user_id: queryResult.id,
            },
        });
    }
    await user.update({
        data: {
            access_failed_count: 0,
        },
        where: {
            ...identifier,
        },
    });
    return {
        accessToken,
        refreshToken,
        id: queryResult.id,
        first_login: Boolean(queryResult.first_login),
    };
};
