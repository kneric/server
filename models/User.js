const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AuthHelper = require("../helpers/authHelper");

const userSchema = Schema(
	{
		name: {
			type: String,
			required: true,
			minlength: 4
		},
		email: {
			type: String,
			required: true,
			unique: true,
			match: [
				/^\w+@([a-z]+\.)+[a-z]{2,3}$/,
				"Please input a valid email format"
			]
		},
		password: {
			type: String,
			required: true,
			minlength: [6, "Password length minimum 6"]
		},
		role: {
			type: String,
			required: true,
			default: "user"
		},
		orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
		receivers: [{ type: Schema.Types.ObjectId, ref: "Order" }]
	},
	{
		timestamps: true
	}
);

userSchema.pre("save", function(next) {
	if (this.isNew) {
		let user = this;
		let password = AuthHelper.hashpass(user.password);
		user.password = password;
	}
	next();
});

userSchema.post("save", function(err, doc, next) {
	if (err.name == "MongoError" && err.code == 11000) {
		next(new Error("Email already used"));
	} else {
		next(err);
	}
});

module.exports = mongoose.model("User", userSchema);
