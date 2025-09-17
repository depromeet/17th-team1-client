"use client";

import { useState, useEffect, useRef } from "react";
import { ImageMetadata } from "@/types/imageMetadata";

interface GoogleMapsModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageMetadata: ImageMetadata | null;
    onLocationUpdate: (lat: number, lng: number, address: string) => void;
}

declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

/**
 * 이미지 메타데이터의 위치를 기반으로 Google Map을 보여주고 사용자가 위치를 검색·선택하여 저장할 수 있는 모달형 컴포넌트입니다.
 *
 * 상세:
 * - 모달이 열리면 Google Maps API 로드 후 지도를 초기화하고, imageMetadata.location을 중심으로 드래그 가능한 마커를 생성합니다.
 * - 마커를 드래그하거나 지도를 클릭하면 해당 좌표로 이동하고 PlacesService / Geocoder를 사용해 한국어 이름(우선) 또는 주소를 조회하여 화면에 표시합니다.
 * - 검색 입력을 통해 장소 검색(textSearch)을 수행하고, 각 결과에 대해 상세 정보를 조회해 가능하면 한국어명을 우선 적용한 결과 목록을 보여줍니다.
 * - 검색 결과를 선택하면 지도 중심과 마커를 해당 장소로 이동시키고 주소를 업데이트합니다.
 * - 저장 버튼을 누르면 선택된 좌표와 주소(선택된 장소의 이름을 우선)를 onLocationUpdate 콜백으로 반환한 뒤 모달을 닫습니다.
 *
 * @param isOpen - 모달 열림 여부. false면 아무것도 렌더링하지 않습니다.
 * @param onClose - 모달을 닫기 위한 콜백 함수.
 * @param imageMetadata - 초기 중심 좌표와 보조 정보를 포함하는 이미지 메타데이터 객체 (null 허용). 내부에서 location.latitude, location.longitude, location.address, location.nearbyPlaces 등을 사용합니다.
 * @param onLocationUpdate - 사용자가 저장을 확정했을 때 호출되는 콜백: (lat: number, lng: number, address: string) => void.
 *
 * @returns JSX.Element | null - isOpen이 true일 때 모달 JSX를 반환하고, false면 null을 반환합니다.
 */
export function GoogleMapsModal({
    isOpen,
    onClose,
    imageMetadata,
    onLocationUpdate
}: GoogleMapsModalProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentAddress, setCurrentAddress] = useState("");
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [isHovering, setIsHovering] = useState(false);

    // 위치에서 주소 업데이트하는 함수
    const updateAddressFromLocation = (lat: number, lng: number) => {
        // 먼저 Places API로 근처 장소 검색
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
            location: { lat, lng },
            radius: 100, // 100m 반경 내에서 검색
            type: ['tourist_attraction', 'museum', 'establishment', 'point_of_interest'],
            language: "ko",
            region: "kr"
        };

        service.nearbySearch(request, (results: any[], status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                // 가장 가까운 장소의 상세 정보 가져오기
                const nearestPlace = results[0];
                const detailsRequest = {
                    placeId: nearestPlace.place_id,
                    fields: ["name", "formatted_address"],
                    language: "ko",
                    region: "kr"
                };

                service.getDetails(detailsRequest, (details: any, detailsStatus: string) => {
                    if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && details && details.name) {
                        // 한글 이름이 있으면 사용
                        setCurrentAddress(details.name);
                    } else {
                        // 장소명을 찾지 못하면 역지오코딩으로 주소 가져오기
                        fallbackToGeocoding(lat, lng);
                    }
                });
            } else {
                // 근처 장소를 찾지 못하면 역지오코딩으로 주소 가져오기
                fallbackToGeocoding(lat, lng);
            }
        });
    };

    // 역지오코딩으로 주소 가져오는 함수
    const fallbackToGeocoding = (lat: number, lng: number) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({
            location: { lat, lng },
            language: "ko",
            region: "kr"
        }, (results: any[], status: string) => {
            if (status === "OK" && results[0]) {
                const address = results[0].formatted_address;
                setCurrentAddress(address);
            }
        });
    };

    // 클릭한 위치의 장소 정보 가져오기
    const getPlaceInfoFromLocation = (lat: number, lng: number, mapInstance?: any) => {
        // Google Maps API가 완전히 로드되었는지 확인
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.log('Google Maps API가 아직 로드되지 않음');
            return;
        }

        // mapInstance가 있으면 사용, 없으면 map 상태 사용
        const currentMap = mapInstance || map;
        if (!currentMap) {
            console.log('지도가 아직 초기화되지 않음, 500ms 후 재시도');
            // 지도가 초기화될 때까지 대기
            setTimeout(() => {
                getPlaceInfoFromLocation(lat, lng, mapInstance);
            }, 500);
            return;
        }

        console.log('지도 사용 가능, 장소 정보 가져오기 시작');
        const service = new window.google.maps.places.PlacesService(currentMap);

        // 1단계: 좌표로 직접 검색 (가장 정확한 방법)
        const coordinateSearch = () => {
            // 여러 방법으로 시도
            const searchQueries = [
                `${lat},${lng}`, // 좌표
                `near ${lat},${lng}`, // 근처
                `hotel near ${lat},${lng}`, // 호텔 근처
                `restaurant near ${lat},${lng}`, // 레스토랑 근처
                `attraction near ${lat},${lng}` // 관광지 근처
            ];

            let searchIndex = 0;
            const tryNextSearch = () => {
                if (searchIndex >= searchQueries.length) {
                    nearbySearch();
                    return;
                }

                const request = {
                    query: searchQueries[searchIndex],
                    fields: ["name", "formatted_address", "geometry", "place_id", "types"],
                    language: "ko",
                    region: "kr"
                };

                console.log(`검색 시도 ${searchIndex + 1}:`, searchQueries[searchIndex]);

                // 서비스가 제대로 초기화되었는지 확인
                if (!service || !service.textSearch) {
                    console.log('PlacesService가 제대로 초기화되지 않음');
                    searchIndex++;
                    tryNextSearch();
                    return;
                }

                service.textSearch(request, (results: any[], status: string) => {
                    console.log(`검색 결과 ${searchIndex + 1}:`, status, results);

                    if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                        const place = results[0];
                        console.log('좌표 검색 결과:', place);

                        // 상세 정보로 한글 이름 확보
                        getPlaceDetails(place.place_id, place);
                    } else {
                        console.log(`검색 ${searchIndex + 1} 실패, 다음 시도`);
                        searchIndex++;
                        tryNextSearch();
                    }
                });
            };

            tryNextSearch();
        };

        // 2단계: 근처 장소 검색
        const nearbySearch = () => {
            const request = {
                location: { lat, lng },
                radius: 50, // 50m로 좁혀서 정확도 높이기
                language: "ko",
                region: "kr"
            };

            // 서비스가 제대로 초기화되었는지 확인
            if (!service || !service.nearbySearch) {
                console.log('PlacesService nearbySearch가 제대로 초기화되지 않음');
                updateAddressFromLocation(lat, lng);
                return;
            }

            service.nearbySearch(request, (results: any[], status: string) => {
                console.log('nearbySearch 결과:', status, results);

                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const place = results[0];
                    console.log('근처 검색 결과:', place);
                    getPlaceDetails(place.place_id, place);
                } else {
                    // 3단계: 역지오코딩으로 fallback
                    console.log('nearbySearch 실패, 역지오코딩 시도');
                    updateAddressFromLocation(lat, lng);
                }
            });
        };

        // 장소 상세 정보 가져오기 (한글 이름 확보)
        const getPlaceDetails = (placeId: string, originalPlace: any) => {
            const request = {
                placeId: placeId,
                fields: ["name", "formatted_address", "rating", "user_ratings_total", "types", "photos", "url"],
                language: "ko",
                region: "kr"
            };

            // 서비스가 제대로 초기화되었는지 확인
            if (!service || !service.getDetails) {
                console.log('PlacesService getDetails가 제대로 초기화되지 않음');
                setSelectedPlace(originalPlace);
                setCurrentAddress(originalPlace.name);
                return;
            }

            service.getDetails(request, (details: any, status: string) => {
                console.log('상세 정보 요청 상태:', status);
                console.log('상세 정보:', details);
                console.log('원래 장소:', originalPlace);

                if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
                    const koreanName = details.name;
                    const koreanAddress = details.formatted_address;

                    // 한글 이름이 있으면 무조건 사용
                    if (koreanName) {
                        console.log('한글 이름 사용:', koreanName);
                        const updatedPlace = {
                            ...originalPlace,
                            name: koreanName,
                            formatted_address: koreanAddress,
                            place_id: originalPlace.place_id
                        };
                        setSelectedPlace(updatedPlace);
                        setCurrentAddress(koreanName);
                        console.log('상태 업데이트 완료 - selectedPlace:', updatedPlace);
                        console.log('상태 업데이트 완료 - currentAddress:', koreanName);
                    } else {
                        // 한글 이름이 없으면 원래 이름 사용
                        console.log('원래 이름 사용:', originalPlace.name);
                        setSelectedPlace(originalPlace);
                        setCurrentAddress(originalPlace.name);
                        console.log('상태 업데이트 완료 - selectedPlace:', originalPlace);
                        console.log('상태 업데이트 완료 - currentAddress:', originalPlace.name);
                    }
                } else {
                    // 상세 정보 실패하면 원래 장소 사용
                    console.log('상세 정보 실패, 원래 장소 사용:', originalPlace.name);
                    setSelectedPlace(originalPlace);
                    setCurrentAddress(originalPlace.name);
                    console.log('상태 업데이트 완료 - selectedPlace:', originalPlace);
                    console.log('상태 업데이트 완료 - currentAddress:', originalPlace.name);
                }
            });
        };

        // 1단계부터 시작
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

        return () => {
            // 필요하면 cleanup
        };
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
            clickableIcons: true, // 클릭 가능한 아이콘 활성화
            gestureHandling: "greedy", // 마우스 제스처 활성화
        });

        const markerInstance = new window.google.maps.Marker({
            position: { lat: initialLat, lng: initialLng },
            map: mapInstance,
            draggable: true,
            title: "사진 촬영 위치",
        });

        // 마커 드래그 이벤트
        markerInstance.addListener("dragend", () => {
            const position = markerInstance.getPosition();
            const lat = position.lat();
            const lng = position.lng();

            console.log('마커 드래그됨:', lat, lng);

            // mapInstance 직접 전달
            getPlaceInfoFromLocation(lat, lng, mapInstance);
        });

        // 지도 클릭 이벤트 (핀 이동 및 장소 정보 가져오기)
        mapInstance.addListener("click", (event: any) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            console.log('지도 클릭됨:', lat, lng);

            markerInstance.setPosition({ lat, lng });

            // mapInstance 직접 전달
            getPlaceInfoFromLocation(lat, lng, mapInstance);
        });

        // 지도에서 클릭 가능한 장소 클릭 이벤트 (가장 중요!)
        mapInstance.addListener("click", (event: any) => {
            // Google Maps의 클릭 가능한 장소가 있는지 확인
            const clickableIcons = event.domEvent?.target?.closest('[data-value]');
            if (clickableIcons) {
                console.log('클릭 가능한 장소 클릭됨:', clickableIcons);
            }
        });

        // 마우스 이동 이벤트 (호버 효과)
        mapInstance.addListener("mousemove", (event: any) => {
            setIsHovering(true);
        });

        mapInstance.addListener("mouseout", () => {
            setIsHovering(false);
        });

        setMap(mapInstance);
        setMarker(markerInstance);

        // 초기 위치 설정 - 한글 이름이 있으면 사용, 없으면 주소 사용
        const initialAddress = imageMetadata.location.nearbyPlaces?.[1] ||
            imageMetadata.location.address ||
            `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`;
        setCurrentAddress(initialAddress);

        console.log('지도 초기화 완료, 상태 설정됨');

        // 초기 위치에서 장소 정보 가져오기 (mapInstance 직접 전달)
        setTimeout(() => {
            getPlaceInfoFromLocation(initialLat, initialLng, mapInstance);
        }, 100);
    };

    // 장소 검색
    const handleSearch = async () => {
        if (!searchQuery.trim() || !map) {
            console.log('검색 불가: 검색어 또는 지도가 없음');
            return;
        }

        setIsSearching(true);
        const service = new window.google.maps.places.PlacesService(map);

        const request = {
            query: searchQuery,
            fields: ["name", "geometry", "formatted_address", "place_id"],
            language: "ko", // 한글 결과 요청
        };

        service.textSearch(request, (results: any[], status: string) => {
            setIsSearching(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                // 각 결과에 대해 상세 정보를 가져와서 한글 이름 확보
                const detailedResults = results.slice(0, 5).map(async (place) => {
                    return new Promise((resolve) => {
                        // 먼저 한글로 시도
                        const koreanRequest = {
                            placeId: place.place_id,
                            fields: ["name", "formatted_address", "geometry", "place_id", "types"],
                            language: "ko",
                            region: "kr"
                        };

                        service.getDetails(koreanRequest, (koreanDetails: any, koreanStatus: string) => {
                            if (koreanStatus === window.google.maps.places.PlacesServiceStatus.OK && koreanDetails) {
                                const koreanName = koreanDetails.name;
                                const koreanAddress = koreanDetails.formatted_address;

                                // 한글 이름이 영문과 다르면 한글 이름 사용
                                if (koreanName && koreanName !== place.name) {
                                    resolve({
                                        ...place,
                                        name: koreanName,
                                        formatted_address: koreanAddress || place.formatted_address,
                                        place_id: place.place_id,
                                        types: koreanDetails.types || place.types
                                    });
                                } else {
                                    // 한글 이름이 없으면 원래 이름 사용
                                    resolve({
                                        ...place,
                                        name: place.name,
                                        formatted_address: koreanAddress || place.formatted_address,
                                        place_id: place.place_id,
                                        types: koreanDetails.types || place.types
                                    });
                                }
                            } else {
                                // 한글 요청 실패하면 원래 데이터 사용
                                resolve(place);
                            }
                        });
                    });
                });

                Promise.all(detailedResults).then((detailedResults) => {
                    setSearchResults(detailedResults);
                });
            } else {
                setSearchResults([]);
            }
        });
    };

    // 검색 결과 선택
    const handleSearchResultClick = (place: any) => {
        if (!map || !marker) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        map.setCenter({ lat, lng });
        marker.setPosition({ lat, lng });

        // 한글 이름을 다시 가져오기
        const service = new window.google.maps.places.PlacesService(map);
        const request = {
            placeId: place.place_id,
            fields: ["name", "formatted_address", "types"],
            language: "ko",
            region: "kr"
        };

        service.getDetails(request, (details: any, status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
                const koreanName = details.name;
                const koreanAddress = details.formatted_address;

                // 한글 이름이 영문과 다르면 한글 이름 사용
                if (koreanName && koreanName !== place.name) {
                    setCurrentAddress(koreanName);
                } else if (koreanName) {
                    // 한글 이름이 있으면 사용 (같아도)
                    setCurrentAddress(koreanName);
                } else {
                    // 한글 이름이 없으면 원래 이름 사용
                    setCurrentAddress(place.name || place.formatted_address);
                }
            } else {
                setCurrentAddress(place.name || place.formatted_address);
            }
        });

        setSearchResults([]);
        setSearchQuery("");
    };

    // 위치 저장
    const handleSave = () => {
        if (!marker) return;

        const position = marker.getPosition();
        const lat = position.lat();
        const lng = position.lng();

        console.log('저장 시 위치:', lat, lng);
        console.log('저장 시 주소:', currentAddress);
        console.log('선택된 장소:', selectedPlace);

        // selectedPlace가 있으면 그 이름을 우선 사용
        const finalAddress = selectedPlace?.name || currentAddress;
        console.log('최종 저장할 주소:', finalAddress);

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
                            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
