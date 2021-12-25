const { error, allModels } = require("../config/config");
const { refresh_tokens } = allModels;
const { sign } = require("jsonwebtoken");
module.exports = async (refreshToken, id, next) => {
    const queryResult = await refresh_tokens.findFirst({
        where: { refresh_token: refreshToken, user_id: id },
        select: { id: true },
    });
    if (!queryResult) {
        error(
            "refreshToken",
            "you have been revoked access, please login again",
            next
        );
        return false;
    }
    const accessToken = sign({ id }, process.env.ACCESS_KEY, {
        expiresIn: "10h",
    });
    return { accessToken };
};
