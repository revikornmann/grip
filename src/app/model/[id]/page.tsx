"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BottomBar, Button, Dialog, Toast } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { createMotorcycle, findGarageMotorcycleByModel } from "@/lib/motorcycles";
import { useModelSpecs } from "@/lib/useModelSpecs";
import { addRecentSearch } from "@/lib/recentSearches";
import { MotorcycleDetail } from "@/components/garage/MotorcycleDetail";
import type { MotorcycleModel } from "@/types/motorcycle";

function headline(m: MotorcycleModel): string {
  return `${m.make} ${m.model} (${m.year})`.trim();
}

function ModelPreviewContent() {
  const t = useTranslations("garage");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id;
  // Set on the post-login return URL so we can finish the add the user started.
  const wantsAdd = searchParams.get("add") === "1";

  const { user, upgradeToGoogle } = useAuth();
  const isSignedIn = !!user && !user.isAnonymous;
  const { model, loading, generating, errorCode } = useModelSpecs(id);

  const [saving, setSaving] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
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

  // notFound / loadFailed are page-level; a failed spec generation is not — the
  // bike still renders (it just falls back to the "no specs" state). Guests can
  // browse the model; only adding to the garage is gated behind sign-in.
  const pageError =
    errorCode === "notFound" || errorCode === "loadFailed" ? t(errorCode) : null;

  // Add the model to the garage. Caller guarantees a real (non-guest) session.
  const addToGarage = useCallback(async () => {
    if (!model || !user) return;
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
  }, [model, user, router, t]);

  const handleAdd = () => {
    if (!model) return;
    // Guests must sign in first — prompt with the login dialog rather than
    // redirecting straight to Google.
    if (!isSignedIn || !user) {
      setLoginOpen(true);
      return;
    }
    addToGarage();
  };

  const handleLogin = () => {
    // Come back to this model with the add flag so the bike lands in the garage
    // automatically once the Google session is established.
    upgradeToGoogle(`/model/${id}?add=1`);
  };

  // Finish the add the user kicked off before logging in: once the Google
  // session and the model are both ready, park it and head to the garage.
  const autoAdded = useRef(false);
  useEffect(() => {
    if (!wantsAdd || !isSignedIn || !user || !model || saving) return;
    if (autoAdded.current) return;
    autoAdded.current = true;
    addToGarage();
  }, [wantsAdd, isSignedIn, user, model, saving, addToGarage]);

  const footer =
    model && !loading && !pageError ? (
      <BottomBar variant="actions" floating>
        <Button
          variant="primary"
          fullWidth
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? t("adding") : t("addToGarage")}
        </Button>
      </BottomBar>
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

      <Dialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        modal={false}
        size="sm"
        mobileHeight="half"
        className="grip-login-dialog"
        title={t("loginToSaveTitle")}
        footerActions={
          <>
            <Button variant="primary" onClick={handleLogin}>
              {t("loginWithGoogle")}
            </Button>
            <Button variant="tertiary" onClick={() => setLoginOpen(false)}>
              {tCommon("cancel")}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, color: "var(--color-text-subtle-default)" }}>
          {t("loginToSaveBody")}
        </p>
      </Dialog>

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

export default function ModelPreviewPage() {
  return (
    <Suspense>
      <ModelPreviewContent />
    </Suspense>
  );
}
