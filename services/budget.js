const { allModels, error } = require("../config/config");
const {
    post: mPost,
    get: mGet,
    patch: mPatch,
} = require("./mostCRUD/mostCRUD");
const { chart_of_account, budget, cost_center } = allModels;

/**
 *
 * @param {any}} budget
 * @param {{
 *      annual_budget_exceeded_mr : number,
 *      annual_budget_exceeded_po:number,
 *      annual_budget_exceeded_actual:number,
 *      accounts:Array<number>
 * }} budgetControlAction
 * @param {*} creator
 * @param {*} next
 */
const post = async (budgetInput, budgetControlAction, creator, next) => {
    const defaultValues = {
        createdBy: String(creator),
        revisedBy: String(creator),
    };
    let budgetControlActions = [];
    let budgetAccounts = [];
    if (budgetInput.is_applicable_material_request) {
        budgetControlActions.push({
            type: 1,
            action_accumulated_monthly_budget_exceeded:
                budgetControlAction.annual_budget_exceeded_mr,
        });
    }
    if (budgetInput.purchase_request) {
        budgetControlActions.push({
            type: 2,
            action_accumulated_monthly_budget_exceeded:
                budgetControlAction.annual_budget_exceeded_po,
        });
    }
    if (budgetInput.booking_actual_expense) {
        budgetControlActions.push({
            type: 3,
            action_accumulated_monthly_budget_exceeded:
                budgetControlAction.annual_budget_exceeded_actual,
        });
    }
    const { accounts } = budgetControlAction;
    for (let i in accounts) {
        const count = await chart_of_account.count({
            where: { id: accounts[i] },
        });
        if (count) {
            budgetAccounts.push({
                chart_of_account_id: accounts[i],
                budget_total_amount: 0,
            });
        }
    }
    if (budgetInput.budget_reason == 1 && !budgetInput.cost_center_id) {
        error(
            "cost_center_id",
            "cost center id is required if budget reason is cost center"
        );
        return false;
    }
    if (budgetInput.budget_reason == 1 && !budgetInput.project_name) {
        error(
            "project_name",
            "project name is required if budget reason is project"
        );
        return false;
    }
    //check existence

    const count =
        budgetInput.budget_reason == 1
            ? await budget.count({
                  where: { cost_center_id: budgetInput.cost_center_id },
              })
            : await budget.count({
                  where: { project_name: budgetInput.project_name },
              });
    if (count) {
        error(
            budgetInput.budget_reason == 1 ? "cost_center_id" : "project_name",
            "budget already exists"
        );
        return false;
    }
    budgetInput.fiscal_year = new Date();
    budgetInput.name =
        budgetInput.budget_reason == 1
            ? (
                  await cost_center.findFirst({
                      where: { id: budgetInput.cost_center_id },
                  })
              ).cost_center_code
            : budgetInput.project_name;
    budgetInput.name += " is budgeted";
    await budget.create({
        data: {
            budget_control_action: {
                createMany: {
                    skipDuplicates: true,
                    data: budgetControlActions.map((action) => {
                        return {
                            ...action,
                            ...defaultValues,
                            startDate: budgetInput.startDate,
                            endDate: budgetInput.endDate,
                        };
                    }),
                },
            },
            ...budgetInput,
            ...defaultValues,
        },
    });
    return { success: true };
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
    get,
    patch,
};
// same as the others
