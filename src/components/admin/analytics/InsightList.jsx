"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

const LOOK = {
  warning: { icon: AlertTriangle, className: "text-amber-500" },
  opportunity: { icon: Sparkles, className: "text-[#37469E]" },
  good: { icon: CheckCircle2, className: "text-emerald-500" },
  info: { icon: Info, className: "text-gray-400" },
};

export default function InsightList({ items, emptyText = "Nothing needs your attention right now." }) {
  if (!items?.length) return <p className="text-sm text-gray-500">{emptyText}</p>;
  return (
    <ul className="divide-y divide-gray-50">
      {items.map((item) => {
        const { icon: Icon, className } = LOOK[item.severity] || LOOK.info;
        return (
          <li key={item.text}>
            <Link href={item.href} className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              <Icon size={17} className={`mt-0.5 shrink-0 ${className}`} />
              <span>{item.text}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
