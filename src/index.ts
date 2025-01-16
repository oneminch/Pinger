import dotenv from "dotenv";
import { getTursoClient, queryTurso, TursoConfig } from "./db/turso";
import { getDatabaseConfig } from "./db/config";

// Load environment variables when running locally
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

interface Env {
  SUPABASE_PROJECT_URL: string;
  SUPABASE_PUBLIC_ANON_KEY: string;
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    try {
      const dbConfig = getDatabaseConfig(env, "turso") as TursoConfig;
      const tursoClient = getTursoClient(dbConfig);

      const { error } = await queryTurso(tursoClient);

      if (error) throw error;
      console.log("Database queried successfully");
    } catch (error) {
      console.error("Error querying database:", error);
    }
  }
};
