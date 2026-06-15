"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PullToRefresh,
  ListItem,
  SwipeActions,
  FAB,
  Icon,
  Toast,
  Spinner,
} from "muka-ui";
import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/auth";
import {
  listMotorcycles,
  createMotorcycle,
  archiveMotorcycle,
  deleteMotorcycle,
} from "@/lib/motorcycles";
import { storage } from "@/lib/storage";
import type { Motorcycle } from "@/types/motorcycle";
import { EmptyGarage } from "@/components/garage/EmptyGarage";
import { AddMotorcycleDialog } from "@/components/garage/AddMotorcycleDialog";

// Demo seed: drop a BMW R 1100GS (1998) into a brand-new, empty garage once per
// browser. The flag keeps it from reappearing after the user deletes it.
const DEMO_SEED_KEY = "demo-seeded";

function motorcycleCaption(m: Motorcycle): string | undefined {
  const parts: string[] = [];
  if (m.year) parts.push(String(m.year));
  if (m.mileageKm != null)
    parts.push(`${m.mileageKm.toLocaleString()} km`);
  return parts.length ? parts.join(" · ") : undefined;
}

function motorcycleLabel(m: Motorcycle): string {
  return m.nickname?.trim() || `${m.make} ${m.model}`.trim();
}

export default function GaragePage() {
  const t = useTranslations("garage");
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "warning">(
    "success",
  );
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = (msg: string, variant: "success" | "warning" = "success") => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastOpen(true);
  };

  const reload = useCallback(async () => {
    if (!user?.id) return;
    try {
      let data = await listMotorcycles(user.id);
      if (data.length === 0 && !storage.get<boolean>(DEMO_SEED_KEY)) {
        try {
          await createMotorcycle(
            { make: "BMW", model: "R 1100GS", year: 1998, mileageKm: 64000 },
            user.id,
          );
          storage.set(DEMO_SEED_KEY, true);
          data = await listMotorcycles(user.id);
        } catch {
          // Seeding is best-effort — never block the garage on it.
        }
      }
      setMotorcycles(data);
    } catch {
      showToast(t("loadFailed"), "warning");
    } finally {
      setPageLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    if (user?.id) reload();
  }, [user?.id, reload]);

  if (loading || !user) return null;

  const isEmpty = !pageLoading && motorcycles.length === 0;

  return (
    <>
      {pageLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "var(--spacing-8) 0",
          }}
        >
          <Spinner />
        </div>
      ) : isEmpty ? (
        <EmptyGarage onAdd={() => setSheetOpen(true)} />
      ) : (
        <PullToRefresh onRefresh={reload}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {motorcycles.map((m) => (
              <li key={m.id}>
                <SwipeActions
                  leftActions={[
                    {
                      label: t("archive"),
                      color: "neutral",
                      icon: <Icon name="archive" />,
                      onClick: async () => {
                        try {
                          await archiveMotorcycle(m.id);
                          showToast(t("archived"));
                          await reload();
                        } catch {
                          showToast(t("archiveFailed"), "warning");
                        }
                      },
                    },
                  ]}
                  rightActions={[
                    {
                      label: t("delete"),
                      color: "destructive",
                      icon: <Icon name="delete-bin" />,
                      fullSwipe: true,
                      onClick: async () => {
                        try {
                          await deleteMotorcycle(m.id);
                          showToast(t("deleted"));
                          await reload();
                        } catch {
                          showToast(t("deleteFailed"), "warning");
                        }
                      },
                    },
                  ]}
                >
                  <ListItem
                    label={motorcycleLabel(m)}
                    caption={motorcycleCaption(m)}
                    leadingIcon={<Icon name="motorbike" />}
                    showChevron
                    showDivider
                    onClick={() => router.push(`/garage/${m.id}`)}
                  />
                </SwipeActions>
              </li>
            ))}
          </ul>
        </PullToRefresh>
      )}

      <FAB
        icon={<Icon name="add" />}
        onClick={() => setSheetOpen(true)}
      />

      <AddMotorcycleDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userId={user.id}
        onCreated={() => {
          setSheetOpen(false);
          reload();
          showToast(t("added"));
        }}
      />

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
