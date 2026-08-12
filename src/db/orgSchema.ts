import { user } from "./auth-schema";
import {
  pgTable,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  index,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";

export const invoiceStatusEnum = pgEnum("invoiceStatusEnum", [
  "pending",
  "canceled",
  "draft",
  "sent",
  "paid",
]);

// =========================
// Organization
// =========================

export const organization = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    phone: text("phone"),
    address: text("address"),
    p_o_box: text("p_o_box"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("organization_user_idx").on(table.userId)],
);

// =========================
// Clients
// =========================

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organization.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("client_org_idx").on(table.organizationId)],
);

// =========================
// Employees
// =========================

export const employees = pgTable(
  "employees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organization.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("employee_org_idx").on(table.organizationId)],
);

// =========================
// Products
// =========================

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organization.id, {
        onDelete: "cascade",
      })
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("product_org_idx").on(table.organizationId)],
);

// =========================
// Invoices
// =========================

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organization.id, {
        onDelete: "cascade",
      })
      .notNull(),
    clientId: uuid("client_id")
      .references(() => clients.id)
      .notNull(),
    invoiceNumber: text("invoice_number").notNull(),
    status: invoiceStatusEnum("status").default("pending").notNull(),
    issueDate: timestamp("issue_date").notNull(),
    dueDate: timestamp("due_date").notNull(),
    subtotal: numeric("subtotal", {
      precision: 10,
      scale: 2,
    }).notNull(),
    tax: numeric("tax", {
      precision: 10,
      scale: 2,
    }).default("0"),
    total: numeric("total", {
      precision: 10,
      scale: 2,
    }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("invoice_org_idx").on(table.organizationId),
    index("invoice_client_idx").on(table.clientId),
  ],
);

// =========================
// Invoice Items
// =========================

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invoiceId: uuid("invoice_id")
      .references(() => invoices.id, {
        onDelete: "cascade",
      })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id)
      .notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    total: numeric("total", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    index("invoice_item_invoice_idx").on(table.invoiceId),
    index("invoice_item_product_idx").on(table.productId),
  ],
);

// =========================
// Relations
// =========================

export const organizationRelations = relations(
  organization,
  ({ one, many }) => ({
    owner: one(user, {
      fields: [organization.userId],
      references: [user.id],
    }),
    clients: many(clients),
    employees: many(employees),
    products: many(products),
    invoices: many(invoices),
  }),
);

export const clientRelations = relations(clients, ({ one, many }) => ({
  organization: one(organization, {
    fields: [clients.organizationId],
    references: [organization.id],
  }),
  invoices: many(invoices),
}));

export const employeeRelations = relations(employees, ({ one }) => ({
  organization: one(organization, {
    fields: [employees.organizationId],
    references: [organization.id],
  }),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  organization: one(organization, {
    fields: [products.organizationId],
    references: [organization.id],
  }),
  invoiceItems: many(invoiceItems),
}));

export const invoiceRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organization, {
    fields: [invoices.organizationId],
    references: [organization.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));
