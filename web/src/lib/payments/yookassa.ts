import type { PaymentProvider, WebhookResult } from "./types";

const API = "https://api.yookassa.ru/v3";

function creds() {
  return {
    shopId: process.env.YOKASSA_SHOP_ID,
    secretKey: process.env.YOKASSA_SECRET_KEY,
  };
}

function basicAuth() {
  const { shopId, secretKey } = creds();
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`;
}

// https://yookassa.ru/developers
export const yookassaProvider: PaymentProvider = {
  id: "yookassa",
  label: "ЮKassa",
  enabled: Boolean(creds().shopId && creds().secretKey),

  async createCheckout(input) {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": crypto.randomUUID(),
        Authorization: basicAuth(),
      },
      body: JSON.stringify({
        amount: {
          value: input.plan.price_monthly.toFixed(2),
          currency: input.plan.currency,
        },
        capture: true,
        confirmation: { type: "redirect", return_url: input.successUrl },
        // Сохраняем способ оплаты для будущих рекуррентных списаний.
        save_payment_method: true,
        description: `Подписка «${input.plan.name}»`,
        metadata: { user_id: input.userId, plan_id: input.plan.id },
      }),
    });

    const data = (await res.json()) as {
      id?: string;
      confirmation?: { confirmation_url?: string };
      description?: string;
    };

    if (!res.ok || !data.id || !data.confirmation?.confirmation_url) {
      throw new Error(data.description ?? "Ошибка создания платежа ЮKassa");
    }

    return {
      confirmationUrl: data.confirmation.confirmation_url,
      externalId: data.id,
    };
  },

  async parseWebhook(body): Promise<WebhookResult | null> {
    const payload = body as {
      event?: string;
      object?: { id?: string; metadata?: Record<string, string> };
    };
    const event = payload?.event;
    if (event !== "payment.succeeded" && event !== "payment.canceled") return null;

    const paymentId = payload?.object?.id;
    if (!paymentId) return null;

    // Верификация: запрашиваем статус платежа напрямую у ЮKassa.
    const res = await fetch(`${API}/payments/${paymentId}`, {
      headers: { Authorization: basicAuth() },
    });
    const payment = (await res.json()) as {
      status?: string;
      metadata?: { user_id?: string; plan_id?: string };
      payment_method?: { id?: string };
    };

    const status = payment?.status;
    const type: WebhookResult["type"] =
      status === "succeeded"
        ? "succeeded"
        : status === "canceled"
          ? "canceled"
          : "ignored";

    return {
      provider: "yookassa",
      type,
      externalId: paymentId,
      userId: payment?.metadata?.user_id ?? "",
      planId: payment?.metadata?.plan_id ?? "",
      paymentMethodId: payment?.payment_method?.id,
    };
  },
};
