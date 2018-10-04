const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class AuthHelper {

	static hashpass(password) {
		return bcrypt.hashSync(password);
	}

	static comparehash(password, hashedPassword) {
		return bcrypt.compareSync(password, hashedPassword);
	}

	static createToken(ObjUserId) {
		return jwt.sign(ObjUserId, process.env.secret, { expiresIn: 600 });
	}

	static decodeToken(token) {
		return jwt.verify(token, process.env.secret);
	}

	static createBasicAuth(username, password) {
		return (
			"Basic " +
			new Buffer.from(username + ":" + password).toString("base64")
		);
	}
}

module.exports = AuthHelper;
