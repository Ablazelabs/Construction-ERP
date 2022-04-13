const { allModels, error, snakeToPascal } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
const { project, task_manager } = allModels;
/**
 *
 * @param {any} reqBody filtered request body for the model of *operation data type* parameter
 * @param {string} operationDataType
 * @param {number} creator
 * @param {string[]} uniqueValues
 * @param {string[]} checkAgainstProject
 * @param {string[]} checkAgainstTaskManager
 * @param {Function} next
 * @param {boolean} sendId
 * @returns
 */
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    checkAgainstProject,
    checkAgainstTaskManager,
    next,
    sendId = false
) => {
    if (checkAgainstTaskManager) {
        const taskManager = await task_manager.findUnique({
            where: { id: reqBody.task_manager_id },
        });
        for (let i in checkAgainstTaskManager) {
            if (
                reqBody[checkAgainstTaskManager[i]] <
                    taskManager.task_start_date &&
                reqBody[checkAgainstTaskManager[i]].getTime() <
                    taskManager.task_start_date.getTime()
            ) {
                error(
                    checkAgainstTaskManager[i],
                    snakeToPascal(checkAgainstTaskManager[i]) +
                        ` can't be less than main task start date ${taskManager.task_start_date.toDateString()}`,
                    next
                );
                return;
            } else if (
                reqBody[checkAgainstTaskManager[i]] >
                    taskManager.task_end_date &&
                reqBody[checkAgainstTaskManager[i]].getTime() >
                    taskManager.task_end_date.getTime()
            ) {
                error(
                    checkAgainstTaskManager[i],
                    snakeToPascal(checkAgainstTaskManager[i]) +
                        ` can't be more than main task end date ${taskManager.task_end_date.toDateString()}`,
                    next
                );
                return;
            }
        }
    } else if (checkAgainstProject) {
        const projectData = await project.findUnique({
            where: { id: reqBody.project_id },
        });
        for (let i in checkAgainstProject) {
            if (
                reqBody[checkAgainstProject[i]] <
                    projectData.project_start_date &&
                reqBody[checkAgainstProject[i]].getTime() <
                    projectData.project_start_date.getTime()
            ) {
                error(
                    checkAgainstProject[i],
                    `${snakeToPascal(
                        checkAgainstProject[i]
                    )} can't be less than project start date ${projectData.project_start_date.toDateString()}`,
                    next
                );
                return;
            } else if (
                reqBody[checkAgainstProject[i]] >
                    projectData.project_end_date &&
                reqBody[checkAgainstProject[i]].getTime() >
                    projectData.project_end_date.getTime()
            ) {
                error(
                    checkAgainstProject[i],
                    `${snakeToPascal(
                        checkAgainstProject[i]
                    )} can't be more than project end date ${projectData.project_end_date.toDateString()}`,
                    next
                );
                return;
            }
        }
    }
    let data = await mPost(
        reqBody,
        operationDataType,
        creator,
        uniqueValues,
        next,
        sendId
    );
    console.log(data);

    if (operationDataType !== "project") {
        return data;
    }
    if (!data.id) {
        return data;
    }
    const projectData = await project.findUnique({ where: { id: data.id } });
    delete data.id;

    console.log(data);
    return { ...data, project: projectData };
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType
) => {
    return mGet(
        queryFilter,
        querySort,
        limit,
        skip,
        projection,
        operationDataType
    );
};
const getProjectId = async () => {
    const before = await project.findFirst({
        orderBy: { project_id: "desc" },
        select: { project_id: true },
    });
    if (before) {
        let toBeSet = `${parseInt(before.project_id) + 1}`;
        const len = toBeSet.length;
        for (let i = 0; i < 6 - len; i++) {
            toBeSet = "0" + toBeSet;
        }
        return toBeSet;
    } else {
        return "000001";
    }
};
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    uniqueValues,
    next
) => {
    return mPatch(
        updateDataProjection,
        reqBody,
        updateData,
        operationDataType,
        creator,
        uniqueValues,
        next
    );
};
/**
 *
 * @param {string} str
 */

module.exports = {
    post,
    get,
    patch,
    getProjectId,
};
