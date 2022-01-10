const { error, allModels } = require("../config/config");
const { compare, genSalt, hash } = require("bcrypt");
const { user } = allModels;

module.exports = async (selfUpdate, id, reqBody, next) => {
    if (selfUpdate) {
        const queryResult = await user.findUnique({
            where: { id },
            select: { password: true },
        });
        if (!queryResult) {
            error("id", "account doesn't exist", next);
            return false;
        }
        const correctPassword = await compare(
            reqBody.password,
            queryResult.password
        );
        if (!correctPassword) {
            error("password", "Wrong password", next);
            return false;
        }
    }
    const salt = await genSalt(10);
    const hashPassword = await hash(reqBody.newPassword, salt);
    await user.update({
        where: {
            id,
        },
        data: {
            password: hashPassword,
            first_login: false,
        },
    });
    return { success: true };
};
