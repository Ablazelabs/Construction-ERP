const express = require("express");
const router = express.Router();

const account = require("./account");
const login = require("./account/login");
const confirmAccount = require("./account/confirmAccount");
const logout = require("./account/logout");
const refresh = require("./account/refresh");
const forgotpassword = require("./account/forgotpassword");
const sendcode = require("./account/sendcode");
const changepassword = require("./account/changepassword");
const role = require("./role");
const privilege = require("./privilege");
const upload = require("./project/master/upload");
const client = require("./project/master/client");
const material = require("./project/master/material");
const documentation = require("./project/master/documentation");
const restMasterData = require("./project/master/restMasterData");

const dashboard = require("./project/dashboard/dashboard");

const projectRequests = require("./project/operational/requests");
const operationalData = require("./project/operational/operational_data");
const mainSubTodo = require("./project/operational/mainsubtodo");
const dailyWorkLog = require("./project/operational/dailyWorkLog");
const workingDays = require("./project/workingDays");
const projectValidations = require("./project/validation/allValidations");

const financeContact = require("./finance/master/contact");
const financemasters = require("./finance/master/financemasters");
const accountingPeriod = require("./finance/master/accountingPeriod");
const financeGeneralExport = require("./finance/operational/generalExport");
const financeNewPvs = require("./finance/operational/newpv");
const financeExports = require("./finance/operational/exportController");
const businessOverviewExports = require("./finance/businessOverviewExport");
const exportTemplate = require("./finance/operational/exportTemplate");
const cashPaymentCustom = require("./finance/operational/cashPaymentCustom");
const crvPayment = require("./finance/operational/crvPayment");
const recurringGeneralJournal = require("./finance/operational/recurringGeneralJournal");
const budget = require("./finance/operational/budget");
const accountTypeFSSection = require("./finance/operational/accountTypeFinancialStatementSection");
const restFinanceOperational = require("./finance/operational/rest_finance_operational");
const financeUpload = require("./finance/operational/upload");

const hcmMasters = require("./hcm/master/hcmMasters");

const hcmEmployeeExport = require("./hcm/employee_master/excelExport");
const hcmEmployeeMasters = require("./hcm/employee_master/hcmEmployeeMasters");
const fileEmployeeMasters = require("./hcm/employee_master/fileEmployeeMasters");
const disciplineAttachment = require("./hcm/employee_master/disciplineAttachment");
const employeeAction = require("./hcm/employee_master/employeeAction");
const initialHiring = require("./hcm/employee_master/initialHiring");
const hcmApprovals = require("./hcm/employee_master/hcmApprovals");
const employeeActionMeasure = require("./hcm/employee_master/employeeActionMeasure");

const hcmVacancyApplicant = require("./hcm/jobPosCompStrucRecru/vacancyApplicant");
const hcmVacancyExaminer = require("./hcm/jobPosCompStrucRecru/vacancyExaminer");
const hcmVacancyResult = require("./hcm/jobPosCompStrucRecru/vacancyResult");
const hcmJobTitle = require("./hcm/jobPosCompStrucRecru/jobTitle");
const jobPosCompStrucRecru = require("./hcm/jobPosCompStrucRecru/jobPosCompStrucRecru");
const compStrucRecruFile = require("./hcm/jobPosCompStrucRecru/compStrucRecruFile");

const hcmPayroll = require("./hcm/payroll/hcmPayroll");
const hcmPayrollSlip = require("./hcm/payroll/payrollSlip");
const employeePayscaleUpload = require("./hcm/payroll/employeePayscaleUpload");
const paygradeScale = require("./hcm/payroll/paygradeScale");
const payrollControl = require("./hcm/payroll/payrollControl");
const accountMapping = require("./hcm/payroll/accountMapping");
const paygradeSalaryComponent = require("./hcm/payroll/paygradeSalaryComponent");

const attendanceSheet = require("./hcm/timeAndLeave/attendanceSheet");
const hcmShiftSchedule = require("./hcm/timeAndLeave/shiftSchedule");
const hcmTimeAndLeave = require("./hcm/timeAndLeave/hcmTimeAndLeave");

const inventMasterAndStock = require("./inventory/masterAndStock/inventMasterAndStock");

router.use(login);
router.use(logout);
router.use(refresh);
router.use(confirmAccount);
router.use(account);
router.use(forgotpassword);
router.use(sendcode);
router.use(changepassword);
router.use(role);
router.use(privilege);
router.use("/project/master", upload);
router.use("/project/master", client);
router.use("/project/master", material);
router.use("/project/master", documentation);
router.use("/project/master", restMasterData);

router.use("/project/dashboard", dashboard);

router.use("/project", workingDays);
router.use("/project/operational", projectRequests);
router.use("/project/operational", dailyWorkLog);
router.use("/project/operational", mainSubTodo);
router.use("/project/operational", operationalData);
router.use("/project/validation", projectValidations);

router.use("/finance/master", financeContact);
router.use("/finance/master", financemasters);
router.use("/finance/master", accountingPeriod);
router.use("/finance/business_export", businessOverviewExports);

router.use("/finance/operational", financeNewPvs);
router.use("/finance/operational", financeGeneralExport);
router.use("/finance/operational", exportTemplate);
router.use("/finance/operational/export", financeExports);
router.use("/finance/operational/cash_payment_custom", cashPaymentCustom);
router.use("/finance/operational/crv_payment", crvPayment);
router.use("/finance/operational", recurringGeneralJournal);
router.use("/finance/operational", budget);
router.use("/finance/operational", accountTypeFSSection);
router.use("/finance/operational", restFinanceOperational);
router.use("/finance/operational", financeUpload);

router.use("/hcm/master", hcmMasters);
router.use("/hcm/employee_master", disciplineAttachment);
router.use("/hcm/employee_master", employeeAction);
router.use("/hcm", hcmApprovals);

router.use("/hcm/employee_master", employeeActionMeasure);
router.use("/hcm/employee_master", fileEmployeeMasters);
router.use("/hcm/employee_master", initialHiring);
router.use("/hcm/employee_master", hcmEmployeeMasters);
router.use("/hcm/employee_master", hcmEmployeeExport);
router.use("/hcm/recruitment", hcmVacancyApplicant);
router.use("/hcm/recruitment", hcmVacancyExaminer);
router.use("/hcm/recruitment", hcmVacancyResult);
router.use("/hcm/job_positions", hcmJobTitle);
router.use("/hcm", jobPosCompStrucRecru);
router.use("/hcm", compStrucRecruFile);
router.use("/hcm/payroll", paygradeScale);
router.use("/hcm/payroll", payrollControl);
router.use("/hcm/payroll", accountMapping);
router.use("/hcm/payroll", paygradeSalaryComponent);
router.use("/hcm/payroll", hcmPayrollSlip);
router.use("/hcm/payroll", hcmPayroll);
router.use("/hcm/payroll", employeePayscaleUpload);
router.use("/hcm/time_and_leave/attendance_payroll", attendanceSheet);
router.use("/hcm/time_and_leave", hcmShiftSchedule);
router.use("/hcm/time_and_leave", hcmTimeAndLeave);
router.use("/inventory", inventMasterAndStock);

module.exports = router;
