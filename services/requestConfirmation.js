const { error, allModels } = require("../config/config");
const { user } = allModels;
module.exports = async (type, id, next) => {
    const data = await user.findUnique({
        select: {
            phone_number: true,
            email: true,
        },
        where: { id },
    });
    if (!data) {
        error("id", "no account exists with this id", next);
        return false;
    }

    if (!data[type]) {
        error(
            type,
            `this account doesn't have ${
                type == "email" ? "an" : "a"
            } ${type} registered`,
            next
        );
        return false;
    }
    const randomValue = 123456 || Math.random() * 100000;
    await confirmCredential(data[type], randomValue);
    await user.update({
        where: { id },
        data: {
            code: randomValue,
        },
    });
    return { success: true };
};
