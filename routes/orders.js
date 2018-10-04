const router = require("express").Router();
const Order = require("../controllers/order");
const AuthMiddleware = require("../middlewares/authMiddleware");

router
	.route("/")
	.get(Order.getAllOrders)
	.post(Order.create);

router
	.route("/:id")
	.get(Order.getOrderById)
	.delete(AuthMiddleware.checkifAdmin, Order.remove)
	.patch(Order.updateOrder);

router.get("/me/receive", Order.getReceiveOrder);

router.get("/me/send", Order.getSendOrder);

module.exports = router;
