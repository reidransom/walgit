#!/usr/bin/env bash
# Build TLC from a fixed upstream commit; the v1.8.0 release jar is replaced
# on every upstream master push and Sonatype snapshots expire after 90 days.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
revision="240fd525d11d4b1fea9b06142444c5972452222d"
jar="$root/target/tla2tools-$revision.jar"

command -v java >/dev/null || { echo "TLA+: Java 11+ is required" >&2; exit 2; }
if [[ -f "$jar" ]]; then
  printf '%s\n' "$jar"
  exit 0
fi
for tool in git ant; do
  command -v "$tool" >/dev/null || { echo "TLA+: $tool is required to build TLC" >&2; exit 2; }
done

mkdir -p "$root/target"
work="$(mktemp -d "$root/target/tla2tools-build.XXXXXX")"
trap 'rm -rf "$work"' EXIT
git init -q "$work/source"
git -C "$work/source" fetch --depth=1 https://github.com/tlaplus/tlaplus.git "$revision" >&2
git -C "$work/source" checkout -q --detach FETCH_HEAD
[[ "$(git -C "$work/source" rev-parse HEAD)" == "$revision" ]] || {
  echo "TLA+: fetched an unexpected revision" >&2
  exit 1
}

# Upstream's info target walks the entire Git history, which a shallow fetch
# lacks. Supply the pinned revision's build metadata and run only jar targets.
(
  cd "$work/source/tlatools/org.lamport.tlatools"
  ant -f customBuild.xml -Dgit.branch=pinned -Dgit.tag= \
    -Dgit.revision="$revision" -Dgit.shortRevision="${revision:0:7}" \
    -Dgit.commitsCount=8998 compile compile-test dist
) >&2
mv "$work/source/tlatools/org.lamport.tlatools/dist/tla2tools.jar" "$jar"
printf '%s\n' "$jar"
