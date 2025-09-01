# ProxmoxVE Watcher - Makefile for easy project management

.PHONY: help build deploy up down logs stop clean health test

# Default target
help: ## Show this help message
	@echo "ProxmoxVE Watcher - Available Commands:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Main commands
deploy: ## Deploy application
	@echo "🚀 Deploying application..."
	./deploy.sh
	@echo "✅ Deployment completed!"

build: ## Build images
	@echo "🔨 Building images..."
	docker-compose build
	@echo "✅ Images built!"

build-no-cache: ## Build images without cache
	@echo "🔨 Building images without cache..."
	docker-compose build --no-cache
	@echo "✅ Images built without cache!"

up: ## Start application
	@echo "🚀 Starting application..."
	docker-compose up -d
	@echo "✅ Application started!"
	@echo "🌐 WEB: http://localhost"
	@echo "🔧 API: http://localhost/api"

down: ## Stop application
	@echo "🛑 Stopping application..."
	docker-compose down
	@echo "✅ Application stopped!"

logs: ## Show logs
	docker-compose logs -f

# Monitoring and maintenance
health: ## Run health check
	@./health-check.sh --verbose

health-json: ## Run health check with JSON output
	@./health-check.sh --json

status: ## Show container status
	@echo "🐳 Container Status:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@docker ps --filter "name=proxmoxve-watcher" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""

stats: ## Show resource usage statistics
	@echo "📊 Resource Usage:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Cleanup commands
clean: ## Clean up containers and images
	@echo "🧹 Cleaning up containers and images..."
	docker-compose down --remove-orphans
	docker system prune -f
	@echo "✅ Cleanup completed!"

clean-all: ## Clean up everything (including volumes)
	@echo "🧹 Cleaning up everything..."
	docker-compose down --remove-orphans --volumes
	docker system prune -af
	docker volume prune -f
	@echo "✅ Complete cleanup finished!"

# Restart commands
restart: ## Restart all services
	@echo "🔄 Restarting services..."
	docker-compose restart
	@echo "✅ Services restarted!"

restart-web: ## Restart web service
	docker-compose restart web
	@echo "✅ web restarted!"

restart-api: ## Restart api service
	docker-compose restart api
	@echo "✅ api restarted!"

# Update commands
update: ## Update and rebuild images
	@echo "📦 Updating and rebuilding images..."
	docker-compose pull
	docker-compose build --no-cache
	docker-compose up -d --force-recreate
	@echo "✅ Update completed!"

# Backup and restore
backup: ## Create backup of configuration and data
	@echo "💾 Creating backup..."
	mkdir -p ./backups/$(shell date +%Y%m%d_%H%M%S)
	cp -r ./api/proxmox_hosts.json ./backups/$(shell date +%Y%m%d_%H%M%S)/ || true
	cp -r ./web/.env* ./backups/$(shell date +%Y%m%d_%H%M%S)/ || true
	@echo "✅ Backup created in ./backups/$(shell date +%Y%m%d_%H%M%S)/"

# Security and maintenance
security-scan: ## Run basic security scan on images
	@echo "🔒 Running security scan..."
	@which docker-bench-security >/dev/null 2>&1 || (echo "⚠️  docker-bench-security not found. Install it for comprehensive security checks."; exit 0)
	docker run --rm -it --net host --pid host --userns host --cap-add audit_control \
		-e DOCKER_CONTENT_TRUST=1 \
		-v /etc:/etc:ro \
		-v /var/lib:/var/lib:ro \
		-v /var/run/docker.sock:/var/run/docker.sock:ro \
		-v /usr/lib/systemd:/usr/lib/systemd:ro \
		-v /etc/systemd:/etc/systemd:ro \
		-v /etc/kubernetes:/etc/kubernetes:ro \
		--label docker_bench_security \
		docker/docker-bench-security || echo "⚠️  Security scan completed with warnings"

# Development helpers
shell-web: ## Open shell in web container
	@if docker ps --filter "name=proxmoxve-watcher-web" --format "{{.Names}}" | head -1 | xargs -I {} docker exec -it {} sh; then \
		echo ""; \
	else \
		echo "❌ web container not running"; \
	fi

shell-api: ## Open shell in api container
	@if docker ps --filter "name=proxmoxve-watcher-api" --format "{{.Names}}" | head -1 | xargs -I {} docker exec -it {} sh; then \
		echo ""; \
	else \
		echo "❌ api container not running"; \
	fi

# Testing
test: ## Run health checks and basic tests
	@echo "🧪 Running tests..."
	@./health-check.sh
	@echo "✅ All tests passed!"
