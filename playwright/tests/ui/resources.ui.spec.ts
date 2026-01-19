import type { Page } from "@playwright/test";
import { test, expect } from "../../support/merged-fixtures";

const createLead = () => {
  const seed = Date.now();
  return {
    name: `Playwright Test ${seed}`,
    email: `playwright+${seed}@lifetrek.test`
  };
};

const unlockResource = async (page: Page, slug: string) => {
  const lead = createLead();
  await page.goto(`/resources/${slug}`);
  await expect(page.getByText("Desbloqueie o recurso completo")).toBeVisible();
  await page.getByRole("button", { name: "Desbloquear agora" }).click();
  await page.getByLabel("Nome completo").fill(lead.name);
  await page.getByLabel("Email corporativo").fill(lead.email);
  await page.getByRole("button", { name: "Desbloquear recurso" }).click();
  await expect(page.getByText("Gostou deste recurso?")).toBeVisible();
};

test("resources list loads with published cards", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByRole("heading", { name: /Central de Recursos/i })).toBeVisible();
  await expect(page.getByText("Erro ao carregar recursos")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Acessar Recurso" }).first()).toBeVisible();
});

test("scorecard captures inputs and saves to CRM", async ({ page }) => {
  await unlockResource(page, "scorecard-risco-supply-chain-2026");

  const sliders = page.locator("input[type='range']");
  await expect(sliders).toHaveCount(5);

  for (let index = 0; index < 5; index += 1) {
    await sliders.nth(index).fill("5");
  }

  await expect(page.getByText(/Faixa:/)).toContainText("Alto");
  await page.getByRole("button", { name: "Salvar respostas no CRM" }).click();
  await expect(page.getByText("Scorecard salvo")).toBeVisible();
});

test("checklist captures inputs and saves to CRM", async ({ page }) => {
  await unlockResource(page, "checklist-producao-local");

  await page.getByLabel("Volume anual relevante").check();
  await page.getByLabel("Lead time de importacao > X dias").check();
  await page.getByLabel("Alto impacto se faltar (linha para)").check();

  const countRow = page.getByText("SIM marcados").locator("..");
  await expect(countRow).toContainText("3");

  await page.getByRole("button", { name: "Salvar checklist no CRM" }).click();
  await expect(page.getByText("Checklist salvo")).toBeVisible();
});
