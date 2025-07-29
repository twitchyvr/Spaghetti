#!/bin/bash

# Enterprise Documentation Platform - System Monitoring Script
# Version: 1.0.0
# Purpose: Automated system health monitoring and alerting

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/system-monitoring.log"
ALERT_THRESHOLD_CPU=70
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_DISK=90
HEALTH_CHECK_TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    local level=$1
    shift
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$level] $*" | tee -a "$LOG_FILE"
}

# Health check functions
check_container_health() {
    local container_name=$1
    local status
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name"; then
        status=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep "$container_name" | awk '{print $2}')
        if [[ $status == "Up" ]]; then
            echo "healthy"
        else
            echo "unhealthy"
        fi
    else
        echo "not_running"
    fi
}

check_api_health() {
    local health_status="unknown"
    
    # Try the direct health endpoint first
    if curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "http://localhost:5001/health" >/dev/null 2>&1; then
        health_status="healthy"
    elif curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "http://localhost:5001/api/health" >/dev/null 2>&1; then
        health_status="healthy"
    else
        # Check if container is running
        if docker ps | grep -q "enterprise-docs-api"; then
            health_status="container_running_endpoint_failing"
        else
            health_status="container_not_running"
        fi
    fi
    
    echo "$health_status"
}

check_database_connectivity() {
    local status="unknown"
    
    if docker exec enterprise-docs-db pg_isready -U enterprisedocs -d enterprisedocs >/dev/null 2>&1; then
        status="healthy"
    else
        status="unhealthy"
    fi
    
    echo "$status"
}

check_redis_connectivity() {
    local status="unknown"
    
    if docker exec enterprise-docs-cache redis-cli ping >/dev/null 2>&1; then
        status="healthy"
    else
        status="unhealthy"
    fi
    
    echo "$status"
}

check_elasticsearch_health() {
    local status="unknown"
    
    if curl -s --max-time "$HEALTH_CHECK_TIMEOUT" "http://localhost:9200/_cluster/health" | grep -q "green\|yellow"; then
        status="healthy"
    else
        status="unhealthy"
    fi
    
    echo "$status"
}

# Resource monitoring functions
get_container_resources() {
    local container_name=$1
    
    if docker ps | grep -q "$container_name"; then
        docker stats --no-stream --format "{{.CPUPerc}}\t{{.MemUsage}}" "$container_name"
    else
        echo "N/A\tN/A"
    fi
}

check_disk_usage() {
    df -h / | awk 'NR==2 {print $5}' | sed 's/%//'
}

check_system_memory() {
    if command -v free >/dev/null 2>&1; then
        free | awk 'NR==2{printf "%.0f", $3*100/$2}'
    else
        # macOS fallback
        vm_stat | awk '
        /Pages free:/ { free = $3 }
        /Pages active:/ { active = $3 }
        /Pages inactive:/ { inactive = $3 }
        /Pages wired down:/ { wired = $4 }
        END { total = free + active + inactive + wired; used = active + inactive + wired; printf "%.0f", used*100/total }
        '
    fi
}

# Alert functions
send_alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $severity in
        "CRITICAL")
            echo -e "${RED}[CRITICAL ALERT] $timestamp: $message${NC}"
            log "CRITICAL" "$message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING] $timestamp: $message${NC}"
            log "WARNING" "$message"
            ;;
        "INFO")
            echo -e "${BLUE}[INFO] $timestamp: $message${NC}"
            log "INFO" "$message"
            ;;
    esac
}

# Main monitoring function
run_system_check() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local alerts=0
    
    echo -e "${GREEN}=== Enterprise Documentation Platform - System Health Check ===${NC}"
    echo "Timestamp: $timestamp"
    echo ""
    
    # Container health checks
    echo -e "${BLUE}Container Health Status:${NC}"
    
    containers=("enterprise-docs-frontend" "enterprise-docs-api" "enterprise-docs-db" "enterprise-docs-cache" "enterprise-docs-search")
    
    for container in "${containers[@]}"; do
        health=$(check_container_health "$container")
        case $health in
            "healthy")
                echo -e "  $container: ${GREEN}✓ Healthy${NC}"
                ;;
            "unhealthy")
                echo -e "  $container: ${RED}✗ Unhealthy${NC}"
                send_alert "CRITICAL" "Container $container is unhealthy"
                ((alerts++))
                ;;
            "not_running")
                echo -e "  $container: ${RED}✗ Not Running${NC}"
                send_alert "CRITICAL" "Container $container is not running"
                ((alerts++))
                ;;
        esac
    done
    
    echo ""
    
    # Service connectivity checks
    echo -e "${BLUE}Service Connectivity:${NC}"
    
    api_health=$(check_api_health)
    case $api_health in
        "healthy")
            echo -e "  API Health: ${GREEN}✓ Accessible${NC}"
            ;;
        "container_running_endpoint_failing")
            echo -e "  API Health: ${YELLOW}⚠ Container running but endpoints failing${NC}"
            send_alert "WARNING" "API endpoints returning 401 - authentication issue detected"
            ((alerts++))
            ;;
        "container_not_running")
            echo -e "  API Health: ${RED}✗ Container not running${NC}"
            send_alert "CRITICAL" "API container is not running"
            ((alerts++))
            ;;
        *)
            echo -e "  API Health: ${RED}✗ Unknown status${NC}"
            send_alert "WARNING" "API health status unknown"
            ((alerts++))
            ;;
    esac
    
    db_health=$(check_database_connectivity)
    if [[ $db_health == "healthy" ]]; then
        echo -e "  Database: ${GREEN}✓ Connected${NC}"
    else
        echo -e "  Database: ${RED}✗ Connection failed${NC}"
        send_alert "CRITICAL" "Database connection failed"
        ((alerts++))
    fi
    
    redis_health=$(check_redis_connectivity)
    if [[ $redis_health == "healthy" ]]; then
        echo -e "  Redis Cache: ${GREEN}✓ Connected${NC}"
    else
        echo -e "  Redis Cache: ${RED}✗ Connection failed${NC}"
        send_alert "CRITICAL" "Redis connection failed"
        ((alerts++))
    fi
    
    es_health=$(check_elasticsearch_health)
    if [[ $es_health == "healthy" ]]; then
        echo -e "  Elasticsearch: ${GREEN}✓ Healthy${NC}"
    else
        echo -e "  Elasticsearch: ${YELLOW}⚠ Degraded${NC}"
        send_alert "WARNING" "Elasticsearch cluster health degraded"
        ((alerts++))
    fi
    
    echo ""
    
    # Resource utilization
    echo -e "${BLUE}Resource Utilization:${NC}"
    
    disk_usage=$(check_disk_usage)
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        echo -e "  Disk Usage: ${RED}${disk_usage}% (Critical)${NC}"
        send_alert "CRITICAL" "Disk usage is at ${disk_usage}%"
        ((alerts++))
    elif [[ $disk_usage -gt 80 ]]; then
        echo -e "  Disk Usage: ${YELLOW}${disk_usage}% (Warning)${NC}"
        send_alert "WARNING" "Disk usage is at ${disk_usage}%"
    else
        echo -e "  Disk Usage: ${GREEN}${disk_usage}% (Normal)${NC}"
    fi
    
    memory_usage=$(check_system_memory)
    if [[ $memory_usage -gt $ALERT_THRESHOLD_MEMORY ]]; then
        echo -e "  Memory Usage: ${RED}${memory_usage}% (Critical)${NC}"
        send_alert "CRITICAL" "Memory usage is at ${memory_usage}%"
        ((alerts++))
    elif [[ $memory_usage -gt 70 ]]; then
        echo -e "  Memory Usage: ${YELLOW}${memory_usage}% (Warning)${NC}"
    else
        echo -e "  Memory Usage: ${GREEN}${memory_usage}% (Normal)${NC}"
    fi
    
    echo ""
    
    # Container resource details
    echo -e "${BLUE}Container Resource Details:${NC}"
    for container in "${containers[@]}"; do
        resources=$(get_container_resources "$container")
        cpu=$(echo "$resources" | cut -f1)
        memory=$(echo "$resources" | cut -f2)
        
        if [[ $cpu != "N/A" ]]; then
            cpu_num=$(echo "$cpu" | sed 's/%//')
            if (( $(echo "$cpu_num > $ALERT_THRESHOLD_CPU" | bc -l) )); then
                echo -e "  $container: CPU ${RED}$cpu${NC}, Memory $memory"
                send_alert "WARNING" "Container $container CPU usage is $cpu"
            else
                echo -e "  $container: CPU ${GREEN}$cpu${NC}, Memory $memory"
            fi
        else
            echo -e "  $container: ${RED}Not running${NC}"
        fi
    done
    
    echo ""
    
    # Summary
    if [[ $alerts -eq 0 ]]; then
        echo -e "${GREEN}✓ System Status: All checks passed${NC}"
        log "INFO" "System health check completed - all systems operational"
    else
        echo -e "${RED}⚠ System Status: $alerts alerts detected${NC}"
        log "WARNING" "System health check completed - $alerts alerts detected"
    fi
    
    echo ""
    echo "Log file: $LOG_FILE"
    echo "===========================================" 
    
    return $alerts
}

# Production environment check
check_production_status() {
    echo -e "${BLUE}Production Environment Status:${NC}"
    
    if curl -s --max-time 10 "https://spaghetti-platform-drgev.ondigitalocean.app/" | grep -q "Enterprise Docs Platform"; then
        echo -e "  Production: ${GREEN}✓ Accessible${NC}"
        log "INFO" "Production environment accessible"
    else
        echo -e "  Production: ${RED}✗ Not accessible${NC}"
        send_alert "CRITICAL" "Production environment not accessible"
    fi
    
    echo ""
}

# Maintenance functions
cleanup_docker_resources() {
    echo -e "${BLUE}Docker Resource Cleanup:${NC}"
    
    # Remove unused images
    removed_images=$(docker image prune -f 2>&1 | grep "Total reclaimed space" || echo "No images to remove")
    echo "  Images: $removed_images"
    
    # Remove unused volumes
    removed_volumes=$(docker volume prune -f 2>&1 | grep "Total reclaimed space" || echo "No volumes to remove")
    echo "  Volumes: $removed_volumes"
    
    # Remove build cache
    removed_cache=$(docker builder prune -f 2>&1 | grep "Total reclaimed space" || echo "No cache to remove")
    echo "  Build Cache: $removed_cache"
    
    log "INFO" "Docker cleanup completed - Images: $removed_images, Volumes: $removed_volumes, Cache: $removed_cache"
    echo ""
}

# Main script logic
main() {
    case "${1:-check}" in
        "check")
            run_system_check
            ;;
        "production")
            check_production_status
            ;;
        "cleanup")
            cleanup_docker_resources
            ;;
        "full")
            run_system_check
            check_production_status
            ;;
        "monitor")
            echo "Starting continuous monitoring (Ctrl+C to stop)..."
            while true; do
                run_system_check
                echo "Waiting 60 seconds for next check..."
                sleep 60
            done
            ;;
        *)
            echo "Usage: $0 {check|production|cleanup|full|monitor}"
            echo "  check      - Run system health check (default)"
            echo "  production - Check production environment"
            echo "  cleanup    - Clean up Docker resources"
            echo "  full       - Run all checks"
            echo "  monitor    - Continuous monitoring mode"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"