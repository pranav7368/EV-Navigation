import {
  ChargerCurrent,
  ChargerStatus,
  ConnectorType,
  PrismaClient,
  UserRole,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const evModels = [
  [
    "Tata",
    "Nexon EV",
    "Empowered LR",
    40.5,
    465,
    7.2,
    50,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Tata",
    "Punch EV",
    "Empowered+ LR",
    35,
    421,
    7.2,
    50,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Mahindra",
    "XUV400",
    "EL Pro 39.4",
    39.4,
    456,
    7.2,
    50,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Mahindra",
    "BE 6",
    "Pack Three",
    79,
    682,
    11,
    175,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "MG",
    "ZS EV",
    "Exclusive Pro",
    50.3,
    461,
    7.4,
    50,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "MG",
    "Windsor EV",
    "Essence",
    38,
    332,
    7.4,
    45,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Hyundai",
    "IONIQ 5",
    "RWD",
    72.6,
    631,
    11,
    220,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Kia",
    "EV6",
    "GT Line RWD",
    77.4,
    708,
    11,
    240,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "BYD",
    "Atto 3",
    "Superior",
    60.48,
    521,
    7,
    80,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Citroën",
    "ë-C3",
    "Shine",
    29.2,
    320,
    3.3,
    30,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Volvo",
    "EX40",
    "Single Motor",
    69,
    592,
    11,
    150,
    [ConnectorType.CCS2, ConnectorType.TYPE_2],
  ],
  [
    "Nissan",
    "Leaf",
    "40 kWh",
    40,
    270,
    6.6,
    50,
    [ConnectorType.CHADEMO, ConnectorType.TYPE_2],
  ],
] as const;

async function seedUsers(): Promise<void> {
  const passwordHash = await bcrypt.hash("Demo@1234", 10);
  await prisma.user.upsert({
    where: { email: "demo@smartev.local" },
    update: {},
    create: { name: "Demo Driver", email: "demo@smartev.local", passwordHash },
  });
  await prisma.user.upsert({
    where: { email: "admin@smartev.local" },
    update: { role: UserRole.ADMIN },
    create: {
      name: "SmartEV Admin",
      email: "admin@smartev.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

async function seedEvs(): Promise<void> {
  for (const [
    manufacturer,
    model,
    variant,
    batteryCapacityKwh,
    ratedRangeKm,
    maxAcChargingKw,
    maxDcChargingKw,
    connectorTypes,
  ] of evModels) {
    await prisma.eVModel.upsert({
      where: { manufacturer_model_variant: { manufacturer, model, variant } },
      update: {},
      create: {
        manufacturer,
        model,
        variant,
        batteryCapacityKwh,
        ratedRangeKm,
        maxAcChargingKw,
        maxDcChargingKw,
        connectorTypes: [...connectorTypes],
      },
    });
  }
}

const start = { latitude: 28.6429, longitude: 77.2197 };
const end = { latitude: 26.9124, longitude: 75.7873 };
const operators = [
  "ChargeZone",
  "Statiq",
  "Tata Power EZ Charge",
  "Jio-bp pulse",
  "Demo Highway Energy",
];

async function seedStations(): Promise<void> {
  for (let index = 0; index < 32; index += 1) {
    const progress = (index + 1) / 34;
    const latitude =
      start.latitude +
      (end.latitude - start.latitude) * progress +
      Math.sin(index * 1.7) * 0.018;
    const longitude =
      start.longitude +
      (end.longitude - start.longitude) * progress +
      Math.cos(index * 1.3) * 0.018;
    const isFast = index % 4 === 1;
    const isSaver = index % 5 === 2;
    const powerKw = isFast ? 120 : isSaver ? 30 : 60;
    const pricePerKwh = isSaver ? 11 : isFast ? 24 : 17 + (index % 3);
    const externalId = `DEMO-NH48-${String(index + 1).padStart(2, "0")}`;
    await prisma.chargingStation.upsert({
      where: { externalId },
      update: { latitude, longitude },
      create: {
        externalId,
        name:
          index === 7
            ? "Manesar HyperCharge Hub"
            : index === 16
              ? "Neemrana ValueCharge Plaza"
              : `NH48 EV Hub ${String(index + 1).padStart(2, "0")}`,
        operator: operators[index % operators.length]!,
        address: `NH 48 milestone ${35 + index * 7}, Delhi–Jaipur Expressway`,
        city:
          index < 11
            ? "Gurugram–Manesar"
            : index < 23
              ? "Neemrana–Kotputli"
              : "Jaipur",
        latitude,
        longitude,
        isDemo: true,
        chargers: {
          create: [
            {
              connectorType: ConnectorType.CCS2,
              currentType: ChargerCurrent.DC,
              powerKw,
              pricePerKwh,
              status: ChargerStatus.OPERATIONAL,
              isDemoStatus: true,
            },
            {
              connectorType: ConnectorType.TYPE_2,
              currentType: ChargerCurrent.AC,
              powerKw: 7.2,
              pricePerKwh: Math.max(9, pricePerKwh - 3),
              status: ChargerStatus.OPERATIONAL,
              isDemoStatus: true,
            },
            ...(index % 6 === 0
              ? [
                  {
                    connectorType: ConnectorType.CHADEMO,
                    currentType: ChargerCurrent.DC,
                    powerKw: 50,
                    pricePerKwh: 19,
                    status: ChargerStatus.OPERATIONAL,
                    isDemoStatus: true,
                  },
                ]
              : []),
          ],
        },
      },
    });
  }
}

async function main(): Promise<void> {
  await seedUsers();
  await seedEvs();
  await seedStations();
  const demo = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@smartev.local" },
  });
  const ev = await prisma.eVModel.findFirstOrThrow({
    where: { manufacturer: "Tata", model: "Nexon EV" },
  });
  await prisma.userVehicle.upsert({
    where: {
      userId_registrationNumber: {
        userId: demo.id,
        registrationNumber: "DL01EV2026",
      },
    },
    update: {},
    create: {
      userId: demo.id,
      evModelId: ev.id,
      nickname: "My Nexon",
      registrationNumber: "DL01EV2026",
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
