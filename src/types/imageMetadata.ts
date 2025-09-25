export interface ImageMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  imagePreview: string;
  dimensions?: { width: number; height: number };
  camera?: { make: string; model: string; software: string };
  settings?: { iso: number; aperture: number; shutterSpeed: string; focalLength: number; flash: boolean };
  location?: { latitude: number; longitude: number; altitude?: number; address?: string; nearbyPlaces?: string[] };
  timestamp?: string;
  orientation?: number;
  status: "processing" | "completed" | "error";
  error?: string;
}
