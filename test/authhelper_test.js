const chai = require("chai");
let expect = chai.expect;
const authHelper = require("../helpers/authHelper");

describe("Auth Helper", function() {
	describe(".hashpass", function() {
		it("should match password and hash correctly", done => {
			let password = "askjdfjasjdfas";
			let hashedPassword = authHelper.hashpass(password);
			let matchWithHash = authHelper.comparehash(
				password,
				hashedPassword
			);
			expect(matchWithHash).to.be.equal(true);
			done();
		});

		it("should match password and hash incorrecly", done => {
			let password = "askjdfjasjdfas";
			let hashedPassword = authHelper.hashpass(password);
			let matchWithHash = authHelper.comparehash("hoi", hashedPassword);
			expect(matchWithHash).to.be.equal(false);
			done();
		});
	});

	describe(".createtoken", function() {
		it("should match token and data correctly", done => {
			let data = { data: "oasodfs" };
			let token = authHelper.createToken(data);
			let decodedToken = authHelper.decodeToken(token);
			expect(decodedToken.data).to.be.equal(data.data);
			done();
		});
	});
});
