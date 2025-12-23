import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { searchAddressPredictions, getPlaceDetails, PlacePrediction, GeocodeResult, loadGoogleMapsScript } from '../../services/googleMapsService';
import { useDebounce } from '../../lib/hooks';

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string) => void;
    onSelect?: (result: GeocodeResult) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    apiKey?: string;
    locationBias?: { lat: number, lng: number };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
    value,
    onChange,
    onSelect,
    placeholder = 'Digite o endereço...',
    className = '',
    disabled = false,
    required = false,
    apiKey,
    locationBias
}) => {
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(!!window.google?.maps);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedValue = useDebounce(value, 500);

    // Load script if apiKey is provided and script is not loaded
    useEffect(() => {
        if (apiKey && !window.google?.maps) {
            loadGoogleMapsScript(apiKey)
                .then(() => setIsLoaded(true))
                .catch(err => console.error('Failed to load Google Maps:', err));
        }
    }, [apiKey]);

    // Search for predictions when debounced value changes
    useEffect(() => {
        const search = async () => {
            if (!isLoaded || debouncedValue.length < 3) {
                setPredictions([]);
                return;
            }

            setIsSearching(true);
            try {
                const results = await searchAddressPredictions(debouncedValue, locationBias);
                setPredictions(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error('Address search error:', error);
                setPredictions([]);
            } finally {
                setIsSearching(false);
            }
        };

        search();
    }, [debouncedValue, isLoaded, locationBias]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (prediction: PlacePrediction) => {
        // Update input immediately with selected text
        onChange(prediction.description);
        setIsOpen(false);
        setPredictions([]);

        // Get full place details with coordinates
        if (onSelect) {
            try {
                const details = await getPlaceDetails(prediction.placeId);
                if (details) {
                    onSelect(details);
                }
            } catch (error) {
                console.error('Error getting place details:', error);
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <Navigation
                    size={16}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${isSearching ? 'text-summo-primary animate-pulse' : 'text-gray-400'
                        }`}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => predictions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled || (!isLoaded && !!apiKey)}
                    required={required}
                    className={`w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none text-gray-800 focus:ring-2 focus:ring-summo-primary transition ${className}`}
                    autoComplete="off"
                />
                {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                    </div>
                )}
                {!isLoaded && apiKey && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                        <Loader2 size={14} className="animate-spin text-gray-400" />
                    </div>
                )}
            </div>

            {/* Predictions Dropdown */}
            {isOpen && predictions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-xl border border-gray-100 mt-1 max-h-64 overflow-y-auto z-[100] animate-fade-in">
                    {predictions.map((prediction, index) => (
                        <div
                            key={prediction.placeId}
                            onClick={() => handleSelect(prediction)}
                            className={`p-3 text-xs border-b border-gray-50 last:border-0 hover:bg-blue-50 cursor-pointer flex items-start gap-2 transition ${index === 0 ? 'rounded-t-xl' : ''
                                } ${index === predictions.length - 1 ? 'rounded-b-xl' : ''}`}
                        >
                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 truncate">{prediction.mainText}</p>
                                <p className="text-gray-500 truncate text-[10px] mt-0.5">
                                    {prediction.secondaryText}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
