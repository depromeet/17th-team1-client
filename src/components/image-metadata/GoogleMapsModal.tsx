"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageMetadata } from "@/types/imageMetadata";

interface GoogleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageMetadata: ImageMetadata | null;
  onLocationUpdate: (lat: number, lng: number, address: string) => void;
}

// global 선언은 실제 window.google API 타입을 참조
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export function GoogleMapsModal({ isOpen, onClose, imageMetadata, onLocationUpdate }: GoogleMapsModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // 위치에서 주소 업데이트하는 함수
  const updateAddressFromLocation = (lat: number, lng: number) => {
    if (!map) return;
    // type은 string 하나만 허용됨. 여러 타입이면 여러 번 호출 필요.
    const service = new window.google.maps.places.PlacesService(map);
    const request: google.maps.places.PlaceSearchRequest = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 100,
      type: "tourist_attraction", // 여러 타입 필요하면 반복 호출
      language: "ko",
    };

    service.nearbySearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination | null,
      ) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const nearestPlace = results[0];
          const detailsRequest: google.maps.places.PlaceDetailsRequest = {
            placeId: nearestPlace.place_id!,
            fields: ["name", "formatted_address"],
            language: "ko",
            region: "kr",
          };

          service.getDetails(
            detailsRequest,
            (details: google.maps.places.PlaceResult | null, detailsStatus: google.maps.places.PlacesServiceStatus) => {
              if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && details && details.name) {
                setCurrentAddress(details.name);
              } else {
                fallbackToGeocoding(lat, lng);
              }
            },
          );
        } else {
          fallbackToGeocoding(lat, lng);
        }
      },
    );
  };

  // 역지오코딩으로 주소 가져오는 함수
  const fallbackToGeocoding = (lat: number, lng: number) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng }, language: "ko", region: "kr" },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          setCurrentAddress(address);
        }
      },
    );
  };

  // 클릭한 위치의 장소 정보 가져오기
  const getPlaceInfoFromLocation = (lat: number, lng: number, mapInstance?: google.maps.Map) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    const currentMap = mapInstance || map;
    if (!currentMap) {
      setTimeout(() => {
        getPlaceInfoFromLocation(lat, lng, mapInstance);
      }, 500);
      return;
    }

    const service = new window.google.maps.places.PlacesService(currentMap);

    // TextSearchRequest에서 fields/region은 불필요, language만 남김
    const coordinateSearch = () => {
      const searchQueries = [
        `${lat},${lng}`,
        `near ${lat},${lng}`,
        `hotel near ${lat},${lng}`,
        `restaurant near ${lat},${lng}`,
        `attraction near ${lat},${lng}`,
      ];

      let searchIndex = 0;
      const tryNextSearch = () => {
        if (searchIndex >= searchQueries.length) {
          nearbySearch();
          return;
        }

        const request: google.maps.places.TextSearchRequest = {
          query: searchQueries[searchIndex],
          language: "ko",
          region: "kr",
        };

        service.textSearch(
          request,
          (
            results: google.maps.places.PlaceResult[] | null,
            status: google.maps.places.PlacesServiceStatus,
            pagination: google.maps.places.PlaceSearchPagination | null,
          ) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
              const place = results[0];
              getPlaceDetails(place.place_id!, place);
            } else {
              searchIndex++;
              tryNextSearch();
            }
          },
        );
      };

      tryNextSearch();
    };

    // 2단계: 근처 장소 검색
    const nearbySearch = () => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new window.google.maps.LatLng(lat, lng),
        radius: 50,
        language: "ko",
      };

      service.nearbySearch(
        request,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus,
          pagination: google.maps.places.PlaceSearchPagination | null,
        ) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            getPlaceDetails(place.place_id!, place);
          } else {
            updateAddressFromLocation(lat, lng);
          }
        },
      );
    };

    // 장소 상세 정보 가져오기
    const getPlaceDetails = (placeId: string, originalPlace: google.maps.places.PlaceResult) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ["name", "formatted_address", "rating", "user_ratings_total", "types", "photos", "url"],
        language: "ko",
        region: "kr",
      };

      service.getDetails(
        request,
        (details: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
            const koreanName = details.name;
            const koreanAddress = details.formatted_address;
            if (koreanName) {
              setSelectedPlace({
                ...originalPlace,
                name: koreanName,
                formatted_address: koreanAddress,
                place_id: originalPlace.place_id,
              });
              setCurrentAddress(koreanName);
            } else {
              setSelectedPlace(originalPlace);
              setCurrentAddress(originalPlace.name || "");
            }
          } else {
            setSelectedPlace(originalPlace);
            setCurrentAddress(originalPlace.name || "");
          }
        },
      );
    };

    coordinateSearch();
  };

  useEffect(() => {
    if (!isOpen) return;

    function waitForGoogleMaps() {
      if (window.google && window.google.maps && window.google.maps.places) {
        initMap();
      } else {
        setTimeout(waitForGoogleMaps, 200);
      }
    }

    waitForGoogleMaps();

    return () => {};
  }, [isOpen]);

  const initMap = () => {
    if (!mapRef.current || !imageMetadata?.location) return;

    const initialLat = imageMetadata.location.latitude;
    const initialLng = imageMetadata.location.longitude;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: initialLat, lng: initialLng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      clickableIcons: true,
      gestureHandling: "greedy",
    });

    const markerInstance = new window.google.maps.Marker({
      position: { lat: initialLat, lng: initialLng },
      map: mapInstance,
      draggable: true,
      title: "사진 촬영 위치",
    });

    markerInstance.addListener("dragend", () => {
      const position = markerInstance.getPosition();
      if (!position) return;
      const lat = position.lat();
      const lng = position.lng();
      getPlaceInfoFromLocation(lat, lng, mapInstance);
    });

    mapInstance.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      markerInstance.setPosition({ lat, lng });
      getPlaceInfoFromLocation(lat, lng, mapInstance);
    });

    mapInstance.addListener("mousemove", () => {
      setIsHovering(true);
    });

    mapInstance.addListener("mouseout", () => {
      setIsHovering(false);
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    const initialAddress =
      imageMetadata.location.nearbyPlaces?.[1] ||
      imageMetadata.location.address ||
      `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`;
    setCurrentAddress(initialAddress);

    setTimeout(() => {
      getPlaceInfoFromLocation(initialLat, initialLng, mapInstance);
    }, 100);
  };

  // 장소 검색
  const handleSearch = async () => {
    if (!searchQuery.trim() || !map) return;

    setIsSearching(true);
    const service = new window.google.maps.places.PlacesService(map);

    const request: google.maps.places.TextSearchRequest = {
      query: searchQuery,
      language: "ko",
    };

    service.textSearch(
      request,
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination | null,
      ) => {
        setIsSearching(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5));
        } else {
          setSearchResults([]);
        }
      },
    );
  };

  // 검색 결과 선택
  const handleSearchResultClick = (place: google.maps.places.PlaceResult) => {
    if (!map || !marker) return;
    if (!place.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    map.setCenter({ lat, lng });
    marker.setPosition({ lat, lng });

    const service = new window.google.maps.places.PlacesService(map);
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: place.place_id!,
      fields: ["name", "formatted_address", "types"],
      language: "ko",
      region: "kr",
    };

    service.getDetails(
      request,
      (details: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
          const koreanName = details.name;
          if (koreanName) {
            setCurrentAddress(koreanName);
          } else {
            setCurrentAddress(place.name || place.formatted_address || "");
          }
        } else {
          setCurrentAddress(place.name || place.formatted_address || "");
        }
      },
    );

    setSearchResults([]);
    setSearchQuery("");
  };

  // 위치 저장
  const handleSave = () => {
    if (!marker) return;

    const position = marker.getPosition();
    if (!position) return;
    const lat = position.lat();
    const lng = position.lng();

    const finalAddress = selectedPlace?.name || currentAddress;
    onLocationUpdate(lat, lng, finalAddress);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-black">위치 선택</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-black"
          >
            ✕
          </button>
        </div>

        {/* 검색 바 */}
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="장소를 검색하세요..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
            >
              {isSearching ? "검색중..." : "검색"}
            </button>
          </div>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((place, index) => (
                <div
                  key={index}
                  onClick={() => handleSearchResultClick(place)}
                  className="p-2 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <div className="font-medium text-black">{place.name}</div>
                  <div className="text-sm text-gray-600">{place.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 지도 */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* 현재 주소 및 저장 버튼 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">현재 위치:</div>
            <div className="font-medium text-black">{currentAddress}</div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-medium transition-colors shadow-sm"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
