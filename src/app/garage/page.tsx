"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PullToRefresh,
  Card,
  ListItem,
  SwipeActions,
  Icon,
  Toast,
  Spinner,
  EmptyState,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  listMotorcycles,
  archiveMotorcycle,
  deleteMotorcycle,
} from "@/lib/motorcycles";
import type { Motorcycle } from "@/types/motorcycle";
import { EmptyGarage } from "@/components/garage/EmptyGarage";
import { prettifyMake } from "@/lib/makes";

function motorcycleCaption(m: Motorcycle): string | undefined {
  const parts: string[] = [];
  if (m.year) parts.push(String(m.year));
  if (m.mileageKm != null) parts.push(`${m.mileageKm.toLocaleString()} km`);
  return parts.length ? parts.join(" · ") : undefined;
}

function motorcycleLabel(m: Motorcycle): string {
  return m.nickname?.trim() || `${prettifyMake(m.make)} ${m.model}`.trim();
}

export default function GaragePage() {
  const t = useTranslations("garage");
  const router = useRouter();
  const { user, loading, upgradeToGoogle } = useAuth();

  const isSignedIn = !!user && !user.isAnonymous;

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState<"success" | "warning">(
    "success",
  );
  const [toastOpen, setToastOpen] = useState(false);

  const showToast = (
    msg: string,
    variant: "success" | "warning" = "success",
  ) => {
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
    if (isSignedIn && user?.id) reload();
  }, [isSignedIn, user?.id, reload]);

  if (loading) return null;

  // Garage is gated behind a real (Google) account — anyone without one (no
  // session, or an anonymous guest session) must sign in first.
  if (!isSignedIn) {
    return (
      <div style={{ paddingTop: "var(--spacing-8)" }}>
        <EmptyState
          size="sm"
          title={t("loginTitle")}
          description={t("loginDescription")}
          icon={<Icon name="motorbike" size="lg" />}
          primaryAction={{
            label: t("loginButton"),
            icon: <Icon name="google" />,
            onClick: () => upgradeToGoogle("/garage"),
          }}
        />
      </div>
    );
  }

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
        <EmptyGarage onSearch={() => router.push("/")} />
      ) : (
        <PullToRefresh onRefresh={reload}>
          {/* PullToRefresh clips overflow (overflow-x: clip) to contain the
              pull gesture, which would crop the Card's drop shadow flush to its
              edges. A small padding buffer gives the shadow room to render. */}
          <div style={{ padding: "var(--spacing-1) var(--spacing-2)" }}>
            <Card padding="none">
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {motorcycles.map((m, i) => (
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
                        showChevron
                        showDivider={i < motorcycles.length - 1}
                        onClick={() => router.push(`/garage/${m.id}`)}
                      />
                    </SwipeActions>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </PullToRefresh>
      )}

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
