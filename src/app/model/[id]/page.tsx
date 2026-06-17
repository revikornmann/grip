"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Toast } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/auth";
import { createMotorcycle } from "@/lib/motorcycles";
import { useModelSpecs } from "@/lib/useModelSpecs";
import { addRecentSearch } from "@/lib/recentSearches";
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
  const { model, loading, generating, errorCode } = useModelSpecs(id);

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  // Record the bike in recent searches once it has loaded (id/make/model/year
  // are stable across spec-generation polling, so this runs once per model).
  useEffect(() => {
    if (!model) return;
    addRecentSearch({
      id: model.id,
      make: model.make,
      model: model.model,
      year: model.year,
    });
  }, [model?.id, model?.make, model?.model, model?.year]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || !user) return null;

  // notFound / loadFailed are page-level; a failed spec generation is not — the
  // bike still renders (it just falls back to the "no specs" state).
  const pageError =
    errorCode === "notFound" || errorCode === "loadFailed" ? t(errorCode) : null;

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
    model && !loading && !pageError ? (
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
        generating={generating}
        error={pageError}
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
