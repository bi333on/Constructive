import { expect, test } from "@playwright/test";

test("полный сценарий: редактор → автосохранение → публикация", async ({ page }) => {
  // 1. Редактор открывается с пустым состоянием
  await page.goto("/");
  await expect(page.getByText("Страница пуста")).toBeVisible();

  // 2. Задаём название страницы
  await page.getByPlaceholder("Название страницы").fill("E2E Страница");

  // 3. Добавляем блок Hero из палитры
  await page.getByRole("button", { name: "Обложка (Hero)" }).first().click();
  await expect(page.locator("h1")).toContainText("Заголовок вашего сайта");

  // 4. Ждём автосохранения
  await expect(page.getByText("Сохранено")).toBeVisible({ timeout: 10_000 });

  // 5. Страница появилась в дашборде
  await page.goto("/dashboard");
  await expect(page.getByText("E2E Страница")).toBeVisible();

  // 6. Публикуем
  await page.getByRole("button", { name: "Опубликовать" }).click();
  await expect(page.getByRole("button", { name: "Снять с публикации" })).toBeVisible({
    timeout: 10_000,
  });

  // 7. Опубликованная страница открывается по slug
  await page.goto("/p/e2e-stranitsa");
  await expect(page.locator("h1")).toContainText("Заголовок вашего сайта");
});
