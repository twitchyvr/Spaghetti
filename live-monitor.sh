#!/bin/bash

# live-monitor.sh
# This script monitors file changes in the current directory and its subdirectories.
# It ignores the .git and node_modules directories.

# Get the absolute path of the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set the directory to watch to the script's directory
WATCH_PATH="$SCRIPT_DIR"

# Use fswatch to monitor the directory
fswatch -o "$WATCH_PATH" | while read -r event; do
  # Extract the file path from the event
  file_path=$(echo "$event" | sed -E 's/.* (.*)//')

  # Check if the file is in the .git or node_modules directory
  if [[ "$file_path" != *".git/"* && "$file_path" != *"node_modules/"* ]]; then
    # Get the event type
    event_type=$(echo "$event" | awk '{print $NF}')

    # Print a message based on the event type
    case "$event_type" in
      "Created")
        echo "FILE CREATED: $file_path"
        ;;
      "Updated")
        echo "FILE MODIFIED: $file_path"
        ;;
      "Removed")
        echo "FILE DELETED: $file_path"
        ;;
    esac
  fi
done
