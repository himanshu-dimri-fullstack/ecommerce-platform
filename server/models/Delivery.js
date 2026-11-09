
import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
    {
        // ORDER REFERENCE
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },

        // DELIVERY PARTNER REFERENCE
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeliveryPartner",
            default: null,
            index: true,
        },

        // STORE REFERENCE
        store: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true
        },

        // SCHEDULED PICKUP TIME
        pickupTime: {
            type: Date,
            default: null
        },

        // ACTUAL PICKUP TIME
        pickedUpAt: {
            type: Date,
            default: null
        },

        // OUT FOR DELIVERY TIME
        outForDeliveryAt: {
            type: Date,
            default: null
        },

        // DELIVERY COMPLETION TIME
        deliveredAt: {
            type: Date,
            default: null
        },

        // DELIVERY STATUS
        deliveryStatus: {
            type: String,
            enum: [
                "assigned",
                "delivered",
                "failed",
                "cancelled"
            ],
            default: "assigned",
            index: true
        },

        // DELIVERY OTP
        deliveryOtp: {
            type: String,
            default: null,
            select: false
        },

        // CUSTOMER DELIVERY ADDRESS
        deliveryAddress: {
            type: String,
            required: true,
            trim: true
        },

        // CUSTOMER LOCATION (GEOJSON)
        customerLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true,
                validate: {
                    validator: function (coordinates) {
                        return (
                            Array.isArray(coordinates) &&
                            coordinates.length === 2 &&
                            coordinates.every(Number.isFinite) &&
                            coordinates[0] >= -180 &&
                            coordinates[0] <= 180 &&
                            coordinates[1] >= -90 &&
                            coordinates[1] <= 90
                        );
                    },
                    message: "Invalid customer location coordinates."
                }
            }
        },

        // DELIVERY NOTES
        notes: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// GEO-SPATIAL INDEX
deliverySchema.index({
    customerLocation: "2dsphere"
});

// COMPOUND INDEXES
deliverySchema.index({
    deliveryPartner: 1,
    deliveryStatus: 1
});

deliverySchema.index({
    store: 1,
    deliveryStatus: 1
});

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
