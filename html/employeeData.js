const { allModels } = require("../config/config");

const columns = [
    {
        label: "ID NO.",
        name: "id_number",
    },
    {
        label: "First Name",
        name: "first_name",
    },
    {
        label: "Middle Name",
        name: "middle_name",
    },
    {
        label: "Last Name",
        name: "last_name",
    },
    {
        label: "Gender",
        name: "genderValue",
    },
    {
        label: "Date Of Birth",
        name: "date_of_birth",
    },
    {
        label: "Place Of Birth",
        name: "place_of_birth",
    },
    {
        label: "Marital Status",
        name: "maritalStatus",
    },
    {
        label: "Married Since",
        name: "marital_since",
    },
    {
        label: "Is Employee Active",
        name: "is_employee_active",
    },
    {
        label: "Type",
        name: "type",
    },
    {
        label: "Bank Account Number",
        name: "bank_account_number",
    },
    {
        label: "Tin Number",
        name: "tin_number",
    },
    {
        label: "Document Ref",
        name: "document_ref",
    },
    {
        label: "Pension Ref",
        name: "pension_ref",
    },
    {
        label: "Nationality",
        name: "nationalityName",
    },
    {
        label: "Country",
        name: "countryName",
    },
    {
        label: "Language",
        name: "languageName",
    },
    {
        label: "Title",
        name: "titleName",
    },
    {
        label: "Employee Type",
        name: "employeeType",
    },
    {
        label: "Start Date",
        name: "startDate",
    },
    {
        label: "End Date",
        name: "endDate",
    },
];
module.exports = async (req, res, next) => {
    const id = Number(req.params.id);
    if (!id) {
        res.send(`We Couldn't Find The Employee! Please try again`);
        return;
    }
    const employeeDb = allModels.employee
        .findUnique({
            where: { id },
            include: {
                nationality: true,
                country: true,
                language: true,
                title: true,
                employee_type: true,
            },
        })
        .catch((e) => undefined);
    let employee = await employeeDb;
    if (!employee) {
        res.send(`We Couldn't Find The Employee! Please try again`);
        return;
    }
    employee.genderValue = ["Male", "Female"][employee.gender];
    employee.maritalStatus = ["Single", "Married", "Widowed", "Divorced"][
        employee.marital_status
    ];
    employee.nationalityName = employee.nationality?.name;
    employee.countryName = employee.country?.country_name;
    employee.languageName = employee.language?.name;
    employee.titleName = employee.title?.name;
    employee.employeeType = employee.employee_type?.description;
    let htmls = "";
    columns.forEach((column, i) => {
        htmls += `
        <div style="padding:10px;display: flex; flex-direction: row; width: 100%; justify-content: flex-start">
            <span style="fontWeight:bold">${column.label}</span> 
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-----&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>${employee[column.name] || ""}</span>
        </div>`;
    });
    return res.send(`
    <html>
        <body>
            <h1>${
                employee.first_name +
                " " +
                employee.middle_name +
                "( " +
                employee.id_number +
                " )"
            }</h1>
            <div width="50%">
                ${htmls}
            </div>
        </body>
    </html>
    `);
};
