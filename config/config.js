const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: "mail.ablazelabs.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SENDER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const confirmCredential = async (to, code) => {
    //TODO
    /**
     * send email or sms to given to(could be phone or email)
     * nothing else to worry about
     */
};
/**
 *
 * @param {string} to email receiver
 * @param {string} title
 * @param {string} subject
 * @param {string} body
 * @param {Array<{fileName:string, file:Buffer}>} attachments
 */
const sendEmail = async (to, title, subject, body, attachments) => {
    // send mail with defined transport object
    try {
        let info = await transporter.sendMail({
            from: `"Ablazelabs ERP" <${process.env.EMAIL_SENDER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text: title, // plain text body
            html: body, // html body
        });
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false };
    }
};
/**
 *   A function that returns a random string.
 * */
const randomConcurrencyStamp = () => {
    return "random";
};
/**
 * It takes a string in snake case and returns a string in pascal case
 * @param {string} str - The string to be converted.
 * @returns A function that takes a string and returns a string.
 */
const snakeToPascal = (str) => {
    let newStr = str.split("_");
    newStr = newStr.map((elem) => {
        elem = elem.split("");
        elem[0] = elem[0].toUpperCase();
        return elem.join("");
    });
    return newStr.join(" ");
};
/**
 *
 * @param {string} key argument of the error
 * @param {string|Array<string>} message error message to send client
 * @param {Function} next the next middleware function of express
 * @param {number} status status of the error(default 400)
 */
const error = (key, message, next, status = 400) => {
    let myError = { status };
    if (key == "status") key = "Status";
    if (status >= 400 && status < 500) {
        myError["error_id"] = (Math.random() * 100).toFixed(2);
        myError[key] = message + "^" + myError["error_id"];
    }
    status != 400 && console.log({ error: myError, status });
    next(new Error(JSON.stringify(myError)));
};

const getOperationDataType = (requestPath) => {
    return requestPath?.split("/")?.pop()?.toLowerCase();
};

const { PrismaClient } = require("@prisma/client");

const allModels = new PrismaClient();
module.exports = {
    error,
    sendEmail,
    confirmCredential,
    randomConcurrencyStamp,
    snakeToPascal,
    getOperationDataType,
    allModels,
    COMPANY_NAME: "ElHadar-PLC",
    REPORT_BASIS_TITLE: "Accounting Method: ",
};
