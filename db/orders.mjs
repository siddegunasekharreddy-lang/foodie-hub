import { getDatabase } from "@netlify/database";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/netlify-db";
import { orders } from "./schema.ts";

const db = drizzle({ client: getDatabase() });

export async function saveOrder(order) {
  await db.insert(orders).values(order);
}

export async function findOrder(orderId) {
  const [order] = await db.select({
    orderId: orders.orderId,
    items: orders.items,
    bill: orders.bill,
    status: orders.status,
    createdAt: orders.createdAt,
  }).from(orders).where(eq(orders.orderId, orderId));
  return order;
}
