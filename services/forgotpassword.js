const { confirmCredential, error } = require("../config/config");
const { PrismaClient } = require("@prisma/client");
const { user } = new PrismaClient();

module.exports = async (identifier, identifierValue, code, next) => {
    const myUser = await user.findUnique({
        where: {
            ...identifier,
        },
    });
    let identifierKey;
    for (let i in identifier) {
        identifierKey = i;
        break;
    }
    if (!myUser) {
        error(identifierKey, "isn't registered in database", next);
        return false;
    }
    await user.update({
        where: {
            ...identifier,
        },
        data: {
            code,
        },
    });
    await confirmCredential(identifierValue, code, "2");
    return { success: true };
};
