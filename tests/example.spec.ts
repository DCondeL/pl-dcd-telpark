import { expect, test } from '@playwright/test';

import {
  closeErrorModalIfVisible,
  expectCostBreakdown,
  fillPersonalDataForm,
  HOME_URL,
  mockCountries,
  mockFirstAmountRate,
  mockOrderSummary,
  mockParkingDetail,
  mockParkingSearch,
  PAYMENT_DATA_URL,
  PERSONAL_DATA_URL,
  runSearch,
  seedStateForPayment,
  seedStateForSearch,
  setupGoogleMapsStub,
} from './helpers';

test.describe('Empark Abonos - Flujos críticos', () => {
  test('Búsqueda de parking y selección de abono con precio esperado', async ({ page }) => {
    await seedStateForSearch(page);
    await setupGoogleMapsStub(page);
    await mockParkingSearch(page);
    await mockParkingDetail(page);

    await page.goto(HOME_URL);
    await runSearch(page);

    await expect(page).toHaveURL(/\/map/);
    await page.getByRole('button', { name: 'Seleccionar' }).first().click();
    await expect(page.getByText('Tipos de abono')).toBeVisible();
    await expect(page.getByText('Abono Mensual 24H')).toBeVisible();
    await expect(page.getByText(/95\s*€/).first()).toBeVisible();
  });

  test('Flujo pasarela de pago con confirmación y coste esperado', async ({ page }) => {
    await seedStateForPayment(page);
    await setupGoogleMapsStub(page);
    await mockCountries(page);
    await mockOrderSummary(page);
    await mockFirstAmountRate(page);

    await page.goto(PERSONAL_DATA_URL);
    await expect(page.getByRole('heading', { name: 'Datos personales' })).toBeVisible();
    await fillPersonalDataForm(page);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page).toHaveURL(/\/payment-proccess\/payment-data/);
    await expect(page.getByRole('heading', { name: 'Pago' })).toBeVisible();
    await expect(page.getByText('Introduce tu tarjeta de crédito')).toBeVisible();
    await expect(page.getByText('Pagar con tarjeta de credito')).toBeVisible();

    await closeErrorModalIfVisible(page);
    await page.goto(PAYMENT_DATA_URL);
    await closeErrorModalIfVisible(page);
    await expectCostBreakdown(page);
    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page).toHaveURL(/\/payment-proccess\/confirm-ok/);
    await expect(page.getByText('¡Compra efectuada correctamente!')).toBeVisible();
    await expect(page.getByText('Ya tienes tu abono')).toBeVisible();
  });
});
