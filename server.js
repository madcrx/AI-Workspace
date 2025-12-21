const { execSync } = require('child_process');

console.log('🚀 Starting AI-Workspace...');

try {
  console.log('📦 Running database migrations...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Database migrations complete');

  console.log('🌐 Starting Next.js server...');
  execSync('npx next start', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
