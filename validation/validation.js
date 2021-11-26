const { error } = require("../config/config");
module.exports = {
  checkPhoneNumber: (phoneNumber, next) => {
    const splitPhone = phoneNumber.split("-");
    if (splitPhone.length != 2) {
      error(
        "phone_number",
        "phone Number must be countryCode-phone_number format",
        next
      );
      return;
    }

    let phone_number = splitPhone[1];
    let countryCode = splitPhone[0];
    if (phone_number.length !== 9)
      error("phone_number", "Phone number Length must be 3-9", next);
    else if (phone_number[0] !== "9")
      error("phone_number", "Phone number must start with 9", next);
    else if (countryCode.length !== 3)
      error("phone_number", "country code must be of 3 length", next);
    else if (phone_number.match("[0-9]{9}") && countryCode.match("[0-9]{3}")) {
      return true;
    }
    error("phone_number", "phone number characters must be Numbers", next);
  },
  checkEmail: (email, next) => {
    if (email.match(".+@.+[.].+")) return true;
    else {
      error(
        "email",
        "email format must contain @ and . in the middle somewhere",
        next
      );
    }
  },
  checkPassword: (password, next) => {
    if (password.length < 8)
      error("password", "password length must be at least 8", next);
    else {
      return true;
    }
  },
};
