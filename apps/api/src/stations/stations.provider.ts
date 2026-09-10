import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ChargerOption, Coordinate } from "@smartev/shared";
import { PrismaService } from "../prisma/prisma.service";

export interface ProviderStation {
  id: string;
  name: string;
  operator: string;
  address: string;
  coordinate: Coordinate;
  chargers: ChargerOption[];
  isDemo: boolean;
}
export interface ChargingStationProvider {
  findNearRoute(
    center: Coordinate,
    radiusKm: number,
  ): Promise<ProviderStation[]>;
}

export const CHARGING_STATION_PROVIDER = Symbol("CHARGING_STATION_PROVIDER");

@Injectable()
export class DatabaseChargingStationProvider implements ChargingStationProvider {
  constructor(private readonly prisma: PrismaService) {}
  async findNearRoute(
    center: Coordinate,
    radiusKm: number,
  ): Promise<ProviderStation[]> {
    const latitudeDelta = radiusKm / 111;
    const longitudeDelta =
      radiusKm / (111 * Math.cos((center.latitude * Math.PI) / 180));
    const stations = await this.prisma.chargingStation.findMany({
      where: {
        isActive: true,
        latitude: {
          gte: center.latitude - latitudeDelta,
          lte: center.latitude + latitudeDelta,
        },
        longitude: {
          gte: center.longitude - longitudeDelta,
          lte: center.longitude + longitudeDelta,
        },
      },
      include: { chargers: true },
    });
    return stations.map((station) => ({
      id: station.id,
      name: station.name,
      operator: station.operator,
      address: station.address,
      coordinate: { latitude: station.latitude, longitude: station.longitude },
      isDemo: station.isDemo,
      chargers: station.chargers.map((charger) => ({
        id: charger.id,
        connectorType: charger.connectorType,
        currentType: charger.currentType,
        powerKw: charger.powerKw,
        pricePerKwh: charger.pricePerKwh,
        status: charger.status,
      })),
    }));
  }
}

interface OpenChargeMapRecord {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1?: string;
    Latitude: number;
    Longitude: number;
  };
  OperatorInfo?: { Title?: string };
  Connections?: Array<{
    ID: number;
    PowerKW?: number;
    ConnectionType?: { Title?: string };
    CurrentType?: { Title?: string };
    StatusType?: { ID?: number };
  }>;
}

@Injectable()
export class OpenChargeMapProvider implements ChargingStationProvider {
  constructor(private readonly config: ConfigService) {}

  async findNearRoute(
    center: Coordinate,
    radiusKm: number,
  ): Promise<ProviderStation[]> {
    const apiKey = this.config.get<string>("OPEN_CHARGE_MAP_API_KEY");
    if (!apiKey) return [];
    const base = this.config.get(
      "OPEN_CHARGE_MAP_BASE_URL",
      "https://api.openchargemap.io/v3",
    );
    const timeout = this.config.get<number>("planning.providerTimeoutMs", 4500);
    const query = new URLSearchParams({
      output: "json",
      latitude: String(center.latitude),
      longitude: String(center.longitude),
      distance: String(radiusKm),
      distanceunit: "KM",
      maxresults: "100",
      compact: "true",
      verbose: "false",
      key: apiKey,
    });
    const response = await fetch(`${base}/poi?${query}`, {
      signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok)
      throw new Error(`Open Charge Map returned ${response.status}`);
    const records = (await response.json()) as OpenChargeMapRecord[];
    return records.map((record) => ({
      id: `ocm-${record.ID}`,
      name: record.AddressInfo.Title,
      operator: record.OperatorInfo?.Title ?? "Unknown operator",
      address: record.AddressInfo.AddressLine1 ?? "",
      coordinate: {
        latitude: record.AddressInfo.Latitude,
        longitude: record.AddressInfo.Longitude,
      },
      isDemo: false,
      chargers: (record.Connections ?? []).flatMap((connection) => {
        const connectorType = this.connector(
          connection.ConnectionType?.Title ?? "",
        );
        const powerKw = connection.PowerKW ?? 0;
        if (!connectorType || powerKw <= 0) return [];
        const currentType =
          connection.CurrentType?.Title?.toLowerCase().includes("dc") ||
          powerKw > 22
            ? "DC"
            : "AC";
        return [
          {
            id: `ocm-connection-${connection.ID}`,
            connectorType,
            currentType,
            powerKw,
            pricePerKwh: 18,
            status:
              connection.StatusType?.ID === 50 ? "OPERATIONAL" : "UNKNOWN",
          },
        ];
      }),
    }));
  }

  private connector(title: string): ChargerOption["connectorType"] | null {
    const value = title.toLowerCase();
    if (value.includes("ccs") || value.includes("combo")) return "CCS2";
    if (value.includes("chademo")) return "CHADEMO";
    if (value.includes("type 2") || value.includes("mennekes")) return "TYPE_2";
    if (value.includes("gb/t")) return "GB_T";
    if (value.includes("bharat")) return "BHARAT_DC001";
    return null;
  }
}

@Injectable()
export class ResilientChargingStationProvider implements ChargingStationProvider {
  constructor(
    private readonly database: DatabaseChargingStationProvider,
    private readonly openChargeMap: OpenChargeMapProvider,
  ) {}

  async findNearRoute(
    center: Coordinate,
    radiusKm: number,
  ): Promise<ProviderStation[]> {
    try {
      const curated = await this.database.findNearRoute(center, radiusKm);
      if (curated.length) return curated;
    } catch {
      // The next provider keeps the overall planning flow available.
    }
    try {
      return await this.openChargeMap.findNearRoute(center, radiusKm);
    } catch {
      return [];
    }
  }
}
