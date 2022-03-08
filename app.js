const express = require("express");
const { json } = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();
const { authenticate } = require("./validation/auth");
const app = express();

const account = require("./api-routes/account");
const login = require("./api-routes/account/login");
const confirmAccount = require("./api-routes/account/confirmAccount");
const logout = require("./api-routes/account/logout");
const refresh = require("./api-routes/account/refresh");
const forgotpassword = require("./api-routes/account/forgotpassword");
const sendcode = require("./api-routes/account/sendcode");
const changepassword = require("./api-routes/account/changepassword");
const role = require("./api-routes/role");
const privilege = require("./api-routes/privilege");
const upload = require("./api-routes/project/master/upload");
const client = require("./api-routes/project/master/client");
const material = require("./api-routes/project/master/material");
const documentation = require("./api-routes/project/master/documentation");
const restMasterData = require("./api-routes/project/master/restMasterData");
const operationalData = require("./api-routes/project/operational/operational_data");

const financeContact = require("./api-routes/finance/master/contact");
const financemasters = require("./api-routes/finance/master/financemasters");
const accountingPeriod = require("./api-routes/finance/master/accountingPeriod");

const financeGeneralExport = require("./api-routes/finance/operational/generalExport");
const financeExports = require("./api-routes/finance/operational/exportController");
const businessOverviewExports = require("./api-routes/finance/businessOverviewExport");
const exportTemplate = require("./api-routes/finance/operational/exportTemplate");
const cashPaymentCustom = require("./api-routes/finance/operational/cashPaymentCustom");
const crvPayment = require("./api-routes/finance/operational/crvPayment");
const recurringGeneralJournal = require("./api-routes/finance/operational/recurringGeneralJournal");
const budget = require("./api-routes/finance/operational/budget");
const accountTypeFSSection = require("./api-routes/finance/operational/accountTypeFinancialStatementSection");
const restFinanceOperational = require("./api-routes/finance/operational/rest_finance_operational");
const financeUpload = require("./api-routes/finance/operational/upload");

const hcmMasters = require("./api-routes/hcm/master/hcmMasters");
const hcmEmployeeMasters = require("./api-routes/hcm/employee_master/hcmEmployeeMasters");
const fileEmployeeMasters = require("./api-routes/hcm/employee_master/fileEmployeeMasters");
const disciplineAttachment = require("./api-routes/hcm/employee_master/disciplineAttachment");
const employeeAction = require("./api-routes/hcm/employee_master/employeeAction");
const initialHiring = require("./api-routes/hcm/employee_master/initialHiring");
const hcmApprovals = require("./api-routes/hcm/employee_master/hcmApprovals");
const employeeActionMeasure = require("./api-routes/hcm/employee_master/employeeActionMeasure");
const hcmVacancyApplicant = require("./api-routes/hcm/jobPosCompStrucRecru/vacancyApplicant");
const hcmVacancyExaminer = require("./api-routes/hcm/jobPosCompStrucRecru/vacancyExaminer");
const hcmVacancyResult = require("./api-routes/hcm/jobPosCompStrucRecru/vacancyResult");
const hcmJobTitle = require("./api-routes/hcm/jobPosCompStrucRecru/jobTitle");
const jobPosCompStrucRecru = require("./api-routes/hcm/jobPosCompStrucRecru/jobPosCompStrucRecru");
const compStrucRecruFile = require("./api-routes/hcm/jobPosCompStrucRecru/compStrucRecruFile");

const hcmPayroll = require("./api-routes/hcm/payroll/hcmPayroll");
const hcmPayrollSlip = require("./api-routes/hcm/payroll/payrollSlip");

const employeePayscaleUpload = require("./api-routes/hcm/payroll/employeePayscaleUpload");
const paygradeScale = require("./api-routes/hcm/payroll/paygradeScale");
const payrollControl = require("./api-routes/hcm/payroll/payrollControl");
const accountMapping = require("./api-routes/hcm/payroll/accountMapping");
const paygradeSalaryComponent = require("./api-routes/hcm/payroll/paygradeSalaryComponent");

const attendanceSheet = require("./api-routes/hcm/timeAndLeave/attendanceSheet");
const hcmShiftSchedule = require("./api-routes/hcm/timeAndLeave/shiftSchedule");
const hcmTimeAndLeave = require("./api-routes/hcm/timeAndLeave/hcmTimeAndLeave");

const inventMasterAndStock = require("./api-routes/inventory/masterAndStock/inventMasterAndStock");
const cors = require("cors");

app.use(json());
app.use(cors());

app.use(authenticate);

app.use((req, _res, next) => {
    // this code is a hack
    // we used req.body to get data from requests, but get doesn't allow, so stringify the json u want to send and send it as a param (parameter name must be body)
    if (req.method == "GET") {
        if (Object.keys(req.body).length == 0) {
            if (req.query.body) {
                try {
                    req.body = JSON.parse(req.query.body);
                } catch {}
            }
        }
    }
    next();
});

app.use("/api/", login);
app.use("/api/", logout);
app.use("/api/", refresh);
app.use("/api/", confirmAccount);

app.use("/api/", account);
app.use("/api/", forgotpassword);
app.use("/api/", sendcode);
app.use("/api/", changepassword);
app.use("/api/", role);
app.use("/api/", privilege);

app.use("/api/project/master", upload);
app.use("/api/project/master", client);
app.use("/api/project/master", material);
app.use("/api/project/master", documentation);
app.use("/api/project/master", restMasterData);

app.use("/api/project/operational", operationalData);

app.use("/api/finance/master", financeContact);
app.use("/api/finance/master", financemasters);
app.use("/api/finance/master", accountingPeriod);

app.use("/api/finance/business_export", businessOverviewExports);
app.use("/api/finance/operational", financeGeneralExport);
app.use("/api/finance/operational", exportTemplate);
app.use("/api/finance/operational/export", financeExports);
app.use("/api/finance/operational/cash_payment_custom", cashPaymentCustom);
app.use("/api/finance/operational/crv_payment", crvPayment);
app.use("/api/finance/operational", recurringGeneralJournal);
app.use("/api/finance/operational", budget);
app.use("/api/finance/operational", accountTypeFSSection);
app.use("/api/finance/operational", restFinanceOperational);
app.use("/api/finance/operational", financeUpload);

app.use("/api/hcm/master", hcmMasters);
app.use("/api/hcm/employee_master", disciplineAttachment);
app.use("/api/hcm/employee_master", employeeAction);
app.use("/api/hcm", hcmApprovals);
app.use("/api/hcm/employee_master", employeeActionMeasure);
app.use("/api/hcm/employee_master", fileEmployeeMasters);
app.use("/api/hcm/employee_master", initialHiring);
app.use("/api/hcm/employee_master", hcmEmployeeMasters);

app.use("/api/hcm/recruitment", hcmVacancyApplicant);
app.use("/api/hcm/recruitment", hcmVacancyExaminer);
app.use("/api/hcm/recruitment", hcmVacancyResult);
app.use("/api/hcm/job_positions", hcmJobTitle);

app.use("/api/hcm", jobPosCompStrucRecru);
app.use("/api/hcm", compStrucRecruFile);

app.use("/api/hcm/payroll", paygradeScale);
app.use("/api/hcm/payroll", payrollControl);
app.use("/api/hcm/payroll", accountMapping);
app.use("/api/hcm/payroll", paygradeSalaryComponent);
app.use("/api/hcm/payroll", hcmPayrollSlip);
app.use("/api/hcm/payroll", hcmPayroll);
app.use("/api/hcm/payroll", employeePayscaleUpload);

app.use("/api/hcm/time_and_leave/attendance_payroll", attendanceSheet);
app.use("/api/hcm/time_and_leave", hcmShiftSchedule);
app.use("/api/hcm/time_and_leave", hcmTimeAndLeave);

app.use("/api/inventory", inventMasterAndStock);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

app.use((err, _req, res, _next) => {
    let myError = JSON.parse(err.message);
    const status = myError.status;
    myError.status = undefined;
    res.status(status).send({ error: myError });
});
const port = 3000;

const basicAuth = require("express-basic-auth");

app.use(
    "/api/api-docs",
    basicAuth({
        users: { yourUser: "yourPassword" },
        challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(require("./documentation/allApis"), { explorer: true })
);

module.exports = app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
