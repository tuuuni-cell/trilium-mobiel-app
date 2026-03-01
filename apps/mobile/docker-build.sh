#!/bin/bash
# ============================================================================
# Trilium Notes Mobile - Docker APK Build Script
# ============================================================================
# This script builds the Android APK entirely inside Docker.
# No Android SDK, Java, or Node.js installation required on your machine.
#
# Usage:
#   cd apps/mobile
#   chmod +x docker-build.sh
#   ./docker-build.sh
#
# Output: ./output/trilium-notes-debug.apk
# ============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/output"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Trilium Notes Mobile - Android APK Builder             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Create output directory
mkdir -p "${OUTPUT_DIR}"

echo "[1/3] Building Docker image (this may take 10-15 min on first run)..."
echo "     Build context: ${SCRIPT_DIR}/../.."
echo ""
docker build \
    -f "${SCRIPT_DIR}/Dockerfile.android" \
    -t trilium-mobile-builder \
    "${SCRIPT_DIR}/../.."

echo ""
echo "[2/3] Extracting APK..."
docker run --rm \
    -v "${OUTPUT_DIR}:/output" \
    trilium-mobile-builder

echo ""
echo "[3/3] Done!"
echo ""

if [ -f "${OUTPUT_DIR}/trilium-notes.apk" ]; then
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  SUCCESS! APK built successfully.                       ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""
    echo "  APK location: ${OUTPUT_DIR}/trilium-notes.apk"
    echo "  APK size:     $(du -h "${OUTPUT_DIR}/trilium-notes.apk" | cut -f1)"
    echo ""
    echo "  To install on your Android device:"
    echo "    1. Transfer the APK to your phone"
    echo "    2. Enable 'Install from unknown sources' in Settings"
    echo "    3. Open the APK file to install"
    echo ""
    echo "  Or install via ADB:"
    echo "    adb install ${OUTPUT_DIR}/trilium-notes.apk"
else
    echo "ERROR: APK not found. Check build output above for errors."
    exit 1
fi
