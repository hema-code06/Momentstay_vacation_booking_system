const router = require("express").Router();
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const Review = require("../models/Review");
const verifyToken = require("../middleware/auth");

const DAY_MS = 24 * 60 * 60 * 1000;

const paidOf = (booking) =>
    booking.amountPaid ?? (booking.paymentStatus === "paid" ? booking.totalPrice : 0);

const dueOf = (booking) =>
    booking.paymentStatus === "pending" ? Math.max(booking.totalPrice - paidOf(booking), 0) : 0;

const stayStatus = (booking, now) => {
    if (booking.endDate < now) return "completed";
    if (booking.startDate > now) return "upcoming";
    return "ongoing";
};

const average = (items) =>
    items.length
        ? Math.round((items.reduce((sum, item) => sum + item.rating, 0) / items.length) * 10) / 10
        : 0;

router.get("/dashboard", verifyToken, async (req, res) => {
    try {
        const hostId = req.user.id;
        const now = new Date();

        const listings = await Listing.find({ creator: hostId }).sort({ createdAt: -1 });
        const listingIds = listings.map((listing) => listing._id);
        const listingById = new Map(listings.map((listing) => [listing._id.toString(), listing]));

        const [bookingDocs, reviewDocs] = await Promise.all([
            Booking.find({ $or: [{ hostId }, { listingId: { $in: listingIds } }] })
                .populate("customerId", "username email profileImagePath")
                .sort({ startDate: -1 }),
            Review.find({ listingId: { $in: listingIds } })
                .populate("userId", "username profileImagePath")
                .sort({ createdAt: -1 }),
        ]);

        const bookings = bookingDocs
            .filter((booking) => listingById.has(booking.listingId?.toString()))
            .map((booking) => {
                const listing = listingById.get(booking.listingId.toString());
                return {
                    _id: booking._id,
                    guest: booking.customerId
                        ? {
                            _id: booking.customerId._id,
                            username: booking.customerId.username,
                            email: booking.customerId.email,
                            profileImagePath: booking.customerId.profileImagePath,
                        }
                        : null,
                    listing: { _id: listing._id, title: listing.title, city: listing.city },
                    startDate: booking.startDate,
                    endDate: booking.endDate,
                    nights: Math.max(1, Math.round((booking.endDate - booking.startDate) / DAY_MS)),
                    totalPrice: booking.totalPrice,
                    paymentMethod: booking.paymentMethod,
                    paymentStatus: booking.paymentStatus,
                    paymentId: booking.paymentId,
                    paidAt: booking.paidAt,
                    paidAmount: paidOf(booking),
                    dueAmount: dueOf(booking),
                    status: stayStatus(booking, now),
                    createdAt: booking.createdAt,
                };
            });

        const reviews = reviewDocs.map((review) => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            guest: review.userId
                ? {
                    _id: review.userId._id,
                    username: review.userId.username,
                    profileImagePath: review.userId.profileImagePath,
                }
                : null,
            listing: {
                _id: review.listingId,
                title: listingById.get(review.listingId.toString())?.title,
            },
        }));

        const properties = listings.map((listing) => {
            const id = listing._id.toString();
            const ownBookings = bookings.filter((booking) => booking.listing._id.toString() === id);
            const ownReviews = reviewDocs.filter((review) => review.listingId.toString() === id);

            return {
                _id: listing._id,
                title: listing.title,
                category: listing.category,
                type: listing.type,
                city: listing.city,
                province: listing.province,
                country: listing.country,
                price: listing.price,
                photo: listing.listingPhotoPaths[0],
                bookingCount: ownBookings.length,
                upcomingCount: ownBookings.filter((booking) => booking.status === "upcoming").length,
                earnings: ownBookings.reduce((sum, booking) => sum + booking.paidAmount, 0),
                reviewCount: ownReviews.length,
                averageRating: average(ownReviews),
            };
        });

        res.json({
            stats: {
                properties: properties.length,
                totalBookings: bookings.length,
                upcomingBookings: bookings.filter((booking) => booking.status === "upcoming").length,
                ongoingBookings: bookings.filter((booking) => booking.status === "ongoing").length,
                totalEarnings: bookings.reduce((sum, booking) => sum + booking.paidAmount, 0),
                dueAtProperty: bookings.reduce((sum, booking) => sum + booking.dueAmount, 0),
                totalReviews: reviews.length,
                averageRating: average(reviewDocs),
            },
            properties,
            bookings,
            reviews,
        });
    } catch (err) {
        console.error("Host dashboard error:", err);
        res.status(500).json({ message: "Failed to load the host dashboard." });
    }
});

module.exports = router;
