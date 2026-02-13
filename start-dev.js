#!/usr/bin/env node

/**
 * Integrated development server starter
 * Starts both Next.js frontend and FastAPI backend with a single command
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';

// Python executable path - try multiple locations
const pythonPaths = isWindows
  ? [
      path.join(__dirname, 'python-backend', 'venv', 'Scripts', 'python.exe'),
      path.join(__dirname, 'python-backend', '.venv', 'Scripts', 'python.exe'),
      'python.exe',
      'python',
    ]
  : [
      path.join(__dirname, 'python-backend', 'venv', 'bin', 'python'),
      path.join(__dirname, 'python-backend', '.venv', 'bin', 'python'),
      'python3',
      'python',
    ];

function findPython() {
  for (const pythonPath of pythonPaths) {
    try {
      // Check if it's an absolute path that exists
      if (!['python', 'python.exe', 'python3'].includes(pythonPath)) {
        if (fs.existsSync(pythonPath)) {
          console.log(`✓ Found Python: ${pythonPath}`);
          return pythonPath;
        }
      } else {
        // For system python, just return it (will work if in PATH)
        console.log(`✓ Using system Python: ${pythonPath}`);
        return pythonPath;
      }
    } catch {}
  }
  // Fallback to system python
  const fallback = isWindows ? 'python.exe' : 'python3';
  console.log(`⚠ Using fallback Python: ${fallback}`);
  return fallback;
}

const pythonCmd = findPython();
const backendDir = path.join(__dirname, 'python-backend');

console.log('\n🚀 Starting YouTube Downloader...\n');
console.log('📋 Configuration:');
console.log(`   Frontend: http://localhost:3000`);
console.log(`   Backend:  http://0.0.0.0:8000`);
console.log(`   Network:  http://192.168.0.7:3000 (Mobile)\n`);

let frontendReady = false;
let backendReady = false;

// Start Next.js frontend
const frontend = spawn('next', ['dev', '--turbo'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

// Add delay before starting backend to prevent port conflicts
setTimeout(() => {
  // Start FastAPI backend
  const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWindows,
    cwd: backendDir,
  });

  // Capture backend output to detect startup
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[BACKEND] ${output}`);
    
    if (output.includes('Uvicorn running on')) {
      if (!backendReady) {
        backendReady = true;
        console.log('\n✓ Backend is running!\n');
      }
    }
  });

  backend.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`[BACKEND ERROR] ${output}`);
  });

  // Handle process termination
  const handleExit = () => {
    console.log('\n\n🛑 Stopping servers...\n');
    frontend.kill('SIGINT');
    backend.kill('SIGINT');
    setTimeout(() => process.exit(0), 1000);
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);

  backend.on('exit', (code) => {
    console.log(`\n❌ Backend exited with code ${code}`);
    frontend.kill();
    process.exit(code || 1);
  });
}, 2000); // Wait 2 seconds for frontend to start before backend

frontend.on('exit', (code) => {
  console.log(`\n❌ Frontend exited with code ${code}`);
  process.exit(code || 1);
});
