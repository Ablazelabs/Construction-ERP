const express = require("express");
const router = express.Router();
const { error } = require("../config/config");
const { verify } = require("jsonwebtoken");
const inputFilter = require("../validation/inputFilter");
const validation = require("../validation/validation");
const { userHasPrivilege } = require("../validation/auth");
const { post, get, patch, deleter } = require("../services/operational_data");

const defaultDateValues = ["startDate", "endDate"];
const auditLogProjection = {
    startDate: true,
    endDate: true,
    creationDate: true,
    createdBy: true,
    revisionDate: true,
    revisedBy: true,
    isProtectedForEdit: true,
};
const auditLogSort = {
    startDate: "number",
    endDate: "number",
    creationDate: "number",
    createdBy: "number",
    revisionDate: "number",
    revisedBy: "number",
    isProtectedForEdit: "number",
};
const allInputFilters = {
    project: {
        name: "string",
        project_manager: "string",
        project_start_date: "string",
        project_end_date: "string",
        project_id: "string",
        contract_number: "string",
        site_engineer: "string",
        dupty_manager: "string",
        project_address: "string",
        client_id: "number",
    },
    daily_work_log: {
        weather: "string",
        day: "string",
        temprature: "string",
        time: "string",
        name_of_employee: "string",
        contact: "string",
        cell_phone: "string",
        contract_no: "string",
        location: "string",
        date: "string",
        project_id: "number",
    },
    instruction_given_on_project: {
        yes_no: "boolean",
        date: "string",
        project_id: "number",
        instruction_id: "number",
    },
    manpower_requirement: {
        number_of_planned_man_power: "number",
        food_expense: "number",
        wage: "number",
        house_rent: "number",
        transportation: "number",
        total_expense: "number",
        manpower_id: "number",
        project_id: "number",
    },
    required_equipment: {
        planned_equipment_number: "number",
        equipment_lifetime: "string",
        expense: "number",
        house_rent: "number",
        transportation: "number",
        total_expense: "number",
        equipment_id: "number",
        project_id: "number",
    },
    required_material: {
        planned_quantity: "number",
        planned_unit_price: "number",
        planned_total_amount: "number",
        material_id: "number",
        project_id: "number",
    },
    risk_tracking: {
        impact: "string",
        risk_level: "string",
        risk_owner: "string",
        work_category_id: "number",
        project_id: "number",
    },
    task_manager: {
        name: "string",
        task_start_date: "string",
        duration_in_days: "string",
        working_days: "string",
        project_id: "number",
    },
    sub_task: {
        name: "string",
        task_start_date: "string",
        duration_in_days: "number",
        working_days: "number",
        task_manager_id: "number",
    },
    simple_task: {
        note: "string",
        name: "string",
        task_start_date: "string",
        completed_percentage: "number",
        estimated_hours: "number",
        project_id: "number",
        priority_id: "number",
    },
    work_log_and_branch_of_work: {
        skilled_worker: "number",
        hours: "number",
        date: "string",
        work_category_id: "number",
        daily_work_log_id: "number",
    },
    weather_data: {
        total_lost_hour: "number",
        duration_of_lost_hour: "number",
        date: "string",
        reference: "string",
        project_id: "number",
        manpower_id: "number",
    },
    todos: {
        notes: "string",
        name: "string",
        date: "string",
        project_id: "number",
        priority_id: "number",
    },
    request: {
        RFI_no: "string",
        current_status: "string",
        request_by: "string",
        assigned_to: "string",
        date_requested: "string",
        notes: "string",
        project_id: "number",
        priority_id: "number",
    },
    invoice_tracking: {
        amount: "number",
        amount_received: "number",
        balance: "number",
        invoice_number: "string",
        date_received: "string",
        notes: "string",
        client_id: "number",
    },
};
const allOptionalInputfilters = {
    project: {
        project_description: "string",
    },
    daily_work_log: {},
    instruction_given_on_project: {
        remarks: "string",
    },
    manpower_requirement: {
        number_of_actual_man_power: "number",
        remark: "string",
    },
    required_equipment: {
        actual_equipment_number: "number",
        remark: "string",
    },
    required_material: {
        delivered_quantity: "number",
        delivered_unit_price: "number",
        delivered_total_amount: "number",
        total_expense: "number",
        remark: "string",
        delivery_date: "string",
    },
    risk_tracking: {
        description: "string",
        risk_response: "string",
        remark: "string",
    },
    task_manager: {
        description: "string",
        task_end_date: "string",
    },
    sub_task: {
        description: "string",
        task_end_date: "string",
    },
    simple_task: {
        task_end_date: "string",
    },
    work_log_and_branch_of_work: {},
    weather_data: {
        reason: "string",
    },
    todos: {},
    request: {
        request_description: "string",
        date_required: "string",
        date_responded: "string",
    },
    invoice_tracking: {
        detail: "string",
    },
};
const dateValues = {
    project: [...defaultDateValues, "project_start_date", "project_end_date"],
    daily_work_log: [...defaultDateValues, "date"],
    instruction_given_on_project: [...defaultDateValues, "date"],
    manpower_requirement: [...defaultDateValues],
    required_equipment: [...defaultDateValues],
    required_material: [...defaultDateValues, "delivery_date"],
    risk_tracking: [...defaultDateValues],
    task_manager: [...defaultDateValues, "task_end_date", "task_start_date"],
    sub_task: [...defaultDateValues, "task_end_date", "task_start_date"],
    simple_task: [...defaultDateValues, "task_end_date", "task_start_date"],
    work_log_and_branch_of_work: [...defaultDateValues, "date"],
    weather_data: [...defaultDateValues, "date"],
    todos: [...defaultDateValues, "date"],
    request: [
        ...defaultDateValues,
        "date_requested",
        "date_required",
        "date_responded",
    ],
    invoice_tracking: [...defaultDateValues, "date_received"],
};
const phoneValues = {
    project: [],
    daily_work_log: ["cell_phone"],
    instruction_given_on_project: [],
    manpower_requirement: [],
    required_equipment: [],
    required_material: [],
    risk_tracking: [],
    task_manager: [],
    sub_task: [],
    simple_task: [],
    work_log_and_branch_of_work: [],
    weather_data: [],
    todos: [],
    request: [],
    invoice_tracking: [],
};
const emailValues = {
    project: [],
    daily_work_log: [],
    instruction_given_on_project: [],
    manpower_requirement: [],
    required_equipment: [],
    required_material: [],
    risk_tracking: [],
    task_manager: [],
    sub_task: [],
    simple_task: [],
    work_log_and_branch_of_work: [],
    weather_data: [],
    todos: [],
    request: [],
    invoice_tracking: [],
};
const allProjections = {
    project: {
        id: true,
        name: true,
        project_manager: true,
        project_start_date: true,
        project_end_date: true,
        project_description: true,
        project_id: true,
        contract_number: true,
        site_engineer: true,
        dupty_manager: true,
        project_address: true,
        client: true,
        ...auditLogProjection,
    },
    daily_work_log: {
        id: true,
        weather: true,
        day: true,
        temprature: true,
        time: true,
        name_of_employee: true,
        contact: true,
        cell_phone: true,
        contract_no: true,
        location: true,
        date: true,
        project: true,
        ...auditLogProjection,
    },
    instruction_given_on_project: {
        id: true,
        yes_no: true,
        remarks: true,
        date: true,
        project_id: true,
        instruction_id: true,
        project: true,
        instruction: true,
        ...auditLogProjection,
    },
    manpower_requirement: {
        id: true,
        number_of_planned_man_power: true,
        food_expense: true,
        wage: true,
        house_rent: true,
        transportation: true,
        total_expense: true,
        manpower_id: true,
        project_id: true,
        number_of_actual_man_power: true,
        remark: true,
        ...auditLogProjection,
    },
    required_equipment: {
        id: true,
        planned_equipment_number: true,
        actual_equipment_number: true,
        equipment_lifetime: true,
        expense: true,
        house_rent: true,
        transportation: true,
        total_expense: true,
        remark: true,
        equipment: true,
        project: true,
        ...auditLogProjection,
    },
    required_material: {
        id: true,
        planned_quantity: true,
        planned_unit_price: true,
        planned_total_amount: true,
        delivered_quantity: true,
        delivered_unit_price: true,
        delivered_total_amount: true,
        total_expense: true,
        remark: true,
        delivery_date: true,
        material: true,
        project: true,
        ...auditLogProjection,
    },
    risk_tracking: {
        id: true,
        description: true,
        impact: true,
        risk_response: true,
        risk_level: true,
        risk_owner: true,
        remark: true,
        work_category: true,
        project: true,
        ...auditLogProjection,
    },
    task_manager: {
        id: true,
        name: true,
        description: true,
        task_start_date: true,
        task_end_date: true,
        duration_in_days: true,
        working_days: true,
        project: true,
        ...auditLogProjection,
    },
    sub_task: {
        id: true,
        description: true,
        name: true,
        task_start_date: true,
        task_end_date: true,
        duration_in_days: true,
        working_days: true,
        task_manager: true,
        ...auditLogProjection,
    },
    simple_task: {
        id: true,
        note: true,
        name: true,
        task_start_date: true,
        task_end_date: true,
        completed_percentage: true,
        estimated_hours: true,
        project: true,
        priority: true,
    },
    work_log_and_branch_of_work: {
        id: true,
        skilled_worker: true,
        hours: true,
        date: true,
        work_category: true,
        daily_work_log: true,
        ...auditLogProjection,
    },
    weather_data: {
        id: true,
        total_lost_hour: true,
        duration_of_lost_hour: true,
        date: true,
        reason: true,
        reference: true,
        project: true,
        manpower: true,
        ...auditLogProjection,
    },
    todos: {
        id: true,
        notes: true,
        name: true,
        date: true,
        project: true,
        priority: true,
        ...auditLogProjection,
    },
    request: {
        id: true,
        RFI_no: true,
        current_status: true,
        request_description: true,
        request_by: true,
        assigned_to: true,
        date_requested: true,
        date_required: true,
        date_responded: true,
        notes: true,
        project: true,
        priority: true,
        ...auditLogProjection,
    },
    invoice_tracking: {
        id: true,
        detail: true,
        amount: true,
        amount_received: true,
        balance: true,
        invoice_number: true,
        date_received: true,
        notes: true,
        client: true,
        ...auditLogProjection,
    },
};
const allFilters = {
    project: {
        name: "string",
        project_manager: "string",
        project_description: "string",
        project_id: "string",
        contract_number: "string",
        site_engineer: "string",
        dupty_manager: "string",
        project_address: "string",
    },
    daily_work_log: {
        weather: "string",
        day: "string",
        temprature: "string",
        time: "string",
        name_of_employee: "string",
        contact: "string",
        cell_phone: "string",
        contract_no: "string",
    },
    instruction_given_on_project: {
        remarks: "string",
    },
    manpower_requirement: {
        remarks: "string",
    },
    required_equipment: {
        equipment_lifetime: "string",
        remark: "string",
    },
    required_material: {
        remark: "string",
    },
    risk_tracking: {
        impact: "string",
        risk_level: "string",
        risk_owner: "string",
        description: "string",
        risk_response: "string",
        remark: "string",
    },
    task_manager: {
        name: "string",
        description: "string",
        duration_in_days: "string",
        working_days: "string",
    },
    sub_task: {
        description: "string",
        name: "string",
    },
    simple_task: {
        note: "string",
        name: "string",
    },
    work_log_and_branch_of_work: {},
    weather_data: {
        reason: "string",
        reference: "string",
    },
    todos: {
        notes: "string",
        name: "string",
    },
    request: {
        RFI_no: "string",
        current_status: "string",
        request_description: "string",
        request_by: "string",
        assigned_to: "string",
        notes: "string",
    },
    invoice_tracking: {
        detail: "string",
        invoice_number: "string",
        notes: "string",
    },
};
const allSorts = {
    project: {
        id: "number",
        name: "number",
        project_manager: "number",
        project_start_date: "number",
        project_end_date: "number",
        project_description: "number",
        project_id: "number",
        contract_number: "number",
        site_engineer: "number",
        dupty_manager: "number",
        project_address: "number",
        ...auditLogSort,
    },
    daily_work_log: {
        id: "number",
        weather: "number",
        day: "number",
        temprature: "number",
        time: "number",
        name_of_employee: "number",
        contact: "number",
        cell_phone: "number",
        contract_no: "number",
        location: "number",
        date: "number",
        project_id: "number",
        ...auditLogSort,
    },
    instruction_given_on_project: {
        id: "number",
        yes_no: "number",
        remarks: "number",
        date: "number",
        project_id: "number",
        instruction_id: "number",
        ...auditLogSort,
    },
    manpower_requirement: {
        id: "number",
        number_of_planned_man_power: "number",
        number_of_actual_man_power: "number",
        food_expense: "number",
        wage: "number",
        house_rent: "number",
        transportation: "number",
        total_expense: "number",
        remark: "number",
        manpower_id: "number",
        project_id: "number",
        ...auditLogSort,
    },
    required_equipment: {
        id: "number",
        planned_equipment_number: "number",
        actual_equipment_number: "number",
        equipment_lifetime: "number",
        expense: "number",
        house_rent: "number",
        transportation: "number",
        total_expense: "number",
        remark: "number",
        equipment_id: "number",
        project_id: "number",
        ...auditLogSort,
    },
    required_material: {
        id: "number",
        planned_quantity: "number",
        planned_unit_price: "number",
        planned_total_amount: "number",
        delivered_quantity: "number",
        delivered_unit_price: "number",
        delivered_total_amount: "number",
        total_expense: "number",
        remark: "number",
        delivery_date: "number",
        material_id: "number",
        project_id: "number",
        ...auditLogSort,
    },
    risk_tracking: {
        id: "number",
        impact: "number",
        risk_level: "number",
        risk_owner: "number",
        work_category_id: "number",
        project_id: "number",
        description: "number",
        risk_response: "number",
        remark: "number",
        ...auditLogSort,
    },
    task_manager: {
        id: "number",
        name: "number",
        description: "number",
        task_start_date: "number",
        task_end_date: "number",
        duration_in_days: "number",
        working_days: "number",
        project_id: "number",
        ...auditLogSort,
    },
    sub_task: {
        id: "number",
        description: "number",
        name: "number",
        task_start_date: "number",
        task_end_date: "number",
        duration_in_days: "number",
        working_days: "number",
        task_manager_id: "number",
        ...auditLogSort,
    },
    simple_task: {
        id: "number",
        note: "number",
        name: "number",
        task_start_date: "number",
        task_end_date: "number",
        completed_percentage: "number",
        estimated_hours: "number",
        project_id: "number",
        priority_id: "number",
        ...auditLogSort,
    },
    work_log_and_branch_of_work: {
        id: "number",
        skilled_worker: "number",
        hours: "number",
        date: "number",
        work_category_id: "number",
        daily_work_log_id: "number",
        ...auditLogSort,
    },
    weather_data: {
        id: "number",
        total_lost_hour: "number",
        duration_of_lost_hour: "number",
        date: "number",
        reason: "number",
        reference: "number",
        project_id: "number",
        manpower_id: "number",
        ...auditLogSort,
    },
    todos: {
        id: "number",
        notes: "number",
        name: "number",
        date: "number",
        project: "number",
        priority: "number",
        ...auditLogSort,
    },
    request: {
        id: "number",
        RFI_no: "number",
        current_status: "number",
        request_description: "number",
        request_by: "number",
        assigned_to: "number",
        date_requested: "number",
        date_required: "number",
        date_responded: "number",
        notes: "number",
        project: "number",
        priority: "number",
        ...auditLogSort,
    },
    invoice_tracking: {
        id: "string",
        detail: "string",
        amount: "string",
        amount_received: "string",
        balance: "string",
        invoice_number: "string",
        date_received: "string",
        notes: "string",
        client: "string",
        ...auditLogSort,
    },
};
const allRoutes = [
    "/project",
    "/daily_work_log",
    "/instruction_given_on_project",
    "/manpower_requirement",
    "/required_equipment",
    "/required_material",
    "/risk_tracking",
    "/task_manager",
    "/sub_task",
    "/simple_task",
    "/work_log_and_branch_of_work",
    "/weather_data",
    "/todos",
    "/request",
    "/invoice_tracking",
];

router.post(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/")[1];
    let reqBody;
    const requiredInputFilter = allInputFilters[operationDataType];
    const optionalInputFilter = allOptionalInputfilters[operationDataType];
    try {
        reqBody = inputFilter(
            {
                startDate: "string",
                endDate: "string",
                accessToken: "string",
                ...requiredInputFilter,
            },
            { isProtectedForEdit: "boolean", ...optionalInputFilter },
            req.body,
            2
        );
        reqBody.accessToken = undefined;
        for (let i in dateValues[operationDataType]) {
            if (!reqBody[dateValues[operationDataType][i]]) {
                continue;
            }
            reqBody[dateValues[operationDataType][i]] = new Date(
                reqBody[dateValues[operationDataType][i]]
            );
            if (!reqBody[dateValues[operationDataType][i]].getTime()) {
                throw {
                    key: dateValues[operationDataType][i],
                    message: "please send date in yyyy/mm/dd format",
                };
            }
        }
    } catch (e) {
        error(e.key, e.message, next, 400);
        return;
    }
    for (let i in phoneValues[operationDataType]) {
        if (reqBody[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    reqBody[phoneValues[operationDataType][i]],
                    next,
                    phoneValues[operationDataType][i]
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (reqBody[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    reqBody[emailValues[operationDataType][i]],
                    next,
                    emailValues[operationDataType][i]
                )
            )
                return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }
    const PRIVILEGE_TYPE = `${operationDataType}_create`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    try {
        const data = await post(reqBody, operationDataType, payLoad.id, next);
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.get(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/")[1];
    let filter = {};
    let sort = {};
    let skip = 0;
    let limit = 0;
    try {
        inputFilter(
            { limit: "number", accessToken: "string" },
            { skip: "number", filter: "object", sort: "object" },
            req.body
        );
        limit = req.body.limit;
        skip = req.body.skip || 0;
        if (req.body.filter) {
            filter = inputFilter(
                {},
                { ...allFilters[operationDataType] },
                req.body.filter
            );
        }
        if (req.body.sort) {
            //send 0 for decending
            //send 1 for ascending
            sort = inputFilter(
                {},
                {
                    ...allSorts[operationDataType],
                },
                req.body.sort
            );
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }

    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
    }

    const PRIVILEGE_TYPE = `${operationDataType}_read`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    const projection = {
        ...allProjections[operationDataType],
    };
    let queryFilter = {};
    for (let i in filter) {
        queryFilter[i] = { contains: filter[i] };
    }
    let querySort = {};
    for (let i in sort) {
        querySort[i] = sort[i] ? "asc" : "desc";
    }
    try {
        res.json(
            await get(
                queryFilter,
                querySort,
                limit,
                skip,
                projection,
                operationDataType
            )
        );
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
    }
});
router.patch(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/")[1];
    let updateData = {};
    try {
        inputFilter(
            {
                accessToken: "string",
                id: "number",
                updateData: "object",
            },
            {},
            req.body
        );

        updateData = inputFilter(
            {},
            {
                ...allInputFilters[operationDataType],
                ...allOptionalInputfilters[operationDataType],
                startDate: "string",
                endDate: "string",
                isProtectedForEdit: "boolean",
            },
            req.body.updateData
        );

        // if date values sent in update data, transform them into a date value, if wrong format detected throw an error

        for (let i in dateValues[operationDataType]) {
            const key = dateValues[operationDataType][i];
            if (updateData[key]) {
                updateData[key] = new Date(updateData[key]);
                if (!updateData[key].getTime()) {
                    throw {
                        key: key,
                        message: "please send date in yyyy/mm/dd format",
                    };
                }
            }
        }
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }

    if (Object.keys(updateData).length == 0) {
        error("updateData", "no data has been sent for update", next);
        return;
    }
    //if phone or email values given in update data validate it.
    for (let i in phoneValues[operationDataType]) {
        if (updateData[phoneValues[operationDataType][i]])
            if (
                !validation.checkPhoneNumber(
                    updateData[phoneValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
    for (let i in emailValues[operationDataType]) {
        if (updateData[emailValues[operationDataType][i]])
            if (
                !validation.checkEmail(
                    updateData[phoneValues[operationDataType][i]],
                    next
                )
            )
                return;
    }
    const PRIVILEGE_TYPE = `${operationDataType}_update`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;

    let updateDataProjection = {};
    for (let i in updateData) {
        if (updateData[i]) {
            updateDataProjection[i] = true;
        }
    }
    try {
        const data = await patch(
            updateDataProjection,
            req.body,
            updateData,
            operationDataType,
            payLoad.id,
            next
        );
        if (data == false) {
            return;
        }
        res.json(data);
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
router.delete(allRoutes, async (req, res, next) => {
    const operationDataType = req.path.split("/")[1];
    try {
        inputFilter(
            {
                accessToken: "string",
                id: "number",
            },
            {},
            req.body
        );
    } catch (e) {
        error(e.key, e.message, next);
        return;
    }
    let payLoad;
    try {
        payLoad = verify(req.body.accessToken, process.env.ACCESS_KEY);
    } catch (e) {
        error("accessToken", "Invalid or Expired Access Token", next, 401);
        return;
    }
    const PRIVILEGE_TYPE = `${operationDataType}_delete`;
    if (!(await userHasPrivilege(payLoad.id, PRIVILEGE_TYPE, next))) return;
    try {
        res.json(await deleter(req.body, operationDataType));
    } catch (e) {
        console.log(e);
        error("database", "error", next, 500);
        return;
    }
});
module.exports = router;
