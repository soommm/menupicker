/**
 * 서버(3001)를 먼저 켠 뒤, 포트가 준비되면 클라이언트(5173)를 실행합니다.
 * 사용법: 프로젝트 루트에서 node scripts/start-all.js 또는 npm start
 */
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SERVER_PORT = Number(process.env.PORT || 3001);

function waitForPort(port, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tryConnect = () => {
      const socket = new net.Socket();
      const done = (ok) => {
        try { socket.destroy(); } catch (_) {}
        if (ok) resolve();
        else reject(new Error('서버가 시작되지 않았어요.'));
      };
      socket.setTimeout(500);
      socket.on('connect', () => done(true));
      socket.on('error', () => {
        if (Date.now() - start > timeoutMs) return done(false);
        setTimeout(tryConnect, 300);
      });
      socket.on('timeout', () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) return done(false);
        setTimeout(tryConnect, 300);
      });
      socket.connect(port, '127.0.0.1');
    };
    tryConnect();
  });
}

function run(cmd, args, cwd, label) {
  const child = spawn(cmd, args, {
    cwd: cwd || ROOT,
    stdio: 'inherit',
    shell: true,
    windowsHide: true
  });
  child.on('error', (err) => {
    console.error(`[${label}]`, err.message);
  });
  return child;
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('error', () => resolve(false));
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.connect(port, '127.0.0.1');
  });
}

(async () => {
  const serverDir = path.join(ROOT, 'server');
  const clientDir = path.join(ROOT, 'client');
  let serverProcess = null;

  const alreadyOpen = await isPortOpen(SERVER_PORT);
  if (alreadyOpen) {
    console.log(`\n  >> 서버가 이미 http://localhost:${SERVER_PORT} 에서 실행 중이에요.\n`);
  } else {
    console.log('\n  [1/2] 서버(3001) 시작 중...\n');
    serverProcess = run('node', ['index.js'], serverDir, 'server');
    await waitForPort(SERVER_PORT).then(
      () => {
        console.log(`\n  >> 서버가 http://localhost:${SERVER_PORT} 에서 준비됐어요.\n`);
      },
      (err) => {
        console.error(err.message);
        process.exit(1);
      }
    );
  }

  console.log('  [2/2] 화면(5173) 시작 중... 브라우저에서 http://localhost:5173 접속하세요.\n');
  const clientProcess = run('npm', ['run', 'dev'], clientDir, 'client');

  const exit = (code) => {
    if (serverProcess) serverProcess.kill('SIGTERM');
    clientProcess.kill('SIGTERM');
    process.exit(code || 0);
  };
  process.on('SIGINT', () => exit(0));
  process.on('SIGTERM', () => exit(0));

  if (serverProcess) {
    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) exit(code);
    });
  }
})();
