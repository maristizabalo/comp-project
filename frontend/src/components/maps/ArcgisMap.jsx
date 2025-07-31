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
import './ArcgisStyles.css'

const Webmap = "123abc";
const ApiKey = "AAPTxy8BH1VEsoebNVZXo8HurLQHIDsXanlPgShVCIMCYkkKbaycatNPKjEwnv_gtWRLfBBuSZ50r4qu_qfDJiBiZLl8eIAc6XE1Fpc6B524dIYFIziyi_0iA9i1zpoe7OcIv6K4XzSBcPH7uXpfSWuQ11IbBNMolHPD-hwaQEYuVPquZloMB0KwE3OrGQTks2MUMtJ8Rp-5ON-KGiOzy7WwtdamtPkq6riNRs6sCPuwmA4.AT1_LQKrYLYv";
const portalUrl = "https://geo.dadep.gov.co/portal";

esriConfig.apiKey = ApiKey;

const ArcGISMapDraw = ({
    onGeometryAdded,
    required,
    error,
    initialGeometry,
}) => {
    const mapRef = useRef(null);
    const [view, setView] = useState(null);
    const [sketch, setSketch] = useState(null);
    const [graphicsLayer, setGraphicsLayer] = useState(null);
    const [activeTool, setActiveTool] = useState(null);
    const [hasGeometry, setHasGeometry] = useState(false);

    // Símbolos para las geometrías
    const createSymbol = (type) => {
        switch (type) {
            case "point":
                return {
                    type: "simple-marker",
                    color: [255, 0, 0],
                    size: "8px",
                    outline: {
                        color: [255, 255, 255],
                        width: 2,
                    },
                };
            case "polyline":
                return {
                    type: "simple-line",
                    color: [0, 0, 255],
                    width: 3,
                };
            case "polygon":
                return {
                    type: "simple-fill",
                    color: [0, 255, 0, 0.3],
                    outline: {
                        color: [0, 255, 0],
                        width: 2,
                    },
                };
            default:
                return null;
        }
    };

    // Cargar geometría inicial
    const loadInitialGeometry = (layer, view) => {
        if (!initialGeometry) return;

        let graphic;
        const { type, coordinates } = initialGeometry;

        // Convertir coordenadas WGS84 a Web Mercator
        const toWebMercator = (coords, type) => {
            if (type === "Point") {
                const point = new Point({
                    longitude: coords[0],
                    latitude: coords[1],
                    spatialReference: { wkid: 4326 },
                });
                return geographicToWebMercator(point);
            }

            if (type === "LineString") {
                return new Polyline({
                    paths: coords.map(([lon, lat]) => {
                        const point = new Point({ longitude: lon, latitude: lat });
                        return geographicToWebMercator(point).toArray();
                    }),
                    spatialReference: { wkid: 3857 },
                });
            }

            if (type === "Polygon") {
                return new Polygon({
                    rings: coords.map((ring) =>
                        ring.map(([lon, lat]) => {
                            const point = new Point({ longitude: lon, latitude: lat });
                            return geographicToWebMercator(point).toArray();
                        })
                    ),
                    spatialReference: { wkid: 3857 },
                });
            }
        };

        try {
            const geometry = toWebMercator(coordinates, type);
            graphic = new Graphic({
                geometry,
                symbol: createSymbol(type.toLowerCase()),
            });

            layer.add(graphic);
            view.goTo(geometry);
            setHasGeometry(true);
            onGeometryAdded(initialGeometry);
        } catch (error) {
            console.error("Error cargando geometría inicial:", error);
        }
    };

    useEffect(() => {
        if (!mapRef.current) return;

        const map = new Map({
            basemap: "streets-navigation-vector",
            portalItem: {
                id: Webmap,
            },
        });

        const view = new MapView({
            container: mapRef.current,
            map: map,
            center: [-74.0817, 4.6097],
            zoom: 12,
        });

        const layer = new GraphicsLayer();
        map.add(layer);

        // Cargar geometría inicial si existe
        loadInitialGeometry(layer, view);

        const sketchWidget = new Sketch({
            view: view,
            layer: layer,
            creationMode: "update",
            availableCreateTools: ["point", "polyline", "polygon"],
        });

        // view.ui.add(sketchWidget, 'top-right');

        const convertToWGS84 = (geometry) => {
            let coordinates;
            const type = geometry.type.toLowerCase();

            if (type === "point") {
                const wgsPoint = webMercatorToGeographic(geometry);
                coordinates = [wgsPoint.longitude, wgsPoint.latitude];
            } else if (type === "polyline") {
                const path = geometry.paths[0]; // 👈 Solo tomamos la primera ruta
                coordinates = path.map((point) => {
                    const [x, y] = point;
                    const mercatorPoint = new Point({
                        x,
                        y,
                        spatialReference: geometry.spatialReference,
                    });
                    const wgsPoint = webMercatorToGeographic(mercatorPoint);
                    return [wgsPoint.longitude, wgsPoint.latitude];
                });
            } else if (type === "polygon") {
                coordinates = geometry.rings.map((ring) =>
                    ring.map((point) => {
                        const [x, y] = point;
                        const mercatorPoint = new Point({
                            x,
                            y,
                            spatialReference: geometry.spatialReference,
                        });
                        const wgsPoint = webMercatorToGeographic(mercatorPoint);
                        return [wgsPoint.longitude, wgsPoint.latitude];
                    })
                );
            }

            return {
                type: geometry.type,
                coordinates,
            };
        };

        sketchWidget.on("create", (event) => {
            if (event.state === "complete") {
                const geometry = event.graphic.geometry;
                const wgsGeometry = convertToWGS84(geometry);
                onGeometryAdded(wgsGeometry);
                setHasGeometry(true);
            }
        });

        sketchWidget.on("update", (event) => {
            if (event.state === "complete") {
                const geometry = event.graphics[0].geometry;
                const wgsGeometry = convertToWGS84(geometry);
                onGeometryAdded(wgsGeometry);
            }
        });

        layer.on("graphic-remove", () => {
            if (layer.graphics.length === 0) {
                setHasGeometry(false);
                onGeometryAdded(null);
            }
        });

        setView(view);
        setSketch(sketchWidget);
        setGraphicsLayer(layer);

        return () => {
            if (view) {
                view.destroy();
            }
        };
    }, []);

    const clearGraphics = () => {
        if (graphicsLayer) {
            graphicsLayer.removeAll();
            setHasGeometry(false);
            setActiveTool(null);
            onGeometryAdded(null);
        }
    };

    const handleToolClick = (tool) => {
        setActiveTool(tool);
        if (sketch) {
            sketch.create(tool);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => handleToolClick("point")}
                        className={`px-3 py-1 rounded ${activeTool === "point" ? "bg-blue-500 text-white" : "bg-gray-200"
                            }`}
                    >
                        Punto
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToolClick("polyline")}
                        className={`px-3 py-1 rounded ${activeTool === "polyline"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                            }`}
                    >
                        Línea
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToolClick("polygon")}
                        className={`px-3 py-1 rounded ${activeTool === "polygon"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200"
                            }`}
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
            <div ref={mapRef} className="flex-1 w-full h-full mt-4" />
            {/* {required && !hasGeometry && (
                <p className="text-red-500 text-sm">
                    Debe dibujar una geometría en el mapa
                </p>
            )} */}
        </div>
    );
};

export default ArcGISMapDraw;
