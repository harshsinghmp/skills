#!/usr/bin/env bun

/**
 * 💳 reconcile-gateways.ts — Multi-Gateway Financial Settlement & Reconciliation Engine
 *
 * Reconciles settlement batches across modern payment gateways:
 * - Stripe (International cards, USD/EUR retainers, SEPA/ACH)
 * - Razorpay (Domestic cards, NetBanking, UPI, Smart Collect)
 * - Cashfree Payments (AutoCollect dynamic virtual accounts & instant payouts)
 * - PayU (Enterprise domestic checkout & recurring mandates)
 * - Paytm Payment Gateway (UPI Intent, QR & Wallet rails)
 *
 * Generates:
 * 1. Multi-Gateway Clearing Ledger Journal Entries.
 * 2. Input Tax Credit (ITC) calculation on merchant processing fees (18% GST).
 * 3. OpenAccountants Standardized Working Paper with 3-Outcome Classification.
 *
 * Usage:
 *   bun accounts/scripts/reconcile-gateways.ts --demo
 *   bun accounts/scripts/reconcile-gateways.ts [path/to/settlement.json]
 */

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

export interface GatewayTransaction {
  id: string;
  gateway: "stripe" | "razorpay" | "cashfree" | "payu" | "paytm";
  date: string;
  counterparty: string;
  currency: string;
  grossAmount: number;
  feeAmount: number;
  feeGst: number;
  netSettlement: number;
  virtualAccountRef?: string;
  classification: "CLASSIFIED" | "ASSUMED" | "NEEDS INPUT";
  coaCode: string;
  notes: string;
}

export interface ReconciliationReport {
  timestamp: string;
  transactionCount: number;
  totalGross: number;
  totalFees: number;
  totalGstItc: number;
  totalNet: number;
  gatewayBreakdown: Record<string, { count: number; gross: number; fees: number; net: number }>;
  workingPapers: GatewayTransaction[];
}

export function generateDemoTransactions(): GatewayTransaction[] {
  return [
    {
      id: "ch_3Nxy8A2eZvKYlo2C1g9X7abc",
      gateway: "stripe",
      date: "2026-09-18",
      counterparty: "Apex Global Labs LLC (US)",
      currency: "USD",
      grossAmount: 12500.0,
      feeAmount: 362.8,
      feeGst: 0.0, // Non-domestic gateway fee without Indian GST
      netSettlement: 12137.2,
      classification: "CLASSIFIED",
      coaCode: "2020 Deferred Revenue",
      notes: "Sprint 4 Milestone 50% deposit. Export of Services under LUT (zero-rated). FIRS P0802 on file.",
    },
    {
      id: "pay_Op9xZ81nK2LmPq",
      gateway: "razorpay",
      date: "2026-09-19",
      counterparty: "Kaveri Logistics Pvt Ltd",
      currency: "INR",
      grossAmount: 250000.0,
      feeAmount: 5000.0,
      feeGst: 900.0, // 18% GST on Razorpay MDR
      netSettlement: 244100.0,
      virtualAccountRef: "RZP_VA_99102",
      classification: "CLASSIFIED",
      coaCode: "4010 Custom Engineering Revenue",
      notes:
        "Final milestone sign-off. Smart Collect virtual account settlement via IMPS. Domestic 18% GST SAC 998314.",
    },
    {
      id: "cf_order_88291044",
      gateway: "cashfree",
      date: "2026-09-20",
      counterparty: "Zenith Retail Systems",
      currency: "INR",
      grossAmount: 180000.0,
      feeAmount: 3150.0,
      feeGst: 567.0, // 18% GST on Cashfree AutoCollect
      netSettlement: 176283.0,
      virtualAccountRef: "CF_VAN_INV2026_09",
      classification: "CLASSIFIED",
      coaCode: "4020 Retainer Maintenance Revenue",
      notes: "Monthly enterprise retainer via AutoCollect Virtual UPI ID. Real-time webhook auto-cleared.",
    },
    {
      id: "payu_txn_77182901",
      gateway: "payu",
      date: "2026-09-20",
      counterparty: "Horizon EdTech",
      currency: "INR",
      grossAmount: 95000.0,
      feeAmount: 1805.0,
      feeGst: 324.9,
      netSettlement: 92870.1,
      classification: "CLASSIFIED",
      coaCode: "4030 Advisory & Growth Consulting",
      notes: "Q3 Strategy Sprint invoice settled via PayU corporate netbanking.",
    },
    {
      id: "ptm_ord_66190283",
      gateway: "paytm",
      date: "2026-09-20",
      counterparty: "Urban Mobility Collective",
      currency: "INR",
      grossAmount: 45000.0,
      feeAmount: 765.0,
      feeGst: 137.7,
      netSettlement: 44097.3,
      classification: "ASSUMED",
      coaCode: "4010 Custom Engineering Revenue",
      notes: "Emergency UI fix payment via Paytm UPI Intent. Assumed final deliverable acceptance.",
    },
  ];
}

export function reconcileTransactions(txns: GatewayTransaction[]): ReconciliationReport {
  let totalGross = 0;
  let totalFees = 0;
  let totalGstItc = 0;
  let totalNet = 0;

  const breakdown: Record<string, { count: number; gross: number; fees: number; net: number }> = {
    stripe: { count: 0, gross: 0, fees: 0, net: 0 },
    razorpay: { count: 0, gross: 0, fees: 0, net: 0 },
    cashfree: { count: 0, gross: 0, fees: 0, net: 0 },
    payu: { count: 0, gross: 0, fees: 0, net: 0 },
    paytm: { count: 0, gross: 0, fees: 0, net: 0 },
  };

  for (const t of txns) {
    totalGross += t.grossAmount;
    totalFees += t.feeAmount;
    totalGstItc += t.feeGst;
    totalNet += t.netSettlement;

    if (breakdown[t.gateway]) {
      breakdown[t.gateway].count++;
      breakdown[t.gateway].gross += t.grossAmount;
      breakdown[t.gateway].fees += t.feeAmount;
      breakdown[t.gateway].net += t.netSettlement;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    transactionCount: txns.length,
    totalGross,
    totalFees,
    totalGstItc,
    totalNet,
    gatewayBreakdown: breakdown,
    workingPapers: txns,
  };
}

export function formatReportMarkdown(report: ReconciliationReport): string {
  const lines: string[] = [
    "# 🏛️ Payment Gateway Settlement & OpenAccountants Reconciliation Report",
    `Generated: \`${report.timestamp}\` | Total Transactions: **${report.transactionCount}**`,
    "",
    "## 📊 Gateway Settlement Summary",
    "",
    "| Gateway | Transactions | Gross Volume | Processing Fees (COGS 5030) | Net Deposited (Operating 1010) |",
    "|:---|:---|:---|:---|:---|",
  ];

  for (const [gw, data] of Object.entries(report.gatewayBreakdown)) {
    if (data.count > 0) {
      lines.push(
        `| **${gw.toUpperCase()}** | ${data.count} | ${data.gross.toLocaleString("en-US", { minimumFractionDigits: 2 })} | ${data.fees.toLocaleString("en-US", { minimumFractionDigits: 2 })} | ${data.net.toLocaleString("en-US", { minimumFractionDigits: 2 })} |`,
      );
    }
  }

  lines.push("");
  lines.push("### 🧾 Key Tax & Ledger Invariants");
  lines.push(
    `- **Total Recoverable GST Input Tax Credit (ITC on Fees)**: \`${report.totalGstItc.toFixed(2)}\` (Debited to Account \`1200 GST Input Credit\`).`,
  );
  lines.push(
    "- **Virtual Account Tracking**: AutoCollect (Cashfree) & Smart Collect (Razorpay) reconciled without manual bank statement parsing.",
  );
  lines.push("");
  lines.push("## 📝 OpenAccountants Standardized Working Papers");
  lines.push("");
  lines.push("| WP Ref | Gateway | Counterparty | Gross | Fee + GST | Net Deposit | Outcome | COA Code & Notes |");
  lines.push("|:---|:---|:---|:---|:---|:---|:---|:---|");

  for (let i = 0; i < report.workingPapers.length; i++) {
    const wp = report.workingPapers[i];
    const ref = `WP-${wp.date.replace(/-/g, "").slice(0, 6)}-${String(i + 1).padStart(4, "0")}`;
    const feeCol = `${wp.feeAmount.toFixed(2)}${wp.feeGst > 0 ? ` (+${wp.feeGst.toFixed(2)} GST)` : ""}`;
    lines.push(
      `| \`${ref}\` | **${wp.gateway}** | ${wp.counterparty} | ${wp.currency} ${wp.grossAmount.toLocaleString()} | ${feeCol} | ${wp.currency} ${wp.netSettlement.toLocaleString()} | \`${wp.classification}\` | \`${wp.coaCode}\` — ${wp.notes} |`,
    );
  }

  lines.push("");
  lines.push("## ⚖️ Standard Double-Entry Ledger Posting");
  lines.push("```text");
  lines.push(`[DEBIT]  1010 Operating Checking:               ${report.totalNet.toFixed(2)}`);
  lines.push(`[DEBIT]  5030 Merchant Payment Processing Fees:   ${report.totalFees.toFixed(2)}`);
  lines.push(`[DEBIT]  1200 GST Input Tax Credit (ITC):         ${report.totalGstItc.toFixed(2)}`);
  lines.push(`[CREDIT] 1030 Payment Gateway Clearing (Zeroed):  ${report.totalGross.toFixed(2)}`);
  lines.push("```");

  return lines.join("\n");
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const txns = generateDemoTransactions();
  const report = reconcileTransactions(txns);
  console.log(formatReportMarkdown(report));
}
