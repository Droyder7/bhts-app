import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

export const db = drizzle(process.env.DATABASE_URL || "", {
  schema,
  logger: true,
  casing: "snake_case",
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    await db.execute("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
