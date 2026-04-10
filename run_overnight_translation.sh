#!/bin/bash
cd /workspace/Balidreamphoto-

echo "Starting HTML translation..."
uv run python translate_site.py > translation_site.log 2>&1

echo "Starting JS translation..."
uv run python translate_places_js.py > translation_js.log 2>&1

echo "All translations complete."
uv run python translate_supabase.py > translation_supabase.log 2>&1
