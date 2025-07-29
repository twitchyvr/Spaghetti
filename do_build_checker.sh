#!/usr/bin/env bash

#-------------------------------------------------------------------------------
# DigitalOcean App/Project Build Status Checker
#
# This script queries the DigitalOcean public API to gather detailed information
# about a given App Platform application and its associated project. It
# retrieves the list of apps in your account, resolves the ID of the app by
# name, fetches detailed app metadata, enumerates every deployment (build)
# triggered by GitHub pushes or manual actions, and fetches information for
# each deployment such as phase, progress, cause and timing statistics. It
# also looks up project details and lists all resources attached to the project.
#
# Results are saved as raw JSON files in the current working directory and
# human-readable summaries are printed to the terminal using jq. The script
# expects your DigitalOcean API token to be supplied via the
# DIGITALOCEAN_API_KEY or DO_API_TOKEN environment variable. For JSON
# formatting it depends on the jq command line tool – install it with
# `brew install jq` on macOS if it is not available.
#
# References:
#  - The DigitalOcean public API exposes endpoints to list apps
#    (`GET /v2/apps`) and fetch details of a specific app by ID
#    (`GET /v2/apps/{id}`). Once an app is
#    identified, its deployments (builds) can be listed via
#    `GET /v2/apps/{app_id}/deployments` and a specific deployment can be
#    retrieved with `GET /v2/apps/{app_id}/deployments/{deployment_id}`.
#  - Projects and their resources are accessible via `GET /v2/projects/{project_id}`
#    and `GET /v2/projects/{project_id}/resources`.
#-------------------------------------------------------------------------------

set -euo pipefail

# --- Configuration ---

# Read API token from environment variables.
# Using parameter expansion to provide a default empty value if not set.
API_TOKEN="${DIGITALOCEAN_API_KEY:-${DO_API_TOKEN:-}}"

# Allow caller to override app name and project ID via environment variables.
APP_NAME="${APP_NAME:-spaghetti-platform}"
PROJECT_ID="${PROJECT_ID:-e7288fce-d900-43b5-94f2-69d95305387e}"

# Base API endpoint.
API_BASE="https://api.digitalocean.com/v2"

# Create a directory to store raw JSON outputs.
RAW_DIR="raw_output"

# --- Functions ---

# Print a formatted header.
print_header() {
    printf "\n================== %s ==================\n" "$1"
}

# Cleanup function to be called on script exit.
cleanup() {
    # Keep the raw output directory - no cleanup needed
    :
}

# Helper function to perform authenticated GET requests.
# Exits the script if the request fails.
do_get() {
    local url="$1"
    if ! response=$(curl -sSf -H "Authorization: Bearer $API_TOKEN" "$url"); then
        echo "Error: Failed to fetch data from $url" >&2
        exit 1
    fi
    echo "$response"
}

# --- Main Script ---

# Set a trap to call the cleanup function on script exit.
trap cleanup EXIT

# Ensure required commands are present.
for cmd in curl jq; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        printf "Error: %s is required but not installed.\n" "$cmd"
        printf "Please install it (e.g. with 'brew install %s' on macOS) and retry.\n" "$cmd"
        exit 1
    fi
done

# Validate the API token.
if [[ -z "$API_TOKEN" ]]; then
    echo "Error: DigitalOcean API token is not set." >&2
    echo "Set either DIGITALOCEAN_API_KEY or DO_API_TOKEN environment variable before running." >&2
    exit 1
fi

# Create the raw output directory.
mkdir -p "$RAW_DIR"

# Fetch the list of apps.
print_header "Fetching List of Apps"
apps_json=$(do_get "$API_BASE/apps")
echo "$apps_json" > "$RAW_DIR/apps.json"

# Resolve the app ID by name.
app_id=$(echo "$apps_json" | jq -r --arg name "$APP_NAME" '.apps[] | select(.spec.name == $name or .name == $name) | .id' | head -n 1)

if [[ -z "$app_id" || "$app_id" == "null" ]]; then
    printf "Error: Could not find an app named '%s' in your account.\n" "$APP_NAME" >&2
    printf "Available apps:\n" >&2
    echo "$apps_json" | jq -r '.apps[].spec.name' >&2
    exit 1
fi

printf "Resolved app ID: %s\n" "$app_id"

# Fetch detailed app information.
print_header "Retrieving App Details"
app_details_json=$(do_get "$API_BASE/apps/$app_id")
echo "$app_details_json" > "$RAW_DIR/app_${APP_NAME}.json"

# Print a summary of the app.
echo "$app_details_json" | jq -C '
    .app as $a |
    {
        id: $a.id,
        name: ($a.spec.name // $a.name),
        region: ($a.region.slug // $a.region),
        live_url: $a.live_url,
        project_id: $a.project_id,
        created_at: $a.created_at,
        updated_at: $a.updated_at,
        active_deployment_id: ($a.active_deployment.id // null),
        in_progress_deployment_id: ($a.in_progress_deployment.id // null)
    }
'

# List deployments.
print_header "Fetching Deployments"
deployments_json=$(do_get "$API_BASE/apps/$app_id/deployments")
echo "$deployments_json" > "$RAW_DIR/deployments_${APP_NAME}.json"

# Print a table summarizing each deployment.
print_header "Deployment Summary (latest first)"
printf "ID\tPhase\tCause\tCreated At\n"
echo "$deployments_json" | jq -r '
    (.deployments // []) | sort_by(.created_at) | reverse |
    map([.id, .phase, .cause, .created_at]) | .[] | @tsv
' | column -t -s $'\t'

# Iterate through each deployment and fetch details.
saved_json_files=("$RAW_DIR/apps.json" "$RAW_DIR/app_${APP_NAME}.json" "$RAW_DIR/deployments_${APP_NAME}.json")
deployment_ids=$(echo "$deployments_json" | jq -r '.deployments[].id')

if [[ -n "$deployment_ids" ]]; then
  for dep_id in $deployment_ids; do
      print_header "Fetching Details for Deployment $dep_id"
      dep_json=$(do_get "$API_BASE/apps/$app_id/deployments/$dep_id")
      dep_file="$RAW_DIR/deployment_${dep_id}.json"
      echo "$dep_json" > "$dep_file"
      saved_json_files+=("$dep_file")

      echo "$dep_json" | jq -r '
          .deployment as $d |
          {
              id: $d.id,
              phase: $d.phase,
              cause: $d.cause,
              created_at: $d.created_at,
              updated_at: $d.updated_at,
              services: ($d.services // []) | map({name: .name, commit: .source_commit_hash}),
              static_sites: ($d.static_sites // []) | map({name: .name, commit: .source_commit_hash}),
              workers: ($d.workers // []) | map({name: .name, commit: .source_commit_hash}),
              functions: ($d.functions // []) | map({name: .name, commit: .source_commit_hash}),
              progress: ($d.progress | {pending_steps, running_steps, success_steps, error_steps, total_steps}),
              timing: ($d.timing // {})
          }
'
  done
fi

# Fetch project details.
print_header "Retrieving Project Details for Project ID $PROJECT_ID"
project_json=$(do_get "$API_BASE/projects/$PROJECT_ID")
project_file="$RAW_DIR/project_${PROJECT_ID}.json"
echo "$project_json" > "$project_file"
saved_json_files+=("$project_file")

print_header "Project Overview"
echo "$project_json" | jq -r '
    .project as $p |
    {
        id: $p.id,
        name: $p.name,
        description: $p.description,
        purpose: $p.purpose,
        environment: $p.environment,
        created_at: $p.created_at,
        updated_at: $p.updated_at
    }
'

# List resources in the project.
print_header "Fetching Resources Attached to the Project"
resources_json=$(do_get "$API_BASE/projects/$PROJECT_ID/resources")
resources_file="$RAW_DIR/project_${PROJECT_ID}_resources.json"
echo "$resources_json" > "$resources_file"
saved_json_files+=("$resources_file")

print_header "Project Resources"
printf "URN\tAssigned At\n"
echo "$resources_json" | jq -r '
    (.resources // []) | map([.urn, .assigned_at]) | .[] | @tsv
' | column -t -s $'\t'

print_header "JSON Output Files"
for f in "${saved_json_files[@]}"; do
    printf "Saved: %s\n" "$(realpath "$f")"
done

printf "\nScript completed successfully.\n"