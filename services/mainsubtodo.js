const { allModels, error } = require("../config/config");
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
 * @param {number[]} pre
 * @param {string[]} todos
 * @param {Function} next
 * @param {boolean} sendId
 * @returns
 */
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    pre,
    todos,
    next,
    sendId = false
) => {
    console.log({ checkAgainstProject, checkAgainstTaskManager });
    if (checkAgainstTaskManager) {
        const taskManager = await task_manager.findUnique({
            where: { id: reqBody.task_manager_id },
        });
        for (let i in checkAgainstTaskManager) {
            if (
                reqBody[checkAgainstTaskManager[i]] <
                taskManager.task_start_date
            ) {
                error(
                    i,
                    i +
                        ` can't be less than main task start date ${taskManager.task_start_date.toDateString()}`,
                    next
                );
                return;
            } else if (
                reqBody[checkAgainstTaskManager[i]] > taskManager.task_end_date
            ) {
                error(
                    i,
                    i +
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
                reqBody[checkAgainstProject[i]] < projectData.project_start_date
            ) {
                error(
                    i,
                    `${i} can't be less than project start date ${projectData.project_start_date.toDateString()}`,
                    next
                );
                return;
            } else if (
                reqBody[checkAgainstProject[i]] > projectData.project_end_date
            ) {
                error(
                    i,
                    `${i} can't be more than project end date ${projectData.project_end_date.toDateString()}`,
                    next
                );
                return;
            }
        }
    }
    if (operationDataType === "sub_task" && todos) {
        reqBody.todos = {
            createMany: {
                data: todos.map((elem) => ({
                    name: elem,
                    createdBy: string(creator),
                    endDate: reqBody.endDate,
                    revisedBy: string(creator),
                    startDate: reqBody.startDate,
                })),
                skipDuplicates: true,
            },
        };
    }
    if (pre) {
        reqBody.prerequisites = {
            connect: pre,
        };
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
    let data = await mGet(
        queryFilter,
        querySort,
        limit,
        skip,
        projection,
        operationDataType
    );
    for (let i in data) {
        const datai = data[i];
        datai.prerequisites = datai.prerequisites.map((elem) => elem.name);
    }
    return data;
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
module.exports = {
    post,
    patch,
    get,
};
