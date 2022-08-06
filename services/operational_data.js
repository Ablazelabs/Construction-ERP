const { allModels, error, snakeToPascal } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
const { project, task_manager, todos, daily_report, sub_task, user } =
    allModels;
const unique = (value, index, self) => {
    return self.indexOf(value) === index;
};
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
    if (reqBody.todo_ids) {
        const todos = reqBody.todo_ids;
        delete reqBody.todo_ids;
        reqBody.todos = {
            connect: todos.map((elem) => ({ id: elem })),
        };
    }
    if (reqBody.employee_ids) {
        reqBody.prepared_by_id = (
            await user.findUnique({ where: { id: creator } })
        )?.employee_id;
        if (!reqBody.prepared_by_id) {
            error("user", "user ins't registered as an employee", next);
            return false;
        }
        const employees = reqBody.employee_ids;
        delete reqBody.employee_ids;
        reqBody.employees = {
            connect: employees.map((elem) => ({ id: elem })),
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

    if (reqBody.todos) {
        const doneTodos = await todos.findMany({
            where: {
                OR: reqBody.todos.connect,
            },
            select: {
                sub_task: {
                    include: {
                        todos: true,
                        task_manager: true,
                    },
                },
            },
        });
        const allSubTasks = doneTodos.map((elem) => elem.sub_task);
        const uniqueSubTaskIds = allSubTasks
            .map((elem) => elem.id)
            .filter(unique);
        let uniqueSubTasks = [];
        for (let i in uniqueSubTaskIds) {
            uniqueSubTasks.push(
                allSubTasks.find((elem) => elem.id === uniqueSubTaskIds[i])
            );
        }
        for (let i in uniqueSubTasks) {
            const subTask = uniqueSubTasks[i];
            const totalTodos = subTask.todos.length;
            const doneSubTodos = subTask.todos.filter(
                (elem) => elem.daily_report_id
            ).length;
            const donePercent = (doneSubTodos / totalTodos) * 100;
            await sub_task.update({
                where: { id: subTask.id },
                data: { progress: donePercent },
            });
        }
        const mainTaskIds = uniqueSubTasks.map((elem) => elem.task_manager_id);
        const uniqueMainTasks = await task_manager.findMany({
            where: {
                OR: mainTaskIds.map((elem) => ({ id: elem })),
            },
            include: {
                sub_task: true,
            },
        });
        for (let i in uniqueMainTasks) {
            const mainTask = uniqueMainTasks[i];
            let completedPercent = 0;
            for (const j in mainTask.sub_task) {
                completedPercent += mainTask.sub_task[j].progress;
            }
            completedPercent /= mainTask.sub_task.length;
            await task_manager.update({
                where: { id: mainTask.id },
                data: { progress: completedPercent },
            });
        }
    }

    if (operationDataType !== "project") {
        return data;
    }
    if (!data.id) {
        return data;
    }
    const projectData = await project.findUnique({ where: { id: data.id } });
    delete data.id;

    return { ...data, project: projectData };
};
const get = async (
    queryFilter,
    querySort,
    limit,
    skip,
    projection,
    operationDataType,
    creator
) => {
    if (operationDataType === "project") {
        if (creator) {
            const userme = await user.findUnique({
                where: { id: creator },
                include: { role: { include: { privileges: true } } },
            });
            if (!userme || !userme.role || !userme.role.privileges.length) {
                return [];
            }
            if (
                userme.role.privileges.find((elem) =>
                    elem.action.match(/(super|admin|HEAD|PROJECT_ONE)/)
                )
            ) {
            } else {
                queryFilter = { ...queryFilter, createdBy: `${creator}` };
            }
        }
    }
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
/**
 *
 * @param {string} operationDataType
 * @returns
 */
const patch = async (
    updateDataProjection,
    reqBody,
    updateData,
    operationDataType,
    creator,
    checkAgainstProject,
    checkAgainstTaskManager,
    uniqueValues,
    next
) => {
    // console.log("patching", operationDataType);
    if (checkAgainstTaskManager) {
        //if this is true the model consists of a task that is connected with task manager id.
        let taskManager = await task_manager.findUnique({
            where: { id: updateData.task_manager_id },
        });
        if (!taskManager) {
            taskManager = await allModels[operationDataType].findUnique({
                where: { id: reqBody.id },
                include: { task_manager: true },
            });
        }
        for (let i in checkAgainstTaskManager) {
            if (updateData[checkAgainstTaskManager[i]]) {
                if (
                    updateData[checkAgainstTaskManager[i]] <
                        taskManager.task_start_date &&
                    updateData[checkAgainstTaskManager[i]].getTime() <
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
                    updateData[checkAgainstTaskManager[i]] >
                        taskManager.task_end_date &&
                    updateData[checkAgainstTaskManager[i]].getTime() >
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
        }
    } else if (checkAgainstProject) {
        let projectData = await project.findUnique({
            where: { id: updateData.project_id },
        });
        if (!projectData) {
            projectData = await allModels[operationDataType].findUnique({
                where: { id: reqBody.id },
                include: { project: true },
            });
        }
        for (let i in checkAgainstProject) {
            if (updateData[checkAgainstProject[i]]) {
                if (
                    updateData[checkAgainstProject[i]] <
                        projectData.project_start_date &&
                    updateData[checkAgainstProject[i]].getTime() <
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
                    updateData[checkAgainstProject[i]] >
                        projectData.project_end_date &&
                    updateData[checkAgainstProject[i]].getTime() >
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
    }
    if (operationDataType === "todos") {
        const todo = await todos.findUnique({ where: { id: reqBody.id } });
        // console.log(todo.completed, todo.daily_report_id, updateData.completed);
        if (todo) {
            if (todo.daily_report_id) {
                updateData.completed = todo.completed;
            }
        }
        // console.log(updateData.completed);
    }
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

const patchSecondRemark = async (id, remark) => {
    const dailyReport = await daily_report.findUnique({
        where: { id },
    });
    if (!dailyReport) {
        return { success: false };
    }
    let oldRemark;
    try {
        oldRemark = JSON.parse(dailyReport.remark)[0];
    } catch {
        oldRemark = dailyReport.remark;
    }
    await daily_report.update({
        where: {
            id,
        },
        data: {
            remark: JSON.stringify([oldRemark, remark]),
        },
    });
    return { success: true };
};

module.exports = {
    post,
    get,
    patch,
    getProjectId,
    patchSecondRemark,
};
