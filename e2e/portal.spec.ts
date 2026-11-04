import { expect, test } from '@playwright/test';

test('redirects unauthenticated visitors to the login form', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
  await expect(page.getByLabel('Email doanh nghiệp')).toBeVisible();
  await expect(page.getByLabel('Mật khẩu')).toBeVisible();
});

test('keeps the operations route usable for unauthenticated visitors', async ({ page }) => {
  await page.goto('/operations');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
});
