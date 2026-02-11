"use client";

import { Button, Card, Chip } from "muka-ui";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <p
        style={{
          fontSize: "var(--font-size-lg)",
          color: "var(--color-text-subtle-default)",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        Vergelijk de kosten van privé- en zakelijk autobezit als ZZP&apos;er.
        Ontdek welke optie het meest voordelig is voor uw situatie.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--spacing-4)",
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="info" size="sm">
              RDW Data
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              Kenteken opzoeken
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              Voer uw kenteken in en ontvang direct alle voertuiggegevens via de
              RDW.
            </p>
          </div>
        </Card>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="success" size="sm">
              Berekeningen
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              Kosten berekenen
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              Bereken de totale kosten inclusief bijtelling, BTW-aftrek en
              afschrijving.
            </p>
          </div>
        </Card>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="warning" size="sm">
              Vergelijking
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              Privé vs. zakelijk
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              Vergelijk privé- en zakelijk autobezit en ontdek het verschil per
              maand.
            </p>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--spacing-4)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/lookup")}
        >
          Voertuig opzoeken
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push("/garage")}
        >
          Mijn garage
        </Button>
      </div>
    </>
  );
}
