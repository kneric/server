const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

let expect = chai.expect;

const app = require("../app");
const Log = require("../models/Log");
const User = require("../models/User");
const Order = require("../models/Order");
const Parcel = require("../models/ParcelPintar");
const { USER_LOGIN, USER_REGISTER } = require("../const/user_const");
const { ORDER_CREATE } = require("../const/order_const");
const { CREATE_PARCEL } = require("../const/pp_const");

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

describe("Logs routes", function() {
	this.timeout(15000);

	describe("POST / logs", done => {
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
			Log.deleteMany({})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Order.deleteMany({});
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

		it("should return success creating log", done => {
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

						let parcel_id = parcel_create_response.body._id;

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

						let log_create_response = await chai
							.request(app)
							.post("/logs")
							.send({
								parcelId: parcel_id,
								long: -103.12,
								lat: 123.02,
								threshold: true
							});
						expect(log_create_response).to.have.status(201);
						expect(log_create_response.body).to.have.property(
							"data"
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

	describe("GET / logs", done => {
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
			Log.deleteMany({})
				.then(() => {
					return User.deleteMany({});
				})
				.then(() => {
					return Order.deleteMany({});
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

		it("should return success creating log", done => {
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

						let parcel_id = parcel_create_response.body._id;

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

						let log_create_response = await chai
							.request(app)
							.post("/logs")
							.send({
								parcelId: parcel_id,
								long: -103.12,
								lat: 123.02,
								threshold: true
							});
						expect(log_create_response).to.have.status(201);
						expect(log_create_response.body).to.have.property(
							"data"
						);

						let log_get_all_response = await chai
							.request(app)
							.get("/logs");

						expect(log_get_all_response).to.have.status(200);
						expect(log_get_all_response.body.data).to.be.an(
							"array"
						);
						expect(
							log_get_all_response.body.data.length
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
});
