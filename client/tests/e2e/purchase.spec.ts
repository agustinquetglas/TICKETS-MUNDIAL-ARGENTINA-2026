import { test, expect } from '@playwright/test';

const SUPABASE_KEY = 'sb-zgapcaehmhnqdbfwogxt-auth-token';

const mockSession = {
  access_token: 'fake-token',
  refresh_token: 'fake-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: 'user-123',
    email: 'test@test.com',
    aud: 'authenticated',
    role: 'authenticated',
    user_metadata: {},
    app_metadata: { provider: 'email' },
  },
};

const mockSectores = [
  { id: 'sec-1', nombre_sector: 'VIP', precio_sector: 300, Stock: 10, partido_id: 1 },
  { id: 'sec-2', nombre_sector: 'Popular', precio_sector: 50, Stock: 50, partido_id: 1 },
];

test.describe('Flujo de Compra de Entradas', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ key, session }) => { window.localStorage.setItem(key, JSON.stringify(session)); },
      { key: SUPABASE_KEY, session: mockSession }
    );
    await page.route(/\/sectores\/1/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSectores),
      });
    });
    await page.route(/\/auth\/v1\/user/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession.user),
      });
    });
  });

  test('debería cargar y mostrar los sectores disponibles', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    const selector = page.locator('#sector');
    await expect(selector).toBeVisible({ timeout: 5000 });

    const opciones = selector.locator('option');
    await expect(opciones).toHaveCount(2);
  });

  test('debería mostrar el precio del sector seleccionado', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=USD 300')).toBeVisible({ timeout: 5000 });
  });

  test('debería actualizar el precio al cambiar de sector', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.locator('#sector').selectOption({ label: 'Popular' });
    await expect(page.locator('text=USD 50')).toBeVisible();
  });

  test('debería incrementar la cantidad de entradas', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("+")');
    await expect(page.locator('.cantidad-numero')).toHaveText('2');

    await page.click('button:has-text("+")');
    await expect(page.locator('.cantidad-numero')).toHaveText('3');
  });

  test('debería decrementar la cantidad pero no bajar de 1', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("−")');
    await expect(page.locator('.cantidad-numero')).toHaveText('1');
  });

  test('no debería superar 6 entradas', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("+")');
    }
    await expect(page.locator('.cantidad-numero')).toHaveText('6');
  });

  test('debería redirigir a MercadoPago al comprar con éxito', async ({ page }) => {
    await page.route('**/tickets/comprar', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ urlPago: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123' }),
      });
    });

    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("CONTINUAR")');

    await page.waitForURL(/mercadopago\.com/, { timeout: 10000 });
    expect(page.url()).toContain('mercadopago.com');
  });

  test('no debería permitir la compra si no hay stock', async ({ page }) => {
    await page.route('**/tickets/comprar', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Stock insuficiente. Solo quedan 0 entradas disponibles en ese sector.' }),
      });
    });

    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("CONTINUAR")');

    await expect(page.locator('.compra-msg--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.compra-msg--error')).toContainText('Stock insuficiente');
  });

  test('no debería permitir la compra si el usuario no tiene suficiente saldo', async ({ page }) => {
    await page.route('**/tickets/comprar', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Saldo insuficiente. Tu saldo actual es de USD 100 y el total es USD 300.' }),
      });
    });

    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("CONTINUAR")');

    await expect(page.locator('.compra-msg--error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.compra-msg--error')).toContainText('Saldo insuficiente');
  });

  test('debería redirigir al login si el usuario no está autenticado', async ({ page }) => {
    await page.route(/\/auth\/v1\/user/, async route => {
      await route.fulfill({ status: 401, body: JSON.stringify({ error: 'unauthorized' }) });
    });
    await page.addInitScript(() => { window.localStorage.clear(); });

    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("CONTINUAR")');

    await expect(page).toHaveURL(/.*login.*/, { timeout: 5000 });
  });

  test('debería poder cancelar y volver atrás', async ({ page }) => {
    await page.goto('/entradas?partido_id=1');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("CANCELAR")');
    await expect(page).not.toHaveURL(/.*entradas.*/);
  });

});
