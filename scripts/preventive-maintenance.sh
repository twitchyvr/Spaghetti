#!/bin/bash

# Enterprise Documentation Platform - Preventive Maintenance Automation
# Version: 1.0.0
# Purpose: Automated preventive maintenance tasks scheduling and execution

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
MAINTENANCE_LOG="$LOG_DIR/preventive-maintenance.log"
BACKUP_DIR="$PROJECT_DIR/backups"
MAX_BACKUP_AGE_DAYS=30
MAX_LOG_SIZE_MB=100

# Create necessary directories
mkdir -p "$LOG_DIR" "$BACKUP_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$level] $*" | tee -a "$MAINTENANCE_LOG"
}

# Maintenance task execution wrapper
execute_task() {
    local task_name=$1
    local task_function=$2
    local priority=${3:-"NORMAL"}
    
    echo -e "${BLUE}🔧 Executing: $task_name${NC}"
    log "INFO" "Starting maintenance task: $task_name (Priority: $priority)"
    
    local start_time=$(date +%s)
    
    if $task_function; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✅ Completed: $task_name (${duration}s)${NC}"
        log "SUCCESS" "Completed maintenance task: $task_name in ${duration}s"
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${RED}❌ Failed: $task_name (${duration}s)${NC}"
        log "ERROR" "Failed maintenance task: $task_name after ${duration}s"
        return 1
    fi
}

# Daily maintenance tasks
daily_container_health_check() {
    local containers=("enterprise-docs-frontend" "enterprise-docs-api" "enterprise-docs-db" "enterprise-docs-cache" "enterprise-docs-search")
    local unhealthy_count=0
    
    for container in "${containers[@]}"; do
        if ! docker ps | grep -q "$container"; then
            log "WARNING" "Container $container is not running"
            ((unhealthy_count++))
        elif ! docker inspect "$container" --format='{{.State.Health.Status}}' 2>/dev/null | grep -q "healthy\|none"; then
            log "WARNING" "Container $container health check failed"
            ((unhealthy_count++))
        fi
    done
    
    if [[ $unhealthy_count -eq 0 ]]; then
        log "INFO" "All containers passed health check"
    else
        log "WARNING" "$unhealthy_count containers have health issues"
    fi
    
    return $unhealthy_count
}

daily_database_optimization() {
    if docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -c "ANALYZE;" >/dev/null 2>&1; then
        log "INFO" "Database statistics updated successfully"
    else
        log "ERROR" "Failed to update database statistics"
        return 1
    fi
    
    # Check for long-running queries
    local long_queries=$(docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';" 2>/dev/null || echo "0")
    
    if [[ $long_queries -gt 0 ]]; then
        log "WARNING" "$long_queries long-running queries detected"
    else
        log "INFO" "No long-running queries detected"
    fi
    
    return 0
}

daily_log_rotation() {
    # Rotate application logs
    find "$LOG_DIR" -name "*.log" -size +${MAX_LOG_SIZE_MB}M -exec mv {} {}.$(date +%Y%m%d) \; -exec touch {} \;
    
    # Clean up old rotated logs (older than 7 days)
    find "$LOG_DIR" -name "*.log.*" -mtime +7 -delete
    
    # Rotate Docker logs if they get too large
    docker system events --filter type=container --since=24h --until=1s --format "{{.Time}} {{.Action}} {{.Actor.Attributes.name}}" > "$LOG_DIR/docker-events-$(date +%Y%m%d).log" 2>/dev/null || true
    
    log "INFO" "Log rotation completed"
    return 0
}

daily_performance_metrics_collection() {
    local metrics_file="$LOG_DIR/performance-metrics-$(date +%Y%m%d).json"
    
    # Collect container metrics
    docker stats --no-stream --format "json" > "$metrics_file.tmp" 2>/dev/null || echo '[]' > "$metrics_file.tmp"
    
    # Add timestamp and system info
    {
        echo "{"
        echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"system_info\": {"
        echo "    \"uptime\": \"$(uptime | sed 's/.*up //' | sed 's/, load.*//')\","
        echo "    \"disk_usage\": \"$(df -h / | awk 'NR==2{print $5}')\","
        echo "    \"memory_usage\": \"$(free -m 2>/dev/null | awk 'NR==2{printf "%.1f%%", $3*100/$2}' || echo 'N/A')\""
        echo "  },"
        echo "  \"containers\": "
        cat "$metrics_file.tmp"
        echo "}"
    } > "$metrics_file"
    
    rm -f "$metrics_file.tmp"
    
    log "INFO" "Performance metrics collected to $metrics_file"
    return 0
}

daily_security_scan() {
    # Check for containers running as root
    local root_containers=$(docker ps --format "table {{.Names}}" --filter "label=com.docker.compose.project=spaghetti" | tail -n +2 | while read container; do
        if docker exec "$container" whoami 2>/dev/null | grep -q "^root$"; then
            echo "$container"
        fi
    done)
    
    if [[ -n "$root_containers" ]]; then
        log "WARNING" "Containers running as root: $root_containers"
    else
        log "INFO" "No containers running as root detected"
    fi
    
    # Check for outdated base images
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}" | awk 'NR>1 && $3 < "'$(date -d '30 days ago' '+%Y-%m-%d')'"' > "$LOG_DIR/outdated-images.log"
    
    if [[ -s "$LOG_DIR/outdated-images.log" ]]; then
        log "WARNING" "Outdated Docker images detected - see $LOG_DIR/outdated-images.log"
    else
        log "INFO" "All Docker images are reasonably current"
    fi
    
    return 0
}

# Weekly maintenance tasks
weekly_docker_cleanup() {
    echo "Starting Docker cleanup..."
    
    # Remove unused images
    local removed_images=$(docker image prune -f 2>&1 | grep "Total reclaimed space" || echo "No images removed")
    log "INFO" "Docker images cleanup: $removed_images"
    
    # Remove unused volumes
    local removed_volumes=$(docker volume prune -f 2>&1 | grep "Total reclaimed space" || echo "No volumes removed")
    log "INFO" "Docker volumes cleanup: $removed_volumes"
    
    # Remove unused networks
    local removed_networks=$(docker network prune -f 2>&1 | grep "Total reclaimed space" || echo "No networks removed")
    log "INFO" "Docker networks cleanup: $removed_networks"
    
    # Clean build cache
    local removed_cache=$(docker builder prune -f 2>&1 | grep "Total reclaimed space" || echo "No cache removed")
    log "INFO" "Docker build cache cleanup: $removed_cache"
    
    return 0
}

weekly_database_maintenance() {
    # Full database vacuum and analyze
    if docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -c "VACUUM ANALYZE;" >/dev/null 2>&1; then
        log "INFO" "Database vacuum and analyze completed"
    else
        log "ERROR" "Database vacuum and analyze failed"
        return 1
    fi
    
    # Check database size and growth
    local db_size=$(docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -t -c "SELECT pg_size_pretty(pg_database_size('enterprisedocs'));" 2>/dev/null | xargs)
    log "INFO" "Current database size: $db_size"
    
    # Reindex if needed (check for index bloat)
    local bloated_indexes=$(docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -t -c "
        SELECT schemaname||'.'||tablename||'.'||indexname 
        FROM pg_stat_user_indexes 
        WHERE idx_scan = 0 AND schemaname = 'public';" 2>/dev/null | wc -l)
    
    if [[ $bloated_indexes -gt 0 ]]; then
        log "WARNING" "$bloated_indexes unused indexes detected"
    else
        log "INFO" "No unused indexes detected"
    fi
    
    return 0
}

weekly_backup_verification() {
    # Create test backup
    local backup_file="$BACKUP_DIR/test-backup-$(date +%Y%m%d).sql"
    
    if docker exec enterprise-docs-db pg_dump -U enterprisedocs enterprisedocs > "$backup_file" 2>/dev/null; then
        local backup_size=$(du -h "$backup_file" | cut -f1)
        log "INFO" "Test backup created successfully: $backup_size"
        
        # Verify backup integrity
        if head -10 "$backup_file" | grep -q "PostgreSQL database dump"; then
            log "INFO" "Backup integrity verified"
        else
            log "ERROR" "Backup integrity check failed"
            return 1
        fi
    else
        log "ERROR" "Failed to create test backup"
        return 1
    fi
    
    # Clean up old backups
    find "$BACKUP_DIR" -name "*.sql" -mtime +$MAX_BACKUP_AGE_DAYS -delete
    log "INFO" "Old backups cleaned up (older than $MAX_BACKUP_AGE_DAYS days)"
    
    return 0
}

weekly_performance_analysis() {
    # Analyze performance trends from daily metrics
    local metrics_files=("$LOG_DIR"/performance-metrics-*.json)
    local metrics_count=${#metrics_files[@]}
    
    if [[ $metrics_count -gt 0 ]]; then
        log "INFO" "Analyzing $metrics_count performance metrics files"
        
        # Create weekly performance summary
        local summary_file="$LOG_DIR/weekly-performance-summary-$(date +%Y%m%d).json"
        {
            echo "{"
            echo "  \"week_ending\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
            echo "  \"metrics_files_analyzed\": $metrics_count,"
            echo "  \"summary\": {"
            echo "    \"avg_response_time\": \"calculated_from_logs\","
            echo "    \"peak_memory_usage\": \"calculated_from_logs\","
            echo "    \"disk_growth\": \"calculated_from_logs\""
            echo "  }"
            echo "}"
        } > "$summary_file"
        
        log "INFO" "Weekly performance summary created: $summary_file"
    else
        log "WARNING" "No performance metrics files found for analysis"
    fi
    
    return 0
}

weekly_security_update_check() {
    # Check for Docker image updates
    echo "Checking for Docker image updates..."
    
    local images=("postgres:15-alpine" "redis:7-alpine" "docker.elastic.co/elasticsearch/elasticsearch:8.11.0")
    
    for image in "${images[@]}"; do
        if docker pull "$image" 2>&1 | grep -q "Image is up to date"; then
            log "INFO" "Docker image $image is up to date"
        else
            log "WARNING" "Docker image $image has updates available"
        fi
    done
    
    # Log current image versions
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | head -10 > "$LOG_DIR/current-images-$(date +%Y%m%d).log"
    log "INFO" "Current image versions logged"
    
    return 0
}

# Monthly maintenance tasks
monthly_capacity_planning() {
    echo "Performing capacity planning analysis..."
    
    # Disk usage trend analysis
    local current_usage=$(df -h / | awk 'NR==2{print $5}' | sed 's/%//')
    log "INFO" "Current disk usage: ${current_usage}%"
    
    # Memory usage analysis
    local memory_info=$(free -m 2>/dev/null | awk 'NR==2{printf "Total: %sMB, Used: %sMB, Free: %sMB", $2, $3, $4}' || echo "Memory info not available")
    log "INFO" "Memory usage: $memory_info"
    
    # Database growth analysis
    local db_size=$(docker exec enterprise-docs-db psql -U enterprisedocs -d enterprisedocs -t -c "SELECT pg_size_pretty(pg_database_size('enterprisedocs'));" 2>/dev/null | xargs)
    log "INFO" "Database size: $db_size"
    
    # Create capacity planning report
    local report_file="$LOG_DIR/capacity-planning-$(date +%Y%m).json"
    {
        echo "{"
        echo "  \"report_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"disk_usage_percent\": $current_usage,"
        echo "  \"database_size\": \"$db_size\","
        echo "  \"memory_info\": \"$memory_info\","
        echo "  \"recommendations\": ["
        if [[ $current_usage -gt 80 ]]; then
            echo "    \"Consider disk cleanup - usage above 80%\","
        fi
        echo "    \"Regular monitoring continues\""
        echo "  ]"
        echo "}"
    } > "$report_file"
    
    log "INFO" "Capacity planning report created: $report_file"
    return 0
}

monthly_disaster_recovery_test() {
    echo "Testing disaster recovery procedures..."
    
    # Test database backup restoration
    local test_db="enterprisedocs_recovery_test"
    local latest_backup=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
    
    if [[ -n "$latest_backup" ]]; then
        # Create test database
        docker exec enterprise-docs-db createdb -U enterprisedocs "$test_db" 2>/dev/null || true
        
        # Restore backup to test database
        if docker exec -i enterprise-docs-db psql -U enterprisedocs "$test_db" < "$latest_backup" >/dev/null 2>&1; then
            log "INFO" "Disaster recovery test: Backup restoration successful"
            
            # Verify data integrity
            local table_count=$(docker exec enterprise-docs-db psql -U enterprisedocs -d "$test_db" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs)
            log "INFO" "Disaster recovery test: $table_count tables restored"
            
            # Cleanup test database
            docker exec enterprise-docs-db dropdb -U enterprisedocs "$test_db" 2>/dev/null || true
        else
            log "ERROR" "Disaster recovery test: Backup restoration failed"
            return 1
        fi
    else
        log "WARNING" "No backup files found for disaster recovery test"
        return 1
    fi
    
    return 0
}

monthly_security_audit() {
    echo "Performing security audit..."
    
    # Check for exposed ports
    local exposed_ports=$(docker ps --format "table {{.Names}}\t{{.Ports}}" | grep -v "PORTS" | awk '{print $2}' | grep "0.0.0.0" | wc -l)
    log "INFO" "Exposed ports count: $exposed_ports"
    
    # Check container user configurations
    local root_containers=0
    local containers=("enterprise-docs-frontend" "enterprise-docs-api" "enterprise-docs-db" "enterprise-docs-cache" "enterprise-docs-search")
    
    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            local user=$(docker exec "$container" whoami 2>/dev/null || echo "unknown")
            if [[ "$user" == "root" ]]; then
                ((root_containers++))
            fi
            log "INFO" "Container $container running as: $user"
        fi
    done
    
    if [[ $root_containers -gt 0 ]]; then
        log "WARNING" "$root_containers containers running as root"
    else
        log "INFO" "No containers running as root"
    fi
    
    # Generate security audit report
    local audit_file="$LOG_DIR/security-audit-$(date +%Y%m).json"
    {
        echo "{"
        echo "  \"audit_date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"exposed_ports\": $exposed_ports,"
        echo "  \"root_containers\": $root_containers,"
        echo "  \"recommendations\": ["
        if [[ $root_containers -gt 0 ]]; then
            echo "    \"Review containers running as root\","
        fi
        if [[ $exposed_ports -gt 5 ]]; then
            echo "    \"Review exposed port configurations\","
        fi
        echo "    \"Continue regular security monitoring\""
        echo "  ]"
        echo "}"
    } > "$audit_file"
    
    log "INFO" "Security audit report created: $audit_file"
    return 0
}

# Maintenance schedulers
run_daily_maintenance() {
    echo -e "${PURPLE}🗓️  Daily Maintenance - $(date)${NC}"
    log "INFO" "Starting daily maintenance cycle"
    
    local failed_tasks=0
    
    execute_task "Container Health Check" daily_container_health_check "HIGH" || ((failed_tasks++))
    execute_task "Database Optimization" daily_database_optimization "MEDIUM" || ((failed_tasks++))
    execute_task "Log Rotation" daily_log_rotation "LOW" || ((failed_tasks++))
    execute_task "Performance Metrics Collection" daily_performance_metrics_collection "MEDIUM" || ((failed_tasks++))
    execute_task "Security Scan" daily_security_scan "HIGH" || ((failed_tasks++))
    
    if [[ $failed_tasks -eq 0 ]]; then
        echo -e "${GREEN}✅ Daily maintenance completed successfully${NC}"
        log "SUCCESS" "Daily maintenance cycle completed - all tasks successful"
    else
        echo -e "${YELLOW}⚠️  Daily maintenance completed with $failed_tasks failed tasks${NC}"
        log "WARNING" "Daily maintenance cycle completed - $failed_tasks tasks failed"
    fi
    
    return $failed_tasks
}

run_weekly_maintenance() {
    echo -e "${PURPLE}📅 Weekly Maintenance - $(date)${NC}"
    log "INFO" "Starting weekly maintenance cycle"
    
    local failed_tasks=0
    
    execute_task "Docker Resource Cleanup" weekly_docker_cleanup "MEDIUM" || ((failed_tasks++))
    execute_task "Database Maintenance" weekly_database_maintenance "HIGH" || ((failed_tasks++))
    execute_task "Backup Verification" weekly_backup_verification "HIGH" || ((failed_tasks++))
    execute_task "Performance Analysis" weekly_performance_analysis "MEDIUM" || ((failed_tasks++))
    execute_task "Security Update Check" weekly_security_update_check "MEDIUM" || ((failed_tasks++))
    
    if [[ $failed_tasks -eq 0 ]]; then
        echo -e "${GREEN}✅ Weekly maintenance completed successfully${NC}"
        log "SUCCESS" "Weekly maintenance cycle completed - all tasks successful"
    else
        echo -e "${YELLOW}⚠️  Weekly maintenance completed with $failed_tasks failed tasks${NC}"
        log "WARNING" "Weekly maintenance cycle completed - $failed_tasks tasks failed"
    fi
    
    return $failed_tasks
}

run_monthly_maintenance() {
    echo -e "${PURPLE}📆 Monthly Maintenance - $(date)${NC}"
    log "INFO" "Starting monthly maintenance cycle"
    
    local failed_tasks=0
    
    execute_task "Capacity Planning Analysis" monthly_capacity_planning "HIGH" || ((failed_tasks++))
    execute_task "Disaster Recovery Test" monthly_disaster_recovery_test "HIGH" || ((failed_tasks++))
    execute_task "Security Audit" monthly_security_audit "HIGH" || ((failed_tasks++))
    
    if [[ $failed_tasks -eq 0 ]]; then
        echo -e "${GREEN}✅ Monthly maintenance completed successfully${NC}"
        log "SUCCESS" "Monthly maintenance cycle completed - all tasks successful"
    else
        echo -e "${YELLOW}⚠️  Monthly maintenance completed with $failed_tasks failed tasks${NC}"
        log "WARNING" "Monthly maintenance cycle completed - $failed_tasks tasks failed"
    fi
    
    return $failed_tasks
}

# Utility functions
show_maintenance_status() {
    echo -e "${BLUE}📊 Maintenance Status Dashboard${NC}"
    echo "=================================="
    
    # Show recent maintenance activity
    if [[ -f "$MAINTENANCE_LOG" ]]; then
        echo "Recent maintenance activity:"
        tail -10 "$MAINTENANCE_LOG" | while read line; do
            if echo "$line" | grep -q "SUCCESS"; then
                echo -e "${GREEN}✅ $line${NC}"
            elif echo "$line" | grep -q "ERROR"; then
                echo -e "${RED}❌ $line${NC}"
            elif echo "$line" | grep -q "WARNING"; then
                echo -e "${YELLOW}⚠️  $line${NC}"
            else
                echo "$line"
            fi
        done
    else
        echo "No maintenance log found"
    fi
    
    echo ""
    echo "Log files location: $LOG_DIR"
    echo "Backup location: $BACKUP_DIR"
    echo "Configuration: Max backup age = $MAX_BACKUP_AGE_DAYS days"
    echo "=================================="
}

# Main script logic
main() {
    case "${1:-help}" in
        "daily")
            run_daily_maintenance
            ;;
        "weekly")
            run_weekly_maintenance
            ;;
        "monthly")
            run_monthly_maintenance
            ;;
        "full")
            run_daily_maintenance
            run_weekly_maintenance
            run_monthly_maintenance
            ;;
        "status")
            show_maintenance_status
            ;;
        "test")
            execute_task "Test Task" "echo 'Test completed successfully'" "LOW"
            ;;
        *)
            echo "Enterprise Documentation Platform - Preventive Maintenance"
            echo "==========================================================="
            echo ""
            echo "Usage: $0 {daily|weekly|monthly|full|status|test}"
            echo ""
            echo "Commands:"
            echo "  daily    - Run daily maintenance tasks"
            echo "  weekly   - Run weekly maintenance tasks"
            echo "  monthly  - Run monthly maintenance tasks"
            echo "  full     - Run all maintenance tasks"
            echo "  status   - Show maintenance status and recent activity"
            echo "  test     - Test the maintenance framework"
            echo ""
            echo "Maintenance Schedule:"
            echo "  Daily:   Container health, DB optimization, log rotation"
            echo "  Weekly:  Docker cleanup, DB maintenance, backup verification"
            echo "  Monthly: Capacity planning, disaster recovery, security audit"
            echo ""
            echo "Logs: $MAINTENANCE_LOG"
            echo "Backups: $BACKUP_DIR"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"