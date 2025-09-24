import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=ko&region=kr`
    );
    const data = await response.json();
    return NextResponse.json({ results: data.results });
  } catch (error) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}
