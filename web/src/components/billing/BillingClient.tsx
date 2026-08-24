"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  cancelSubscription,
  subscribeToPlan,
} from "@/app/actions/billing";
import { cn } from "@/lib/utils";

export interface PlanView {
  id: string;
  name: string;
  price_monthly: number;
  currency: string;
  limits: { max_pages?: number; publish?: boolean };
}

function planFeatures(plan: PlanView): string[] {
  const f: string[] = [];
  const max = plan.limits?.max_pages;
  f.push(max === -1 || max == null ? "Без ограничения страниц" : `До ${max} стр.`);
  f.push(plan.limits?.publish ? "Публикация сайта" : "Без публикации");
  return f;
}

export function BillingClient({
  plans,
  currentTier,
  hasActiveSubscription,
}: {
  plans: PlanView[];
  currentTier: string;
  hasActiveSubscription: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = (fn: () => Promise<{ error?: string; redirectUrl?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
        return;
      }
      router.refresh();
    });

  const formatPrice = (plan: PlanView) =>
    plan.price_monthly > 0
      ? `${plan.price_monthly.toLocaleString("ru-RU")} ₽/мес`
      : "Бесплатно";

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Тарифы</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Выберите план, который подходит вашему проекту.
          </p>
        </header>

        {error && (
          <p className="mx-auto mb-6 max-w-xl rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border bg-white p-6",
                  isCurrent ? "border-blue-500 ring-2 ring-blue-500/20" : "border-neutral-200",
                )}
              >
                <h2 className="text-lg font-semibold text-neutral-900">{plan.name}</h2>
                <div className="mt-2 text-3xl font-bold text-neutral-900">
                  {formatPrice(plan)}
                </div>
                <ul className="mt-5 flex-1 space-y-2">
                  {planFeatures(plan).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <span className="mt-6 rounded-lg bg-blue-50 py-2.5 text-center text-sm font-medium text-blue-700">
                    Текущий тариф
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setBusyId(plan.id);
                      run(() => subscribeToPlan(plan.id));
                    }}
                    className="mt-6 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {busyId === plan.id && isPending ? "Подождите…" : "Выбрать"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {hasActiveSubscription && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={isPending}
              onClick={() => run(cancelSubscription)}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50"
            >
              Отменить подписку
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-neutral-400">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← К моим страницам
          </Link>
        </p>
      </div>
    </main>
  );
}
