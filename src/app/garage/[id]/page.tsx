"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/auth";
import { getMotorcycle, getMotorcycleModel } from "@/lib/motorcycles";
import { MotorcycleDetail } from "@/components/garage/MotorcycleDetail";
import type { Motorcycle, MotorcycleSpecs } from "@/types/motorcycle";

function headline(m: Motorcycle): string {
  const base = `${m.make} ${m.model}`.trim();
  return m.year ? `${base} (${m.year})` : base;
}

export default function MotorcycleDetailPage() {
  const t = useTranslations("garage");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { user, loading: authLoading } = useRequireAuth();

  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [specs, setSpecs] = useState<MotorcycleSpecs>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const m = await getMotorcycle(id);
        if (cancelled) return;
        if (!m) {
          setError(t("notFound"));
          return;
        }
        setMotorcycle(m);
        if (m.modelId) {
          const mm = await getMotorcycleModel(m.modelId);
          if (!cancelled && mm) setSpecs(mm.specs);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("loadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, id, t]);

  if (authLoading || !user) return null;

  return (
    <MotorcycleDetail
      title={motorcycle ? headline(motorcycle) : ""}
      subtitle={motorcycle?.nickname?.trim() || null}
      mileageKm={motorcycle?.mileageKm ?? null}
      specs={specs}
      loading={loading}
      error={error}
      onBack={() => router.push("/garage")}
    />
  );
}
