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

const mockPedidos = [
  {
    id: 'pedido-abc-123',
    fecha_compra: '2026-05-01T19:41:45Z',
    estado_pago: 'PAGADO',
    monto_total: 300,
    Tickets: [{
      id: 'ticket-1',
      Partidos: { equipo_a: 'ARGENTINA', equipo_b: 'ARGELIA' }
    }]
  },
  {
    id: 'pedido-def-456',
    fecha_compra: '2026-05-03T10:00:00Z',
    estado_pago: 'PENDIENTE',
    monto_total: 150,
    Tickets: [{
      id: 'ticket-2',
      Partidos: { equipo_a: 'ARGENTINA', equipo_b: 'AUSTRIA' }
    }]
  }
];

test.describe('Mis Entradas', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ key, session }) => { window.localStorage.setItem(key, JSON.stringify(session)); },
      { key: SUPABASE_KEY, session: mockSession }
    );
    await page.route(/\/auth\/v1\/user/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockSession.user),
      });
    });
    await page.route(/\/tickets\/sincronizar-pagos\/.*/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });
  });

  test('debería mostrar el título MIS ENTRADAS', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPedidos) });
    });
    await page.goto('/compras-realizadas');
    await expect(page.locator('text=MIS ENTRADAS')).toBeVisible();
  });

  test('debería mostrar los pedidos del usuario', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPedidos) });
    });
    await page.goto('/compras-realizadas');
    await expect(page.locator('text=ARGENTINA vs ARGELIA')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=ARGENTINA vs AUSTRIA')).toBeVisible();
  });

  test('debería mostrar estado PENDIENTE', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPedidos) });
    });
    await page.goto('/compras-realizadas');
    await expect(page.locator('text=PENDIENTE')).toBeVisible({ timeout: 5000 });
  });

  test('debería mostrar link al comprobante para pedidos PAGADO', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPedidos) });
    });
    await page.goto('/compras-realizadas');
    // Usar getByRole para ser específico con el link, no el header de columna
    await expect(page.getByRole('link', { name: 'comprobante' })).toBeVisible({ timeout: 5000 });
  });

  test('debería mostrar mensaje cuando no hay entradas', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/compras-realizadas');
    await expect(page.locator('text=No tenés entradas compradas aún.')).toBeVisible({ timeout: 5000 });
  });

  test('debería mostrar error si el usuario no está logueado', async ({ page }) => {
    await page.route(/\/auth\/v1\/user/, async route => {
      await route.fulfill({ status: 401, body: JSON.stringify({ error: 'unauthorized' }) });
    });
    await page.addInitScript(() => { window.localStorage.clear(); });

    await page.goto('/compras-realizadas');
    await expect(page.locator('text=Debés iniciar sesión')).toBeVisible({ timeout: 5000 });
  });

  test('debería tener un botón para volver al inicio', async ({ page }) => {
    await page.route(/\/tickets\/mis-entradas\/.*/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/compras-realizadas');
    await page.click('text=Volver');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

});