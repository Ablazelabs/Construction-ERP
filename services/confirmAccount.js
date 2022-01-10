const { error, allModels } = require("../config/config");
const { user } = allModels;
module.exports = async (code, id, type, next) => {
    const data = await user.findUnique({
        select: {
            code: true,
        },
        where: { id },
    });
    if (!data) {
        error("id", "no account exists with this id", next);
        return false;
    }
    const updatedData =
        type == "email"
            ? { email_confirmed: true }
            : { phone_number_confirmed: true };
    if (data.code === code) {
        await user.update({
            where: { id },
            data: {
                ...updatedData,
            },
        });
        return { success: true };
    } else {
        error("code", "doesn't match", next);
        return false;
    }
};
