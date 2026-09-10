"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { Coordinate, RankedCandidate } from "@smartev/shared";

function FitRoute({ route }: { route: Coordinate[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length > 1)
      map.fitBounds(
        route.map((point) => [point.latitude, point.longitude]),
        { padding: [28, 28] },
      );
  }, [map, route]);
  return null;
}

export default function MapView({
  route,
  stations = [],
  recommendedId,
}: {
  route: Coordinate[];
  stations?: RankedCandidate[];
  recommendedId?: string;
}) {
  const center = route[0] ?? { latitude: 28.6139, longitude: 77.209 };
  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={8}
      zoomControl={false}
      scrollWheelZoom
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={route.map((point) => [point.latitude, point.longitude])}
        pathOptions={{ color: "#0d6f48", weight: 5, opacity: 0.9 }}
      />
      {route[0] && (
        <CircleMarker
          center={[route[0].latitude, route[0].longitude]}
          radius={7}
          pathOptions={{
            color: "#07130f",
            fillColor: "#b7f34a",
            fillOpacity: 1,
          }}
        >
          <Popup>Journey start</Popup>
        </CircleMarker>
      )}
      {route.at(-1) && (
        <CircleMarker
          center={[route.at(-1)!.latitude, route.at(-1)!.longitude]}
          radius={7}
          pathOptions={{
            color: "#07130f",
            fillColor: "#ffffff",
            fillOpacity: 1,
          }}
        >
          <Popup>Destination</Popup>
        </CircleMarker>
      )}
      {stations.map((station) => (
        <CircleMarker
          key={station.id}
          center={[station.coordinate.latitude, station.coordinate.longitude]}
          radius={station.id === recommendedId ? 10 : 6}
          pathOptions={{
            color: station.id === recommendedId ? "#07130f" : "#39765a",
            weight: 2,
            fillColor: station.id === recommendedId ? "#b7f34a" : "#76e5b1",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>{station.name}</strong>
            <br />
            {station.charger.powerKw} kW · ₹{station.charger.pricePerKwh}/kWh
            <br />
            Arrival {station.arrivalSoc.toFixed(0)}% SOC
          </Popup>
        </CircleMarker>
      ))}
      <FitRoute route={route} />
    </MapContainer>
  );
}
