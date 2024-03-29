const { error } = require("../config/config");
module.exports = {
    /** Checking the phone number. */
    checkPhoneNumber: (phoneNumber, next, key = "phone_number") => {
        console.log(phoneNumber);
        if (phoneNumber[0] === "0") {
            if (phoneNumber.length === 10) {
                return true;
            }
            error(key, "phone Number length must be 10", next);
            return;
        }
        const splitPhone = phoneNumber.split("-");
        if (splitPhone.length != 2) {
            error(
                key,
                "phone Number must be countryCode-phone_number format or 0xxxxxxxxx",
                next
            );
            return;
        }

        let phone_number = splitPhone[1];
        let countryCode = splitPhone[0];
        if (phone_number.length !== 9)
            error(key, "Phone number Length must be 3-9", next);
        else if (
            phone_number.match("[0-9]{9}") &&
            countryCode.match("[0-9]{3}")
        ) {
            return true;
        } else {
            error(key, "phone number characters must be Numbers", next);
        }
    },
    /**  Checking the email format. */
    checkEmail: (email, next, key = "email") => {
        if (email.match(".+@.+[.].+")) return true;
        else {
            error(
                key,
                "email format must contain @ and . in the middle somewhere",
                next
            );
        }
    },
    /** Checking the password length. */
    checkPassword: (password, next, key = "password") => {
        if (password.length < 8)
            error(key, "password length must be at least 8", next);
        else {
            return true;
        }
    },
};
