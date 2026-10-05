const { spawn } = require('child_process');

console.log('\x1b[36m========================================\x1b[0m');
console.log('\x1b[36m   BharatAero Full-Stack Dev Launcher   \x1b[0m');
console.log('\x1b[36m========================================\x1b[0m\n');
console.log('Starting Backend (Port 5000) & Frontend (Port 3000)...\n');

function formatOutput(prefix, data, stream) {
  const lines = data.toString().split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === lines.length - 1 && line === '') continue;
    stream.write(`${prefix} ${line}\n`);
  }
}

function startProcess(name, command, args, colorCode) {
  const proc = spawn(command, args, {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  const prefix = `\x1b[${colorCode}m[${name}]\x1b[0m`;

  proc.stdout.on('data', (chunk) => formatOutput(prefix, chunk, process.stdout));
  proc.stderr.on('data', (chunk) => formatOutput(prefix, chunk, process.stderr));

  proc.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`${prefix} Process exited with code ${code}`);
    }
  });

  return proc;
}

const backend = startProcess('BACKEND', 'npm', ['run', 'dev', '--prefix', 'backend'], '35');
const frontend = startProcess('FRONTEND', 'npm', ['run', 'dev', '--prefix', 'frontend'], '36');

function cleanup() {
  console.log('\n\x1b[33mStopping BharatAero servers...\x1b[0m');
  if (process.platform === 'win32') {
    if (backend && backend.pid) {
      spawn('taskkill', ['/pid', backend.pid, '/f', '/t'], { stdio: 'ignore' });
    }
    if (frontend && frontend.pid) {
      spawn('taskkill', ['/pid', frontend.pid, '/f', '/t'], { stdio: 'ignore' });
    }
  } else {
    if (backend) backend.kill('SIGTERM');
    if (frontend) frontend.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
