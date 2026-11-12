
const OSRM_BASE_URL =
    process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

/**
 * Validates a GeoJSON Point location.
 * Coordinates format: [longitude, latitude]
 */
const isValidLocation = (location) => {
    if (!location || location.type !== "Point") {
        return false;
    }

    const coordinates = location.coordinates;

    return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every(Number.isFinite) &&
        coordinates[0] >= -180 &&
        coordinates[0] <= 180 &&
        coordinates[1] >= -90 &&
        coordinates[1] <= 90
    );
};

/**
 * Calculates actual road distance between store and customer.
 *
 * @param {Object} storeLocation - Store GeoJSON location
 * @param {Object} customerLocation - Customer GeoJSON location
 */

const calculateRoadDistance = async (storeLocation, customerLocation) => {
    if (!isValidLocation(storeLocation)) {
        throw new Error("Invalid store location. Check store GeoJSON coordinates.");
    }

    if (!isValidLocation(customerLocation)) {
        throw new Error("Invalid customer location. Check customer GeoJSON coordinates.");
    }

    const [storeLng, storeLat] = storeLocation.coordinates;
    const [customerLng, customerLat] = customerLocation.coordinates;

    const coordinates = `${storeLng},${storeLat};${customerLng},${customerLat}`;

    const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?overview=false`;

    console.log("OSRM REQUEST:", url);
    console.log("STORE COORDINATES:", storeLocation.coordinates);
    console.log("CUSTOMER COORDINATES:", customerLocation.coordinates);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(10000)
        });

        const data = await response.json();

        console.log("OSRM RESPONSE:", data);

        if (!response.ok) {
            throw new Error(
                `OSRM ${response.status}: ${data.message || data.code || "Unknown routing error"}`
            );
        }

        if (
            data.code !== "Ok" ||
            !Array.isArray(data.routes) ||
            !data.routes.length
        ) {
            throw new Error(
                data.message || data.code || "No road route found."
            );
        }

        const route = data.routes[0];

        if (
            !Number.isFinite(route.distance) ||
            !Number.isFinite(route.duration) ||
            route.distance < 0 ||
            route.duration < 0
        ) {
            throw new Error("Invalid route distance or duration.");
        }

        return {
            distanceMeters: route.distance,
            distanceKm: Number((route.distance / 1000).toFixed(2)),
            durationSeconds: route.duration,
            durationMinutes: Number((route.duration / 60).toFixed(2))
        };

    } catch (error) {
        if (error.name === "TimeoutError") {
            throw new Error("Road distance service timed out.");
        }

        if (error.name === "AbortError") {
            throw new Error("Road distance request was cancelled.");
        }

        throw new Error(`Unable to calculate road distance: ${error.message}`);
    }
};


export default calculateRoadDistance;
