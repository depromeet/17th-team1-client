export interface CountryData {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  color: string;
}

export interface TravelPattern {
  title: string;
  subtitle: string;
  countries: CountryData[];
}
