const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres.ecletaquophgdnwjykly:r9m%26%21MVq%24Pt%40%26sd@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`SELECT "id", "name", "stockQuantity", "physicalStock" FROM "product" WHERE "name" ILIKE '%empanada%'`);
  console.table(res.rows);
  await client.end();
}
fix().catch(console.error);
