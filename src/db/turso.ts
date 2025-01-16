import { type Client, createClient } from "@libsql/client";

interface TursoConfig {
  databaseUrl: string;
  authToken: string;
}

let tursoClient: Client | null = null;

const getTursoClient = (config: TursoConfig) => {
  if (!config.databaseUrl || !config.authToken) {
    throw new Error("Invalid Turso configuration");
  }

  if (!tursoClient) {
    tursoClient = createClient({
      url: config.databaseUrl,
      authToken: config.authToken
    });
  }

  return tursoClient;
};

const queryTurso = async (
  turso: Client
): Promise<{
  apps: string[];
  error: string | null;
}> => {
  const querySqlString = `SELECT id FROM apps LIMIT 3;`;

  try {
    const res = await turso.execute(querySqlString);

    return {
      apps: res.rows.map((tagObject) => tagObject.name) as string[],
      error: null
    };
  } catch (error: any) {
    // console.error(error);
    return {
      apps: [],
      error: error.message as string
    };
  }
};

export { getTursoClient, queryTurso, type TursoConfig };
