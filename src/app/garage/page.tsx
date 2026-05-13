"use client";

import { useState, useEffect, useCallback } from "react";
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
  archiveMotorcycle,
  deleteMotorcycle,
} from "@/lib/motorcycles";
import type { Motorcycle } from "@/types/motorcycle";
import { EmptyGarage } from "@/components/garage/EmptyGarage";
import { AddMotorcycleDialog } from "@/components/garage/AddMotorcycleDialog";

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
      const data = await listMotorcycles(user.id);
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
