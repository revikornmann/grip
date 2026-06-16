"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Toast } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getMotorcycleModel,
  createMotorcycle,
  findGarageMotorcycleByModel,
} from "@/lib/motorcycles";
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

  const { user, upgradeToGoogle } = useAuth();
  const isSignedIn = !!user && !user.isAnonymous;

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
        else {
          setModel(mm);
          addRecentSearch({
            id: mm.id,
            make: mm.make,
            model: mm.model,
            year: mm.year,
          });
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
  }, [id, t]);

  const handleAdd = async () => {
    if (!model) return;
    // Saving to the garage needs a real account — guests sign in first and
    // land back on this page to finish adding.
    if (!isSignedIn || !user) {
      upgradeToGoogle(`/model/${id}`);
      return;
    }
    setSaving(true);
    try {
      // A model can live in the garage only once. If it is already there, go to
      // the existing entry and let it explain — don't create a duplicate.
      const existing = await findGarageMotorcycleByModel(user.id, model.id);
      if (existing) {
        router.replace(`/garage/${existing.id}?exists=1`);
        return;
      }
      const created = await createMotorcycle(
        { make: model.make, model: model.model, year: model.year },
        user.id,
      );
      // ?added=1 tells the garage detail page to surface a confirmation toast.
      router.replace(`/garage/${created.id}?added=1`);
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
          {saving
            ? t("adding")
            : isSignedIn
              ? t("addToGarage")
              : t("signInToAdd")}
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
