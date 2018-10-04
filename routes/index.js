const router = require("express").Router();
const ordersRouter = require("./orders");
const usersRouter = require("./users");
const parcelsRouter = require("./parcels");
const logsRouter = require("./logs");
const authMiddleware = require("../middlewares/authMiddleware");

router.use("/users", usersRouter);
router.use(
	"/orders",
	authMiddleware.checkifTokenExist,
	authMiddleware.checkifTokenValid,
	ordersRouter
);
router.use("/parcels", parcelsRouter);
router.use("/logs", logsRouter);

router.get("/", (req, res) => {
	res.send("Welcome to ParcelPintar API");
});

module.exports = router;
