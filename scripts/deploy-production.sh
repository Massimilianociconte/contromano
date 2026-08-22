#!/bin/bash
set -e
export PATH="$HOME/.turso/bin:$PATH"
TURSO="$HOME/.turso/turso"

echo "── 1/6 Database Turso"
$TURSO db create contromano --location aws-eu-west-1 >/dev/null 2>&1 || echo "(già esistente)"
URL=$($TURSO db show contromano --url)
TOKEN=$($TURSO db tokens create contromano)
echo "   $URL"

echo "── 2/6 Variabili su Vercel"
AUTHFILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
export AUTHFILE
VTOKEN=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.AUTHFILE,'utf8')).token)")
PROJECT="prj_GkYX9tWeC5STcvOVIXwgPMVtPuBc"
for KV in "TURSO_DATABASE_URL:$URL" "TURSO_AUTH_TOKEN:$TOKEN"; do
  KEY="${KV%%:*}"; VAL="${KV#*:}"
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT/env?upsert=true" \
    -H "Authorization: Bearer $VTOKEN" -H "Content-Type: application/json" \
    -d "{\"key\":\"$KEY\",\"value\":\"$VAL\",\"type\":\"sensitive\",\"target\":[\"production\"]}" | grep -q error && { echo "Errore env $KEY"; exit 1; } || echo "   $KEY ✓"
done

echo "── 3/6 Migrazione + seed sul DB remoto"
export TURSO_DATABASE_URL="$URL" TURSO_AUTH_TOKEN="$TOKEN"
cd "$(dirname "$0")/.."
npx tsx lib/db/migrate.ts
npx tsx scripts/seed.mts

echo "── 4/6 Deploy production"
npx vercel --prod 2>&1 | tail -2

echo "── 5/6 Verifica sito live"
sleep 5
for p in "/" "/sitemap.xml" "/robots.txt" "/esplora"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://contromano.vercel.app$p")
  echo "   $CODE $p"
done

echo "── 6/6 Fatto ✓  Admin: npx tsx scripts/promote.mts <tuo-username>"
