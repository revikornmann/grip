"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, Dialog, Icon, Toast } from "@revikornmann/muka-ui";
import { useRequireAuth } from "@/lib/auth";
import { getMotorcycle, deleteMotorcycle } from "@/lib/motorcycles";
import { useModelSpecs } from "@/lib/useModelSpecs";
import { MotorcycleDetail } from "@/components/garage/MotorcycleDetail";
import type { Motorcycle } from "@/types/motorcycle";

function headline(m: Motorcycle): string {
  const base = `${m.make} ${m.model}`.trim();
  return m.year ? `${base} (${m.year})` : base;
}

function MotorcycleDetailContent() {
  const t = useTranslations("garage");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id;
  const justAdded = searchParams.get("added") === "1";
  const alreadyExisted = searchParams.get("exists") === "1";

  const { user, loading: authLoading } = useRequireAuth();

  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<
    "success" | "warning" | "info"
  >("success");
  const [toastOpen, setToastOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

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

  // Specs (and on-demand generation) come from the linked catalogue model.
  const { model, generating } = useModelSpecs(motorcycle?.modelId ?? undefined);

  // Confirm a just-added motorcycle, then drop the ?added flag so a refresh
  // doesn't replay the toast.
  useEffect(() => {
    if ((!justAdded && !alreadyExisted) || !motorcycle) return;
    const name = `${motorcycle.make} ${motorcycle.model}`.trim();
    if (alreadyExisted) {
      setToastMsg(t("alreadyInGarage", { name }));
      setToastVariant("info");
    } else {
      setToastMsg(t("addedToGarage", { name }));
      setToastVariant("success");
    }
    setToastOpen(true);
    router.replace(`/garage/${id}`, { scroll: false });
  }, [justAdded, alreadyExisted, motorcycle, id, router, t]);

  const handleRemove = async () => {
    if (!id) return;
    setRemoving(true);
    try {
      await deleteMotorcycle(id);
      router.replace("/garage");
    } catch {
      setRemoving(false);
      setConfirmOpen(false);
      setToastMsg(t("removeFailed"));
      setToastVariant("warning");
      setToastOpen(true);
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      <MotorcycleDetail
        title={motorcycle ? headline(motorcycle) : ""}
        subtitle={motorcycle?.nickname?.trim() || null}
        mileageKm={motorcycle?.mileageKm ?? null}
        specs={model?.specs ?? {}}
        loading={loading}
        generating={generating}
        error={error}
        onBack={() => router.push("/garage")}
        endSlot={
          motorcycle ? (
            <Button
              variant="ghost"
              fullWidth
              iconLeft={<Icon name="delete-bin" />}
              onClick={() => setConfirmOpen(true)}
            >
              {t("removeFromGarage")}
            </Button>
          ) : null
        }
      />

      <Dialog
        open={confirmOpen}
        onClose={() => (removing ? undefined : setConfirmOpen(false))}
        size="sm"
        mobileHeight="half"
        title={
          motorcycle
            ? t("removeConfirmTitle", {
                name: `${motorcycle.make} ${motorcycle.model}`.trim(),
              })
            : ""
        }
        footerActions={
          <>
            <Button variant="primary" onClick={handleRemove} disabled={removing}>
              {t("remove")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={removing}
            >
              {t("keep")}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, color: "var(--color-text-subtle-default)" }}>
          {t("removeConfirmBody")}
        </p>
      </Dialog>

      <Toast
        variant={toastVariant}
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        duration={3000}
      >
        {toastMsg}
      </Toast>
    </>
  );
}

export default function MotorcycleDetailPage() {
  return (
    <Suspense>
      <MotorcycleDetailContent />
    </Suspense>
  );
}
