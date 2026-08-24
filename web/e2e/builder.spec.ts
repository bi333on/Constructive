import { expect, test } from "@playwright/test";

test("полный сценарий: регистрация → проект → страница → публикация", async ({ page }) => {
  // 1. Регистрация → дашборд (проекты)
  await page.goto("/signup");
  await page.getByPlaceholder("you@example.com").fill("e2e@example.com");
  await page.getByPlaceholder("••••••••").fill("password123");
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // 2. Создание проекта
  await page.getByPlaceholder("Название нового сайта").fill("Мой сайт");
  await page.getByRole("button", { name: "Создать сайт" }).click();
  await expect(page.getByRole("button", { name: "Мой сайт" })).toBeVisible();

  // 3. Открыть проект
  await page.getByRole("link", { name: "Открыть страницы" }).click();
  await expect(page).toHaveURL(/\/dashboard\/project\//);

  // 4. Создать страницу → редактор
  await page.getByRole("button", { name: "Новая страница" }).click();
  await expect(page).toHaveURL(/\/\?page=/);

  // 5. Добавить блок и переименовать
  await page.getByRole("button", { name: "Обложка (Hero)" }).first().click();
  await expect(page.locator("h1")).toContainText("Заголовок вашего сайта");
  await page.getByPlaceholder("Название страницы").fill("Главная");
  await expect(page.getByText("Сохранено")).toBeVisible({ timeout: 10_000 });

  // 6. Вернуться в проект и опубликовать
  await page.goto("/dashboard");
  await page.getByRole("link", { name: "Открыть страницы" }).click();
  await page.getByRole("button", { name: "Опубликовать" }).click();
  await expect(page.getByRole("button", { name: "Снять с публикации" })).toBeVisible({
    timeout: 10_000,
  });

  // 7. Опубликованная страница открывается по slug
  await page.goto("/p/glavnaya");
  await expect(page.locator("h1")).toContainText("Заголовок вашего сайта");
});
