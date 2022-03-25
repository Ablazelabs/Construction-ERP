const { allModels } = require("../config/config");
const { refresh_tokens } = allModels;
module.exports = async (reqBody, next) => {
    await refresh_tokens.deleteMany({
        where: {
            refresh_token: reqBody.refreshToken,
        },
    });
    return { success: true };
};
