import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  orderId: text("order_id").primaryKey(),
  customer: jsonb("customer").notNull(),
  items: jsonb("items").notNull(),
  bill: jsonb("bill").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true }).notNull(),
});
