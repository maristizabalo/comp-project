import React, { useEffect, useRef, useState } from "react";

// Importación de web components de ArcGIS
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-sketch";
import "@arcgis/map-components/components/arcgis-zoom";

const ArcGISMapDraw = ({
  onGeometryAdded,
  required,
  error,
  initialGeometry,
  itemId,
}) => {
  const sketchRef = useRef(null);
  const [activeTool, setActiveTool] = useState("");
  const [hasGeometry, setHasGeometry] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    if (sketchRef.current) {
      sketchRef.current.activeTool = tool;
    }
  };

  const convertToWGS84 = (graphic) => {
    const geom = graphic.geometry.toJSON();
    return { type: geom.type, coordinates: geom.coordinates };
  };

  const onSketchEvent = (event) => {
    if (event.state === "complete" && event.graphic) {
      const geom = convertToWGS84(event.graphic);
      onGeometryAdded(geom);
      setHasGeometry(true);
    }
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex space-x-2 mb-2">
        {["point", "polyline", "polygon"].map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={() => handleToolClick(tool)}
            className={`px-3 py-1 rounded ${
              activeTool === tool ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tool === "point"
              ? "Punto"
              : tool === "polyline"
              ? "Línea"
              : "Polígono"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (sketchRef.current) sketchRef.current.clear();
            setActiveTool("");
            setHasGeometry(false);
            onGeometryAdded(null);
          }}
          className="px-3 py-1 rounded bg-red-500 text-white"
        >
          Limpiar
        </button>
      </div>

      {!isLoaded && (
        <div className="text-center text-gray-500">Cargando mapa...</div>
      )}

      <arcgis-map
        style={{ width: "100%", height: "400px", flex: 1 }}
        item-id={itemId}
        onarcgisViewReadyChange={() => setIsLoaded(true)}
      >
        <arcgis-zoom position="top-left" slot="controls" />
        <arcgis-sketch
          ref={sketchRef}
          active-tool={activeTool}
          onrequest-create={onSketchEvent}
          onrequest-update={onSketchEvent}
        />
      </arcgis-map>

      {required && !hasGeometry && (
        <p className="text-red-500 text-sm mt-2">
          Debe dibujar una geometría en el mapa
        </p>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default ArcGISMapDraw;
