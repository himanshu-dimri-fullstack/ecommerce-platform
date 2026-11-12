
import mongoose from "mongoose";

import DeliveryPayout from "../models/DeliveryPayout.js";
import DeliveryPartner from "../models/DeliveryPartner.js";


// ============================================
// GET ALL DELIVERY PAYOUTS
// ============================================

export const getAllDeliveryPayouts = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
        );

        const search = (req.query.search || "").trim();
        const status = req.query.status || "all";

        const skip = (page - 1) * limit;

        const match = {};

        if (status !== "all") {
            const allowedStatuses = [
                "pending",
                "payable",
                "paid",
                "failed",
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payout status.",
                });
            }

            match.payoutStatus = status;
        }

        // SEARCH ORDER NUMBER, PARTNER NAME, EMAIL OR PAYMENT REFERENCE
        if (search) {
            const regex = new RegExp(
                search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            );

            const matchingPartners = await DeliveryPartner.find()
                .populate({
                    path: "user",
                    match: {
                        $or: [
                            { name: regex },
                            { firstName: regex },
                            { lastName: regex },
                            { email: regex },
                        ],
                    },
                    select: "name firstName lastName email",
                })
                .select("_id user");

            const partnerIds = matchingPartners
                .filter((partner) => partner.user)
                .map((partner) => partner._id);

            const matchingOrders = await mongoose
                .model("Order")
                .find({
                    orderNumber: regex,
                })
                .select("_id");

            const orderIds = matchingOrders.map((order) => order._id);

            match.$or = [
                { paymentReference: regex },
                { order: { $in: orderIds } },
                { deliveryPartner: { $in: partnerIds } },
            ];
        }

        const [payouts, filteredCount] = await Promise.all([
            DeliveryPayout.find(match)
                .populate({
                    path: "order",
                    select: "orderNumber orderStatus paymentMethod paymentStatus totalAmount",
                })
                .populate({
                    path: "deliveryPartner",
                    select: "user vehicleType vehicleNumber totalDeliveries totalEarnings",
                    populate: {
                        path: "user",
                        select: "name firstName lastName email phone",
                    },
                })
                .populate({
                    path: "delivery",
                    select: "deliveryStatus deliveredAt deliveryAddress",
                })
                .populate({
                    path: "store",
                    select: "name code",
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            DeliveryPayout.countDocuments(match),
        ]);

        // SUMMARY IS INDEPENDENT OF SEARCH AND STATUS FILTER
        const summaryResult = await DeliveryPayout.aggregate([
            {
                $group: {
                    _id: "$payoutStatus",
                    count: { $sum: 1 },
                    amount: { $sum: "$totalEarning" },
                },
            },
        ]);

        const summary = {
            totalPayouts: 0,
            pendingAmount: 0,
            payableAmount: 0,
            paidAmount: 0,
            pendingCount: 0,
            payableCount: 0,
            paidCount: 0,
        };

        summaryResult.forEach((item) => {
            summary.totalPayouts += item.count;

            if (item._id === "pending") {
                summary.pendingAmount = item.amount;
                summary.pendingCount = item.count;
            }

            if (item._id === "payable") {
                summary.payableAmount = item.amount;
                summary.payableCount = item.count;
            }

            if (item._id === "paid") {
                summary.paidAmount = item.amount;
                summary.paidCount = item.count;
            }
        });

        return res.status(200).json({
            success: true,
            payouts,
            summary,
            filteredCount,
            totalPages: Math.ceil(filteredCount / limit) || 1,
            currentPage: page,
        });

    } catch (error) {
        console.error("Get delivery payouts error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch delivery payouts.",
        });
    }
};


// ============================================
// SETTLE DELIVERY PAYOUT
// ============================================

export const settleDeliveryPayout = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { id } = req.params;

        const { paymentReference = "", settlementNote = "" } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payout ID.",
            });
        }

        if (
            typeof paymentReference !== "string" ||
            typeof settlementNote !== "string" ||
            paymentReference.length > 100 ||
            settlementNote.length > 500
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid settlement details.",
            });
        }

        let settledPayout;

        await session.withTransaction(async () => {
            const payout = await DeliveryPayout.findOne({
                _id: id,
                payoutStatus: "payable",
            }).session(session);

            if (!payout) {
                throw new Error(
                    "Payout is not payable or has already been settled."
                );
            }

            const partner = await DeliveryPartner.findById(
                payout.deliveryPartner
            ).session(session);

            if (!partner) {
                throw new Error("Delivery partner not found.");
            }

            // UPDATE ONLY IF PAYOUT IS STILL PAYABLE
            const updatedPayout = await DeliveryPayout.findOneAndUpdate(
                {
                    _id: id,
                    payoutStatus: "payable",
                },
                {
                    $set: {
                        payoutStatus: "paid",
                        paidAt: new Date(),
                        paymentReference: paymentReference.trim() || null,
                        settlementNote: settlementNote.trim(),
                    },
                },
                {
                    new: true,
                    runValidators: true,
                    session,
                }
            );

            if (!updatedPayout) {
                throw new Error(
                    "Payout has already been settled."
                );
            }

            // ADD TO PARTNER EARNINGS ONLY ON SUCCESSFUL SETTLEMENT
            const updatedPartner = await DeliveryPartner.findOneAndUpdate(
                { _id: payout.deliveryPartner },
                {
                    $inc: {
                        totalEarnings: payout.totalEarning,
                    },
                },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedPartner) {
                throw new Error("Unable to update partner earnings.");
            }

            settledPayout = updatedPayout;
        });

        return res.status(200).json({
            success: true,
            message: "Delivery payout settled successfully.",
            payout: settledPayout,
        });

    } catch (error) {
        console.error("Settle delivery payout error:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to settle delivery payout.",
        });

    } finally {
        await session.endSession();
    }
};
