const User = require("../models/User");
const AuthHelper = require("../helpers/authHelper");

class UserController {
	static register(req, res) {
		const { name, email, password, role } = req.body;

		User.create({
			name,
			email,
			password,
			role
		})
			.then(newUser => {
				res.status(201).json(newUser);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static login(req, res) {
		const { email, password } = req.body;

		User.findOne({ email })
			.then(userFound => {
				if (userFound) {
					let passwordIsMatch = AuthHelper.comparehash(
						password,
						userFound.password
					);
					if (passwordIsMatch) {
						let token = AuthHelper.createToken({
							id: userFound.id,
							name: userFound.name,
							email: userFound.email,
							role: userFound.role
						});

						res.status(200).json({
							token
						});
					} else {
						res.status(404).json({
							error: "User not registered"
						});
					}
				} else {
					res.status(404).json({
						error: "User not registered"
					});
				}
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static updateUser(req, res) {
		let userId = req.params.id;
		const { name, email } = req.body;
		User.findByIdAndUpdate(userId, { $set: { name, email } }, { new: true })
			.then(updatedUser => {
				res.status(200).json(updatedUser);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static remove(req, res) {
		let userId = req.params.id;

		User.findByIdAndRemove(userId)
			.then(removedUser => {
				res.status(200).json(removedUser);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static getUserById(req, res) {
		let userId = req.params.id;

		User.findById(userId)
			.populate("orders")
			.populate("receivers")
			.then(userFound => {
				if (userFound) {
					res.status(200).json(userFound);
				} else {
					res.status(404).json({
						error: "User not found"
					});
				}
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static getAllUsers(req, res) {
		User.find()
			.populate("orders")
			.populate("receivers")
			.then(users => {
				res.status(200).json(users);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}
}

module.exports = UserController;
