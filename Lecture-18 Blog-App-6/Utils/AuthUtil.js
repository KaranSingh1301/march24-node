const validator = require("validator");

// const validateEmail = (email) => {
//   return String(email)
//     .toLowerCase()
//     .match(
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//     );
// };

const validateRegisterUserData = ({ username, email, name, password }) => {
  return new Promise((resolve, reject) => {
    if (!name || !email || !username || !password) {
      reject("Missing user data");
    }

    if (typeof email !== "string") reject("Email is not a string");
    if (typeof password !== "string") reject("password is not a string");
    if (typeof username !== "string") reject("username is not a string");
    if (typeof name !== "string") reject("name is not a string");

    if (username.length < 3 || username.length > 50)
      reject("Username length should be 3-50");

    if (!validator.isEmail(email)) reject("Email format is incorrect.");

    resolve();
  });
};

module.exports = { validateRegisterUserData };
