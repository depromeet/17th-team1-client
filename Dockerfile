FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app

# pnpm 버전 고정
RUN npm install -g pnpm@9.1.0

# pnpm 설정 파일들 복사
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# 빌드 시 환경변수 설정
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_REDIRECT_ORIGIN
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
ENV NEXT_PUBLIC_REDIRECT_ORIGIN=${NEXT_PUBLIC_REDIRECT_ORIGIN}
ENV NODE_ENV=production

RUN pnpm run build

FROM base AS runner
WORKDIR /app

# 계정 설정
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Next.js standalone 빌드 아티팩트만 복사 (중요!)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/next.config.ts .
COPY --from=builder /app/package.json .

ENV PORT=80
CMD ["node", "server.js"]