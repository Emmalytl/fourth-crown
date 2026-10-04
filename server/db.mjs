import 'dotenv/config';
import pg from 'pg';
let pool;
export function database() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) throw new Error('Database is not configured');
  // Keep credentials server-only. Neon connection strings include sslmode=require.
  return pool ||= new pg.Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:10000});
}
export async function transaction(actor, work) {
  const client=await database().connect();
  try { await client.query('BEGIN'); await client.query("select set_config('app.actor_id',$1,true)",[actor||'']); const value=await work(client); await client.query('COMMIT');return value; }
  catch(e){await client.query('ROLLBACK');throw e;} finally{client.release();}
}

// Test-only injection executes the real API against embedded PostgreSQL, without a hosted secret.
export function setTestDatabase(adapter){if(process.env.NODE_ENV!=='test')throw new Error('Test adapter prohibited');pool=adapter;}
