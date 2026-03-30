import { expect, type Page } from '@playwright/test';

export const HOME_URL = 'https://test.abonos.empark.com/home/es/es';
export const PERSONAL_DATA_URL = 'https://test.abonos.empark.com/payment-proccess/personal-data';
export const PAYMENT_DATA_URL =
  'https://test.abonos.empark.com/payment-proccess/payment-data?hash=hash-ok';

export const MOCK_PARKINGS = [
  {
    idAparcamiento: 101,
    name: 'Parking Plaza Galicia',
    city: 'A Coruña',
    address: 'Praza de Galicia, 15004 A Coruña',
    countryCode: 'ES',
    coordenadas: { latitud: 43.3671, longitud: -8.4048 },
    tarifasList: [
      {
        descripcion: 'Abono Mensual 24H',
        descripcionProducto: 'Abono Mensual 24H',
        precio: 120,
        precioConDescuento: 95,
        fechaFinDescuento: '2099-12-31',
        fechaInicio: '2099-12-20',
        scheduleList: ['L-V 00:00-23:59', 'S-D 00:00-23:59'],
      },
    ],
  },
];

export async function setupGoogleMapsStub(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as any).__fakeAutocompleteInstances = [];

    class LatLng {
      private readonly _lat: number;
      private readonly _lng: number;

      constructor(lat: number, lng: number) {
        this._lat = Number(lat);
        this._lng = Number(lng);
      }

      lat(): number {
        return this._lat;
      }

      lng(): number {
        return this._lng;
      }
    }

    class FakeMap {
      private readonly center: LatLng;
      private readonly zoom: number;

      constructor(_element: Element, options?: { center?: LatLng; zoom?: number }) {
        this.center = options?.center ?? new LatLng(43.3623, -8.4115);
        this.zoom = options?.zoom ?? 12;
      }

      addListener(eventName?: string, cb?: () => void): { remove: () => void } {
        if (eventName === 'dragend' && typeof cb === 'function') {
          setTimeout(() => cb(), 0);
        }
        return { remove: () => undefined };
      }

      getCenter(): LatLng {
        return this.center;
      }

      getZoom(): number {
        return this.zoom;
      }

      getBounds(): { getNorthEast: () => LatLng; getSouthWest: () => LatLng } {
        return {
          getNorthEast: () => new LatLng(this.center.lat() + 0.05, this.center.lng() + 0.05),
          getSouthWest: () => new LatLng(this.center.lat() - 0.05, this.center.lng() - 0.05),
        };
      }
    }

    class Autocomplete {
      private readonly input: HTMLInputElement;
      private placeChangedCb: (() => void) | undefined;

      constructor(input: HTMLInputElement) {
        this.input = input;
        (window as any).__fakeAutocompleteInstances.push(this);
      }

      addListener(eventName: string, cb: () => void): void {
        if (eventName !== 'place_changed') {
          return;
        }
        this.placeChangedCb = cb;
        this.input.addEventListener(
          'keydown',
          (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
              this.placeChangedCb?.();
            }
          },
          true
        );
      }

      getPlace() {
        const value = this.input.value || 'A Coruña, La Coruña, España';
        return {
          name: value,
          formatted_address: value,
          geometry: { location: new LatLng(43.3623, -8.4115) },
          address_components: [{ long_name: 'A Coruña', types: ['locality'] }],
        };
      }
    }

    const googleObj = (window as any).google ?? {};
    googleObj.maps = googleObj.maps ?? {};
    googleObj.maps.places = googleObj.maps.places ?? {};
    googleObj.maps.places.Autocomplete = Autocomplete;
    googleObj.maps.places.AutocompleteService = class AutocompleteService {
      getQueryPredictions(
        _request: unknown,
        cb: (predictions: Array<{ place_id: string }>, status: string) => void
      ): void {
        cb([{ place_id: 'fake-place-id' }], 'OK');
      }
    };
    googleObj.maps.places.PlacesServiceStatus = { OK: 'OK' };
    googleObj.maps.places.PlacesService = class PlacesService {
      constructor(_element: Element) {}

      getDetails(
        _request: unknown,
        cb: (place: unknown, status: string) => void
      ): void {
        cb(
          {
            name: 'A Coruña, La Coruña, España',
            formatted_address: 'A Coruña, La Coruña, España',
            geometry: { location: new LatLng(43.3623, -8.4115) },
            address_components: [{ long_name: 'A Coruña', types: ['locality'] }],
          },
          'OK'
        );
      }
    };
    googleObj.maps.LatLng = LatLng;
    googleObj.maps.Map = FakeMap;
    googleObj.maps.Marker = class Marker {
      constructor(_options?: unknown) {}

      setMap(_map: unknown): void {}

      addListener(_eventName: string, _cb: () => void): { remove: () => void } {
        return { remove: () => undefined };
      }
    };
    googleObj.maps.Point = class Point {
      x: number;
      y: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
    };
    googleObj.maps.event = {
      clearInstanceListeners: () => undefined,
    };
    (window as any).google = googleObj;
  });

  await page.route('https://maps.googleapis.com/**', (route) => route.abort());
}

export async function mockParkingSearch(page: Page): Promise<void> {
  await page.route('https://apitest.abonos.empark.com/r/aparcamiento', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_PARKINGS),
    });
  });
}

export async function mockParkingDetail(page: Page): Promise<void> {
  await page.route(
    /https:\/\/apitest\.abonos\.empark\.com\/r\/aparcamiento\/\d+\/[A-Za-z]+$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PARKINGS[0]),
      });
    }
  );

  await page.route(
    /https:\/\/apitest\.abonos\.empark\.com\/r\/conditions\/\d+\/[A-Za-z]+$/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<p>Términos y condiciones de prueba</p>',
      });
    }
  );
}

export async function mockCountries(page: Page): Promise<void> {
  await page.route('https://apitest.abonos.empark.com/r/countries/ES', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ iso2: 'ES', name: 'España' }]),
    });
  });
}

export async function mockOrderSummary(page: Page): Promise<void> {
  await page.route('**/r/ordersummary/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        parking: {
          name: 'Parking Plaza Galicia',
          address: 'Praza de Galicia, 15004 A Coruña',
        },
        tarifa: {
          descripcion: 'Abono Mensual 24H',
          fechaInicio: '2099-12-20',
        },
        personalData: {
          nombreCliente: 'Juan',
          apellidos: 'Pérez',
          email: 'qa.empark@example.com',
          matricula: '1234ABC',
        },
        amount: {
          primerPago: 20,
          precioDescuento: 95,
          precioNormal: 120,
          fechaMax: '2099-12-31',
          fechaMaxPrecioDecuento: '2099-12-31',
        },
      }),
    });
  });
}

export async function mockFirstAmountRate(page: Page): Promise<void> {
  await page.route('https://apitest.abonos.empark.com/firstamountrate', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        primerPago: 20,
        precioDescuento: 95,
        precioNormal: 120,
        fechaMax: '2099-12-31',
        fechaMaxPrecioDecuento: '2099-12-31',
      }),
    });
  });
}

export async function seedStateForSearch(page: Page): Promise<void> {
  await page.addInitScript((parkings) => {
    localStorage.setItem(
      'state',
      JSON.stringify({
        loading: false,
        search: false,
        lan: 'ES',
        coordinates: {
          name: 'A Coruña',
          address: 'A Coruña, La Coruña, España',
          lat: 43.3623,
          lng: -8.4115,
          city: 'A Coruña',
        },
        parkings,
        parking: parkings[0],
      })
    );
  }, MOCK_PARKINGS);
}

export async function seedStateForPayment(page: Page): Promise<void> {
  await page.addInitScript((parkings) => {
    localStorage.setItem(
      'state',
      JSON.stringify({
        loading: false,
        search: false,
        lan: 'ES',
        coordinates: {
          name: 'A Coruña',
          address: 'A Coruña, La Coruña, España',
          lat: 43.3623,
          lng: -8.4115,
          city: 'A Coruña',
        },
        parkings,
        parking: parkings[0],
        fare: {
          descripcion: 'Abono Mensual 24H',
          descripcionProducto: 'Abono Mensual 24H',
          precio: 120,
          precioConDescuento: 95,
          fechaFinDescuento: '2099-12-31',
          fechaInicio: '2099-12-20',
        },
      })
    );
  }, MOCK_PARKINGS);
}

export async function runSearch(page: Page): Promise<void> {
  const searchInput = page.getByPlaceholder('Introduce una ubicación');
  await searchInput.click();
  await searchInput.fill('A Coruña, La Coruña, España');
  await page.evaluate(() => {
    const instances = (window as any).__fakeAutocompleteInstances ?? [];
    for (const instance of instances) {
      if (typeof instance.placeChangedCb === 'function') {
        instance.placeChangedCb();
      }
    }
  });
  await page.getByRole('button', { name: 'Buscar' }).click();
}

export async function closeErrorModalIfVisible(page: Page): Promise<void> {
  const errorModal = page.locator('ngb-modal-window');
  if (await errorModal.isVisible()) {
    const closeButton = errorModal.getByRole('button', { name: /close/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await expect(errorModal).toBeHidden();
    }
  }
}

export async function fillPersonalDataForm(page: Page): Promise<void> {
  await page.locator('#txtName').fill('Juan');
  await page.locator('#txtSurName').fill('Pérez');
  await page.locator('#txtNif').fill('12345678Z');
  await page.locator('#phone_number').fill('612345678');
  await page.locator('#txtAddress').fill('Calle Mayor 1');
  await page.locator('#txtPostal').fill('15001');
  await page.locator('#txtCity').fill('A Coruña');
  await page.evaluate(() => {
    const countrySelect = document.querySelector('#cmbCountry') as HTMLSelectElement | null;
    if (!countrySelect) {
      return;
    }
    if (!countrySelect.querySelector('option[value="ES"]')) {
      const option = document.createElement('option');
      option.value = 'ES';
      option.text = 'España';
      countrySelect.appendChild(option);
    }
    countrySelect.value = 'ES';
    countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.locator('#txtVehicle').fill('1234ABC');
  await page.locator('#txtEmail').fill('qa.empark@example.com');
  await page.locator('#txtEmailConfirm').fill('qa.empark@example.com');
  await page.locator('label[for="ch-data"]').click();
}

export async function expectCostBreakdown(page: Page): Promise<void> {
  await expect(page.getByText(/20\s*€\s*\/mes/).first()).toBeVisible();
  await expect(page.getByText(/95\s*€\s*\/mes/).first()).toBeVisible();
  await expect(page.getByText(/120\s*€\s*\/mes/).first()).toBeVisible();
}
