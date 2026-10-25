import {pgTable, serial, varchar, timestamp, boolean} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email:varchar("email", {length: 255}).notNull().unique(),
    password: varchar("name", {length: 255}).notNull(),
    createdAt:timestamp("created_at").defaultNow().notNull(),
    updatedAt:timestamp("updated_at").defaultNow().notNull(),
    isActive:boolean("is_active").default(true).notNull()
})