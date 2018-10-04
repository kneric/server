const chaiHTTP = require("chai-http");
const chai = require("chai");
const {
	USER_LOGIN,
	USER_REGISTER,
	USER_PATCH,
	USER_GET_BY_ID,
	USER_DELETE
} = require("../const/user_const");
let expect = chai.expect;
chai.use(chaiHTTP);

let User = require("../models/User");

let app = require("../app");

let test_args = {
	normal: {
		name: "erithiana_sisijoan",
		email: "joanlamrack@gmail.com",
		password: "12340000"
	},
	wrong_email_format: {
		name: "brian_pradipta",
		email: "brianbriangmail.com",
		password: "asdfasdfasdf"
	},
	wrong_password_length: {
		name: "maharamarama",
		email: "lah@gmail.com",
		password: "lock"
	},
	unregistered: {
		name: "Albert Henry",
		email: "creativeProgrammer@gmail.com",
		password: "rahasiadong"
	},
	patch: {
		name: "eri",
		password: "blackdragon"
	},
	patch_unnormal: {
		name: {},
		password: {}
	}
};

describe("Users", function() {
	this.timeout(10000);

	describe("POST/register", () => {
		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return the created new User + encrypted password", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);
					done();
				});
		});
		it("should show error email is wrong format", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.wrong_email_format)
				.end((err, res) => {
					expect(res).to.have.status(400);
					expect(res.body).to.be.a("object");
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.equal(
						"User validation failed: email: Please input a valid email format"
					);
					done();
				});
		});
		it("should show invalid length of password alert", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.wrong_password_length)
				.end((err, res) => {
					expect(res).to.have.status(400);
					expect(res.body).to.be.a("object");
					expect(res.body).to.have.property("error");
					expect(res.body.error).to.equal(
						"User validation failed: password: Password length minimum 6"
					);
					done();
				});
		});

		it("should return fail since mail is not unique", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					chai.request(app)
						.post(USER_REGISTER)
						.send(test_args.normal)
						.end((err, res) => {
							expect(res).to.have.status(400);
							expect(res.body).to.have.property("error");
							expect(res.body.error).to.equal(
								"Email already used"
							);
							done();
						});
				});
		});
	});

	describe("POST/login", () => {
		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return user / password is wrong", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					chai.request(app)
						.post(USER_LOGIN)
						.send({
							email: test_args.unregistered.email,
							password: test_args.unregistered.password
						})
						.end((err, res) => {
							expect(res).to.have.status(404);
							expect(res.body).to.have.property("error");
							expect(res.body.error).to.equal(
								"User not registered"
							);
							done();
						});
				});
		});

		it("should return user / password is wrong", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					chai.request(app)
						.post(USER_LOGIN)
						.send({
							email: test_args.normal.email,
							password: test_args.unregistered.password
						})
						.end((err, res) => {
							expect(res).to.have.status(404);
							expect(res.body).to.have.property("error");
							expect(res.body.error).to.equal(
								"User not registered"
							);
							done();
						});
				});
		});

		it("should return success message and token", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					chai.request(app)
						.post(USER_LOGIN)
						.send({
							email: test_args.normal.email,
							password: test_args.normal.password
						})
						.end((err, res) => {
							expect(res).to.have.status(200);
							expect(res.body).to.have.property("token");
							done();
						});
				});
		});

		it("should return error", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					chai.request(app)
						.post(USER_LOGIN)
						.send({ email: {} })
						.end((err, res) => {
							expect(res).to.have.status(400);
							expect(res.body).to.have.property("error");
							done();
						});
				});
		});
	});

	describe("PATCH/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});
		it("should return the modified user data", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.then(async userCreationResponse => {
					try {
						expect(userCreationResponse).to.have.status(201);
						expect(userCreationResponse.body).to.be.a("object");
						expect(userCreationResponse.body.name).to.equal(
							test_args.normal.name
						);
						expect(userCreationResponse.body.password).to.not.equal(
							test_args.normal.password
						);
						expect(userCreationResponse.body.email).to.equal(
							test_args.normal.email
						);

						let userId = userCreationResponse.body._id;

						let responseFromPatching = await chai
							.request(app)
							.patch("/users/" + userId)
							.send(test_args.patch);

						expect(responseFromPatching).to.have.status(200);
						expect(responseFromPatching.body).to.have.property(
							"name"
						);
						expect(responseFromPatching.body).to.have.property(
							"email"
						);
						expect(responseFromPatching.body).to.have.property(
							"password"
						);
						expect(responseFromPatching.body.name).to.be.equal(
							test_args.patch.name
						);
						expect(responseFromPatching.body.password).to.not.equal(
							test_args.patch.password
						);

						done();
					} catch (err) {
						console.log(err);
					}
				});
		});

		it("should return error", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.then(async userCreationResponse => {
					try {
						expect(userCreationResponse).to.have.status(201);
						expect(userCreationResponse.body).to.be.a("object");
						expect(userCreationResponse.body.name).to.equal(
							test_args.normal.name
						);
						expect(userCreationResponse.body.password).to.not.equal(
							test_args.normal.password
						);
						expect(userCreationResponse.body.email).to.equal(
							test_args.normal.email
						);

						let userId = userCreationResponse.body._id;

						let responseFromPatching = await chai
							.request(app)
							.patch("/users/" + userId)
							.send(test_args.patch_unnormal);

						expect(responseFromPatching).to.have.status(400);
						expect(responseFromPatching.body).to.have.property(
							"error"
						);
						done();
					} catch (err) {
						console.log(err);
					}
				});
		});
	});

	describe("DELETE/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});
		it("should return the deleted account and the account doesn't exist in db", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					let userId = res.body._id;
					chai.request(app)
						.delete("/users/" + userId)
						.then(res => {
							expect(res).to.have.status(200);
							return chai
								.request(app)
								.post(USER_LOGIN)
								.send(test_args.normal);
						})
						.then(res => {
							expect(res).to.have.status(404);
							done();
						})
						.catch(err => {
							console.log(err.message);
						});
				});
		});
		it("should return error and the account still exist in db", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					let userId = res.body._id;
					chai.request(app)
						.delete("/users/" + {})
						.then(res => {
							console.log(res.body);
							expect(res).to.have.status(400);
							return chai
								.request(app)
								.post(USER_LOGIN)
								.send(test_args.normal);
						})
						.then(res => {
							expect(res).to.have.status(200);
							expect(res.body).to.have.property("token");
							done();
						})
						.catch(err => {
							console.log(err.message);
						});
				});
		});
	});

	describe("GET /users/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return the specified user", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					let userId = res.body._id;
					chai.request(app)
						.get("/users/" + userId)
						.then(res => {
							expect(res).to.have.status(200);
							expect(res.body).to.have.property("name");
							expect(res.body).to.have.property("password");
							expect(res.body).to.have.property("email");
							done();
						})
						.catch(err => {
							console.log(err.message);
						});
				});
		});

		it("should return error and user not found", done => {
			chai.request(app)
				.post(USER_REGISTER)
				.send(test_args.normal)
				.end((err, res) => {
					expect(res).to.have.status(201);
					expect(res.body).to.be.a("object");
					expect(res.body.name).to.equal(test_args.normal.name);
					expect(res.body.password).to.not.equal(
						test_args.normal.password
					);
					expect(res.body.email).to.equal(test_args.normal.email);

					let userId = res.body._id;
					chai.request(app)
						.delete("/users/" + userId)
						.then(res => {
							expect(res).to.have.status(200);
							return chai.request(app).get("/users/" + userId);
						})
						.then(response => {
							expect(response).to.have.status(404);
							expect(response.body).to.have.property("error");
							expect(response.body.error).to.be.equal(
								"User not found"
							);
							done();
						})
						.catch(err => {
							console.log(err.message);
						});
				});
		});

		it("should return error", done => {
			chai.request(app)
				.get("/users/" + {})
				.then(response => {
					expect(response).to.have.status(400);
					expect(response.body).to.have.property("error");
					done();
				})
				.catch(err => {
					console.log(err.message);
				});
		});
	});

	describe("GET /users", () => {
		it("should return all users", done => {
			chai.request(app)
				.get("/users")
				.then(response => {
					expect(response).to.have.status(200);
					expect(response.body).to.be.an("array");
					done();
				})
				.catch(err => console.log(err));
		});
	});
});
