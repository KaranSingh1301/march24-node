const UserSchema = require("../Schema/UserSchema");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

//example to see how to use class in model

const User = class {
  username;
  name;
  password;
  email;

  constructor({ email, username, password, name }) {
    this.username = username;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  registerUser() {
    return new Promise(async (resolve, reject) => {
      const hashedPassword = await bcrypt.hash(
        this.password,
        parseInt(process.env.SALT)
      );

      const userObj = new UserSchema({
        name: this.name,
        email: this.email,
        username: this.username,
        password: hashedPassword,
      });

      try {
        const userDb = await userObj.save();
        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }

  static emailAndUsernameExist({ username, email }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userExist = await UserSchema.findOne({
          $or: [{ email }, { username }],
        });
        console.log(userExist);
        if (userExist && userExist.email === email)
          reject("Email already exist");
        if (userExist && userExist.username === username)
          reject("Username already exist");

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static findUserWithKeys({ key }) {
    return new Promise(async (resolve, reject) => {
      try {
        const userDb = await UserSchema.findOne({
          $or: [
            ObjectId.isValid(key) ? { _id: key } : { email: key },
            { username: key },
          ],
        }).select("+password");

        if (!userDb) reject("User not found");

        resolve(userDb);
      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = User;

// Index.js(Router) -----> Controler(UserModel)------>Model(UserSchema)<------Schema
//const id = ObjectId.createFromHexString(person._id);
