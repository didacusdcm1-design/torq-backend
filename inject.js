const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://torq_db_25tf_user:6tHVJ3SAyBs4KJ6x0higfQof4m42Y5xE@dpg-dbfdg5avcj2c73fmolcg-a.singapore-postgres.render.com/torq_db_25tf",
  ssl: {
    rejectUnauthorized: false,
    // This explicitly forces TLS 1.2 which Render requires for external connections
    minVersion: 'TLSv1.2'
  }
});

const sql = `
INSERT INTO "Rider" (id, "firstName", "lastName", email, phone, status, "createdAt", "updatedAt") 
VALUES 
(gen_random_uuid(), 'Chadrick', 'Didacus', 'rider@torq.com', '0712345678', 'APPROVED', NOW(), NOW()),
(gen_random_uuid(), 'John', 'Doe', 'john@torq.com', '0722334455', 'PENDING', NOW(), NOW()),
(gen_random_uuid(), 'Jane', 'Smith', 'jane@torq.com', '0733445566', 'REJECTED', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
`;

console.log("Connecting to Render database...");

client.connect()
  .then(() => {
    console.log("✅ Connected! Inserting data...");
    return client.query(sql);
  })
  .then((res) => {
    console.log(`✅ Successfully processed rows! (Command: ${res.command})`);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Database error:', err.message);
    client.end();
  });
