#!/bin/bash

# Exit on error
set -e

SCHEMA_DIR="./schema"
TEMP_DIR="./temp_ocsf_schema"

# Check if schema directory exists
if [ -d "$SCHEMA_DIR" ]; then
    echo "Schema directory exists. Remove if you want to update the schema."
    exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Clone the repository
echo "Cloning OCSF schema repository..."
git clone https://github.com/ocsf/ocsf-schema.git "$TEMP_DIR"

# Create schema directory
mkdir -p "$SCHEMA_DIR"

# Move schema files to schema directory
echo "Moving schema files..."
mv "$TEMP_DIR"/* "$SCHEMA_DIR/"

# Cleanup
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

echo "Schema update complete!"
