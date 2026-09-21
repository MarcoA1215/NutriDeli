const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: "postgresql://postgres.ecletaquophgdnwjykly:r9m%26%21MVq%24Pt%40%26sd@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const res = await client.query(`UPDATE "product" SET "stockQuantity" = "stockQuantity" - 2 WHERE "id" = '825f7875-9fdb-4f77-b574-0078acc7a2d2' RETURNING "id", "name", "stockQuantity", "physicalStock"`);
  console.table(res.rows);
  await client.end();
}
fix().catch(console.error);
