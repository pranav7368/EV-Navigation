import { expect, test } from "@playwright/test";

test("login → select EV → create trip → display recommendation", async ({
  page,
}) => {
  await page.route("**/api/auth/login", async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "e2e-token",
        user: { name: "Demo Driver" },
      }),
    }),
  );
  await page.route("**/api/ev-models", async (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "demo-nexon",
          manufacturer: "Tata",
          model: "Nexon EV",
          variant: "Empowered LR",
          batteryCapacityKwh: 40.5,
          ratedRangeKm: 465,
          maxAcChargingKw: 7.2,
          maxDcChargingKw: 50,
          connectorTypes: ["CCS2", "TYPE_2"],
        },
      ]),
    }),
  );
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole("combobox").selectOption("demo-nexon");
  await page.getByRole("button", { name: "FASTEST" }).click();
  await page.getByRole("button", { name: /Plan my trip/ }).click();
  await expect(page.getByTestId("trip-results")).toBeVisible();
  await expect(page.getByText("Manesar HyperCharge Hub").first()).toBeVisible();
  await expect(page.getByText(/Recommended because its 120 kW/)).toBeVisible();
});
