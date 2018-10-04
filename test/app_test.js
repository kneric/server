const chaiHTTP = require("chai-http");
const chai = require("chai");
let expect = chai.expect;
chai.use(chaiHTTP);
let app = require("../app");

describe("app.js test", () => {
	it("should return main api response", done => {
		chai.request(app)
			.get("/")
			.then(response => {
				expect(response).to.have.status(200);
				expect(response.text).to.be.equal(
					"Welcome to ParcelPintar API"
				);
				done();
			})
			.catch(err => {
				console.log(err);
			});
	});
	it("should return 404", done => {
		chai.request(app)
			.get("/asdfsd")
			.then(response => {
				expect(response).to.have.status(404);
				expect(response).to.be.have.property("error");
				done();
			})
			.catch(err => {
				console.log(err);
			});
	});
	// it("should return 500", done => {
	// 	chai.request(app)
	// 		.get("/users/asdfasdfasdfasdf")
	// 		.then(response => {
	// 			expect(response).to.have.status(500);
	// 			expect(response).to.be.have.property("error");
	// 			done();
	// 		})
	// 		.catch(err => {
	// 			console.log(err);
	// 		});
	// });
});
