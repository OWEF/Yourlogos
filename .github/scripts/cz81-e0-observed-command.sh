#!/usr/bin/env bash
# CZ-81 E0 safe command wrapper. NO model is called unless a separately
# approved workflow explicitly invokes this script with its own argv.
# NEVER upload RAW_DIR. Upload OBS_REPORT_DIR only; it contains numeric metadata.
set -Eeuo pipefail
umask 077
if [[ "${1:-}" != "--" || "$#" -lt 2 ]]; then
  echo "Usage: observed-command.sh -- command [args ...]" >&2
  exit 2
fi
shift
: "${OBS_REPORT_DIR:?Required metadata-only report path}"
: "${OBS_CANDIDATE:?Required expected output artwork path}"
OBS_TIMEOUT_SECONDS="${OBS_TIMEOUT_SECONDS:-600}"
OBS_SAMPLE_INTERVAL_SECONDS="${OBS_SAMPLE_INTERVAL_SECONDS:-30}"
[[ "$OBS_TIMEOUT_SECONDS" =~ ^[0-9]+$ ]] || exit 2
[[ "$OBS_SAMPLE_INTERVAL_SECONDS" =~ ^[0-9]+$ ]] || exit 2
(( OBS_TIMEOUT_SECONDS>=1 && OBS_TIMEOUT_SECONDS<=600 )) || exit 2
(( OBS_SAMPLE_INTERVAL_SECONDS>=1 && OBS_SAMPLE_INTERVAL_SECONDS<=120 )) || exit 2
observer="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/cz81-e0-diagnostics.mjs"
test -s "$observer"
node --check "$observer"
mkdir -p "$OBS_REPORT_DIR"
raw="$(mktemp -d "${RUNNER_TEMP:-/tmp}/cz81-e0-raw.XXXXXXXX")"
child=''
sampler=''
cleanup(){
  if [[ -n "$sampler" ]]; then kill "$sampler" 2>/dev/null || true; fi
  if [[ -n "$child" ]]; then kill "$child" 2>/dev/null || true; fi
  rm -rf -- "$raw"
}
trap cleanup EXIT
# Do not print argv, prompt, stdout, stderr, tokens or environment.
timeout --signal=TERM --kill-after=5s "${OBS_TIMEOUT_SECONDS}s" "$@" > "$raw/stdout.jsonl" 2> "$raw/stderr.log" &
child=$!
start=$SECONDS
(
  while kill -0 "$child" 2>/dev/null; do
    node "$observer" sample "--report-dir=$OBS_REPORT_DIR" "--raw-dir=$raw" \
      "--candidate=$OBS_CANDIDATE" "--seconds=$((SECONDS-start))"
    sleep "$OBS_SAMPLE_INTERVAL_SECONDS"
  done
) &
sampler=$!
set +e
wait "$child"
rc=$?
set -e
kill "$sampler" 2>/dev/null || true
wait "$sampler" 2>/dev/null || true
sampler=''
child=''
duration=$((SECONDS-start))
node "$observer" sample "--report-dir=$OBS_REPORT_DIR" "--raw-dir=$raw" \
  "--candidate=$OBS_CANDIDATE" "--seconds=$duration"
node "$observer" finalize "--report-dir=$OBS_REPORT_DIR" "--raw-dir=$raw" \
  "--candidate=$OBS_CANDIDATE" "--seconds=$duration" "--exit-code=$rc"
# Explicitly distinguish model status from instrumentation success, so the
# workflow can upload safe summary before applying a separate fail-closed gate.
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  printf 'model_exit_code=%s\n' "$rc" >> "$GITHUB_OUTPUT"
fi
echo "Diagnostics complete: model exit $rc; metadata-only report generated."
exit 0
