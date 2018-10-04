const router = require("express").Router();
const logController = require("../controllers/logController");
router
	.route("/")
	.get(logController.getAll)
	.post(logController.create);

module.exports = router;
