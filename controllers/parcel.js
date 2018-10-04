const Parcel = require("../models/ParcelPintar");
const parcelFirebaseController = require("./parcelFirebaseController");

class ParcelController {
	static create(req, res) {
		Parcel.create({ gryo: {}, gps: {} }).then(newParcel => {
			parcelFirebaseController.createNewParcel(newParcel._id);
			res.status(201).json(newParcel);
		});
	}

	static getParcelById(req, res) {
		let parcelId = req.params.id;

		Parcel.findById(parcelId)
			.then(parcelFound => {
				if (parcelFound) {
					res.status(200).json(parcelFound);
				} else {
					res.status(404).json({
						error: "Parcel not found"
					});
				}
			})
			.then(data => {
				res.status(200).json(data);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}

	static getAllParcels(req, res) {
		Parcel.find({}).then(parcels => {
			res.status(200).json(parcels);
		});
	}

	static updateParcel(req, res) {
		let parcelId = req.params.id;
		let { long, lat, threshold } = req.body;

		if (long && lat && threshold) {
			Parcel.findByIdAndUpdate(
				parcelId,
				{
					$set: {
						gyro: { threshold },
						gps: {
							location: { long, lat }
						}
					}
				},
				{ new: true }
			)
				.then(updatedParcel => {
					parcelFirebaseController.patchParcelById(
						updatedParcel._id,
						{
							lat: updatedParcel.gps.location.lat,
							long: updatedParcel.gps.location.long,
							threshold: updatedParcel.gyro.threshold
						}
					);
					res.status(200).json(updatedParcel);
				})
				.catch(err => {
					res.status(400).json({
						error: err.message
					});
				});
		} else {
			res.status(400).json({
				error: "invalid input"
			});
		}
	}

	static remove(req, res) {
		let parcelId = req.params.id;
		Parcel.findByIdAndRemove(parcelId)
			.then(removedParcel => {
				parcelFirebaseController.deleteParcelById(parcelId);
				res.status(200).json(removedParcel);
			})
			.catch(err => {
				res.status(400).json({
					error: err.message
				});
			});
	}
}

module.exports = ParcelController;
