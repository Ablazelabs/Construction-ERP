const { sign } = require("jsonwebtoken");
const { error, allModels } = require("../config/config");
const { user } = allModels;
module.exports = async (identifier, identifierKey, reqBody, next) => {
    const codeData = await user.findUnique({
        select: {
            code: true,
            id: true,
        },
        where: {
            ...identifier,
        },
    });
    if (!codeData) {
        error(identifierKey, "doesn't exit", next);
        return false;
    }
    const { code } = codeData;
    if (code !== reqBody.code) {
        error("code", "doesn't match", next);
        return false;
    }
    const tempAccessToken = sign(
        {
            tempId: codeData.id,
        },
        process.env.ACCESS_KEY,
        { expiresIn: "1h" }
    );
    return { tempAccessToken };
};
