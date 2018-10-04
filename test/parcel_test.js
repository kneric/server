const chai = require("chai");
const chaiHttp = require("chai-http");
chai.should();
chai.use(chaiHttp);
const app = require("../app");
const ParcelPintar = require("../models/ParcelPintar");

describe("parcel CRUD", function() {
	this.timeout(3000);

	after(done => {
		ParcelPintar.deleteMany({})
			.then(() => {
				done();
			})
			.catch(err => {
				console.log(err);
			});
	});

	describe("POST /parcels", () => {
		it("should return 201 response", done => {
			chai.request(app)
				.post("/parcels")
				.send()
				.end((err, response) => {
					response.status.should.equal(201);
					response.body.should.have.property("gps");
					response.body.should.have.property("gyro");
					done();
				});
		});
	});

	let tempPPId = "";

	describe("GET /parcels", () => {
		it("should list all parcels", done => {
			chai.request(app)
				.get("/parcels")
				.end((err, response) => {
					tempPPId = response.body[0]._id;
					response.status.should.equal(200);
					response.body.should.be.an("array");
					done();
				});
		});
	});
	describe("GET /parcels/:id", () => {
		it("should get the right parcel by id", done => {
			chai.request(app)
				.get(`/parcels/${tempPPId}`)
				.end((err, response) => {
					response.status.should.equal(200);
					response.body._id.should.equal(tempPPId);
					response.body.should.be.an("object");
					response.body.should.have.property("gyro");
					response.body.should.have.property("gps");
					done();
				});
		});
		it("should get error if id invalid", done => {
			chai.request(app)
				.get(`/parcels/${911}`)
				.end((err, response) => {
					response.status.should.equal(400);
					response.body.should.have.property("error");
					done();
				});
		});
		it("should get not found", done => {
			chai.request(app)
				.get(`/parcels/${tempPPId.slice(1) + "1"}`)
				.end((err, response) => {
					response.status.should.equal(404);
					response.body.should.have.property("error");
					done();
				});
		});
	});
	describe("PATCH /parcels/:id", () => {
		it("should return updated GPS", done => {
			let updatedParcel = {
				long: 123,
				lat: 12,
				threshold: true
			};

			chai.request(app)
				.patch(`/parcels/${tempPPId}`)
				.send(updatedParcel)
				.end((err, response) => {
					response.status.should.equal(200);
					response.body.should.be.an("object");
					response.body.gyro.threshold.should.equal(true);
					response.body.gps.location.long.should.equal(
						updatedParcel.long
					);
					response.body.gps.location.lat.should.equal(
						updatedParcel.lat
					);
					done();
				});
		});

		it("should return error 400 if object is invalid", done => {
			chai.request(app)
				.patch(`/parcels/${tempPPId}`)
				.send({ gyro: "a" })
				.end((err, response) => {
					response.status.should.equal(400);
					response.body.should.have.property("error");
					done();
				});
		});

		it("should return 400 if the parcel ID is invalid", done => {
			chai.request(app)
				.patch(`/parcels/${tempPPId.slice(1) + "a"}`)
				.send({ long: "a", lat: "meh", threshold: false })
				.end((err, response) => {
					response.status.should.equal(400);
					response.body.should.have.property("error");
					done();
				});
		});
	});
	describe("DELETE /gps/:id", () => {
		it("should return deleted GPS", done => {
			chai.request(app)
				.delete(`/parcels/${tempPPId}`)
				.end((err, response) => {
					response.status.should.equal(200);
					response.body.should.be.an("object");
					done();
				});
		});

		it("should return error 400 if id is invalid", done => {
			chai.request(app)
				.delete(`/parcels/${911}`)
				.end((err, response) => {
					response.status.should.equal(400);
					response.body.should.have.property("error");
					done();
				});
		});
	});
});
