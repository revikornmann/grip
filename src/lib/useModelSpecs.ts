"use client";

import { useEffect, useState } from "react";
import { getMotorcycleModel } from "@/lib/motorcycles";
import { triggerSpecGeneration } from "@/lib/specs";
import type { MotorcycleModel } from "@/types/motorcycle";

export type ModelSpecsError = "notFound" | "loadFailed" | "generateFailed";

export interface ModelSpecsState {
  model: MotorcycleModel | null;
  /** Initial model fetch in flight. */
  loading: boolean;
  /** Specs are being generated in the background (triggered + polling). */
  generating: boolean;
  /** Error code — translate in the component (namespace "garage"). */
  errorCode: ModelSpecsError | null;
}

const POLL_MS = 4000;
const MAX_POLLS = 22; // ~90s ceiling before giving up

function hasSpecs(m: MotorcycleModel | null): boolean {
  return (
    !!m &&
    (m.specsFilledAt != null || Object.keys(m.specs ?? {}).length > 0)
  );
}

/**
 * Load a catalogue model and, if it has no specs yet, trigger background
 * generation and poll until the specs land (or generation fails / times out).
 * Pass `undefined` to disable (e.g. a garage bike with no linked model).
 */
export function useModelSpecs(modelId: string | undefined): ModelSpecsState {
  const [model, setModel] = useState<MotorcycleModel | null>(null);
  const [loading, setLoading] = useState<boolean>(!!modelId);
  const [generating, setGenerating] = useState(false);
  const [errorCode, setErrorCode] = useState<ModelSpecsError | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let polls = 0;

    const poll = async (id: string) => {
      try {
        const m = await getMotorcycleModel(id);
        if (cancelled) return;
        setModel(m);
        if (hasSpecs(m)) {
          setGenerating(false);
          return;
        }
        if (m?.specsStatus === "failed") {
          setGenerating(false);
          setErrorCode("generateFailed");
          return;
        }
        if (polls++ >= MAX_POLLS) {
          setGenerating(false);
          setErrorCode("generateFailed");
          return;
        }
        timer = setTimeout(() => poll(id), POLL_MS);
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
        setLoading(false);
        setGenerating(false);
        setErrorCode(null);
        return;
      }
      setLoading(true);
      setGenerating(false);
      setErrorCode(null);
      try {
        const m = await getMotorcycleModel(modelId);
        if (cancelled) return;
        if (!m) {
          setErrorCode("notFound");
          return;
        }
        setModel(m);
        if (!hasSpecs(m)) {
          setGenerating(true);
          // Fire-and-forget; the server dedupes concurrent requests.
          triggerSpecGeneration(modelId).catch(() => {});
          timer = setTimeout(() => poll(modelId), POLL_MS);
        }
      } catch {
        if (!cancelled) setErrorCode("loadFailed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [modelId]);

  return { model, loading, generating, errorCode };
}
