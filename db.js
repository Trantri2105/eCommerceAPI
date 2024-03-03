import pg from "pg";
import env from "dotenv";

env.config();
const databaseConfig = {
  connectionString: process.env.POSTGRES_URL,
}

const pool = new pg.Pool(databaseConfig);

export default pool;
