const chaiHTTP = require("chai-http");
const chai = require("chai");
const { USER_LOGIN, USER_REGISTER } = require("../const/user_const");
const { ORDER_CREATE, ORDER_GET_BY_ID } = require("../const/order_const");
const { CREATE_PARCEL } = require("../const/pp_const");
let expect = chai.expect;
chai.use(chaiHTTP);

let User = require("../models/User");
let Order = require("../models/Order");
let Parcel = require("../models/ParcelPintar");
let app = require("../app");

let test_args = {
	firstAccount: {
		name: "erithiana_sisijoan",
		email: "joanlamrack@gmail.com",
		password: "12340000"
	},
	secondAccount: {
		name: "Albert Henry",
		email: "creativeProgrammer@gmail.com",
		password: "rahasiadong"
	},
	adminAccount: {
		name: "admin",
		role: "admin",
		password: "admin1234",
		email: "adminadmin@gmail.com"
	},
	parcel: { gyro: {}, gps: {} }
};

describe("Orders", function() {
	this.timeout(15000);

	describe("POST /orders", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(res => {
					//console.log(res.body);
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("Should return the created order", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);
						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return receiver is required", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL)
							.send(test_args.parcel);

						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								destination: 12.78,
								address: "pondok Indah"
							});

						expect(order_create_response).to.have.status(400);
						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return not authorized ", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.send({
								receiver: new_user_id,
								destination: 12.78,
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(403);
						expect(order_create_response.body).to.have.property(
							"error"
						);
						expect(order_create_response.body.error).to.be.equal(
							"not authorized"
						);
						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return invalid token", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;
					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token.slice(1))
							.send({
								receiver: new_user_id,
								destination: 12.78,
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(400);
						expect(order_create_response.body).to.have.property(
							"error"
						);
						expect(order_create_response.body.error).to.be.equal(
							"invalid token"
						);
						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("GET /orders/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(res => {
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return the specified order", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let orderId = order_create_response.body._id;

						let order_get_by_id_response = await chai
							.request(app)
							.get("/orders/" + orderId)
							.set("token", token);
						expect(order_get_by_id_response).to.have.status(200);
						expect(order_get_by_id_response.body).to.be.an(
							"object"
						);
						expect(order_get_by_id_response.body).to.have.property(
							"pickup"
						);
						expect(order_get_by_id_response.body).to.have.property(
							"destination"
						);
						expect(order_get_by_id_response.body).to.have.property(
							"parcel"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return not found", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let orderId = order_create_response.body._id;

						let order_get_by_id_response = await chai
							.request(app)
							.get("/orders/" + orderId.slice(1) + "a")
							.set("token", token);

						//console.log(order_get_by_id_response.body);
						expect(order_get_by_id_response).to.have.status(404);
						expect(order_get_by_id_response.body).to.have.property(
							"error"
						);
						expect(order_get_by_id_response.body.error).to.be.equal(
							"Order not found"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return Bad request", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let orderId = order_create_response.body._id;

						let order_get_by_id_response = await chai
							.request(app)
							.get("/orders/" + orderId.slice(1))
							.set("token", token);

						//console.log(order_get_by_id_response.body);
						expect(order_get_by_id_response).to.have.status(400);
						expect(order_get_by_id_response.body).to.have.property(
							"error"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("GET /orders", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(res => {
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return array of orders", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);
						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return empty array", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let get_orders_reponse = await chai
							.request(app)
							.get("/orders")
							.set("token", token);
						expect(get_orders_reponse).to.have.status(200);
						expect(get_orders_reponse.body).to.have.an("array");
						expect(get_orders_reponse.body.length).to.be.equal(0);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("GET /orders/me/send", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(res => {
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return array of orders by the user", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let login_second_user_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.secondAccount.email,
								password: test_args.secondAccount.password
							});

						expect(login_second_user_response).to.have.status(200);
						expect(
							login_second_user_response.body
						).to.have.property("token");

						let second_user_token =
							login_second_user_response.body.token;

						let get_order_on_second_user_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", second_user_token);

						expect(
							get_order_on_second_user_response
						).to.have.status(200);
						expect(get_order_on_second_user_response.body).to.be.an(
							"array"
						);
						expect(
							get_order_on_second_user_response.body.length
						).to.be.equal(0);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("GET /orders/me/receive", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(res => {
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return array of orders by the user", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let login_second_user_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.secondAccount.email,
								password: test_args.secondAccount.password
							});

						expect(login_second_user_response).to.have.status(200);
						expect(
							login_second_user_response.body
						).to.have.property("token");

						let second_user_token =
							login_second_user_response.body.token;

						let get_receive_order_on_second_user_response = await chai
							.request(app)
							.get("/orders/me/receive")
							.set("token", second_user_token);

						console.log(
							get_receive_order_on_second_user_response.body
						);

						expect(
							get_receive_order_on_second_user_response
						).to.have.status(200);
						expect(
							get_receive_order_on_second_user_response.body
						).to.be.an("array");
						expect(
							get_receive_order_on_second_user_response.body
								.length
						).to.be.equal(1);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("PATCH /orders/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.adminAccount);
				})
				.then(res => {
					console.log(res.body);
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return modified status of the order", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let admin_login_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.adminAccount.email,
								password: test_args.adminAccount.password
							});

						expect(admin_login_response).to.have.status(200);
						expect(admin_login_response.body).to.have.property(
							"token"
						);

						let admin_token = admin_login_response.body.token;

						let order_id = order_create_response.body._id;

						let patch_order_by_admin = await chai
							.request(app)
							.patch("/orders/" + order_id)
							.set("token", admin_token)
							.send({
								status: "Delayed"
							});

						expect(patch_order_by_admin).to.have.status(200);
						expect(patch_order_by_admin.body).to.have.property(
							"status"
						);
						expect(patch_order_by_admin.body.status).to.be.equal(
							"Delayed"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return the modified order (modified by sender)", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let first_account_login_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.firstAccount.email,
								password: test_args.firstAccount.password
							});

						expect(first_account_login_response).to.have.status(
							200
						);
						expect(
							first_account_login_response.body
						).to.have.property("token");

						let admin_token =
							first_account_login_response.body.token;

						let order_id = order_create_response.body._id;

						let patch_order_by_admin = await chai
							.request(app)
							.patch("/orders/" + order_id)
							.set("token", admin_token)
							.send({
								status: "Delayed"
							});

						console.log(patch_order_by_admin.body);

						expect(patch_order_by_admin).to.have.status(200);
						expect(patch_order_by_admin.body).to.have.property(
							"status"
						);
						expect(patch_order_by_admin.body.status).to.be.equal(
							"Delayed"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});

	describe("DELETE /orders/:id", () => {
		beforeEach(done => {
			User.deleteMany({})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.firstAccount);
				})
				.then(() => {
					return chai
						.request(app)
						.post(USER_REGISTER)
						.send(test_args.adminAccount);
				})
				.then(res => {
					console.log(res.body);
					expect(res).to.have.status(201);
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		afterEach(done => {
			User.deleteMany({})
				.then(() => {
					return Order.deleteMany({});
				})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Parcel.deleteMany({});
				})
				.then(() => {
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return the deleted order", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let admin_login_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.adminAccount.email,
								password: test_args.adminAccount.password
							});

						expect(admin_login_response).to.have.status(200);
						expect(admin_login_response.body).to.have.property(
							"token"
						);

						let admin_token = admin_login_response.body.token;

						let order_id = order_create_response.body._id;

						let patch_order_by_admin = await chai
							.request(app)
							.delete("/orders/" + order_id)
							.set("token", admin_token);

						expect(patch_order_by_admin).to.have.status(200);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return Not Authorized", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let first_account_login_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.firstAccount.email,
								password: test_args.firstAccount.password
							});

						expect(first_account_login_response).to.have.status(
							200
						);
						expect(
							first_account_login_response.body
						).to.have.property("token");

						let ordinary_token =
							first_account_login_response.body.token;

						let order_id = order_create_response.body._id;

						let delete_order_by_user = await chai
							.request(app)
							.delete("/orders/" + order_id)
							.set("token", ordinary_token);

						console.log(delete_order_by_user.body);

						expect(delete_order_by_user).to.have.status(403);
						expect(delete_order_by_user.body).to.have.property(
							"error"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});

		it("should return bad request", done => {
			chai.request(app)
				.post(USER_LOGIN)
				.send({
					email: test_args.firstAccount.email,
					password: test_args.firstAccount.password
				})
				.then(async res => {
					expect(res).to.have.status(200);
					let token = res.body.token;

					try {
						let createAnotherUserResponse = await chai
							.request(app)
							.post(USER_REGISTER)
							.send(test_args.secondAccount);

						expect(createAnotherUserResponse).to.have.status(201);
						let new_user_id = createAnotherUserResponse.body._id;

						let parcel_create_response = await chai
							.request(app)
							.post(CREATE_PARCEL);
						expect(parcel_create_response).to.have.status(201);

						let order_create_response = await chai
							.request(app)
							.post(ORDER_CREATE)
							.set("token", token)
							.send({
								receiver: new_user_id,
								destination: {
									long: 234234234,
									lat: 234234234234
								},
								pickup: {
									long: 234123421,
									lat: 13234e234
								},
								address: "pondok Indah",
								parcel: parcel_create_response.body._id
							});
						expect(order_create_response).to.have.status(201);

						let get_orders_response = await chai
							.request(app)
							.get("/orders/me/send")
							.set("token", token);

						expect(get_orders_response).to.have.status(200);
						expect(get_orders_response.body).to.be.an("array");
						expect(get_orders_response.body.length).to.be.equal(1);

						let admin_account_login_response = await chai
							.request(app)
							.post(USER_LOGIN)
							.send({
								email: test_args.adminAccount.email,
								password: test_args.adminAccount.password
							});

						expect(admin_account_login_response).to.have.status(
							200
						);
						expect(
							admin_account_login_response.body
						).to.have.property("token");

						let admin_token =
							admin_account_login_response.body.token;

						let order_id = order_create_response.body._id;

						let delete_order_by_user = await chai
							.request(app)
							.delete("/orders/" + order_id.slice(1))
							.set("token", admin_token);

						console.log(delete_order_by_user.body);

						expect(delete_order_by_user).to.have.status(400);
						expect(delete_order_by_user.body).to.have.property(
							"error"
						);

						done();
					} catch (err) {
						console.log(err);
					}
				})
				.catch(err => {
					console.log(err);
				});
		});
	});
});
