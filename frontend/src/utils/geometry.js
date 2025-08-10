export function esriToGeoJSON(geom) {
  if (!geom) return null;
  const t = String(geom.type || "").toLowerCase();

  if (t === "point") {
    const [lon, lat] = geom.coordinates || [];
    return { type: "Point", coordinates: [lon, lat] };
  }
  if (t === "polyline") {
    // asumir una sola ruta
    const coords = geom.coordinates;
    return { type: "LineString", coordinates: coords };
  }
  if (t === "polygon") {
    let rings = geom.coordinates;
    // si llega un solo array de anillos, envolverlo
    if (Array.isArray(rings) && rings.length && typeof rings[0][0] === "number") {
      rings = [rings];
    }
    return { type: "Polygon", coordinates: rings };
  }
  return geom; // si ya viene en GeoJSON
}