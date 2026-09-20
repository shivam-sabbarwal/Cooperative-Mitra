FROM node:20-alpine AS builder

ARG BACKEND_INTERNAL_URL
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NEXT_PUBLIC_API_BASE_URL=/api/v1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_PUBLIC_API_BASE_URL=/api/v1

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["npm", "start"]
