const { PrismaClient } = require("@prisma/client");
const { refresh_tokens } = new PrismaClient();
const { sign } = require("jsonwebtoken");
const { error } = require("../config/config");
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
