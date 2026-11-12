import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  console.log('🔌 Tentative de connexion à Neon (via WebSocket/443)...');
  try {
    const result = await pool.query('SELECT NOW() as now');
    console.log('✅ Connexion réussie !');
    console.log('   Heure du serveur:', result.rows[0].now);
    process.exit(0);
  } catch (error) {
    console.error('❌ Échec:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

test();