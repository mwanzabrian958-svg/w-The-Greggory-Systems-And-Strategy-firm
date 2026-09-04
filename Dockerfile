# =============================================================================
# The Greggory Systems And Strategy Firm — container manifest
#
# Used by Render's "Web Service -> Dockerfile" flow (and any other Docker host).
# The project ALSO ships a render.yaml Blueprint (native Node runtime) — both
# deploy the exact same thing (Express API + built React dist/ on one origin).
# The container file simply gives the "Select manifest" / Docker path a
# manifest to find, and mirrors the blueprint's build & start commands.
#
# Build:   package.json at "$site/" → npm install (incl. dev) → vite build
# Runtime: prod deps only + dist/ + server code + schema/bootstrap scripts.
# =============================================================================
FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV NODE_ENV=production

# App lives in this subdirectory of the repo (keep the source layout intact).
COPY "The-Greggory-Systems-And-Strategy-firm website/package.json" ./package.json
COPY "The-Greggory-Systems-And-Strategy-firm website/package-lock.json" ./package-lock.json
RUN npm install --no-audit --no-fund --include=dev

COPY "The-Greggory-Systems-And-Strategy-firm website/" ./
RUN npm run build && rm -rf node_modules

# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/server ./server
COPY --from=build /app/backend ./backend
COPY --from=build /app/database ./database
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/index.html ./index.html

RUN npm install --no-audit --no-fund --omit=dev \
 && mkdir -p backups uploads public

EXPOSE 3000
# Mirror render.yaml: bootstrap the (possibly empty) cloud MySQL, sync the
# schema manifest, then serve the API + SPA. Both bootstrap scripts are
# idempotent and exit 0 even when the DB is unreachable, so the site still boots.
CMD ["sh", "-c", "node scripts/import-if-empty.js && node scripts/sync-db-schema.js && node server.js"]