import React, { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import esriConfig from "@arcgis/core/config";
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";
import {
  webMercatorToGeographic,
  geographicToWebMercator,
} from "@arcgis/core/geometry/support/webMercatorUtils";
import "./ArcgisStyles.css";

const ApiKey = "AAPTxy8BH1VEsoebNVZXo8HurLQHIDsXanlPgShVCIMCYkkKbaycatNPKjEwnv_gtWRLfBBuSZ50r4qu_qfDJiBiZLl8eIAc6XE1Fpc6B524dIYFIziyi_0iA9i1zpoe7OcIv6K4XzSBcPH7uXpfSWuQ11IbBNMolHPD-hwaQEYuVPquZloMB0KwE3OrGQTks2MUMtJ8Rp-5ON-KGiOzy7WwtdamtPkq6riNRs6sCPuwmA4.AT1_LQKrYLYv";
esriConfig.apiKey = ApiKey;

const typeToSymbol = (geojsonType) => {
  const t = String(geojsonType || "").toLowerCase(); // point | linestring | polygon
  if (t === "point") {
    return {
      type: "simple-marker",
      color: [255, 0, 0],
      size: "8px",
      outline: { color: [255, 255, 255], width: 2 },
    };
  }
  if (t === "linestring") {
    return { type: "simple-line", color: [0, 0, 255], width: 3 };
  }
  if (t === "polygon") {
    return {
      type: "simple-fill",
      color: [0, 255, 0, 0.3],
      outline: { color: [0, 255, 0], width: 2 },
    };
  }
  return null;
};

// GeoJSON (WGS84) -> ArcGIS geometry (WebMercator)
const toWebMercator = (geojson) => {
  if (!geojson) return null;
  const { type, coordinates } = geojson;
  const t = String(type || "").toLowerCase();

  if (t === "point") {
    const [lon, lat] = coordinates || [];
    const p = new Point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });
    return geographicToWebMercator(p);
  }
  if (t === "linestring") {
    const paths = (coordinates || []).map(([lon, lat]) => {
      const p = new Point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });
      return geographicToWebMercator(p).toArray();
    });
    return new Polyline({ paths: [paths], spatialReference: { wkid: 3857 } });
  }
  if (t === "polygon") {
    const rings = (coordinates || []).map((ring) =>
      ring.map(([lon, lat]) => {
        const p = new Point({ longitude: lon, latitude: lat, spatialReference: { wkid: 4326 } });
        return geographicToWebMercator(p).toArray();
      })
    );
    return new Polygon({ rings, spatialReference: { wkid: 3857 } });
  }
  return null;
};

// ArcGIS geometry (WebMercator) -> GeoJSON (WGS84)
const toGeoJSON = (geometry) => {
  if (!geometry) return null;
  const t = String(geometry.type || "").toLowerCase();

  if (t === "point") {
    const wgs = webMercatorToGeographic(geometry);
    return { type: "Point", coordinates: [wgs.longitude, wgs.latitude] };
  }
  if (t === "polyline") {
    const path = geometry.paths?.[0] || [];
    const coords = path.map(([x, y]) => {
      const p = new Point({ x, y, spatialReference: geometry.spatialReference });
      const wgs = webMercatorToGeographic(p);
      return [wgs.longitude, wgs.latitude];
    });
    return { type: "LineString", coordinates: coords };
  }
  if (t === "polygon") {
    const rings = (geometry.rings || []).map((ring) =>
      ring.map(([x, y]) => {
        const p = new Point({ x, y, spatialReference: geometry.spatialReference });
        const wgs = webMercatorToGeographic(p);
        return [wgs.longitude, wgs.latitude];
      })
    );
    return { type: "Polygon", coordinates: rings };
  }
  return null;
};

const ArcGISMapDraw = ({
  geometry,            // GeoJSON: { type: "Point"|"LineString"|"Polygon", coordinates: ... }
  onGeometryChange,    // (geojson|null) => void
  required,
  error,
  readOnly = false,    // 👈 NUEVO
}) => {
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const [graphicsLayer, setGraphicsLayer] = useState(null);
  const [sketch, setSketch] = useState(null);
  const [activeTool, setActiveTool] = useState(null);

  // Montaje del mapa (una sola vez)
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({ basemap: "streets-navigation-vector" });
    const v = new MapView({
      container: mapRef.current,
      map,
      center: [-74.0817, 4.6097],
      zoom: 12,
    });

    const layer = new GraphicsLayer();
    map.add(layer);

    // Navegación siempre habilitada (aunque sea readOnly)
    v.navigation.mouseWheelZoomEnabled = true;
    v.navigation.browserTouchPanEnabled = true;
    v.constraints = { rotationEnabled: false };

    setView(v);
    setGraphicsLayer(layer);

    return () => {
      try {
        v && v.destroy();
      } catch {}
    };
  }, []);

  // Crear/Destruir Sketch cuando cambia readOnly (solo si no es readOnly)
  useEffect(() => {
    if (!view || !graphicsLayer) return;

    // Limpia cualquier sketch anterior
    if (sketch) {
      try {
        sketch.destroy();
      } catch {}
      setSketch(null);
    }

    if (readOnly) {
      // Modo solo visualización: NO creamos sketch, NO listeners de create/update
      setActiveTool(null);
      return;
    }

    // Modo edición/dibujo
    const sk = new Sketch({
      view,
      layer: graphicsLayer,
      creationMode: "update",
      availableCreateTools: ["point", "polyline", "polygon"],
      // Evita que editen seleccionando el gráfico si no quieres: updateOnGraphicClick: true por defecto
    });

    // No añadimos el widget a la UI si usas tus botones custom,
    // si quieres usar el widget propio, descomenta:
    // view.ui.add(sk, "top-right");

    const onCreate = sk.on("create", (event) => {
      if (event.state === "complete") {
        const gj = toGeoJSON(event.graphic.geometry);
        onGeometryChange?.(gj);
      }
    });

    const onUpdate = sk.on("update", (event) => {
      if (event.state === "complete" && event.graphics?.[0]) {
        const gj = toGeoJSON(event.graphics[0].geometry);
        onGeometryChange?.(gj);
      }
    });

    setSketch(sk);

    return () => {
      try {
        onCreate.remove();
        onUpdate.remove();
        sk.destroy();
      } catch {}
      setSketch(null);
    };
  }, [view, graphicsLayer, readOnly]); // 👈 se recompone al cambiar readOnly

  // Pintar/centrar cuando cambia `geometry`
  useEffect(() => {
    if (!graphicsLayer || !view) return;

    graphicsLayer.removeAll();

    if (!geometry) return;

    const arcGeom = toWebMercator(geometry);
    if (!arcGeom) return;

    const symbol = typeToSymbol(geometry.type);
    const graphic = new Graphic({ geometry: arcGeom, symbol });

    graphicsLayer.add(graphic);

    view.goTo(arcGeom).catch(() => {});
  }, [geometry, graphicsLayer, view]);

  const clearGraphics = () => {
    if (readOnly) return; // no borrar en modo lectura
    if (!graphicsLayer) return;
    graphicsLayer.removeAll();
    onGeometryChange?.(null);
    setActiveTool(null);
  };

  const handleToolClick = (tool) => {
    if (readOnly) return;
    setActiveTool(tool);
    sketch?.create(tool);
  };

  return (
    <div className="flex flex-col h-full">
      {!readOnly && (
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleToolClick("point")}
              className={`px-3 py-1 rounded ${activeTool === "point" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Punto
            </button>
            <button
              type="button"
              onClick={() => handleToolClick("polyline")}
              className={`px-3 py-1 rounded ${activeTool === "polyline" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Línea
            </button>
            <button
              type="button"
              onClick={() => handleToolClick("polygon")}
              className={`px-3 py-1 rounded ${activeTool === "polygon" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Polígono
            </button>
            <button
              type="button"
              onClick={clearGraphics}
              className="px-3 py-1 rounded bg-red-500 text-white"
            >
              Limpiar
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      <div ref={mapRef} className="flex-1 w-full h-full mt-4" />
      {required && !readOnly && !geometry && (
        <p className="text-red-500 text-sm mt-2">Debe dibujar una geometría en el mapa</p>
      )}
    </div>
  );
};

export default ArcGISMapDraw;
