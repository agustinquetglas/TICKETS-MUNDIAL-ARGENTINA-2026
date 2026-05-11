import { test, expect } from '@playwright/test';

test.describe('Pago Exitoso', () => {

  test('debería mostrar mensaje de pago exitoso', async ({ page }) => {
    await page.route(/\/tickets\/confirmar\/.*/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/pago-exitoso?payment_id=12345');
    await expect(page.locator('text=¡Pago exitoso!')).toBeVisible({ timeout: 5000 });
  });

  test('debería confirmar el pago en el backend con el payment_id', async ({ page }) => {
    let urlConfirmada = '';
    await page.route(/\/tickets\/confirmar\/.*/, async route => {
      urlConfirmada = route.request().url();
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/pago-exitoso?payment_id=12345');
    await page.waitForLoadState('networkidle');

    expect(urlConfirmada).toContain('12345');
  });

  test('debería mostrar mensaje de confirmación después de confirmar', async ({ page }) => {
    await page.route(/\/tickets\/confirmar\/.*/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/pago-exitoso?payment_id=12345');
    await expect(page.locator('text=Tu entrada fue confirmada')).toBeVisible({ timeout: 5000 });
  });

  test('debería tener botón para ir a Mis Entradas', async ({ page }) => {
    await page.route(/\/tickets\/confirmar\/.*/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/pago-exitoso?payment_id=12345');
    await page.click('text=Mis Entradas');
    await expect(page).toHaveURL(/.*compras-realizadas.*/);
  });

  test('debería tener botón para volver al inicio', async ({ page }) => {
    await page.route(/\/tickets\/confirmar\/.*/, async route => {
      await route.fulfill({ status: 200, body: '{}' });
    });

    await page.goto('/pago-exitoso?payment_id=12345');
    await page.click('text=Inicio');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

});
