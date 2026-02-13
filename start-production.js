const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Determine platform
const isWindows = os.platform() === 'win32';

console.log('🚀 Starting YouTube Downloader Application...\n');

// Start Next.js frontend
const frontendProcess = spawn('next', ['start'], {
  stdio: 'inherit',
  shell: true
});

frontendProcess.on('error', (err) => {
  console.error('❌ Frontend error:', err);
});

// Start Python backend
const pythonCmd = isWindows 
  ? 'python-backend\\venv\\Scripts\\python -m uvicorn main:app --host 0.0.0.0 --port 8000'
  : 'cd python-backend && ./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000';

const backendProcess = spawn(pythonCmd, {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

backendProcess.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down servers...');
  frontendProcess.kill();
  backendProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down servers...');
  frontendProcess.kill();
  backendProcess.kill();
  process.exit(0);
});

console.log('✅ Frontend running at: http://localhost:3000');
console.log('✅ Backend running at: http://localhost:8000\n');
