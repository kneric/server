const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema(
	{
		status: {
			type: Schema.Types.String,
			enum: ["Pickup", "Ongoing", "Completed", "Delayed", "Cancelled"],
			required: true,
			default: "Pickup"
		}, // delayed, arrived, etc.
		sender: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		receiver: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		pickup: {
			long: { type: Schema.Types.Number, required: true },
			lat: { type: Schema.Types.Number, required: true }
		},
		destination: {
			long: { type: Schema.Types.Number, required: true },
			lat: { type: Schema.Types.Number, required: true }
		},
		notes: {
			type: String
		}, // other things that might be a concern that related to the deliver,
		parcel: {
			type: Schema.Types.ObjectId,
			ref: "ParcelPintar",
			required: true,
			default: "5ba9e60dc819600005b5b48e"
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Order", orderSchema);
