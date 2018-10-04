require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const logger = require("morgan");
const indexrouter = require("./routes");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.NODE_ENV) {
	process.env.NODE_ENV = "development";
}

let DBurl = {
	test: `mongodb://${process.env.MONGODB_TEST_USER}:${
		process.env.MONGODB_TEST_PASS
	}@${process.env.MONGODB_TEST_HOST}:${
		process.env.MONGODB_TEST_PORT
	}/parcelpintar_test`,
	development: "mongodb://localhost:27017/parcelpintar_test",
	production: process.env.MONGODB_ATLAS
};

mongoose.set("useCreateIndex", true);

mongoose.connect(
	DBurl[process.env.NODE_ENV],
	{ useNewUrlParser: true }
);

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
	console.log(`MongoDB Connected on ${process.env.NODE_ENV} database`);
});

app.use("/", indexrouter);

app.use(function(req, res, next) {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500).json({
		message: err.message,
		error: err
	});
});

app.listen(process.env.PORT || 3000, () => {
	console.log("Express connected!");
});

module.exports = app;
