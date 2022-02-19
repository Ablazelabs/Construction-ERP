const { allModels } = require("../config/config");

const { user } = allModels;

const test = async () => {
    const data = await user.findMany({
        where: {
            id: {
                in: [1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 0, 103],
            },
        },
    });
    console.log(data);
};
test();
