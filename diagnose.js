#!/usr/bin/env node

/**
 * YouTube Downloader - Diagnostic & Troubleshooting Tool
 * Tests backend connectivity and logs system information
 */

const http = require('http');
const https = require('https');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     YouTube Downloader - Diagnostic Tool                          ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// 1. System Information
console.log('📊 System Information:');
console.log(`   OS:       ${os.platform()} ${os.release()}`);
console.log(`   Node:     ${process.version}`);
console.log(`   Arch:     ${os.arch()}\n`);

// 2. Check files
console.log('📁 Project Files:');
const files = [
  '.env.local',
  'package.json',
  'pnpm-lock.yaml',
  'python-backend/main.py',
  'python-backend/requirements.txt',
  'python-backend/.env'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const exists = fs.existsSync(fullPath) ? '✓' : '✗';
  console.log(`   ${exists} ${file}`);
});

// 3. Check Python
console.log('\n🐍 Python Environment:');
try {
  const { execSync } = require('child_process');
  const version = execSync('python --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✓ Python found: ${version}`);
} catch {
  console.log('   ✗ Python not found in PATH');
}

// 4. Check ports
console.log('\n🔌 Checking Ports:');

function checkPort(host, port, name) {
  return new Promise((resolve) => {
    const socket = require('net').createConnection(port, host);
    socket.on('connect', () => {
      socket.destroy();
      resolve({ name, host, port, status: 'OPEN ✓' });
    });
    socket.on('error', () => {
      resolve({ name, host, port, status: 'CLOSED ✗' });
    });
    setTimeout(() => {
      socket.destroy();
      resolve({ name, host, port, status: 'TIMEOUT ⏱' });
    }, 1000);
  });
}

Promise.all([
  checkPort('localhost', 3000, 'Frontend (localhost)'),
  checkPort('127.0.0.1', 8000, 'Backend (localhost)'),
  checkPort('192.168.0.7', 3000, 'Frontend (network)'),
  checkPort('192.168.0.7', 8000, 'Backend (network)'),
]).then((results) => {
  results.forEach(({ name, host, port, status }) => {
    console.log(`   ${status} ${name} (${host}:${port})`);
  });
  
  // 5. Environment Variables
  console.log('\n🔐 Environment Variables:');
  const envLocal = path.join(__dirname, '.env.local');
  if (fs.existsSync(envLocal)) {
    const content = fs.readFileSync(envLocal, 'utf-8');
    const url = content.match(/NEXT_PUBLIC_API_URL=(.+)/)?.[1];
    console.log(`   ✓ NEXT_PUBLIC_API_URL: ${url || 'not set'}`);
  } else {
    console.log('   ✗ .env.local not found');
  }
  
  // 6. Test Backend Health
  console.log('\n🏥 Testing Backend Health:');
  testBackendHealth();
});

function testBackendHealth() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.7:8000';
  const url = `${apiUrl}/health`;
  
  console.log(`   Checking: ${url}`);
  
  const request = apiUrl.startsWith('https') ? https : http;
  const options = new URL(url);
  
  const req = request.get(options, (res) => {
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   ✓ Backend is healthy!`);
        console.log(`   Response: ${data.substring(0, 100)}`);
        printSummary();
      });
    } else {
      console.log(`   ✗ Unexpected status: ${res.statusCode}`);
      printSummary();
    }
  });
  
  req.on('error', (err) => {
    console.log(`   ✗ Cannot reach backend`);
    console.log(`   Error: ${err.message}`);
    printSummary();
  });
  
  setTimeout(() => {
    req.abort();
    console.log('   ⏱ Request timeout');
    printSummary();
  }, 3000);
}

function printSummary() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                    Diagnostic Summary                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  console.log('💡 Troubleshooting Guide:\n');
  
  console.log('1. Backend Connection Refused:');
  console.log('   - Run: pnpm run setup');
  console.log('   - Run: pnpm run dev');
  console.log('   - Wait 10 seconds for backend to start\n');
  
  console.log('2. Python not found:');
  console.log('   - Install Python from: https://python.org');
  console.log('   - Add to PATH\n');
  
  console.log('3. FFmpeg warnings:');
  console.log('   - Install FFmpeg from: https://ffmpeg.org\n');
  
  console.log('4. Port already in use:');
  console.log('   - Kill process using port 3000/8000');
  console.log('   - Or change port in configuration\n');
  
  console.log('📝 Next Steps:');
  console.log('   1. pnpm run setup');
  console.log('   2. pnpm run dev');
  console.log('   3. Open http://192.168.0.7:3000\n');
}
