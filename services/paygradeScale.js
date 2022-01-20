const { allModels } = require("../config/config");
const { patch, post } = require("./hcmPayroll");
const { paygrade, paygrade_scale } = allModels;
const defaultData = {
    startDate: new Date(),
    endDate: new Date("9999/12/31"),
};
module.exports = async (
    scaleList,
    creator,
    uniqueValues,
    updateDataProjection
) => {
    for (let i in scaleList) {
        const payscale = scaleList[i];
        if (!payscale.scale || !payscale.amount) {
            continue;
        }
        const payGradeExists = await paygrade.count({
            where: { id: payscale.paygrade_id },
        });
        const prevPayScale = await paygrade_scale.findFirst({
            where: { paygrade_id: payscale.paygrade_id, scale: payscale.scale },
        });
        if (payGradeExists) {
            if (prevPayScale) {
                await patch(
                    updateDataProjection,
                    { id: prevPayScale.id },
                    payscale,
                    "paygrade_scale",
                    creator,
                    uniqueValues,
                    (something) => {
                        console.log(something);
                    }
                );
            } else {
                await post(
                    { ...payscale, ...defaultData },
                    "paygrade_scale",
                    creator,
                    uniqueValues,
                    (something) => {
                        console.log(something);
                    }
                );
            }
        }
    }
    return { success: true };
};
