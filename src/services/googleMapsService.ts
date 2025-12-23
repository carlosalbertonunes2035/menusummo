/**
 * Google Maps & Places API Service
 * Handles address autocomplete, geocoding, and distance calculations
 */

export interface PlacePrediction {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

export interface GeocodeResult {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
}

// Session token for cost optimization (groups multiple autocomplete requests into one session)
let currentSessionToken: google.maps.places.AutocompleteSessionToken | null = null;

/**
 * Load Google Maps JavaScript API dynamically
 */
export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.google?.maps) {
            resolve();
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', reject);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&language=pt-BR&region=BR&loading=async`;
        script.async = true;
        script.defer = true;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));

        document.head.appendChild(script);
    });
};

/**
 * Get or create a session token for autocomplete requests
 */
const getSessionToken = (): google.maps.places.AutocompleteSessionToken => {
    if (!currentSessionToken) {
        currentSessionToken = new google.maps.places.AutocompleteSessionToken();
    }
    return currentSessionToken;
};

/**
 * Reset session token (call after user selects a place)
 */
const resetSessionToken = (): void => {
    currentSessionToken = null;
};

/**
 * Search for address predictions using Google Places Autocomplete
 */
export const searchAddressPredictions = async (
    input: string,
    locationBias?: { lat: number, lng: number },
    radius: number = 50000, // Default 50km bias
    countryCode: string = 'br'
): Promise<PlacePrediction[]> => {
    if (!input || input.length < 3) return [];

    if (!window.google?.maps?.places) {
        console.error('Google Maps Places API not loaded');
        return [];
    }

    return new Promise((resolve, reject) => {
        const service = new google.maps.places.AutocompleteService();

        const request: google.maps.places.AutocompletionRequest = {
            input,
            sessionToken: getSessionToken(),
            componentRestrictions: { country: countryCode },
            types: ['address'],
        };

        if (locationBias) {
            request.locationBias = new google.maps.LatLng(locationBias.lat, locationBias.lng);
            request.radius = radius;
        }

        service.getPlacePredictions(
            request,
            (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    const results: PlacePrediction[] = predictions.map((prediction) => ({
                        placeId: prediction.place_id,
                        description: prediction.description,
                        mainText: prediction.structured_formatting.main_text,
                        secondaryText: prediction.structured_formatting.secondary_text || '',
                    }));
                    resolve(results);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    console.error('Places Autocomplete error:', status);
                    resolve([]);
                }
            }
        );
    });
};

/**
 * Get place details and geocode from place ID
 */
export const getPlaceDetails = async (placeId: string): Promise<GeocodeResult | null> => {
    if (!window.google?.maps?.places) {
        console.error('Google Maps Places API not loaded');
        return null;
    }

    return new Promise((resolve) => {
        // Create a temporary div for PlacesService (required by API)
        const div = document.createElement('div');
        const service = new google.maps.places.PlacesService(div);

        service.getDetails(
            {
                placeId,
                fields: ['formatted_address', 'geometry', 'place_id'],
                sessionToken: getSessionToken(),
            },
            (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
                // Reset session token after getting details (completes the session)
                resetSessionToken();

                if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
                    resolve({
                        address: place.formatted_address || '',
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        placeId: place.place_id || placeId,
                    });
                } else {
                    console.error('Place Details error:', status);
                    resolve(null);
                }
            }
        );
    });
};

/**
 * Geocode an address string to coordinates
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
    if (!window.google?.maps) {
        console.error('Google Maps API not loaded');
        return null;
    }

    return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address, region: 'BR' }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus | string) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const result = results[0];
                resolve({
                    address: result.formatted_address,
                    lat: result.geometry.location.lat(),
                    lng: result.geometry.location.lng(),
                    placeId: result.place_id,
                });
            } else {
                console.error('Geocoding error:', status);
                resolve(null);
            }
        });
    });
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number => {
    if (!window.google?.maps?.geometry) {
        // Fallback to Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const from = new google.maps.LatLng(lat1, lng1);
    const to = new google.maps.LatLng(lat2, lng2);
    return google.maps.geometry.spherical.computeDistanceBetween(from, to) / 1000; // Convert to km
};

/**
 * Check if an address is within delivery radius
 */
export const isWithinDeliveryRadius = (
    storeLat: number,
    storeLng: number,
    customerLat: number,
    customerLng: number,
    radiusKm: number
): boolean => {
    const distance = calculateDistance(storeLat, storeLng, customerLat, customerLng);
    return distance <= radiusKm;
};
