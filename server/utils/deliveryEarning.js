
const calculateDeliveryEarning = (distanceKm) => {
    if (
        !Number.isFinite(distanceKm) ||
        distanceKm <= 0
    ) {
        throw new Error("Invalid delivery distance.");
    }

    let totalEarning = 0;

    if (distanceKm <= 2) {
        totalEarning = 12;
    } else if (distanceKm <= 4) {
        totalEarning = 22;
    } else if (distanceKm <= 6) {
        totalEarning = 32;
    } else {
        totalEarning = 40;
    }

    return {
        distanceKm,
        totalEarning,
    };
};

export default calculateDeliveryEarning;
