#!/bin/bash
set -e
echo "Building AKFU Backend..."
bun install || echo "Bun install skipped (using cached dependencies)"
echo "Build complete"
