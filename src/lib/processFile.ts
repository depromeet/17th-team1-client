import { ImageMetadata } from "@/types/imageMetadata";
import exifr from "exifr";

/**
 * 주어진 위도/경도에 인접한 장소 목록을 가져옵니다.
 *
 * 서버의 `/api/places` 엔드포인트를 호출하여 근처 장소 배열을 반환합니다.
 * 네트워크 오류나 파싱 오류가 발생하면 빈 배열을 반환합니다.
 *
 * @param lat - 위도 (decimal)
 * @param lng - 경도 (decimal)
 * @returns 근처 장소 문자열 배열(서버의 `data.places`), 오류 시 빈 배열
 */
async function getNearbyPlaces(lat: number, lng: number): Promise<string[]> {
  try {
    const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    return data.places || [];
  } catch {
    return [];
  }
}

/**
 * 주어진 이미지 파일을 처리하여 EXIF, 위치, 카메라/설정 정보 및 미리보기 URL을 포함하는 ImageMetadata 객체를 생성합니다.
 *
 * 처리 내용 요약:
 * - HEIC 파일이면 가능하면 JPEG로 변환하거나 썸네일을 생성해 imagePreview를 설정합니다.
 * - exifr로 메타데이터를 파싱하여 가로/세로, 촬영 기기 정보, 노출/조리개/셔터/초점거리/플래시 상태 등을 추출합니다.
 * - GPS 좌표가 있으면 근처 장소 목록을 조회하고(내부 API) Google Geocoding으로 역지오코딩해 주소를 얻어 location 및 nearbyPlaces를 구성합니다.
 * - DateTimeOriginal을 ISO 타임스탬프로 변환하고 Orientation을 설정합니다.
 * - 성공 시 status는 `"completed"`, 처리 중 오류 발생 시 status는 `"error"`로 설정되며 error 필드에 메시지를 담아 반환합니다.
 *
 * @param file - 처리할 이미지 파일(브라우저 File 객체)
 * @returns 처리 결과를 담은 ImageMetadata 객체(비동기 Promise)
 */
export async function processSingleFile(file: File): Promise<ImageMetadata> {
  const id = Math.random().toString(36).substr(2, 9);
  const extracted: ImageMetadata = {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    imagePreview: URL.createObjectURL(file),
    status: "processing",
  };

  const isHeic =
    file.type.toLowerCase().includes("heic") || /\.heic$/i.test(file.name);
  if (isHeic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file as unknown as Blob,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      if (jpegBlob instanceof Blob)
        extracted.imagePreview = URL.createObjectURL(jpegBlob);
    } catch {
      try {
        const thumb = await exifr.thumbnail(file);
        if (thumb) {
          // Uint8Array를 새로운 Uint8Array로 복사하여 타입 안전성 확보
          const thumbArray = new Uint8Array(thumb);
          extracted.imagePreview = URL.createObjectURL(
            new Blob([thumbArray], { type: "image/jpeg" })
          );
        }
      } catch {}
    }
  }

  try {
    const exifData: any = await exifr.parse(file);
    if (exifData.ImageWidth && exifData.ImageHeight)
      extracted.dimensions = {
        width: exifData.ImageWidth,
        height: exifData.ImageHeight,
      };
    if (exifData.Make || exifData.Model || exifData.Software)
      extracted.camera = {
        make: exifData.Make || "",
        model: exifData.Model || "",
        software: exifData.Software || "",
      };
    if (
      exifData.ISO ||
      exifData.FNumber ||
      exifData.ExposureTime ||
      exifData.FocalLength ||
      exifData.Flash
    )
      extracted.settings = {
        iso: exifData.ISO || 0,
        aperture: exifData.FNumber || 0,
        shutterSpeed: exifData.ExposureTime
          ? `1/${Math.round(1 / exifData.ExposureTime)}s`
          : "",
        focalLength: exifData.FocalLength || 0,
        flash: exifData.Flash ? exifData.Flash !== 0 : false,
      };
    if (exifData.latitude && exifData.longitude) {
      const nearbyPlaces = await getNearbyPlaces(
        exifData.latitude,
        exifData.longitude
      );
      let address = `${exifData.latitude.toFixed(
        4
      )}, ${exifData.longitude.toFixed(4)}`;
      try {
        const addressResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${exifData.latitude},${exifData.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ko&region=kr`
        );
        const addressData = await addressResponse.json();
        if (addressData.results && addressData.results.length > 0)
          address = addressData.results[0].formatted_address;
      } catch {}
      extracted.location = {
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        altitude: exifData.altitude,
        address,
        nearbyPlaces: [address, ...nearbyPlaces],
      };
    }
    if (exifData.DateTimeOriginal)
      extracted.timestamp = new Date(exifData.DateTimeOriginal).toISOString();
    if (exifData.Orientation) extracted.orientation = exifData.Orientation;
    extracted.status = "completed";
    return extracted;
  } catch (e: any) {
    extracted.status = "error";
    extracted.error = e?.message || "알 수 없는 오류";
    return extracted;
  }
}
