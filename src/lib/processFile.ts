import exifr from "exifr";
import type { ImageMetadata } from "@/types/imageMetadata";

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

// 서버 API로 역지오코딩(주소) 가져오기
async function getAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
  } catch {}
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

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

  const isHeic = file.type.toLowerCase().includes("heic") || /\.heic$/i.test(file.name);
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
        // 메모리 누수 방지: 기존 Object URL 해제
        const newUrl = URL.createObjectURL(jpegBlob);
        URL.revokeObjectURL(extracted.imagePreview);
        extracted.imagePreview = newUrl;
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
    if (exifData.ImageWidth && exifData.ImageHeight)
      extracted.dimensions = {
        width: exifData.ImageWidth as number,
        height: exifData.ImageHeight as number,
      };
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
      const [nearbyPlaces, address] = await Promise.all([getNearbyPlaces(lat, lng), getAddress(lat, lng)]);
      extracted.location = {
        latitude: lat,
        longitude: lng,
        altitude: exifData.altitude as number,
        address,
        nearbyPlaces: [address, ...nearbyPlaces],
      };
    }
    if (exifData.DateTimeOriginal) extracted.timestamp = new Date(exifData.DateTimeOriginal as string).toISOString();
    if (exifData.Orientation) extracted.orientation = exifData.Orientation as number;
    extracted.status = "completed";
    return extracted;
  } catch (e: unknown) {
    const error = e as Error;
    extracted.status = "error";
    extracted.error = error?.message || "알 수 없는 오류";
    return extracted;
  }
}
