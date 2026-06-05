"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/upgrade-button";
import Link from "next/link";
import { Check, X, Crown } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanData {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  description: string;
  badge: string | null;
  trialDays: number;
  features: PlanFeature[];
}

interface PricingToggleProps {
  plans: PlanData[];
  currentPlan: string;
  isLoggedIn: boolean;
}

export function PricingToggle({ plans, currentPlan, isLoggedIn }: PricingToggleProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const paidPlans = plans.filter((p) => p.id !== "free");

  return (
    <>
      {/* Billing Toggle */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <button
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            billing === "monthly"
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          月付
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            billing === "annual"
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          年付
          <span className="ml-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-semibold">
            省最多 34%
          </span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Free Plan */}
        <Card>
          <div className="h-6" />
          <h2 className="text-lg font-bold">{plans[0].name}</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{plans[0].description}</p>
          <p className="mt-4 text-3xl font-bold">
            $0<span className="text-base font-normal text-[var(--muted)]">/月</span>
          </p>
          <ul className="mt-6 space-y-2">
            {plans[0].features.map((f) => (
              <FeatureItem key={f.text} text={f.text} included={f.included} />
            ))}
          </ul>
          <div className="mt-8">
            {currentPlan === "free" && isLoggedIn ? (
              <p className="text-sm text-gray-500 font-medium">当前计划</p>
            ) : !isLoggedIn ? (
              <Link href="/register" className="block">
                <Button variant="secondary" className="w-full">
                  免费注册
                </Button>
              </Link>
            ) : null}
          </div>
        </Card>

        {/* Paid Plans */}
        {paidPlans.map((plan) => {
          const isHighlighted = plan.id === "pro";
          const monthlyEquiv =
            billing === "annual"
              ? (plan.annualPrice / 12).toFixed(2)
              : plan.price.toFixed(0);
          const displayPrice =
            billing === "annual" ? plan.annualPrice : plan.price;
          const savingsPercent =
            billing === "annual"
              ? Math.round((1 - plan.annualPrice / (plan.price * 12)) * 100)
              : 0;
          const isCurrent = currentPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={
                isHighlighted
                  ? "border-[var(--primary)] ring-2 ring-blue-100 relative"
                  : "relative"
              }
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                    {isHighlighted ? <Crown className="inline h-3 w-3 mr-1" /> : null}
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="h-6" />
              <h2 className="text-lg font-bold">{plan.name}</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">{plan.description}</p>
              <div className="mt-4">
                {billing === "annual" ? (
                  <>
                    <p className="text-3xl font-bold">
                      ${displayPrice}
                      <span className="text-base font-normal text-[var(--muted)]">/年</span>
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      约 ${monthlyEquiv}/月 ·{" "}
                      <span className="text-green-600 font-medium">省 {savingsPercent}%</span>
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-base font-normal text-[var(--muted)]">/月</span>
                  </p>
                )}
                {plan.trialDays > 0 && (
                  <p className="mt-1 text-xs text-blue-600 font-medium">
                    ✓ 前 {plan.trialDays} 天免费试用
                  </p>
                )}
              </div>
              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <FeatureItem key={f.text} text={f.text} included={f.included} />
                ))}
              </ul>
              <div className="mt-8">
                {isCurrent ? (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-4 w-4" /> 当前计划
                  </p>
                ) : isLoggedIn ? (
                  <UpgradeButton
                    label={
                      plan.trialDays > 0
                        ? `免费试用 ${plan.trialDays} 天`
                        : `订阅 ${plan.name}`
                    }
                    plan={plan.id}
                    billing={billing}
                    className="w-full"
                  />
                ) : (
                  <Link href="/register" className="block">
                    <Button className="w-full">注册后升级</Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Annual savings summary */}
      {billing === "annual" && (
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          年付按一次性计费，Starter 省 $10 · Pro 省 $29 · Business 省 $99
        </p>
      )}
    </>
  );
}

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {included ? (
        <Check className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-300 shrink-0" />
      )}
      <span className={included ? "" : "text-[var(--muted)]"}>{text}</span>
    </li>
  );
}
