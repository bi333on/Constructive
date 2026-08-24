import type { PaymentProvider } from "./types";
import { rollypayProvider } from "./rollypay";
import { yookassaProvider } from "./yookassa";

export const paymentProviders: PaymentProvider[] = [
  yookassaProvider,
  rollypayProvider,
];

/** Включённые (настроенные) провайдеры. */
export function getEnabledProviders() {
  return paymentProviders.filter((p) => p.enabled);
}

export function getProvider(id: string) {
  return paymentProviders.find((p) => p.id === id);
}
