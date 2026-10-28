const { Client } = require('pg');

// We remove the ?sslmode=require from the end, because the Client config handles SSL now
const connectionString = "postgresql://torq_db_25tf_user:6tHVJ3SAyBs4KJ6x0higfQof4m42Y5xE@dpg-dbfdg5avcj2c73fmolcg-a.singapore-postgres.render.com/torq_db_25tf";

const sql = `
INSERT INTO "Rider" (id, "firstName", "lastName", email, phone, status, "createdAt", "updatedAt") 
VALUES 
(gen_random_uuid(), 'Chadrick', 'Didacus', 'rider@torq.com', '0712345678', 'APPROVED', NOW(), NOW()),
(gen_random_uuid(), 'John', 'Doe', 'john@torq.com', '0722334455', 'PENDING', NOW(), NOW()),
(gen_random_uuid(), 'Jane', 'Smith', 'jane@torq.com', '0733445566', 'REJECTED', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
`;

console.log("Sending data to Render database...");

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000 // Wait up to 10 seconds for Render to wake up
});

client.connect()
  .then(() => {
    console.log("Connected! Inserting data...");
    return client.query(sql);
  })
  .then(() => {
    console.log('✅ Successfully inserted riders directly into the database!');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    client.end();
  });
