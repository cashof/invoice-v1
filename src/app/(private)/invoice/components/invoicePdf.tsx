import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { getInvoiceWithItems } from "@/actions/invoiceList";

// NOTE: this expects getInvoiceWithItems to also return organization info
// (see actions-additions.ts). If you keep the org fields optional, this
// template degrades gracefully and just omits the "from" block.
export type InvoicePdfData = NonNullable<
  Awaited<ReturnType<typeof getInvoiceWithItems>>
> & {
  organizationName?: string | null;
  organizationAddress?: string | null;
  organizationPoBox?: string | null;
  organizationPhone?: string | null;
};

const COLORS = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#94a3b8",
  line: "#e2e8f0",
  accent: "#0d9488",
  accentSoft: "#f0fdfa",
  band: "#f8fafc",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  pending: "Pending",
  paid: "Paid",
  canceled: "Cancelled",
};

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.body,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  orgName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 4,
  },
  orgLine: {
    fontSize: 8.5,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  invoiceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    color: COLORS.accent,
    textAlign: "right",
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 9.5,
    color: COLORS.muted,
    textAlign: "right",
    marginTop: 4,
  },
  statusPill: {
    alignSelf: "flex-end",
    marginTop: 8,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 3,
    backgroundColor: COLORS.accentSoft,
  },
  statusPillText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: COLORS.accent,
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.accent,
    marginBottom: 22,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  infoBlock: {
    width: "48%",
  },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: COLORS.ink,
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 8.5,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 8.5,
    color: COLORS.muted,
  },
  dateValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  table: {
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.band,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: COLORS.muted,
    letterSpacing: 0.75,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  colDesc: { flexGrow: 4, flexBasis: 0, paddingRight: 8 },
  colQty: { flexGrow: 1, flexBasis: 0, textAlign: "center" },
  colPrice: { flexGrow: 1.4, flexBasis: 0, textAlign: "right" },
  colAmount: { flexGrow: 1.4, flexBasis: 0, textAlign: "right" },
  itemName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: COLORS.ink,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 8,
    color: COLORS.muted,
    lineHeight: 1.4,
  },
  cellText: {
    fontSize: 9,
    color: COLORS.body,
  },
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  totalsBox: {
    width: 220,
  },
  totalsLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 9,
    color: COLORS.muted,
  },
  totalsValue: {
    fontSize: 9,
    color: COLORS.ink,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginTop: 6,
    borderRadius: 3,
  },
  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: COLORS.ink,
  },
  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.accent,
  },
  notesBlock: {
    marginTop: 28,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  notesLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: COLORS.muted,
    letterSpacing: 1,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8.5,
    color: COLORS.body,
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  footerText: {
    fontSize: 7.5,
    color: COLORS.muted,
  },
});

function money(value: string | number | null | undefined) {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return `${(Number.isFinite(n) ? n : 0).toFixed(2)}`;
}

function safeDate(value: unknown) {
  if (!value) return "—";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const items = data.items ?? [];
  const statusKey = (data.status ?? "draft").toLowerCase();

  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author={data.organizationName ?? undefined}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.orgName}>
              {data.organizationName ?? "Your Business"}
            </Text>
            {data.organizationAddress ? (
              <Text style={styles.orgLine}>{data.organizationAddress}</Text>
            ) : null}
            {data.organizationPoBox ? (
              <Text style={styles.orgLine}>
                P.O. Box {data.organizationPoBox}
              </Text>
            ) : null}
            {data.organizationPhone ? (
              <Text style={styles.orgLine}>{data.organizationPhone}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {(STATUS_LABELS[statusKey] ?? statusKey).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Bill to / details */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>BILL TO</Text>
            <Text style={styles.infoValue}>{data.clientName ?? "—"}</Text>
            {data.clientAddress ? (
              <Text style={styles.infoSub}>{data.clientAddress}</Text>
            ) : null}
            {data.clientEmail ? (
              <Text style={styles.infoSub}>{data.clientEmail}</Text>
            ) : null}
            {data.clientPhone ? (
              <Text style={styles.infoSub}>{data.clientPhone}</Text>
            ) : null}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>INVOICE DETAILS</Text>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Issue date</Text>
              <Text style={styles.dateValue}>{safeDate(data.issueDate)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Due date</Text>
              <Text style={styles.dateValue}>{safeDate(data.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>QTY</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>
              UNIT PRICE
            </Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>
              AMOUNT
            </Text>
          </View>

          {items.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={styles.cellText}>No items on this invoice.</Text>
            </View>
          ) : (
            items.map((item: any) => (
              <View style={styles.tableRow} key={item.id} wrap={false}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemName}>
                    {item.productName ?? "Item"}
                  </Text>
                  {item.productDescription ? (
                    <Text style={styles.itemDesc}>
                      {item.productDescription}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.cellText, styles.colQty]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.cellText, styles.colPrice]}>
                  {money(item.unitPrice)}
                </Text>
                <Text style={[styles.cellText, styles.colAmount]}>
                  {money(item.total)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{money(data.subtotal)}</Text>
            </View>
            <View style={styles.totalsLine}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text style={styles.totalsValue}>{money(data.tax)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalValue}>{money(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {data.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Thank you for your business.</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

// Generates the PDF as a Blob for client-side download. Keep this in its
// own module (rather than inlined in invoicelist.tsx) so the ~1MB
// @react-pdf/renderer bundle is only loaded via dynamic import() when a
// user actually clicks "Download PDF", not on initial page load.
export async function generateInvoicePdfBlob(
  data: InvoicePdfData,
): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");
  return pdf(<InvoiceDocument data={data} />).toBlob();
}
