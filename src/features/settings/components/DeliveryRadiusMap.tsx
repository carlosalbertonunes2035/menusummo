import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Loader2, MapPin } from 'lucide-react';
import { loadGoogleMapsScript, geocodeAddress } from '../../../services/googleMapsService';

interface DeliveryRadiusMapProps {
    storeAddress: string;
    radiusKm: number;
    onRadiusChange: (radius: number) => void;
    apiKey: string;
    initialLocation?: { lat: number; lng: number };
}

const DeliveryRadiusMap: React.FC<DeliveryRadiusMapProps> = ({
    storeAddress,
    radiusKm,
    onRadiusChange,
    apiKey,
    initialLocation,
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [circle, setCircle] = useState<google.maps.Circle | null>(null);
    const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        const initMap = async () => {
            if (!apiKey) {
                setError('API Key do Google Maps não configurada');
                setIsLoading(false);
                return;
            }

            try {
                // Load Google Maps script
                await loadGoogleMapsScript(apiKey);

                let center = initialLocation;

                if (!center) {
                    // Geocode store address
                    const geocoded = await geocodeAddress(storeAddress);
                    if (!geocoded) {
                        setError('Não foi possível geocodificar o endereço da loja');
                        setIsLoading(false);
                        return;
                    }
                    center = { lat: geocoded.lat, lng: geocoded.lng };
                }

                // Create map
                if (mapRef.current) {
                    const newMap = new google.maps.Map(mapRef.current, {
                        center,
                        zoom: 13,
                        mapTypeControl: true,
                        streetViewControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        mapId: 'DEMO_MAP_ID', // Requisito para AdvancedMarkerElement
                        styles: [
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'off' }],
                            },
                        ],
                    });

                    // Add store marker
                    const pinElement = new google.maps.marker.PinElement({
                        background: '#3B82F6',
                        borderColor: '#FFFFFF',
                        glyphColor: '#FFFFFF',
                        scale: 1.2
                    });

                    const newMarker = new google.maps.marker.AdvancedMarkerElement({
                        position: center,
                        map: newMap,
                        title: 'Sua Loja',
                        content: pinElement.element
                    });

                    // Add delivery radius circle
                    const newCircle = new google.maps.Circle({
                        map: newMap,
                        center,
                        radius: radiusKm * 1000, // Convert km to meters
                        fillColor: '#EF4444',
                        fillOpacity: 0.15,
                        strokeColor: '#EF4444',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        editable: false,
                        draggable: false,
                    });

                    setMap(newMap);
                    setMarker(newMarker);
                    setCircle(newCircle);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Map initialization error:', err);
                setError('Erro ao carregar o mapa');
                setIsLoading(false);
            }
        };

        initMap();
    }, [apiKey, storeAddress]);

    // Update circle radius when radiusKm changes
    useEffect(() => {
        if (circle) {
            circle.setRadius(radiusKm * 1000);
        }
    }, [radiusKm, circle]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 text-sm font-bold">{error}</p>
                <p className="text-red-500 text-xs mt-1">
                    Verifique se o endereço da loja está correto e se a API Key está configurada.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div
                className={`relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-sm ${isFullscreen ? 'fixed inset-0 z-[999] rounded-none' : ''
                    }`}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="text-center">
                            <Loader2 size={32} className="animate-spin text-summo-primary mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-bold">Carregando mapa...</p>
                        </div>
                    </div>
                )}

                <div
                    ref={mapRef}
                    className={`w-full ${isFullscreen ? 'h-screen' : 'h-[400px]'}`}
                />

                {/* Fullscreen Toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="absolute top-3 right-3 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition z-20"
                    title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                {/* Map Legend */}
                {!isLoading && (
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md z-20">
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                            <span className="font-bold text-gray-700">Sua Loja</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/30 border-2 border-red-500"></div>
                            <span className="font-bold text-gray-700">Área de Entrega</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Radius Slider */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MapPin size={16} className="text-summo-primary" />
                        Raio Máximo de Entrega
                    </label>
                    <span className="text-2xl font-bold text-summo-primary">{radiusKm} km</span>
                </div>

                <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={radiusKm}
                    onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                        background: `linear-gradient(to right, #A95BFF 0%, #A95BFF ${((radiusKm - 1) / 19) * 100}%, #E5E7EB ${((radiusKm - 1) / 19) * 100}%, #E5E7EB 100%)`,
                    }}
                />

                <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>1 km</span>
                    <span>20 km</span>
                </div>
            </div>
        </div>
    );
};

export default DeliveryRadiusMap;
