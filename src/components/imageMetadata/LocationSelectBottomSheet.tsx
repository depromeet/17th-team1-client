"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/assets/icons";
import { SearchInput } from "@/components/common/Input";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import { cn } from "@/utils/cn";
import { BaseInputBottomSheet } from "./BaseInputBottomSheet";

export type LocationSelection = {
  placeId?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

type LocationSelectBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (location: LocationSelection) => void;
  initialLocation?: LocationSelection | null;
};

export const LocationSelectBottomSheet = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}: LocationSelectBottomSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection | null>(null);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasTyped, setHasTyped] = useState(false);

  const {
    isReady,
    isLoading,
    load,
    error: scriptError,
  } = useGoogleMapsScript({
    language: "ko",
    region: "KR",
  });

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const placesContainerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(false);

  const isInputDisabled = useMemo(() => !isReady || isLoading || !!scriptError, [isReady, isLoading, scriptError]);

  const resetState = useCallback(() => {
    setSearchQuery("");
    setPredictions([]);
    setSelectedLocation(null);
    setActivePlaceId(null);
    setErrorMessage(null);
    setHasTyped(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      load();
    }
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen || !isReady) return;

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }

    if (!placesServiceRef.current) {
      const container = placesContainerRef.current ?? document.createElement("div");
      if (!placesContainerRef.current) {
        container.style.display = "none";
        document.body.appendChild(container);
        placesContainerRef.current = container;
      }
      placesServiceRef.current = new window.google.maps.places.PlacesService(container);
    }
  }, [isOpen, isReady]);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      if (initialLocation) {
        setSelectedLocation(initialLocation);
        setActivePlaceId(initialLocation.placeId ?? null);
        setSearchQuery(initialLocation.name || initialLocation.address || "");
      } else {
        resetState();
      }
    }
    wasOpenRef.current = isOpen;
  }, [initialLocation, isOpen, resetState]);

  useEffect(() => {
    if (!isOpen || !isReady) return;

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setPredictions([]);
      setIsSearching(false);
      setErrorMessage(null);
      setHasTyped(false);
      return;
    }

    setHasTyped(true);
    setIsSearching(true);

    const timeoutId = window.setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: trimmed,
          language: "ko",
          region: "KR",
        },
        (results, status) => {
          setIsSearching(false);
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results.slice(0, 5));
            setErrorMessage(null);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setPredictions([]);
            setErrorMessage(null);
          } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
            setPredictions([]);
            setErrorMessage("잠시 후 다시 시도해주세요. (쿼리 한도 초과)");
          } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            setPredictions([]);
            setErrorMessage("Google Maps API 요청이 거부되었습니다. API 키를 확인해주세요.");
          } else if (status === window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
            setPredictions([]);
            setErrorMessage("잘못된 검색 요청입니다.");
          } else if (status === window.google.maps.places.PlacesServiceStatus.NOT_FOUND) {
            setPredictions([]);
            setErrorMessage("검색 결과를 찾을 수 없습니다.");
          } else {
            setPredictions([]);
            setErrorMessage("장소를 검색하는 중 문제가 발생했습니다.");
          }
        },
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, isReady, searchQuery]);

  useEffect(() => {
    return () => {
      if (placesContainerRef.current) {
        document.body.removeChild(placesContainerRef.current);
        placesContainerRef.current = null;
      }
    };
  }, []);

  const handlePredictionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!prediction.place_id || !placesServiceRef.current) return;

    setActivePlaceId(prediction.place_id);
    setIsFetchingDetails(true);
    setErrorMessage(null);

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: prediction.place_id,
      fields: ["name", "formatted_address", "geometry"],
      language: "ko",
      region: "KR",
    };

    placesServiceRef.current.getDetails(request, (details, status) => {
      setIsFetchingDetails(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && details?.geometry?.location) {
        const lat = details.geometry.location.lat();
        const lng = details.geometry.location.lng();
        const name =
          details.name || prediction.structured_formatting?.main_text || prediction.description || "선택한 장소";
        const formattedAddress =
          details.formatted_address ||
          prediction.structured_formatting?.secondary_text ||
          prediction.description ||
          name;

        const location: LocationSelection = {
          placeId: prediction.place_id,
          name,
          address: formattedAddress,
          latitude: lat,
          longitude: lng,
        };

        setSelectedLocation(location);
        setActivePlaceId(location.placeId ?? null);
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        setActivePlaceId(null);
        setErrorMessage("선택한 장소의 상세 정보를 찾을 수 없습니다.");
      } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
        setActivePlaceId(null);
        setErrorMessage("잠시 후 다시 시도해주세요. (쿼리 한도 초과)");
      } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        setActivePlaceId(null);
        setErrorMessage("Google Maps API 요청이 거부되었습니다. API 키를 확인해주세요.");
      } else {
        setActivePlaceId(null);
        setErrorMessage("장소 정보를 불러오지 못했습니다.");
      }
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setSelectedLocation(null);
    setActivePlaceId(null);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && predictions.length > 0) {
      event.preventDefault();
      handlePredictionSelect(predictions[0]);
    }
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;
    onConfirm?.(selectedLocation);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const renderStatusMessage = () => {
    if (scriptError) {
      return scriptError.message;
    }
    if (isLoading) {
      return "지도 서비스를 불러오는 중입니다...";
    }
    if (!isReady) {
      return "Google Maps 서비스를 초기화하는 중입니다...";
    }
    return null;
  };

  const statusMessage = renderStatusMessage();

  return (
    <BaseInputBottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="위치 추가"
      isValid={Boolean(selectedLocation)}
    >
      <div className="flex flex-col h-full min-h-0">
        <div className="relative shrink-0">
          <SearchIcon
            width={20}
            height={20}
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
              isFocused ? "text-white" : "text-gray-400"
            }`}
          />
          <SearchInput
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleInputKeyDown}
            placeholder="장소를 검색해주세요."
            disabled={isInputDisabled}
            backgroundColor="#1B293E"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide mt-6">
          {statusMessage && (
            <div className="flex flex-col items-center justify-center text-sm text-text-thirdly gap-2">
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              <span>{statusMessage}</span>
            </div>
          )}

          {!statusMessage && (
            <>
              {isSearching && (
                <div className="flex items-center gap-2 text-sm text-text-thirdly">
                  <Loader2 className="animate-spin" size={16} />
                  <span>검색 중...</span>
                </div>
              )}

              {!isSearching && predictions.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {predictions.map((prediction) => {
                    const isSelected = prediction.place_id === (activePlaceId ?? selectedLocation?.placeId ?? null);
                    const mainText = prediction.structured_formatting?.main_text || prediction.description || "";
                    const secondaryText =
                      prediction.structured_formatting?.secondary_text || prediction.description || "상세 정보 없음";
                    return (
                      <li key={prediction.place_id}>
                        <button
                          type="button"
                          onClick={() => handlePredictionSelect(prediction)}
                          className={cn(
                            "w-full rounded-2xl border text-left transition-colors cursor-pointer flex flex-col items-start gap-1 px-5 py-[15px]",
                            isSelected
                              ? "border-[#00D9FF] bg-transparent hover:border-[#00D9FF]"
                              : "border-[#243246] bg-transparent hover:border-[#36506C] hover:bg-[#1C2B43]",
                          )}
                        >
                          <div className="text-base font-bold text-white truncate w-full">{mainText}</div>
                          <div className="text-sm text-text-secondary font-medium truncate w-full">{secondaryText}</div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!isSearching && hasTyped && predictions.length === 0 && !errorMessage && (
                <div className="text-sm text-text-thirdly">검색 결과가 없습니다.</div>
              )}

              {errorMessage && (
                <div className="text-sm text-red-400" role="alert">
                  {errorMessage}
                </div>
              )}

              {isFetchingDetails && (
                <div className="flex items-center gap-2 text-sm text-text-thirdly">
                  <Loader2 className="animate-spin" size={16} />
                  <span>장소 정보를 불러오는 중...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </BaseInputBottomSheet>
  );
};
