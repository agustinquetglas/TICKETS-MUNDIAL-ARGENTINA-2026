import { test, expect } from '@playwright/test';

beforeEach(async ({ page }) => {
  await page.goto('/');
 
  await page.evaluate(() => {
    localStorage.setItem('user_email', 'test@test.com');
  });
  await page.reload(); 
});

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

const mockPartidos = [
  { id: 1, equipo_a: 'ARGENTINA', equipo_b: 'ARGELIA', fecha: '2026-06-16T22:00:00Z', precio_base: 50 },
  { id: 2, equipo_a: 'ARGENTINA', equipo_b: 'AUSTRIA', fecha: '2026-06-22T14:00:00Z', precio_base: 50 },
];

test.describe('Página Principal - Sin sesión', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/partidos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPartidos),
      });
    });
  });

  test('debería mostrar el título de partidos disponibles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2')).toContainText('Partidos Disponibles');
  });

  test('debería mostrar las cards de partidos al cargar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Cargando partidos...')).not.toBeVisible({ timeout: 5000 });
    const cards = page.locator('.grid > div');
    await expect(cards).toHaveCount(2);
  });

  test('debería mostrar los nombres de los equipos', async ({ page }) => {
    await page.goto('/');
    // Usar .first() para evitar el error de strict mode con múltiples elementos
    await expect(page.locator('text=ARGENTINA').first()).toBeVisible();
    await expect(page.locator('text=ARGELIA').first()).toBeVisible();
  });

  test('debería mostrar el botón de ingresar cuando no hay sesión', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Ingresar')).toBeVisible();
  });

  test('debería redirigir a /login al hacer click en Ingresar', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Ingresar');
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('debería mostrar mensaje cuando no hay partidos disponibles', async ({ page }) => {
    await page.route('**/partidos', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await page.goto('/');
    await expect(page.locator('text=No hay partidos disponibles.')).toBeVisible();
  });

  test('debería tener el botón CONSEGUÍ TU ENTRADA en cada partido', async ({ page }) => {
    await page.goto('/');
    const botones = page.locator('button:has-text("CONSEGUÍ TU ENTRADA")');
    await expect(botones).toHaveCount(2);
  });

  test('debería navegar a /entradas al clickear un partido', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("CONSEGUÍ TU ENTRADA")').first().click();
    await expect(page).toHaveURL(/.*entradas.*/);
  });

});

test.describe('Página Principal - Con sesión', () => {

  test.beforeEach(async ({ page }) => {
    // UserMenu usa localStorage('user_email'), no Supabase Auth
    await page.addInitScript(
      ({ key, session, email }) => {
        window.localStorage.setItem(key, JSON.stringify(session));
        window.localStorage.setItem('user_email', email);
      },
      { key: SUPABASE_KEY, session: mockSession, email: 'test@test.com' }
    );
    await page.route('**/partidos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPartidos),
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

  test('debería mostrar el avatar del usuario cuando hay sesión activa', async ({ page }) => {
    await page.goto('/');
    // El UserMenu muestra un avatar con la inicial, no "Cerrar sesión" directamente
    await expect(page.locator('.user-avatar-btn')).toBeVisible({ timeout: 5000 });
  });

  test('debería mostrar el menú al clickear el avatar', async ({ page }) => {
    await page.goto('/');
    await page.click('.user-avatar-btn');
    await expect(page.locator('text=Cerrar sesión')).toBeVisible({ timeout: 5000 });
  });

  test('debería cerrar sesión al clickear Cerrar sesión', async ({ page }) => {
    await page.route(/\/auth\/v1\/logout/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/');
    // Abrir el dropdown primero
    await page.click('.user-avatar-btn');
    await page.click('text=Cerrar sesión');
    // Después de cerrar sesión redirige a /login
    await expect(page).toHaveURL(/.*login.*/, { timeout: 5000 });
  });

  test('debería mostrar link a Mis entradas en el menú', async ({ page }) => {
    await page.goto('/');
    await page.click('.user-avatar-btn');
    await expect(page.locator('text=Mis entradas')).toBeVisible({ timeout: 5000 });
  });

});