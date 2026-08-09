import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { getInvoiceWithItems } from "@/actions/invoiceList";

// NOTE: this expects getInvoiceWithItems to also return organization info
export type InvoicePdfData = NonNullable<
  Awaited<ReturnType<typeof getInvoiceWithItems>>
> & {
  organizationName?: string | null;
  organizationAddress?: string | null;
  organizationPoBox?: string | null;
  organizationPhone?: string | null;
};

/**
 * Colors based on your Tailwind / shadcn theme.
 *
 * --primary: oklch(0 0 0)        -> #000000
 * --primary-foreground: white    -> #ffffff
 * --background: oklch(.99 0 0)  -> #fcfcfc
 * --card: white                  -> #ffffff
 * --foreground: black            -> #000000
 * --muted: oklch(.97 0 0)       -> #f5f5f5
 * --muted-foreground: .44        -> #707070
 * --border: .92                 -> #e6e6e6
 * --secondary: .94              -> #f0f0f0
 */
const COLORS = {
  primary: "#000000",
  primaryForeground: "#ffffff",

  background: "#fcfcfc",
  card: "#ffffff",

  foreground: "#000000",
  body: "#333333",

  muted: "#f5f5f5",
  mutedForeground: "#707070",

  secondary: "#f0f0f0",
  secondaryForeground: "#000000",

  border: "#e6e6e6",

  destructive: "#a40000",
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
    paddingTop: 42,
    paddingBottom: 55,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.body,
    backgroundColor: COLORS.background,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  companySection: {
    width: "58%",
  },

  companyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    color: COLORS.primary,
    marginBottom: 6,
  },

  companyDetails: {
    fontSize: 8.5,
    color: COLORS.mutedForeground,
    lineHeight: 1.5,
  },

  invoiceSection: {
    width: "35%",
    alignItems: "flex-end",
  },

  invoiceTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  invoiceNumber: {
    fontSize: 9,
    color: COLORS.mutedForeground,
    marginBottom: 9,
  },

  statusPill: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
  },

  statusPillText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: COLORS.primaryForeground,
    letterSpacing: 0.7,
  },

  headerLine: {
    height: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 24,
  },

  /* =========================
     BILLING INFORMATION
  ========================= */

  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  billTo: {
    width: "52%",
  },

  invoiceDetails: {
    width: "40%",
    paddingLeft: 15,
  },

  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: 7,
  },

  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: COLORS.primary,
    marginBottom: 4,
  },

  clientDetails: {
    fontSize: 8.5,
    color: COLORS.mutedForeground,
    lineHeight: 1.5,
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  dateLabel: {
    fontSize: 8.5,
    color: COLORS.mutedForeground,
  },

  dateValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    color: COLORS.primary,
  },

  /* =========================
     ITEMS TABLE
  ========================= */

  table: {
    marginBottom: 5,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderRadius: 3,
  },

  tableHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: COLORS.primaryForeground,
    letterSpacing: 0.6,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },

  tableRowAlternate: {
    backgroundColor: COLORS.muted,
  },

  colDescription: {
    flexGrow: 4,
    flexBasis: 0,
    paddingRight: 10,
  },

  colQuantity: {
    flexGrow: 0.8,
    flexBasis: 0,
    textAlign: "center",
  },

  colPrice: {
    flexGrow: 1.5,
    flexBasis: 0,
    textAlign: "right",
  },

  colAmount: {
    flexGrow: 1.5,
    flexBasis: 0,
    textAlign: "right",
  },

  itemName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: COLORS.primary,
    marginBottom: 2,
  },

  itemDescription: {
    fontSize: 7.8,
    color: COLORS.mutedForeground,
    lineHeight: 1.4,
  },

  cellText: {
    fontSize: 8.5,
    color: COLORS.body,
  },

  /* =========================
     TOTALS
  ========================= */

  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 18,
  },

  totalsBox: {
    width: 225,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  totalLabel: {
    fontSize: 8.5,
    color: COLORS.mutedForeground,
  },

  totalValue: {
    fontSize: 8.5,
    color: COLORS.primary,
  },

  totalDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 3,
    marginBottom: 5,
  },

  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 3,
    marginTop: 5,
  },

  grandTotalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: COLORS.primaryForeground,
  },

  grandTotalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: COLORS.primaryForeground,
  },

  /* =========================
     NOTES
  ========================= */

  notesBlock: {
    marginTop: 28,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  notesLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: 6,
  },

  notesText: {
    fontSize: 8.5,
    color: COLORS.body,
    lineHeight: 1.6,
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    position: "absolute",
    bottom: 28,
    left: 42,
    right: 42,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerText: {
    fontSize: 7.5,
    color: COLORS.mutedForeground,
  },
});

/**
 * Format money as Ugandan Shillings.
 *
 * Example:
 * 150000 -> UGX 150,000
 * 150000.5 -> UGX 150,000.50
 */
function money(value: string | number | null | undefined) {
  const n =
    typeof value === "string"
      ? parseFloat(value)
      : typeof value === "number"
        ? value
        : 0;

  const amount = Number.isFinite(n) ? n : 0;

  return `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function safeDate(value: unknown) {
  if (!value) return "—";

  const d = new Date(value as string);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString("en-UG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function InvoiceDocument({ data }: { data: InvoicePdfData }) {
  const items = data.items ?? [];

  const statusKey = (data.status ?? "draft").toLowerCase();

  const statusLabel =
    STATUS_LABELS[statusKey] ??
    statusKey.charAt(0).toUpperCase() + statusKey.slice(1);

  return (
    <Document
      title={`Invoice ${data.invoiceNumber}`}
      author={data.organizationName ?? undefined}
    >
      <Page size="A4" style={styles.page}>
        {/* =========================
            HEADER
        ========================= */}

        <View style={styles.header}>
          <View style={styles.companySection}>
            <Text style={styles.companyName}>
              {data.organizationName ?? "Your Business"}
            </Text>

            {data.organizationAddress ? (
              <Text style={styles.companyDetails}>
                {data.organizationAddress}
              </Text>
            ) : null}

            {data.organizationPoBox ? (
              <Text style={styles.companyDetails}>
                P.O. Box {data.organizationPoBox}
              </Text>
            ) : null}

            {data.organizationPhone ? (
              <Text style={styles.companyDetails}>
                {data.organizationPhone}
              </Text>
            ) : null}
          </View>

          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>

            <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>

            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>
                {statusLabel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerLine} />

        {/* =========================
            BILL TO / DETAILS
        ========================= */}

        <View style={styles.billingRow}>
          <View style={styles.billTo}>
            <Text style={styles.sectionLabel}>BILL TO</Text>

            <Text style={styles.clientName}>{data.clientName ?? "—"}</Text>

            {data.clientAddress ? (
              <Text style={styles.clientDetails}>{data.clientAddress}</Text>
            ) : null}

            {data.clientEmail ? (
              <Text style={styles.clientDetails}>{data.clientEmail}</Text>
            ) : null}

            {data.clientPhone ? (
              <Text style={styles.clientDetails}>{data.clientPhone}</Text>
            ) : null}
          </View>

          <View style={styles.invoiceDetails}>
            <Text style={styles.sectionLabel}>INVOICE DETAILS</Text>

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

        {/* =========================
            ITEMS
        ========================= */}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDescription]}>
              DESCRIPTION
            </Text>

            <Text style={[styles.tableHeaderText, styles.colQuantity]}>
              QTY
            </Text>

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
            items.map((item: any, index: number) => (
              <View
                key={item.id ?? index}
                wrap={false}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlternate : {},
                ]}
              >
                <View style={styles.colDescription}>
                  <Text style={styles.itemName}>
                    {item.productName ?? "Item"}
                  </Text>

                  {item.productDescription ? (
                    <Text style={styles.itemDescription}>
                      {item.productDescription}
                    </Text>
                  ) : null}
                </View>

                <Text style={[styles.cellText, styles.colQuantity]}>
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

        {/* =========================
            TOTALS
        ========================= */}

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>

              <Text style={styles.totalValue}>{money(data.subtotal)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>

              <Text style={styles.totalValue}>{money(data.tax)}</Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL DUE</Text>

              <Text style={styles.grandTotalValue}>{money(data.total)}</Text>
            </View>
          </View>
        </View>

        {/* =========================
            NOTES
        ========================= */}

        {data.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>NOTES</Text>

            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        {/* =========================
            FOOTER
        ========================= */}

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

// Generates the PDF as a Blob for client-side download.
export async function generateInvoicePdfBlob(
  data: InvoicePdfData,
): Promise<Blob> {
  const { pdf } = await import("@react-pdf/renderer");

  return pdf(<InvoiceDocument data={data} />).toBlob();
}
