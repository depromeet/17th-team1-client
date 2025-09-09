'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

const GlobePrototype = () => {
  const globeEl = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currentGlobeIndex, setCurrentGlobeIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [clusteredData, setClusteredData] = useState<any[]>([]);
  const [globeLoading, setGlobeLoading] = useState(false);
  const [globeError, setGlobeError] = useState<string | null>(null);

  // 여행 패턴들
  const travelPatterns = [
    {
      title: '아시아 문화 여행',
      subtitle: '전통과 현대가 공존하는 아시아의 매력',
      countries: [
        {
          id: 'JPN',
          name: '도쿄, 일본',
          flag: '🇯🇵',
          lat: 35.6762,
          lng: 139.6503,
          color: '#e91e63',
        },
        {
          id: 'JPN2',
          name: '오사카, 일본',
          flag: '🇯🇵',
          lat: 34.6937,
          lng: 135.5023,
          color: '#e91e63',
        },
        {
          id: 'JPN3',
          name: '교토, 일본',
          flag: '🇯🇵',
          lat: 35.0116,
          lng: 135.7681,
          color: '#e91e63',
        },
        {
          id: 'KOR',
          name: '서울, 한국',
          flag: '🇰🇷',
          lat: 37.5665,
          lng: 126.978,
          color: '#9c27b0',
        },
        {
          id: 'TWN',
          name: '타이베이, 대만',
          flag: '🇹🇼',
          lat: 25.033,
          lng: 121.5654,
          color: '#673ab7',
        },
        {
          id: 'THA',
          name: '방콕, 태국',
          flag: '🇹🇭',
          lat: 13.7563,
          lng: 100.5018,
          color: '#3f51b5',
        },
        {
          id: 'SGP',
          name: '싱가포르',
          flag: '🇸🇬',
          lat: 1.3521,
          lng: 103.8198,
          color: '#2196f3',
        },
      ],
    },
    {
      title: '세계 명소 순례',
      subtitle: '꿈에 그리던 세계 각국의 랜드마크들',
      countries: [
        {
          id: 'USA',
          name: '뉴욕, 미국',
          flag: '🇺🇸',
          lat: 40.7128,
          lng: -74.006,
          color: '#f44336',
        },
        {
          id: 'FRA',
          name: '파리, 프랑스',
          flag: '🇫🇷',
          lat: 48.8566,
          lng: 2.3522,
          color: '#e91e63',
        },
        {
          id: 'EGY',
          name: '카이로, 이집트',
          flag: '🇪🇬',
          lat: 30.0444,
          lng: 31.2357,
          color: '#9c27b0',
        },
        {
          id: 'BRA',
          name: '리우데자네이루, 브라질',
          flag: '🇧🇷',
          lat: -22.9068,
          lng: -43.1729,
          color: '#4caf50',
        },
        {
          id: 'AUS',
          name: '시드니, 호주',
          flag: '🇦🇺',
          lat: -33.8688,
          lng: 151.2093,
          color: '#00bcd4',
        },
      ],
    },
    {
      title: '유럽 로맨틱 여행',
      subtitle: '낭만적인 유럽의 고성과 거리들',
      countries: [
        {
          id: 'ITA',
          name: '로마, 이탈리아',
          flag: '🇮🇹',
          lat: 41.9028,
          lng: 12.4964,
          color: '#ff9800',
        },
        {
          id: 'ESP',
          name: '바르셀로나, 스페인',
          flag: '🇪🇸',
          lat: 41.3851,
          lng: 2.1734,
          color: '#4caf50',
        },
        {
          id: 'GBR',
          name: '런던, 영국',
          flag: '🇬🇧',
          lat: 51.5074,
          lng: -0.1278,
          color: '#2196f3',
        },
        {
          id: 'DEU',
          name: '베를린, 독일',
          flag: '🇩🇪',
          lat: 52.52,
          lng: 13.405,
          color: '#ff5722',
        },
        {
          id: 'CHE',
          name: '취리히, 스위스',
          flag: '🇨🇭',
          lat: 47.3769,
          lng: 8.5417,
          color: '#795548',
        },
      ],
    },
  ];

  const currentPattern = travelPatterns[currentGlobeIndex];

  // ISO 코드 매핑 함수
  const getISOCode = (countryId: string): string => {
    const isoMap: { [key: string]: string } = {
      JPN: 'JPN',
      JPN2: 'JPN',
      JPN3: 'JPN',
      KOR: 'KOR',
      TWN: 'TWN',
      THA: 'THA',
      SGP: 'SGP',
      USA: 'USA',
      FRA: 'FRA',
      EGY: 'EGY',
      BRA: 'BRA',
      AUS: 'AUS',
      ITA: 'ITA',
      ESP: 'ESP',
      GBR: 'GBR',
      DEU: 'DEU',
      CHE: 'CHE',
    };
    return isoMap[countryId] || countryId;
  };

  // 거리 기반 클러스터링 함수
  const clusterLocations = (locations: any[], distance: number) => {
    const clusters: any[] = [];
    const processed = new Set();

    locations.forEach((location, index) => {
      if (processed.has(index)) return;

      const cluster = {
        id: location.id,
        name: location.name,
        flag: location.flag,
        lat: location.lat,
        lng: location.lng,
        color: location.color,
        items: [location],
        count: 1,
      };

      // 주변의 가까운 위치들을 클러스터에 추가
      locations.forEach((otherLocation, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;

        const dist = Math.sqrt(
          Math.pow(location.lat - otherLocation.lat, 2) +
            Math.pow(location.lng - otherLocation.lng, 2)
        );

        if (dist < distance) {
          cluster.items.push(otherLocation);
          cluster.count++;
          processed.add(otherIndex);

          // 클러스터 중심점 재계산
          const totalLat = cluster.items.reduce(
            (sum, item) => sum + item.lat,
            0
          );
          const totalLng = cluster.items.reduce(
            (sum, item) => sum + item.lng,
            0
          );
          cluster.lat = totalLat / cluster.items.length;
          cluster.lng = totalLng / cluster.items.length;
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    return clusters;
  };

  // 줌 레벨에 따른 클러스터링 거리 계산
  const getClusterDistance = (zoom: number) => {
    // zoom이 클수록 멀리서 보는 것 (altitude가 높음)
    // zoom이 작을수록 가까이서 보는 것 (altitude가 낮음)

    if (zoom > 4) return 15; // 매우 멀리서 볼 때 - 강한 클러스터링
    if (zoom > 3) return 10; // 멀리서 볼 때 - 중간 클러스터링
    if (zoom > 2) return 5; // 중간 거리 - 약한 클러스터링
    if (zoom > 1.5) return 2; // 가까이서 볼 때 - 매우 약한 클러스터링
    return 0; // 매우 가까이서 볼 때 - 클러스터링 해제
  };

  // 브라우저 기본 확대/축소 방지
  useEffect(() => {
    const preventZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    const preventKeyboardZoom = (e: KeyboardEvent) => {
      if (
        e.ctrlKey &&
        (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')
      ) {
        e.preventDefault();
      }
    };

    const preventTouchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 이벤트 리스너 추가
    document.addEventListener('wheel', preventZoom, { passive: false });
    document.addEventListener('keydown', preventKeyboardZoom);
    document.addEventListener('touchstart', preventTouchZoom, {
      passive: false,
    });

    return () => {
      // 클린업
      document.removeEventListener('wheel', preventZoom);
      document.removeEventListener('keydown', preventKeyboardZoom);
      document.removeEventListener('touchstart', preventTouchZoom);
    };
  }, []);

  // 카메라 줌 레벨을 주기적으로 체크 (onZoom 이벤트 대신 사용)
  useEffect(() => {
    if (!globeRef.current) return;

    const checkZoomLevel = () => {
      if (globeRef.current) {
        const camera = globeRef.current.camera();
        if (camera && camera.position) {
          const currentAltitude = camera.position.length() / globeRef.current.getGlobeRadius() - 1;
          
          // 현재 줌 레벨과 차이가 클 때만 업데이트
          if (Math.abs(currentAltitude - zoomLevel) > 0.2) {
            setZoomLevel(currentAltitude);
          }
        }
      }
    };

    // 주기적으로 줌 레벨 체크 (onZoom 이벤트 대신)
    const interval = setInterval(checkZoomLevel, 200);

    return () => clearInterval(interval);
  }, [zoomLevel]); // zoomLevel을 의존성에 포함하되, 큰 변화가 있을 때만 업데이트

  useEffect(() => {
    // Globe.gl 동적 로딩
    const loadGlobe = async () => {
      try {
        setGlobeLoading(true);
        setGlobeError(null);

        if (!globeEl.current) {
          setGlobeError('Globe container not found');
          return;
        }

        const Globe = (await import('globe.gl')).default;

        if (!Globe) {
          setGlobeError('Failed to load Globe.gl library');
          return;
        }

        // 기존 내용 제거
        globeEl.current.innerHTML = '';

        const globe = new Globe(globeEl.current)
          // Blue Marble 고해상도 지구본 이미지 사용
          .globeImageUrl(
            '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
          )
          .bumpImageUrl(
            '//unpkg.com/three-globe/example/img/earth-topology.png'
          )
          .backgroundImageUrl(
            '//unpkg.com/three-globe/example/img/night-sky.png'
          )
          .width(500)
          .height(500)
          .showGlobe(true)
          .showAtmosphere(true)
          .atmosphereColor('#4a90e2')
          .atmosphereAltitude(0.15);

        // globe 참조 저장
        globeRef.current = globe;
        console.log('Globe initialized successfully');

        // 카메라 변경 이벤트 리스너 제거 (주기적 체크로 대체)

        // 국가 데이터 로드
        fetch('//unpkg.com/world-atlas/countries-110m.json')
          .then((res) => res.json())
          .then((countriesData) => {
            // 현재 패턴의 방문한 국가들의 ISO 코드 계산
            const currentVisitedISOCodes = [
              ...new Set(currentPattern.countries.map((c) => getISOCode(c.id))),
            ];

            // countriesData가 undefined이거나 features가 없는 경우 빈 배열 사용
            const features = countriesData?.features || [];

            globe
              .polygonsData(
                features.filter((d: any) =>
                  currentVisitedISOCodes.includes(d.properties.ISO_A3)
                )
              )
              .polygonCapColor((feat: any) => {
                const isoCode = feat.properties.ISO_A3;
                const countryData = currentPattern.countries.find(
                  (c: any) => getISOCode(c.id) === isoCode
                );

                // 선택된 국가인지 확인 (selectedCountry는 country.id 형태)
                const isSelected =
                  selectedCountry &&
                  currentPattern.countries.find(
                    (c) =>
                      c.id === selectedCountry && getISOCode(c.id) === isoCode
                  );

                if (isSelected) {
                  return countryData?.color || '#ff6b6b'; // 밝은 색상
                } else if (countryData) {
                  return `${countryData.color}88`; // 반투명 색상
                } else {
                  return 'rgba(100, 100, 100, 0.2)'; // 기본 회색
                }
              })
              .polygonSideColor((feat: any) => {
                const isoCode = feat.properties.ISO_A3;
                const isSelected =
                  selectedCountry &&
                  currentPattern.countries.find(
                    (c) =>
                      c.id === selectedCountry && getISOCode(c.id) === isoCode
                  );
                return isSelected ? '#555555' : '#333333';
              })
              .polygonStrokeColor((feat: any) => {
                const isoCode = feat.properties.ISO_A3;
                const isSelected =
                  selectedCountry &&
                  currentPattern.countries.find(
                    (c) =>
                      c.id === selectedCountry && getISOCode(c.id) === isoCode
                  );
                return isSelected ? '#ffffff' : '#111111';
              })
              .polygonAltitude((feat: any) => {
                const isoCode = feat.properties.ISO_A3;
                const isSelected =
                  selectedCountry &&
                  currentPattern.countries.find(
                    (c) =>
                      c.id === selectedCountry && getISOCode(c.id) === isoCode
                  );
                return isSelected ? 0.03 : 0.005;
              })
              .polygonLabel('')
              .onPolygonClick((polygon: any) => {
                const countryISOCode = polygon.properties.ISO_A3;

                // 클릭된 ISO 코드에 해당하는 첫 번째 도시 찾기
                const clickedCountry = currentPattern.countries.find(
                  (c: any) => getISOCode(c.id) === countryISOCode
                );

                if (clickedCountry) {
                  setSelectedCountry(clickedCountry.id);
                  globe.pointOfView(
                    {
                      lat: clickedCountry.lat,
                      lng: clickedCountry.lng,
                      altitude: 1.5,
                    },
                    1000
                  );
                }
              });
          });

        // 자동 회전
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableZoom = true;
        globe.controls().minDistance = 101; // 최소 거리 설정
        globe.controls().maxDistance = 1000; // 최대 거리 설정

        // 렌더러 품질 개선
        const renderer = globe.renderer();
        if (renderer) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = 2; // PCFSoftShadowMap
        }

        // 지구본 객체에 접근하여 텍스처 필터링 개선
        setTimeout(() => {
          const scene = globe.scene();
          if (scene) {
            scene.traverse((child: any) => {
              if (child.material && child.material.map) {
                child.material.map.generateMipmaps = true;
                child.material.map.minFilter = 1008; // LinearMipmapLinearFilter
                child.material.map.magFilter = 1006; // LinearFilter
                child.material.map.anisotropy =
                  renderer?.capabilities?.getMaxAnisotropy() || 4;
              }
            });
          }
        }, 1000);

        // 초기 카메라 위치
        globe.pointOfView({ altitude: 2.5 });

        setGlobeLoading(false);
        console.log('Globe setup completed successfully');
      } catch (error) {
        console.error('Globe.gl 로딩 실패:', error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setGlobeError(`Globe.gl 로딩 실패: ${errorMessage}`);
        setGlobeLoading(false);
        // 폴백 UI 표시
        if (globeEl.current) {
          globeEl.current.innerHTML = `
            <div style="
              width: 500px; 
              height: 500px; 
              background: radial-gradient(circle at 30% 30%, #2c3e50 0%, #1a252f 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 14px;
              text-align: center;
              flex-direction: column;
              gap: 10px;
            ">
              <div>⚠️ Globe.gl 로딩 실패</div>
              <div style="font-size: 12px; opacity: 0.8;">인터넷 연결을 확인해주세요</div>
            </div>
          `;
        }
      }
    };

    loadGlobe();
  }, [selectedCountry, currentGlobeIndex]);

  // 줌 레벨 변경에 따른 클러스터링 업데이트 (별도 useEffect로 분리)
  useEffect(() => {
    if (!globeRef.current) return;

    // 줌 레벨이 너무 높으면 (너무 멀리서 보면) 라벨 숨기기
    if (zoomLevel > 6) {
      globeRef.current.htmlElementsData([]);
      setClusteredData([]);
      return;
    }

    const clusterDistance = getClusterDistance(zoomLevel);
    const clusters = clusterLocations(
      currentPattern.countries,
      clusterDistance
    );

    // 클러스터 데이터 업데이트
    setClusteredData(clusters);
  }, [zoomLevel, currentGlobeIndex]); // currentPattern.countries 대신 currentGlobeIndex 사용

  // 클러스터 데이터가 변경될 때 HTML 라벨 업데이트
  useEffect(() => {
    if (!globeRef.current || clusteredData.length === 0) return;
    
    // HTML 라벨 업데이트
    globeRef.current
      .htmlElementsData(clusteredData)
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlAltitude(0.01)
      .htmlElement((d: any) => {
        const el = document.createElement('div');

        // 클러스터인 경우와 단일 아이템인 경우 다르게 표시
        const isCluster = d.count > 1;
        const displayText = isCluster ? `${d.count}개 도시` : d.name;

        // 줌 레벨에 따른 라벨 크기 조절
        const scaleFactor = Math.max(0.8, Math.min(1.5, 3 / zoomLevel));
        const fontSize = Math.round(13 * scaleFactor);
        const flagSize = Math.round(16 * scaleFactor);
        const padding = Math.round(8 * scaleFactor);

        el.innerHTML = `
          <div style="
            background: ${
              isCluster
                ? 'rgba(74, 144, 226, 0.95)'
                : 'rgba(255, 255, 255, 0.95)'
            };
            color: ${isCluster ? 'white' : '#333'};
            padding: ${padding}px ${padding * 1.5}px;
            border-radius: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 500;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(0, 0, 0, 0.1);
            cursor: pointer;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 6px;
            backdrop-filter: blur(10px);
            transition: all 0.2s ease;
            min-width: ${isCluster ? '60px' : 'auto'};
            justify-content: center;
          ">
            ${
              isCluster
                ? `<span style="font-size: ${flagSize}px;">🌍</span>`
                : `<span style="font-size: ${flagSize}px;">${d.flag}</span>`
            }
            <span>${displayText}</span>
          </div>
        `;

        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.style.position = 'relative';
        el.style.zIndex = '1000';

        // 호버 효과
        const labelDiv = el.querySelector('div') as HTMLElement;
        el.addEventListener('mouseenter', () => {
          if (labelDiv) {
            labelDiv.style.transform = 'scale(1.05)';
            labelDiv.style.background = isCluster
              ? 'rgba(74, 144, 226, 1)'
              : 'rgba(255, 255, 255, 1)';
            labelDiv.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
            labelDiv.style.zIndex = '1001';
          }
        });

        el.addEventListener('mouseleave', () => {
          if (labelDiv) {
            labelDiv.style.transform = 'scale(1)';
            labelDiv.style.background = isCluster
              ? 'rgba(74, 144, 226, 0.95)'
              : 'rgba(255, 255, 255, 0.95)';
            labelDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            labelDiv.style.zIndex = '1000';
          }
        });

        el.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (isCluster) {
            // 클러스터 클릭 시 적절한 레벨로 줌인
            const targetAltitude = Math.max(0.8, zoomLevel * 0.4);
            if (globeRef.current) {
              globeRef.current.pointOfView(
                {
                  lat: d.lat,
                  lng: d.lng,
                  altitude: targetAltitude,
                },
                1000
              );
            }
          } else {
            // 단일 아이템 클릭 시 선택
            setSelectedCountry(d.id);
            if (globeRef.current) {
              globeRef.current.pointOfView(
                {
                  lat: d.lat,
                  lng: d.lng,
                  altitude: 1.2,
                },
                1000
              );
            }
          }
        });

        return el;
      });
  }, [clusteredData, selectedCountry]); // clusteredData와 selectedCountry만 의존성으로 사용

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a2e 100%)',
        color: 'white',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px',
            color: 'white',
          }}
        >
          {currentPattern.title}
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#4a90e2',
            margin: 0,
            marginBottom: '20px',
          }}
        >
          {currentPattern.subtitle}
        </p>

        {/* 글로브 선택 버튼들 */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {travelPatterns.map((pattern, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentGlobeIndex(index);
                setSelectedCountry(null);
              }}
              style={{
                backgroundColor:
                  currentGlobeIndex === index
                    ? '#4a90e2'
                    : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
              }}
            >
              패턴 {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Globe.gl 컨테이너 */}
      <div
        ref={globeEl}
        style={{
          marginBottom: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      />

      {/* 로딩 및 에러 상태 표시 */}
      {globeLoading && (
        <div style={{ color: '#4a90e2', marginBottom: '20px' }}>
          🌍 Globe.gl 로딩 중...
        </div>
      )}

      {globeError && (
        <div
          style={{
            color: '#ff5722',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          ⚠️ {globeError}
        </div>
      )}

      {/* 클러스터링 정보 */}
      {clusteredData.length > 0 && zoomLevel <= 6 && (
        <div
          style={{
            color: '#8892b0',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          현재 줌 레벨: {zoomLevel.toFixed(1)} | 클러스터:{' '}
          {clusteredData.length}개
        </div>
      )}

      {/* 선택된 국가 정보 */}
      {selectedCountry && (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {(() => {
            const country = currentPattern.countries.find(
              (c: any) => c.id === selectedCountry
            );
            return country ? (
              <>
                <div style={{ fontSize: '30px', marginBottom: '10px' }}>
                  {country.flag}
                </div>
                <h3 style={{ margin: '0 0 5px 0', color: 'white' }}>
                  {country.name}
                </h3>
                <button
                  onClick={() => setSelectedCountry(null)}
                  style={{
                    backgroundColor: country.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  닫기
                </button>
              </>
            ) : null;
          })()}
        </div>
      )}

      {/* 안내 메시지 */}
      <p
        style={{
          color: '#8892b0',
          fontSize: '12px',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        위 버튼으로 다른 여행 패턴을 확인하고, 지구본을 확대/축소하며 클러스터를
        클릭해보세요
      </p>
    </div>
  );
};

export default GlobePrototype;
