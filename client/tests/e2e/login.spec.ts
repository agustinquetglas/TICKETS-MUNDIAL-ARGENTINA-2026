import { test, expect } from '@playwright/test';

test.describe('Flujo de Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  // ─── VISTA LOGIN ───────────────────────────────────────────

  test('debería mostrar el formulario de login por defecto', async ({ page }) => {
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Contraseña"]')).toBeVisible();
    await expect(page.locator('button:has-text("INICIAR SESIÓN")')).toBeVisible();
  });

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.route(/\/usuarios\/login/, async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales inválidas' }),
      });
    });

    await page.fill('input[placeholder="Email"]', 'test@error.com');
    await page.fill('input[placeholder="Contraseña"]', '123456');
    await page.click('button:has-text("INICIAR SESIÓN")');

    await expect(page.locator('.login-msg--error')).toBeVisible({ timeout: 7000 });
    await expect(page.locator('.login-msg--error')).toContainText('Credenciales inválidas');
  });

  test('debería redirigir al home tras un login exitoso', async ({ page }) => {
    await page.route(/\/usuarios\/login/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: { access_token: 'fake-token', refresh_token: 'fake-refresh' }
        }),
      });
    });
    await page.route(/\/auth\/v1\/token/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'fake-token', refresh_token: 'fake-refresh' }),
      });
    });

    await page.fill('input[placeholder="Email"]', 'usuario@test.com');
    await page.fill('input[placeholder="Contraseña"]', 'Password1');
    await page.click('button:has-text("INICIAR SESIÓN")');

    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 10000 });
  });

  test('no debería enviar el formulario con email inválido', async ({ page }) => {
    await page.fill('input[placeholder="Email"]', 'no-es-un-email');
    await page.fill('input[placeholder="Contraseña"]', '123456');
    await page.click('button:has-text("INICIAR SESIÓN")');
    // El navegador bloquea el submit por validación HTML nativa
    await expect(page).toHaveURL(/.*login.*/);
  });

  // ─── VISTA REGISTRO ────────────────────────────────────────

  test('debería cambiar a la vista de registro', async ({ page }) => {
    await page.click('text=¿No tenés cuenta? Registrate');
    await expect(page.locator('input[placeholder="Nombre completo"]')).toBeVisible();
    await expect(page.locator('button:has-text("REGISTRARSE")')).toBeVisible();
  });

  test('debería mostrar todos los campos del formulario de registro', async ({ page }) => {
    await page.click('text=¿No tenés cuenta? Registrate');
    await expect(page.locator('input[placeholder="Nombre completo"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Email"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Contraseña"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Documento"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Teléfono"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('input[placeholder="Localidad"]')).toBeVisible();
  });

  test('debería registrar exitosamente y mostrar mensaje de confirmación', async ({ page }) => {
    await page.route(/\/usuarios\/register/, async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cuenta creada. Revisá tu email para confirmarla.' }),
      });
    });

    await page.click('text=¿No tenés cuenta? Registrate');
    await page.fill('input[placeholder="Nombre completo"]', 'Juan Perez');
    await page.fill('input[placeholder="Email"]', 'juan@test.com');
    await page.fill('input[placeholder="Contraseña"]', 'Password1');
    await page.fill('input[placeholder="Documento"]', '12345678');
    await page.fill('input[placeholder="Teléfono"]', '3412345678');
    await page.selectOption('select', 'Córdoba');
    await page.fill('input[placeholder="Localidad"]', 'Rosario');
    await page.click('button:has-text("REGISTRARSE")');

    await expect(page.locator('.login-msg--ok')).toBeVisible({ timeout: 7000 });
    await expect(page.locator('.login-msg--ok')).toContainText('Revisá tu email');
  });

  test('debería mostrar error si el email ya está registrado', async ({ page }) => {
    await page.route(/\/usuarios\/register/, async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'User already registered' }),
      });
    });

    await page.click('text=¿No tenés cuenta? Registrate');
    await page.fill('input[placeholder="Nombre completo"]', 'Juan Perez');
    await page.fill('input[placeholder="Email"]', 'yaexiste@test.com');
    await page.fill('input[placeholder="Contraseña"]', 'Password1');
    await page.fill('input[placeholder="Documento"]', '12345678');
    await page.fill('input[placeholder="Teléfono"]', '3412345678');
    await page.selectOption('select', 'Córdoba');
    await page.fill('input[placeholder="Localidad"]', 'Rosario');
    await page.click('button:has-text("REGISTRARSE")');

    await expect(page.locator('.login-msg--error')).toBeVisible({ timeout: 7000 });
  });

  test('debería volver al login desde el registro', async ({ page }) => {
    await page.click('text=¿No tenés cuenta? Registrate');
    await page.click('text=Ya tengo cuenta. Iniciar sesión');
    await expect(page.locator('button:has-text("INICIAR SESIÓN")')).toBeVisible();
  });

  // ─── VISTA OLVIDE CONTRASEÑA ───────────────────────────────

  test('debería cambiar a la vista de olvidé contraseña', async ({ page }) => {
    await page.click('text=Olvidé mi contraseña');
    await expect(page.locator('button:has-text("ENVIAR EMAIL")')).toBeVisible();
  });

  test('debería enviar email de recuperación exitosamente', async ({ page }) => {
    await page.route(/\/usuarios\/forgot-password/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Listo. Revisá tu email para restablecer la contraseña.' }),
      });
    });

    await page.click('text=Olvidé mi contraseña');
    await page.fill('input[placeholder="Email"]', 'usuario@test.com');
    await page.click('button:has-text("ENVIAR EMAIL")');

    await expect(page.locator('.login-msg--ok')).toBeVisible({ timeout: 7000 });
    await expect(page.locator('.login-msg--ok')).toContainText('Revisá tu email');
  });

  test('debería volver al login desde olvidé contraseña', async ({ page }) => {
    await page.click('text=Olvidé mi contraseña');
    await page.click('text=Volver al login');
    await expect(page.locator('button:has-text("INICIAR SESIÓN")')).toBeVisible();
  });

});
