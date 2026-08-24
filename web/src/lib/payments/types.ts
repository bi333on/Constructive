// Абстракция платёжных провайдеров (ЮKassa, RollyPay).
// Каждый провайдер — независимый модуль за единым интерфейсом; включается флагом по env.

export interface PlanRow {
  id: string;
  name: string;
  price_monthly: number;
  currency: string;
  limits: Record<string, unknown>;
}

export interface CreateCheckoutInput {
  userId: string;
  email?: string | null;
  plan: PlanRow;
  successUrl: string;
}

export interface CreateCheckoutResult {
  /** URL, на который перенаправить пользователя для оплаты. */
  confirmationUrl: string;
  /** Внешний id платежа/подписки у провайдера. */
  externalId: string;
}

export interface WebhookResult {
  provider: string;
  type: "succeeded" | "canceled" | "ignored";
  externalId: string;
  userId: string;
  planId: string;
  /** Сохранённый способ оплаты для рекуррентных списаний (если есть). */
  paymentMethodId?: string;
}

export interface PaymentProvider {
  id: string;
  label: string;
  enabled: boolean;
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;
  /** Возвращает null, если событие не относится к оплате подписки. */
  parseWebhook(body: unknown, headers: Headers): Promise<WebhookResult | null>;
}
