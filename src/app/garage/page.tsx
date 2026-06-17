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
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/lib/auth";
import {
  listMotorcycles,
  archiveMotorcycle,
  deleteMotorcycle,
} from "@/lib/motorcycles";
import type { Motorcycle } from "@/types/motorcycle";
import { EmptyGarage } from "@/components/garage/EmptyGarage";

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

  // Bikes are added by finding them in the catalog (search → model → add to
  // garage), so the "add" affordance navigates to the search screen.
  const goToSearch = () => router.push("/");

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
        <EmptyGarage onAdd={goToSearch} />
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

      <FAB icon={<Icon name="add" />} onClick={goToSearch} />

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
