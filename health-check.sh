#!/bin/bash

# Health Check Script for ProxmoxVE Watcher
# Usage: ./health-check.sh [--json] [--verbose]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WEB_URL="http://localhost"
API_URL="http://localhost/api"
TIMEOUT=10

# Parse command line arguments
JSON_OUTPUT=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to print colored output
print_status() {
    if [[ $JSON_OUTPUT == false ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

print_success() {
    if [[ $JSON_OUTPUT == false ]]; then
        echo -e "${GREEN}[OK]${NC} $1"
    fi
}

print_warning() {
    if [[ $JSON_OUTPUT == false ]]; then
        echo -e "${YELLOW}[WARN]${NC} $1"
    fi
}

print_error() {
    if [[ $JSON_OUTPUT == false ]]; then
        echo -e "${RED}[ERROR]${NC} $1"
    fi
}

# Health check results
declare -A results=(
    ["web_status"]="unknown"
    ["web_response_time"]="0"
    ["api_status"]="unknown"
    ["api_response_time"]="0"
    ["containers_running"]="0"
    ["overall_status"]="unknown"
)

# Check if containers are running
check_containers() {
    print_status "Checking container status..."
    
    local web_running=$(docker ps --filter "name=proxmoxve-watcher-web" --format "{{.Names}}" | wc -l)
    local api_running=$(docker ps --filter "name=proxmoxve-watcher-api" --format "{{.Names}}" | wc -l)
    
    results["containers_running"]=$((web_running + api_running))
    
    if [[ $web_running -eq 1 && $api_running -eq 1 ]]; then
        print_success "All containers are running"
        return 0
    else
        print_error "Some containers are not running (web: $web_running, API: $api_running)"
        return 1
    fi
}

# Check web health
check_web() {
    print_status "Checking web health..."
    
    local start_time=$(date +%s.%N)
    if curl -f -s --max-time $TIMEOUT "$WEB_URL/health" > /dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l)
        results["web_status"]="healthy"
        results["web_response_time"]=$(printf "%.3f" $response_time)
        print_success "web is healthy (${results["web_response_time"]}s)"
        return 0
    else
        results["web_status"]="unhealthy"
        print_error "web health check failed"
        return 1
    fi
}

# Check api health
check_api() {
    print_status "Checking api health..."
    
    local start_time=$(date +%s.%N)
    if curl -f -s --max-time $TIMEOUT "$API_URL/health" > /dev/null 2>&1; then
        local end_time=$(date +%s.%N)
        local response_time=$(echo "$end_time - $start_time" | bc -l)
        results["api_status"]="healthy"
        results["api_response_time"]=$(printf "%.3f" $response_time)
        print_success "API is healthy (${results["api_response_time"]}s)"
        return 0
    else
        results["api_status"]="unhealthy"
        print_error "API health check failed"
        return 1
    fi
}

# Output results
output_results() {
    if [[ $JSON_OUTPUT == true ]]; then
        cat << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "web": {
        "status": "${results["web_status"]}",
        "response_time": ${results["web_response_time"]}
    },
    "api": {
        "status": "${results["api_status"]}",
        "response_time": ${results["api_response_time"]}
    },
    "containers": {
        "running": ${results["containers_running"]}
    },
    "overall_status": "${results["overall_status"]}"
}
EOF
    else
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📊 ProxmoxVE Watcher Health Check Results"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        printf "🌐 web:    %-10s (%.3fs)\n" "${results["web_status"]}" "${results["web_response_time"]}"
        printf "🔧 API:     %-10s (%.3fs)\n" "${results["api_status"]}" "${results["api_response_time"]}"
        printf "🐳 Containers:  %d running\n" "${results["containers_running"]}"
        printf "✅ Overall:     %s\n" "${results["overall_status"]}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        if [[ $VERBOSE == true ]]; then
            echo "🔍 Additional Information:"
            echo "  Timestamp: $(date)"
            echo "  web URL: $WEB_URL"
            echo "  API URL: $API_URL"
            echo "  Timeout: ${TIMEOUT}s"
        fi
    fi
}

# Main health check
main() {
    local container_check=0
    local web_check=0
    local api_check=0
    
    # Run checks
    check_containers || container_check=1
    check_web || web_check=1
    check_api || api_check=1
    
    # Determine overall status
    if [[ $container_check -eq 0 && $web_check -eq 0 && $api_check -eq 0 ]]; then
        results["overall_status"]="healthy"
    elif [[ $container_check -eq 1 ]]; then
        results["overall_status"]="critical"
    else
        results["overall_status"]="degraded"
    fi
    
    # Output results
    output_results
    
    # Exit with appropriate code
    case "${results["overall_status"]}" in
        "healthy")
            exit 0
            ;;
        "degraded")
            exit 1
            ;;
        "critical")
            exit 2
            ;;
        *)
            exit 3
            ;;
    esac
}

# Run main function
main "$@"
