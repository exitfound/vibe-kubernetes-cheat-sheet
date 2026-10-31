#!/usr/bin/env bash
# Stages the shippable site into <dir> exactly as deploy.yml publishes it: an allowlist of root files and
# app folders, then every internal doc removed by NAME. verify.yml stages the same way and tests the result.
set -euo pipefail
out="${1:?usage: tools/deploy/stage.sh <dir>}"
case "$out" in /*) ;; *) out="$PWD/$out" ;; esac
cd "$(dirname "$0")/../.."
mkdir -p "$out"
cp index.html 404.html favicon.svg favicon.ico robots.txt sitemap.xml llms.txt CNAME "$out/"
cp -r images cli diagrams scheme "$out/"
rm -rf "$out/diagrams/test"
# Two shapes of design record: the per-category CARDS.md and the per-card CARDS/ folder beside it.
# README.md and README.ru.md are the GitHub guides of a sub-app, not pages. Exclusion is by NAME, so a
# directory needs its own clause. -depth: files go before their folder.
find "$out" -depth \( -name CLAUDE.md -o -name CARDS.md -o -name CANON.md -o -name README.md -o -name README.ru.md -o -name CARDS -type d \) -exec rm -rf {} +
