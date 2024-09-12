// npm install serpapi
import { getJson } from "serpapi";

const CHARGEMAP_URL = import.meta.env.VITE_CHARGEMAP_URL;

const serpApi =
  "10d42a13a051a3e3b278cf4dc915252ca5d7890e0fedaefaceb2f03b80ffbc39";

export async function googleLookup(center) {
  const url = new URL(`${CHARGEMAP_URL}/food`);
  url.searchParams.append("lat", center.lat);
  url.searchParams.append("lng", center.lng);

  console.log(url.toString());
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}
