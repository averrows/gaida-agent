import { pgTable, bigint, varchar, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const customers = pgTable("customers", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "customers_id_seq", startWith: 1, increment: 1, minValue: 1, cache: 1 }),
  name: varchar(),
  address: varchar(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const targetRecruits = pgTable("target_recruits", {
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "target_recruits_id_seq", startWith: 1, increment: 1, minValue: 1 }),
  linkedinProfileUrl: varchar(),
  name: varchar(),
  recruitmentStatus: varchar().default("TARGETTED"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});
