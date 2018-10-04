const Order = require("../models/Order");

class OrderController {
	static create(req, res) {
		const { receiver, destination, pickup, notes, parcel } = req.body;
		const sender = req.headers.userId;

		Order.create({
			sender,
			receiver,
			pickup,
			destination,
			notes,
			parcel
		})
			.then(newOrder => {
				res.status(201).json(newOrder);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static getOrderById(req, res) {
		let orderId = req.params.id;

		Order.findById(orderId)
			.then(orderFound => {
				if (orderFound) {
					res.status(200).json(orderFound);
				} else {
					res.status(404).json({
						error: "Order not found"
					});
				}
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static getAllOrders(req, res) {
		Order.find({}).then(orders => {
			res.status(200).json(orders);
		});
	}

	static getSendOrder(req, res) {
		let userId = req.headers.userId;

		Order.find({ sender: userId }).then(orders => {
			res.status(200).json(orders);
		});
	}

	static getReceiveOrder(req, res) {
		let userId = req.headers.userId;

		Order.find({ receiver: userId }).then(orders => {
			res.status(200).json(orders);
		});
	}

	static updateOrder(req, res) {
		let orderId = req.params.id;
		let role = req.headers.role;
		let { status } = req.body;
		let request = { _id: orderId, sender: req.headers.userId };

		if (role === "admin") {
			request = { _id: orderId };
		}

		Order.findOneAndUpdate(request, { $set: { status } }, { new: true })
			.then(updatedOrder => {
				console.log("modified ----->>>", updatedOrder);
				res.status(200).json(updatedOrder);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static remove(req, res) {
		let orderId = req.params.id;

		Order.findByIdAndRemove(orderId)
			.then(removedOrder => {
				res.status(200).json(removedOrder);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}
}

module.exports = OrderController;
