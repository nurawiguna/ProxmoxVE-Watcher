#!/bin/bash

# ProxmoxVE Watcher - Production Deployment Script
# This script builds and deploys the application in production mode

set -e  # Exit on any error

echo "🚀 Starting ProxmoxVE Watcher Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Build the application
build_application() {
    print_status "Building Docker images..."
    
    # Use docker compose (modern) or docker-compose (legacy)
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    $COMPOSE_CMD -f docker-compose.yml build --no-cache
    print_success "Docker images built successfully"
}

# Deploy the application
deploy_application() {
    print_status "Deploying application..."
    
    # Stop existing containers
    $COMPOSE_CMD -f docker-compose.yml down --remove-orphans
    
    # Start new containers
    $COMPOSE_CMD -f docker-compose.yml up -d
    
    print_success "Application deployed successfully"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check api health
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_success "API is healthy"
    else
        print_warning "API health check failed"
    fi
    
    # Check web health
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_success "Web is healthy"
    else
        print_warning "Web health check failed"
    fi
}

# Show deployment information
show_deployment_info() {
    print_status "Deployment Information:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 Web URL: http://localhost"
    echo "🔧 API: http://localhost:5000/api"
    echo "📊 Health Check: http://localhost/health"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Management Commands:"
    echo "  View logs:     $COMPOSE_CMD -f docker-compose.yml logs -f"
    echo "  Stop services: $COMPOSE_CMD -f docker-compose.yml down"
    echo "  Restart:       $COMPOSE_CMD -f docker-compose.yml restart"
    echo "  Scale:         $COMPOSE_CMD -f docker-compose.yml up -d --scale web=2"
    echo ""
}

# Main deployment flow
main() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔥 ProxmoxVE Watcher - Production Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    check_dependencies
    build_application
    deploy_application
    health_check
    show_deployment_info
    
    print_success "🎉 Deployment completed successfully!"
}

# Handle script interruption
cleanup() {
    print_warning "Deployment interrupted. Cleaning up..."
    $COMPOSE_CMD -f docker-compose.yml down --remove-orphans
    exit 1
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Run main function
main "$@"
