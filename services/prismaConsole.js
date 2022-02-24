const { allModels } = require("../config/config");

const { user } = allModels;

const test = async () => {
    const data = await user.groupBy({
        by: ["first_login", "id"],
    });
    console.log(data);
};
test();
