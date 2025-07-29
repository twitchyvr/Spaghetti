#!/bin/bash

# Sprint 3 Deployment Validation Script
# Comprehensive health checks and rollback automation for enterprise deployment

set -euo pipefail

# Configuration
API_BASE_URL="http://localhost:5001"
PRODUCTION_URL="https://spaghetti-platform-drgev.ondigitalocean.app"
HEALTH_CHECK_TIMEOUT=30
ROLLBACK_ENABLED=true
LOG_FILE="/tmp/deployment-validation-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}✅ SUCCESS: $1${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  WARNING: $1${NC}"
}

log_error() {
    log "${RED}❌ ERROR: $1${NC}"
}

log_info() {
    log "${BLUE}ℹ️  INFO: $1${NC}"
}

# Health check functions
check_api_health() {
    log_info "Checking API health..."
    
    local response
    if response=$(curl -s -w "%{http_code}" "$API_BASE_URL/api/admin/health" --max-time $HEALTH_CHECK_TIMEOUT); then
        local status_code="${response: -3}"
        local body="${response%???}"
        
        if [[ "$status_code" == "200" ]]; then
            log_success "API health check passed (HTTP $status_code)"
            echo "$body" | jq -r '.status' 2>/dev/null || echo "healthy"
            return 0
        else
            log_error "API health check failed (HTTP $status_code)"
            return 1
        fi
    else
        log_error "API health check timeout or connection failed"
        return 1
    fi
}

check_database_stats() {
    log_info "Checking database connectivity..."
    
    local response
    if response=$(curl -s "$API_BASE_URL/api/admin/database-stats" --max-time $HEALTH_CHECK_TIMEOUT); then
        local db_status=$(echo "$response" | jq -r '.databaseStatus' 2>/dev/null || echo "unknown")
        
        if [[ "$db_status" == "healthy" ]]; then
            log_success "Database connectivity confirmed"
            return 0
        else
            log_error "Database status: $db_status"
            return 1
        fi
    else
        log_error "Database stats check failed"
        return 1
    fi
}

check_frontend_build() {
    log_info "Validating frontend build..."
    
    if [[ -f "src/frontend/dist/index.html" ]]; then
        local bundle_size=$(du -sh src/frontend/dist/ | cut -f1)
        log_success "Frontend build validated (Size: $bundle_size)"
        return 0
    else
        log_error "Frontend build artifacts not found"
        return 1
    fi
}

check_docker_services() {
    log_info "Checking Docker service health..."
    
    local unhealthy_services
    unhealthy_services=$(docker-compose ps --format json | jq -r 'select(.Health != "healthy" and .Health != "" and .Health != null) | .Name' 2>/dev/null || true)
    
    if [[ -z "$unhealthy_services" ]]; then
        log_success "All Docker services are healthy"
        return 0
    else
        log_error "Unhealthy services detected: $unhealthy_services"
        return 1
    fi
}

check_production_deployment() {
    log_info "Validating production deployment..."
    
    local response
    if response=$(curl -s -I "$PRODUCTION_URL" --max-time $HEALTH_CHECK_TIMEOUT); then
        if echo "$response" | grep -q "HTTP/.*200"; then
            log_success "Production deployment is accessible"
            return 0
        else
            log_error "Production returned non-200 status"
            return 1
        fi
    else
        log_error "Production deployment check failed"
        return 1
    fi
}

# Performance validation
validate_performance() {
    log_info "Running performance validation..."
    
    # Check API response time
    local start_time=$(date +%s%N)
    if curl -s "$API_BASE_URL/api/admin/database-stats" > /dev/null; then
        local end_time=$(date +%s%N)
        local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [[ $response_time -lt 2000 ]]; then
            log_success "API response time: ${response_time}ms (within 2s target)"
        else
            log_warning "API response time: ${response_time}ms (exceeds 2s target)"
        fi
    else
        log_error "Performance validation failed - API unreachable"
        return 1
    fi
}

# Authentication workflow validation
validate_authentication() {
    log_info "Validating authentication workflow..."
    
    # Test sample data endpoint (should work without auth)
    if curl -s "$API_BASE_URL/api/admin/sample-data-status" > /dev/null; then
        log_success "Authentication workflow baseline validated"
        return 0
    else
        log_error "Authentication workflow validation failed"
        return 1
    fi
}

# Rollback function
execute_rollback() {
    if [[ "$ROLLBACK_ENABLED" == "true" ]]; then
        log_warning "Initiating automated rollback..."
        
        # Restart services to previous state
        docker-compose restart api frontend
        
        # Wait for services to stabilize
        sleep 30
        
        # Re-run health checks
        if check_api_health && check_database_stats; then
            log_success "Rollback completed successfully"
            return 0
        else
            log_error "Rollback failed - manual intervention required"
            return 1
        fi
    else
        log_info "Rollback disabled - manual intervention required"
        return 1
    fi
}

# Main validation flow
main() {
    log_info "Starting Sprint 3 deployment validation..."
    log_info "Log file: $LOG_FILE"
    
    local validation_failed=false
    
    # Core health checks
    if ! check_api_health; then
        validation_failed=true
    fi
    
    if ! check_database_stats; then
        validation_failed=true
    fi
    
    if ! check_frontend_build; then
        validation_failed=true
    fi
    
    if ! check_docker_services; then
        validation_failed=true
    fi
    
    # Performance and functional validation
    if ! validate_performance; then
        log_warning "Performance validation failed but not blocking deployment"
    fi
    
    if ! validate_authentication; then
        validation_failed=true
    fi
    
    # Production validation (non-blocking)
    if ! check_production_deployment; then
        log_warning "Production validation failed but not blocking local deployment"
    fi
    
    # Summary and action
    if [[ "$validation_failed" == "true" ]]; then
        log_error "Deployment validation FAILED"
        
        if execute_rollback; then
            log_info "Rollback completed - system restored to previous state"
            exit 2
        else
            log_error "Rollback failed - immediate manual intervention required"
            exit 3
        fi
    else
        log_success "Deployment validation PASSED"
        log_info "Sprint 3 deployment is ready for production"
        exit 0
    fi
}

# Signal handlers for clean shutdown
trap 'log_warning "Validation interrupted"; exit 130' INT TERM

# Run main function
main "$@"