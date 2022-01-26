const { allModels, error } = require("../config/config");
const { post: mPost, deleter: mDelete } = require("./mostCRUD/mostCRUD");
const { vacancy_applicant, vacancy_internal_applicant, employee } = allModels;
const post = async (
    reqBody,
    operationDataType,
    creator,
    uniqueValues,
    next,
    sendId = false
) => {
    if (operationDataType === "vacancy_applicant") {
        const vacApp = await vacancy_applicant.findFirst({
            where: {
                vacancy_id: reqBody.vacancy_id,
                employee_id: reqBody.employee_id,
            },
            select: { id: true },
        });
        if (vacApp) {
            error(
                "employee_id",
                "Employee already applied for this vacancy",
                next
            );
            return false;
        }
        const emp = await employee.findUnique({
            where: { id: reqBody.employee_id },
            select: { first_name: true, middle_name: true, last_name: true },
        });
        if (emp) {
            reqBody.name = `${emp.first_name} ${emp.middle_name}${
                emp.last_name ? " " + emp.last_name : ""
            }`;
        } else {
            error("employee_id", "no employee exists with this id", next);
            return false;
        }
    }
    return mPost(
        reqBody,
        operationDataType,
        creator,
        uniqueValues,
        next,
        sendId
    );
};
/**
 *
 * @param {number} id
 */
const deleteFnExternal = async (id) => {
    const exApplicant = await vacancy_applicant.findUnique({
        where: { id },
        select: {
            external_applicant_id: true,
        },
    });
    console.log(exApplicant);
    await mDelete(
        exApplicant?.external_applicant_id || -1,
        "external_applicant"
    );
    return await mDelete(id, "vacancy_applicant");
};
const deleteFnInternal = async (id) => {
    const deletedVacApp = await vacancy_applicant.findUnique({ where: { id } });
    let data = await mDelete(id, "vacancy_applicant");
    if (deletedVacApp.is_employee == 1) {
        const deletedInternalApplicant =
            await vacancy_internal_applicant.findFirst({
                where: {
                    employee_id: deletedVacApp.employee_id,
                    vacancy_id: deletedVacApp.vacancy_id,
                },
                select: { id: true },
            });
        data = await mDelete(
            deletedInternalApplicant.id,
            "vacancy_internal_applicant"
        );
    }
    return data;
};
module.exports = {
    post,
    deleteFnExternal,
    deleteFnInternal,
};
// same as the others
