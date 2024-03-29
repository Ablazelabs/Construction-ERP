const { allModels, error, snakeToPascal } = require("../config/config");
const calculateProject = require("./calculateProject");
const { post: mPost, get: mGet } = require("./mostCRUD/mostCRUD");
const { project, task_manager, todos } = allModels;
/**
 *
 * @param {any} reqBody filtered request body for the model of *operation data type* parameter
 * @param {string} operationDataType
 * @param {number} creator
 * @param {string[]} uniqueValues
 * @param {[number[],string[]]} param4
 * @param {[string[],string[]]} param5
 * @param {Function} next
 * @param {boolean} sendId
 * @returns
 */
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    [pre, todos],
    [checkAgainstProject, checkAgainstTaskManager],
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
    if (operationDataType === "sub_task" && todos) {
        reqBody.todos = {
            createMany: {
                data: todos
                    .filter((elem) => elem)
                    .map((elem) => ({
                        name: elem.name,
                        quantity: Number(elem.quantity) || 1,
                        total_area: Number(elem.total_area) || 1,
                        unit_price: Number(elem.unit_price) || 1,
                        total_price:
                            (Number(elem.quantity) || 1) *
                            (Number(elem.total_area) || 1) *
                            (Number(elem.unit_price) || 1),
                        createdBy: String(creator),
                        endDate: reqBody.endDate,
                        revisedBy: String(creator),
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
        true
    );
    console.log(data, "here", operationDataType);
    if (operationDataType !== "project") {
        if (operationDataType === "sub_task" && todos) {
            const projectData = await allModels.sub_task
                .findUnique({ where: { id: data.id } })
                .task_manager()
                .project();
            await calculateProject(projectData.id);
        }
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
/**
 *
 * @param {number} project_id
 * @returns
 */
const projectTodo = async (project_id) => {
    return await todos.findMany({
        where: {
            sub_task: {
                task_manager: {
                    project_id,
                },
            },
            completed: true,
            daily_report_id: null,
        },
    });
};
/**
 *
 * @param {number} project_id
 * @returns
 */
const projectPercent = async (project_id) => {
    const pro = await project.findUnique({
        where: { id: project_id },
        include: { task_manager: true },
    });
    let progress = 0;
    if (pro) {
        for (let i in pro.task_manager) {
            progress += pro.task_manager[i].progress;
        }
        progress /= pro.task_manager.length;
    }
    return { progress };
};
module.exports = {
    post,
    projectTodo,
    projectPercent,
    get,
};
