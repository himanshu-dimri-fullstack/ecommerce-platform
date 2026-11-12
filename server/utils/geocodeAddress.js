
const PHOTON_API = "https://photon.komoot.io/api/";

export const geocodeAddress = async ({
    houseNumber,
    street,
    landmark,
    city,
    state,
    country,
    pincode,
}) => {
    const clean = (value) => String(value || "").trim();

    const house = clean(houseNumber);
    const streetName = clean(street);
    const landmarkName = clean(landmark);
    const cityName = clean(city);
    const stateName = clean(state);
    const countryName = clean(country);
    const postalCode = clean(pincode);

    if (!streetName || !cityName || !stateName || !countryName) {
        throw new Error("Please provide a complete address.");
    }

    // CREATE FALLBACK SEARCH QUERIES
    const queries = [
        // 1. Complete address
        [
            house,
            streetName,
            landmarkName,
            cityName,
            stateName,
            postalCode,
            countryName,
        ],

        // 2. Without house number
        [
            streetName,
            landmarkName,
            cityName,
            stateName,
            postalCode,
            countryName,
        ],

        // 3. Landmark-based search
        [
            landmarkName,
            streetName,
            cityName,
            stateName,
            countryName,
        ],

        // 4. Street + city + pincode
        [
            streetName,
            cityName,
            stateName,
            postalCode,
            countryName,
        ],

        // 5. Landmark + city + pincode
        [
            landmarkName,
            cityName,
            stateName,
            postalCode,
            countryName,
        ],

        // 6. Street + city
        [
            streetName,
            cityName,
            stateName,
            countryName,
        ],

        // 7. Last fallback: city + state + pincode
        [
            cityName,
            stateName,
            postalCode,
            countryName,
        ],
    ];

    // REMOVE EMPTY AND DUPLICATE QUERIES
    const uniqueQueries = [
        ...new Set(
            queries
                .map((parts) =>
                    parts
                        .filter(Boolean)
                        .join(", ")
                )
                .filter(Boolean)
        ),
    ];

    const requestedCountry = countryName.toLowerCase();
    const requestedPincode = postalCode;

    let bestResult = null;
    let lastError = null;

    // TRY EACH QUERY UNTIL A VALID LOCATION IS FOUND
    for (let index = 0; index < uniqueQueries.length; index++) {
        const query = uniqueQueries[index];

        try {
            const url = new URL(PHOTON_API);

            url.searchParams.set("q", query);
            url.searchParams.set("limit", "5");
            url.searchParams.set("lang", "en");

            console.log(
                `Geocoding attempt ${index + 1}/${uniqueQueries.length}:`,
                query
            );

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "User-Agent": "QuickKart/1.0",
                },
                signal: AbortSignal.timeout(12000),
            });

            if (!response.ok) {
                lastError = new Error(
                    `Photon returned status ${response.status}`
                );
                continue;
            }

            const data = await response.json();

            if (!data.features?.length) {
                continue;
            }

            // VALIDATE AND SCORE RESULTS
            const results = data.features
                .map((feature) => {
                    const properties = feature.properties || {};
                    const coordinates = feature.geometry?.coordinates;

                    if (
                        !Array.isArray(coordinates) ||
                        coordinates.length !== 2
                    ) {
                        return null;
                    }

                    const [longitude, latitude] = coordinates;

                    if (
                        !Number.isFinite(longitude) ||
                        !Number.isFinite(latitude) ||
                        (longitude === 0 && latitude === 0)
                    ) {
                        return null;
                    }

                    const resultCountry = String(
                        properties.country || ""
                    ).toLowerCase();

                    const countryCode = String(
                        properties.countrycode || ""
                    ).toLowerCase();

                    // DO NOT ACCEPT ANOTHER COUNTRY
                    if (
                        requestedCountry.includes("india") &&
                        countryCode !== "in" &&
                        !resultCountry.includes("india")
                    ) {
                        return null;
                    }

                    let score = 0;

                    const resultPincode = String(
                        properties.postcode || ""
                    ).trim();

                    const resultCity = String(
                        properties.city ||
                        properties.name ||
                        properties.locality ||
                        ""
                    ).toLowerCase();

                    const resultState = String(
                        properties.state || ""
                    ).toLowerCase();

                    const resultStreet = String(
                        properties.street || ""
                    ).toLowerCase();

                    const resultName = String(
                        properties.name || ""
                    ).toLowerCase();

                    // PINCODE MATCHING
                    if (requestedPincode && resultPincode) {
                        if (resultPincode === requestedPincode) {
                            score += 20;
                        } else {
                            score -= 5;
                        }
                    }

                    // CITY MATCHING
                    if (
                        cityName &&
                        (
                            resultCity.includes(cityName.toLowerCase()) ||
                            cityName.toLowerCase().includes(resultCity)
                        )
                    ) {
                        score += 10;
                    }

                    // STATE MATCHING
                    if (
                        stateName &&
                        resultState.includes(stateName.toLowerCase())
                    ) {
                        score += 10;
                    }

                    // STREET MATCHING
                    if (
                        streetName &&
                        (
                            resultStreet.includes(streetName.toLowerCase()) ||
                            resultName.includes(streetName.toLowerCase())
                        )
                    ) {
                        score += 8;
                    }

                    // LANDMARK MATCHING
                    if (
                        landmarkName &&
                        (
                            resultName.includes(landmarkName.toLowerCase()) ||
                            resultStreet.includes(landmarkName.toLowerCase())
                        )
                    ) {
                        score += 8;
                    }

                    // HOUSE NUMBER MATCHING
                    if (
                        house &&
                        String(properties.housenumber || "")
                            .toLowerCase() === house.toLowerCase()
                    ) {
                        score += 5;
                    }

                    return {
                        score,
                        coordinates,
                        query,
                    };
                })
                .filter(Boolean)
                .sort((a, b) => b.score - a.score);

            if (!results.length) {
                continue;
            }

            const currentBest = results[0];

            // KEEP THE BEST MATCH ACROSS ALL FALLBACK QUERIES
            if (
                !bestResult ||
                currentBest.score > bestResult.score
            ) {
                bestResult = currentBest;
            }

            // A GOOD MATCH HAS BEEN FOUND
            if (bestResult.score >= 20) {
                break;
            }
        } catch (error) {
            lastError = error;

            console.error(
                `Geocoding attempt ${index + 1} failed:`,
                error.message
            );

            // CONTINUE TO THE NEXT QUERY
            continue;
        }
    }

    if (!bestResult) {
        if (lastError && !lastError.message?.includes("status")) {
            throw new Error(
                "Location service is temporarily unavailable. Please try again."
            );
        }

        throw new Error(
            "Address location not found. Please check your address details."
        );
    }

    console.log("Geocoding successful:", {
        query: bestResult.query,
        score: bestResult.score,
        coordinates: bestResult.coordinates,
    });

    return {
        type: "Point",
        coordinates: bestResult.coordinates,
    };
};
