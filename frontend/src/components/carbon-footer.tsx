"use client";

import { useEffect, useState } from "react";

type CarbonData = {
  bytes: number;
  gco2e: number;
  rating: string;
  cleanerThan: number;
};

type CarbonState =
  | { status: "loading" }
  | { status: "ready"; data: CarbonData }
  | { status: "unavailable"; reason: string; bytes?: number };

function entryBytes(entry: PerformanceEntry) {
  const resource = entry as PerformanceResourceTiming;
  return resource.transferSize || resource.encodedBodySize || 0;
}

function measuredTransferBytes() {
  const entries = [
    ...performance.getEntriesByType("navigation"),
    ...performance.getEntriesByType("resource"),
  ];

  return Math.round(entries.reduce((total, entry) => total + entryBytes(entry), 0));
}

export function CarbonFooter() {
  const [state, setState] = useState<CarbonState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    const measure = window.setTimeout(() => {
      const bytes = measuredTransferBytes();

      if (!bytes) {
        setState({
          status: "unavailable",
          reason: "Browser transfer data was unavailable for this visit.",
        });
        return;
      }

      fetch(`/api/carbon?bytes=${bytes}&green=1`, { cache: "no-store" })
        .then((response) => response.json())
        .then((payload) => {
          if (!active) return;
          if (payload?.ok === false) {
            setState({
              status: "unavailable",
              reason: payload.reason ?? "Website Carbon did not return a score.",
              bytes,
            });
            return;
          }
          setState({ status: "ready", data: payload as CarbonData });
        })
        .catch(() => {
          if (!active) return;
          setState({
            status: "unavailable",
            reason: "Website Carbon request failed.",
            bytes,
          });
        });
    }, 1200);

    return () => {
      active = false;
      window.clearTimeout(measure);
    };
  }, []);

  return (
    <footer
      id="carbon"
      className="flex flex-col gap-5 border-t border-white/10 py-8 text-sm text-white/46 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p className="flex items-center gap-2 font-medium text-white">
          <img src="/rypple-logo.png" alt="" className="h-5 w-5 invert" />
          Rypple
        </p>
        <p className="mt-1">Prompt better. Waste less. See the impact.</p>
      </div>
      <div className="max-w-xl text-left md:text-right">
        {state.status === "loading" && (
          <p>Measuring this visit&apos;s page transfer for Website Carbon.</p>
        )}
        {state.status === "ready" && (
          <p>
            Measured page transfer this visit:{" "}
            <span className="text-white">{state.data.bytes.toLocaleString()} bytes</span>.{" "}
            Website Carbon:{" "}
            <span className="text-white">{state.data.gco2e.toFixed(3)}g CO2e</span>,{" "}
            rating <span className="text-white">{state.data.rating}</span>,
            cleaner than{" "}
            <span className="text-white">
              {Math.round(state.data.cleanerThan * 100)}%
            </span>{" "}
            of tested pages.
          </p>
        )}
        {state.status === "unavailable" && (
          <p>
            Carbon score unavailable
            {state.bytes ? ` for ${state.bytes.toLocaleString()} measured bytes` : ""}.{" "}
            {state.reason}
          </p>
        )}
      </div>
    </footer>
  );
}
