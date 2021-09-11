const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("./task");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, uppercase: true, trim: true },
        age: {
            type: Number,
            validate(value) {
                if (value < 0) {
                    throw new Error("age must be postive");
                }
            },
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            toLowerCase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Please enter a valid email address");
                }
            },
        },
        password: {
            type: String,
            minLength: 7,
            required: true,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("Password cannot contain 'password'");
                }
            },
        },
        tokens: [{ token: { type: String, required: true } }],
        avatar: {
            type: Buffer,
        },
    },
    { timestamps: true }
);
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner",
});
userSchema.methods.toJSON = function () {
    const userObj = this.toObject();
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
};
userSchema.methods.generateAuthToken = async function () {
    console.log("id" + this._id);
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
};
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("unable to login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("unable to login");
    }
    console.log("return user");
    return user;
};

//Hash password
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});
userSchema.pre("remove", async function (next) {
    await Task.deleteMany({ owner: this._id });
    next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
