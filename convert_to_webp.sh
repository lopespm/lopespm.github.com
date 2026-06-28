#!/usr/bin/env bash
# Converts all .png/.jpg/.jpeg files under source/files/ to .webp
# Skips conversion if the .webp already exists and is newer than the source file.

set -euo pipefail

SEARCH_DIR="$(dirname "$0")/source/files/why_is_my_kitchen_so_clean"

find "$SEARCH_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) | while IFS= read -r src; do
  basename=$(basename "$src")
  if [[ "$basename" == thumb* || "$basename" == pthumb* ]]; then
    echo "SKIP  $src (thumbnail)"
    continue
  fi

  webp="${src%.*}.webp"

  if [[ -f "$webp" ]]; then
    src_mtime=$(stat -f "%m" "$src")
    webp_mtime=$(stat -f "%m" "$webp")
    if [[ "$src_mtime" == "$webp_mtime" ]]; then
      echo "SKIP  $src (webp is up to date)"
      continue
    fi
  fi

  echo "CONVERT $src -> $webp"
  img2webp "$src" -o "$webp"
  touch -r "$src" "$webp"
done

echo "Done."
