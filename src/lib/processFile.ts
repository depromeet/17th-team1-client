import exifr from "exifr";

import type { ImageMetadata } from "@/types/imageMetadata";
import { reverseGeocode } from "@/utils/geocoding";

// 서버 API로 근처 장소 가져오기
async function getNearbyPlaces(lat: number, lng: number): Promise<string[]> {
  try {
    const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    return data.places || [];
  } catch {
    return [];
  }
}

// 이미지 실제 크기 측정
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 크기를 측정할 수 없습니다."));
    };

    img.src = url;
  });
}

export async function processSingleFile(file: File): Promise<{ metadata: ImageMetadata; uploadFile: File }> {
  const id = Math.random().toString(36).substr(2, 9);
  const extracted: ImageMetadata = {
    id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    imagePreview: URL.createObjectURL(file),
    status: "processing",
  };

  // HEIC 파일 여부 판별 (MIME 타입 또는 확장자 기준)
  const isHeic = file.type.toLowerCase().includes("heic") || /\.heic$/i.test(file.name);
  // S3에 실제로 올릴 파일 (HEIC → JPEG 변환 성공 시 교체, 아니면 원본 유지)
  let uploadFile: File = file;

  if (isHeic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file as unknown as Blob,
        toType: "image/jpeg",
        quality: 0.92,
      });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      if (jpegBlob instanceof Blob) {
        // 미리보기 URL 교체 (메모리 누수 방지: 기존 Object URL 해제)
        const newUrl = URL.createObjectURL(jpegBlob);
        URL.revokeObjectURL(extracted.imagePreview);
        extracted.imagePreview = newUrl;

        // S3 업로드용 JPEG File 객체 생성 (.heic → .jpg, MIME 타입 image/jpeg)
        const jpegFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
        uploadFile = new File([jpegBlob], jpegFileName, { type: "image/jpeg" });
      }
    } catch {
      try {
        const thumb = await exifr.thumbnail(file);
        if (thumb) {
          // Uint8Array를 새로운 Uint8Array로 복사하여 타입 안전성 확보
          const thumbArray = new Uint8Array(thumb);
          // 메모리 누수 방지: 기존 Object URL 해제
          const newUrl = URL.createObjectURL(new Blob([thumbArray], { type: "image/jpeg" }));
          URL.revokeObjectURL(extracted.imagePreview);
          extracted.imagePreview = newUrl;
        }
      } catch {}
    }
  }

  try {
    const exifData: Record<string, unknown> = await exifr.parse(file);

    // EXIF에서 크기 정보 가져오기 (우선순위 1)
    if (exifData.ImageWidth && exifData.ImageHeight) {
      extracted.dimensions = {
        width: exifData.ImageWidth as number,
        height: exifData.ImageHeight as number,
      };
    }

    // EXIF에 크기 정보가 없으면 실제 이미지 로드해서 측정 (우선순위 2)
    if (!extracted.dimensions) {
      try {
        extracted.dimensions = await getImageDimensions(file);
      } catch {
        // 크기 측정 실패 시 기본값 설정하지 않음
      }
    }

    if (exifData.Make || exifData.Model || exifData.Software)
      extracted.camera = {
        make: (exifData.Make as string) || "",
        model: (exifData.Model as string) || "",
        software: (exifData.Software as string) || "",
      };
    if (exifData.ISO || exifData.FNumber || exifData.ExposureTime || exifData.FocalLength || exifData.Flash)
      extracted.settings = {
        iso: (exifData.ISO as number) || 0,
        aperture: (exifData.FNumber as number) || 0,
        shutterSpeed: exifData.ExposureTime ? `1/${Math.round(1 / (exifData.ExposureTime as number))}s` : "",
        focalLength: (exifData.FocalLength as number) || 0,
        flash: exifData.Flash ? (exifData.Flash as number) !== 0 : false,
      };
    if (exifData.latitude && exifData.longitude) {
      // 백엔드 API로 주소, 장소 정보 요청 (키 노출 X)
      const lat = exifData.latitude as number;
      const lng = exifData.longitude as number;
      const [nearbyPlaces, placeName] = await Promise.all([getNearbyPlaces(lat, lng), reverseGeocode(lat, lng)]);
      const address = placeName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      extracted.location = {
        latitude: lat,
        longitude: lng,
        altitude: exifData.altitude as number,
        address,
        nearbyPlaces: address ? [address, ...nearbyPlaces] : nearbyPlaces,
      };
    }
    if (exifData.DateTimeOriginal) extracted.timestamp = new Date(exifData.DateTimeOriginal as string).toISOString();
    if (exifData.Orientation) extracted.orientation = exifData.Orientation as number;
    extracted.status = "completed";
    return { metadata: extracted, uploadFile };
  } catch (e: unknown) {
    const error = e as Error;
    extracted.status = "error";
    extracted.error = error?.message || "알 수 없는 오류";
    return { metadata: extracted, uploadFile };
  }
}
