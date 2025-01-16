import { type SupabaseConfig } from "./supabase";
import { type TursoConfig } from "./turso";

type DatabaseConfig = TursoConfig | SupabaseConfig;

type DBProvider = "turso" | "supabase";

export const getDatabaseConfig = (
  env: any,
  dbProvider: DBProvider
): DatabaseConfig | void => {
  if (dbProvider === "supabase") {
    if (!env.SUPABASE_PROJECT_URL || !env.SUPABASE_PUBLIC_ANON_KEY) {
      throw new Error("Supabase configuration missing");
    }

    return {
      projectUrl: env.SUPABASE_PROJECT_URL,
      publicAnonKey: env.SUPABASE_PUBLIC_ANON_KEY
    } as SupabaseConfig;
  }

  if (dbProvider === "turso") {
    if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
      throw new Error("Turso configuration missing");
    }

    return {
      databaseUrl: env.TURSO_DATABASE_URL,
      authToken: env.TURSO_AUTH_TOKEN
    } as TursoConfig;
  }
};
