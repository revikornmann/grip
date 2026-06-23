"use client";

import { useEffect, useState } from "react";
import { getMotorcycleModel } from "@/lib/motorcycles";
import {
  triggerSpecGeneration,
  triggerSpecTranslation,
  getSpecTranslation,
} from "@/lib/specs";
import { useLocale } from "@/components/LocaleProvider";
import type { MotorcycleModel, MotorcycleSpecs } from "@/types/motorcycle";

export type ModelSpecsError = "notFound" | "loadFailed" | "generateFailed";

export interface ModelSpecsState {
  model: MotorcycleModel | null;
  /** Specs to render: the active-locale translation when ready, otherwise the
   *  canonical English specs (the graceful fallback while a translation is in
   *  flight, failed, or the locale is English). */
  specs: MotorcycleSpecs;
  /** Initial model fetch in flight. */
  loading: boolean;
  /** Specs are being generated in the background (triggered + polling). */
  generating: boolean;
  /** Error code — translate in the component (namespace "garage"). */
  errorCode: ModelSpecsError | null;
}

const POLL_MS = 4000;
const MAX_POLLS = 22; // ~90s ceiling before giving up
// Don't re-request a translation that recently failed — it self-heals only after
// this window. Keep in sync with the server guard in the translate-specs Edge
// Function.
const FAILED_RETRY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function hasSpecs(m: MotorcycleModel | null): boolean {
  return (
    !!m &&
    (m.specsFilledAt != null || Object.keys(m.specs ?? {}).length > 0)
  );
}

/**
 * Load a catalogue model and, if it has no specs yet, trigger background
 * generation and poll until the specs land (or generation fails / times out).
 * Once the canonical (English) specs are ready, resolve the active-locale
 * translation: serve a cached one, or trigger + poll a new one, falling back to
 * the English specs meanwhile. Pass `undefined` to disable (e.g. a garage bike
 * with no linked model).
 */
export function useModelSpecs(modelId: string | undefined): ModelSpecsState {
  const { locale } = useLocale();
  const [model, setModel] = useState<MotorcycleModel | null>(null);
  const [localizedSpecs, setLocalizedSpecs] = useState<MotorcycleSpecs | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(!!modelId);
  const [generating, setGenerating] = useState(false);
  const [errorCode, setErrorCode] = useState<ModelSpecsError | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let genPolls = 0;
    let trPolls = 0;

    // Resolve the active-locale translation once the canonical specs are ready.
    // English is the canonical form, so it needs no translation.
    const resolveTranslation = async (id: string) => {
      if (locale === "en") return;

      const pollTranslation = async () => {
        try {
          const tr = await getSpecTranslation(id, locale);
          if (cancelled) return;
          if (tr?.status === "ready" && tr.specs) {
            setLocalizedSpecs(tr.specs);
            return;
          }
          // "failed" or exhausted polls → keep the English fallback silently.
          if (tr?.status === "failed" || trPolls++ >= MAX_POLLS) return;
          timers.push(setTimeout(pollTranslation, POLL_MS));
        } catch {
          // Network hiccup — leave the English fallback in place.
        }
      };

      try {
        const tr = await getSpecTranslation(id, locale);
        if (cancelled) return;
        if (tr?.status === "ready" && tr.specs) {
          setLocalizedSpecs(tr.specs);
          return;
        }
        // No cached translation (or a failure past its cooldown) — request one
        // and poll. A recent failure is left alone so we don't re-spend an API
        // call on every view; it retries on a later visit once the cooldown ends.
        const failedStale =
          tr?.status === "failed" &&
          (!tr.updatedAt ||
            Date.now() - Date.parse(tr.updatedAt) >= FAILED_RETRY_COOLDOWN_MS);
        if (!tr || failedStale) {
          triggerSpecTranslation(id, locale).catch(() => {});
        }
        timers.push(setTimeout(pollTranslation, POLL_MS));
      } catch {
        // Ignore — the English fallback already renders.
      }
    };

    const pollGeneration = async (id: string) => {
      try {
        const m = await getMotorcycleModel(id);
        if (cancelled) return;
        setModel(m);
        if (hasSpecs(m)) {
          setGenerating(false);
          resolveTranslation(id);
          return;
        }
        if (m?.specsStatus === "failed") {
          setGenerating(false);
          setErrorCode("generateFailed");
          return;
        }
        if (genPolls++ >= MAX_POLLS) {
          setGenerating(false);
          setErrorCode("generateFailed");
          return;
        }
        timers.push(setTimeout(() => pollGeneration(id), POLL_MS));
      } catch {
        if (!cancelled) {
          setGenerating(false);
          setErrorCode("generateFailed");
        }
      }
    };

    (async () => {
      // Reset (and short-circuit) when there is no model to load. Done inside
      // the async fn so no setState runs synchronously in the effect body.
      if (!modelId) {
        setModel(null);
        setLocalizedSpecs(null);
        setLoading(false);
        setGenerating(false);
        setErrorCode(null);
        return;
      }
      setLoading(true);
      setGenerating(false);
      setErrorCode(null);
      // Drop any previous-locale translation so we fall back to English until
      // this locale's translation resolves.
      setLocalizedSpecs(null);
      try {
        const m = await getMotorcycleModel(modelId);
        if (cancelled) return;
        if (!m) {
          setErrorCode("notFound");
          return;
        }
        setModel(m);
        if (hasSpecs(m)) {
          resolveTranslation(modelId);
        } else {
          setGenerating(true);
          // Fire-and-forget; the server dedupes concurrent requests.
          triggerSpecGeneration(modelId).catch(() => {});
          timers.push(setTimeout(() => pollGeneration(modelId), POLL_MS));
        }
      } catch {
        if (!cancelled) setErrorCode("loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [modelId, locale]);

  return {
    model,
    specs: localizedSpecs ?? model?.specs ?? {},
    loading,
    generating,
    errorCode,
  };
}
