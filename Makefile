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
	@export DOCKER_BUILDKIT=1 && export BUILDX_NO_DEFAULT_ATTESTATIONS=1 && docker-compose build --parallel
	@echo "✅ Images built!"

build-no-cache: ## Build images without cache
	@echo "🔨 Building images without cache..."
	@export DOCKER_BUILDKIT=1 && export BUILDX_NO_DEFAULT_ATTESTATIONS=1 && docker-compose build --no-cache --parallel
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
	@if ./health-check.sh --verbose; then \
		true; \
	else \
		case $$? in \
			1) echo "⚠️  Health check completed - system is degraded" ;; \
			2) echo "❌ Health check completed - system is critical" ;; \
			*) echo "❓ Health check completed - unknown status" ;; \
		esac; \
	fi

health-json: ## Run health check with JSON output
	@if ./health-check.sh --json; then \
		true; \
	else \
		case $$? in \
			1) echo "{\"message\": \"Health check completed - system is degraded\"}" ;; \
			2) echo "{\"message\": \"Health check completed - system is critical\"}" ;; \
			*) echo "{\"message\": \"Health check completed - unknown status\"}" ;; \
		esac; \
	fi

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
	docker system prune -af
	@echo "✅ Cleanup completed!"

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
	git clone https://github.com/ProxmoxVE-Watcher/ProxmoxVE-Watcher.git
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
	@cid=$$(docker ps --filter "name=proxmoxve-watcher-web" --format "{{.Names}}" | head -1); \
	if [ -n "$$cid" ]; then \
		echo "🔌 Attaching to $$cid"; \
		( docker exec -it $$cid sh 2>/dev/null \
			|| docker exec -it $$cid /bin/sh 2>/dev/null \
			|| docker exec -it $$cid bash ) || echo "⚠️  Unable to start an interactive shell"; \
	else \
		echo "❌ web container not running"; \
	fi

shell-api: ## Open shell in api container
	@cid=$$(docker ps --filter "name=proxmoxve-watcher-api" --format "{{.Names}}" | head -1); \
	if [ -n "$$cid" ]; then \
		echo "🔌 Attaching to $$cid"; \
		( docker exec -it $$cid sh 2>/dev/null \
			|| docker exec -it $$cid /bin/sh 2>/dev/null \
			|| docker exec -it $$cid bash ) || echo "⚠️  Unable to start an interactive shell"; \
	else \
		echo "❌ api container not running"; \
	fi

# Testing
test: ## Run health checks and basic tests
	@echo "🧪 Running tests..."
	@if ./health-check.sh; then \
		echo "✅ All tests passed!"; \
	else \
		case $$? in \
			1) echo "⚠️  Tests completed - system is degraded" ;; \
			2) echo "❌ Tests completed - system is critical" ;; \
			*) echo "❓ Tests completed - unknown status" ;; \
		esac; \
	fi
