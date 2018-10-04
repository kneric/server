const User = require("../models/User");
const AuthHelper = require("../helpers/authHelper");

class AuthMiddleware {
	static checkifTokenExist(req, res, next) {
		if (req.headers.token) {
			next();
		} else {
			res.status(403).json({
				error: "not authorized"
			});
		}
	}

	//if valid, inject header with userId
	static checkifTokenValid(req, res, next) {
		try {
			let id = AuthHelper.decodeToken(req.headers.token).id;
			User.findById(id)
				.then(userfound => {
					if (userfound) {
						req.headers.userId = userfound._id;
						req.headers.role = userfound.role;
						next();
					} else {
						res.status(400).json({
							error: "invalid token"
						});
					}
				})
				.catch(err => {
					res.status(400).json({
						error: err.message
					});
				});
		} catch (error) {
			res.status(400).json({
				error: error.message
			});
		}
	}

	static checkifAdmin(req, res, next) {
		if (req.headers.role && req.headers.role === "admin") {
			next();
		} else {
			res.status(403).json({
				error: "Not Authorized"
			});
		}
	}
}

module.exports = AuthMiddleware;
