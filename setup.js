#!/usr/bin/env node

/**
 * YouTube Downloader - Complete Setup and Installation
 * Handles all initialization and dependency installation
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     YouTube Downloader - Setup & Installation Script             ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

try {
  // Step 1: Install Node dependencies
  console.log('📦 Step 1: Installing Node.js dependencies...');
  if (fs.existsSync('pnpm-lock.yaml')) {
    execSync('pnpm install', { stdio: 'inherit' });
  } else {
    execSync('npm install', { stdio: 'inherit' });
  }
  console.log('✓ Node dependencies installed!\n');

  // Step 2: Setup Python
  console.log('🐍 Step 2: Setting up Python environment...');
  
  const backendDir = path.join(__dirname, 'python-backend');
  const venvDir = path.join(backendDir, 'venv');
  const requirementsFile = path.join(backendDir, 'requirements.txt');
  const pipCmd = isWindows 
    ? path.join(venvDir, 'Scripts', 'pip.exe')
    : path.join(venvDir, 'bin', 'pip');
  
  // Check if venv exists
  if (!fs.existsSync(venvDir)) {
    console.log('   Creating virtual environment...');
    execSync('python -m venv venv', { cwd: backendDir, stdio: 'inherit' });
  }
  
  // Upgrade pip (skip if fails - not critical)
  console.log('   Upgrading pip...');
  try {
    execSync(`${pipCmd} install --upgrade pip`, { stdio: 'pipe' });
    console.log('   ✓ Pip upgraded');
  } catch {
    console.log('   ⚠ Pip upgrade failed (continuing with install)');
  }
  
  // Install Python dependencies
  console.log('   Installing Python dependencies...');
  execSync(`${pipCmd} install -r requirements.txt`, { cwd: backendDir, stdio: 'inherit' });
  
  console.log('✓ Python environment ready!\n');

  // Step 3: Verify FFmpeg
  console.log('🎬 Step 3: Checking FFmpeg...');
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    console.log('✓ FFmpeg is available!\n');
  } catch {
    console.log('⚠ FFmpeg not found in PATH');
    console.log('  Please ensure FFmpeg is installed: https://ffmpeg.org/download.html\n');
  }

  // Step 4: Create environment files
  console.log('⚙️  Step 4: Setting up environment files...');
  
  // Detect the machine's IP address for network access
  let localIP = '192.168.0.7';
  const networkInterfaces = os.networkInterfaces();
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== '192.168.0.7') break;
  }
  
  const envLocalPath = path.join(__dirname, '.env.local');
  const backendEnvPath = path.join(backendDir, '.env');
  
  if (!fs.existsSync(envLocalPath)) {
    fs.writeFileSync(envLocalPath, `# Local Development
# Note: The frontend will automatically use the correct IP when accessed from mobile devices
# This URL is used as fallback for SSR/build time
NEXT_PUBLIC_API_URL=http://${localIP}:8000
`);
    console.log(`   Created .env.local with IP: ${localIP}`);
  }
  
  if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, `# Backend Environment
DEBUG=False
`);
    console.log('   Created python-backend/.env');
  }
  
  console.log('✓ Environment files ready!\n');

  // Step 5: Summary
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✓ Setup Complete!                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📝 Next Steps:\n');
  console.log('1. Start development servers:');
  console.log(`   ${isWindows ? '$' : '$'} pnpm run dev\n`);
  
  console.log('2. Access the application:');
  console.log('   Desktop:  http://localhost:3000');
  console.log('   Mobile:   http://192.168.0.7:3000\n');
  
  console.log('3. Backend API:');
  console.log('   Local:    http://localhost:8000');
  console.log('   Network:  http://192.168.0.7:8000\n');
  
} catch (error) {
  console.error('\n❌ Setup failed!', error.message);
  process.exit(1);
}
