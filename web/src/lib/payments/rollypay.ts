import type { PaymentProvider } from "./types";

// TODO: реализовать по официальной документации RollyPay.
// Интерфейс уже задан, осталось заполнить createCheckout и parseWebhook.
// Включится автоматически, когда будут заданы env-переменные ROLLYPAY_*.
export const rollypayProvider: PaymentProvider = {
  id: "rollypay",
  label: "RollyPay",
  enabled: false,

  async createCheckout() {
    throw new Error("RollyPay: требуется документация API для реализации");
  },

  async parseWebhook() {
    return null;
  },
};
