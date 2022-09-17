const { allModels } = require("../config/config");

module.exports = async (project_id, editTodo = false) => {
    if (editTodo) {
        const todo = await allModels.todos.findUnique({
            where: { id: project_id },
        });
        await allModels.todos.update({
            where: {
                id: todo.id,
            },
            data: {
                total_price: todo.quantity * todo.total_area * todo.unit_price,
            },
        });
        return;
    }
    const project = await allModels.project.findUnique({
        where: { id: project_id },
    });
    const todos = await allModels.todos.groupBy({
        where: { sub_task: { task_manager: { project_id } }, status: 0 },
        by: ["sub_task_id"],
        _count: {
            daily_report_id: true,
            id: true,
        },
        _sum: {
            total_price: true,
        },
    });
    let totalBudget = 0;
    let totalDone = 0;
    let totalTodos = 0;
    for (let todo of todos) {
        await allModels.sub_task.update({
            where: { id: todo.sub_task_id },
            data: {
                progress: (todo._count.daily_report_id / todo._count.id) * 100,
                budget: todo._sum.total_price,
            },
        });

        totalBudget += todo._sum.total_price;
        totalDone += todo._count.daily_report_id;
        totalTodos += todo._count.id;
    }
    const subTasks = await allModels.sub_task.groupBy({
        where: { task_manager: { project_id }, status: 0 },
        by: ["task_manager_id"],
        _sum: {
            budget: true,
        },
        _avg: {
            progress: true,
        },
    });
    for (const subTask of subTasks) {
        await allModels.task_manager.update({
            where: { id: subTask.task_manager_id },
            data: {
                progress: subTask._avg.progress,
                budget: subTask._sum.budget,
            },
        });
    }
    await allModels.project.update({
        where: { id: project.id },
        data: {
            progress: (totalDone / totalTodos) * 100,
            budget: totalBudget,
            total_budget: totalBudget + totalBudget * 0.15,
            tax: totalBudget * 0.15,
        },
    });
};
