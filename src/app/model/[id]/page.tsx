"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Toast } from "muka-ui";
import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/auth";
import { getMotorcycleModel, createMotorcycle } from "@/lib/motorcycles";
import { MotorcycleDetail } from "@/components/garage/MotorcycleDetail";
import type { MotorcycleModel } from "@/types/motorcycle";

function headline(m: MotorcycleModel): string {
  return `${m.make} ${m.model} (${m.year})`.trim();
}

export default function ModelPreviewPage() {
  const t = useTranslations("garage");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { user, loading: authLoading } = useRequireAuth();

  const [model, setModel] = useState<MotorcycleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const mm = await getMotorcycleModel(id);
        if (cancelled) return;
        if (!mm) setError(t("notFound"));
        else setModel(mm);
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
  }, [id, t]);

  if (authLoading || !user) return null;

  const handleAdd = async () => {
    if (!model || !user) return;
    setSaving(true);
    try {
      const created = await createMotorcycle(
        { make: model.make, model: model.model, year: model.year },
        user.id,
      );
      router.replace(`/garage/${created.id}`);
    } catch (e) {
      setToastMsg(e instanceof Error ? e.message : t("addFailed"));
      setToastOpen(true);
      setSaving(false);
    }
  };

  const footer =
    model && !loading && !error ? (
      <div style={{ padding: "var(--spacing-4)" }}>
        <Button
          variant="primary"
          fullWidth
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? t("adding") : t("addToGarage")}
        </Button>
      </div>
    ) : undefined;

  return (
    <>
      <MotorcycleDetail
        title={model ? headline(model) : ""}
        specs={model?.specs ?? {}}
        loading={loading}
        error={error}
        footer={footer}
        onBack={() => router.push("/")}
      />
      <Toast
        variant="warning"
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {toastMsg}
      </Toast>
    </>
  );
}
