/**
 * 모바일 기기에서 로컬 개발 서버를 확인하기 위한 터널 + 개발 서버 실행 스크립트
 *
 * 1. cloudflared 임시 터널(trycloudflare.com)을 연다
 * 2. 발급된 주소를 NEXT_PUBLIC_REDIRECT_ORIGIN으로 넘겨 next dev를 실행한다
 *    (카카오 로그인 후 localhost가 아닌 터널 주소로 돌아오게 하기 위함)
 *
 * 사용법: pnpm dev:tunnel  (포트 변경: PORT=3001 pnpm dev:tunnel)
 */
const { spawn, spawnSync } = require("child_process");

const PORT = process.env.PORT || "3000";
const TUNNEL_URL_PATTERN = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;
const TUNNEL_TIMEOUT_MS = 30000;

const children = [];

function shutdown(code) {
  children.forEach(child => child.kill());
  process.exit(code);
}

function checkCloudflared() {
  const result = spawnSync("cloudflared", ["--version"], { stdio: "ignore" });
  if (result.error || result.status !== 0) {
    console.error("[dev-tunnel] cloudflared를 찾을 수 없습니다.");
    console.error("  설치: brew install cloudflared");
    console.error("  자세한 내용: docs/mobile-dev-tunnel.md");
    process.exit(1);
  }
}

function openTunnel() {
  return new Promise((resolve, reject) => {
    const tunnel = spawn("cloudflared", ["tunnel", "--url", `http://localhost:${PORT}`]);
    children.push(tunnel);

    const timer = setTimeout(() => reject(new Error("터널 주소를 받지 못했습니다 (30초 초과)")), TUNNEL_TIMEOUT_MS);

    // cloudflared는 주소를 stderr로 출력한다
    tunnel.stderr.on("data", chunk => {
      const match = chunk.toString().match(TUNNEL_URL_PATTERN);
      if (match) {
        clearTimeout(timer);
        resolve(match[0]);
      }
    });

    tunnel.on("exit", code => {
      clearTimeout(timer);
      reject(new Error(`cloudflared가 종료되었습니다 (code ${code})`));
    });
  });
}

async function main() {
  checkCloudflared();

  const tunnelUrl = await openTunnel();
  console.log("\n[dev-tunnel] 모바일에서 아래 주소로 접속하세요");
  console.log(`  ${tunnelUrl}\n`);

  const dev = spawn("pnpm", ["exec", "next", "dev", "-p", PORT], {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_REDIRECT_ORIGIN: tunnelUrl },
  });
  children.push(dev);
  dev.on("exit", code => shutdown(code ?? 0));
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

main().catch(error => {
  console.error(`[dev-tunnel] ${error.message}`);
  shutdown(1);
});
