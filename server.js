const { execSync, spawn } = require('child_process');

console.log('🚀 Starting AI-Workspace...');

try {
  console.log('📦 Running database migrations...');
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ Database migrations complete');
} catch (error) {
  console.error('❌ Database migration failed:', error.message);
  process.exit(1);
}

console.log('🌐 Starting Next.js server...');
const server = spawn('npx', ['next', 'start'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
