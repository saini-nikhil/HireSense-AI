const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://Fuucggi:JliPAriNalvQ@jwckftdbxifl.db.dbaas.dev:32563/hSPuDz",
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const res = await client.query("SELECT NOW()");
    console.log("Server time:", res.rows[0]);

    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

testConnection();

// const { Client } = require("pg");

// const client = new Client({
//   host: "jwckftdbxif1.db.dbaas.dev",
//   port: 32563,
//   user: "Fuucggi",
//   password: "JliPAriNalvQ",
//   database: "hSPuDz",
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// async function testConnection() {
//   try {
//     await client.connect();
//     console.log("✅ Connected successfully!");

//     const res = await client.query("SELECT NOW()");
//     console.log("Server time:", res.rows[0]);

//     await client.end();
//   } catch (err) {
//     console.error("❌ Connection failed:", err.message);
//   }
// }

// testConnection();