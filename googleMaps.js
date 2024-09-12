// npm install serpapi
import { getJson } from "serpapi";

const CHARGEMAP_URL = import.meta.env.VITE_CHARGEMAP_URL;

export async function googleLookup(center) {
  const url = new URL(`${CHARGEMAP_URL}/food`);
  url.searchParams.append("lat", center.lat);
  url.searchParams.append("lng", center.lng);

  console.log(url.toString());
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}
