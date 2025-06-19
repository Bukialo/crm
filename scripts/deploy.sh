#!/bin/bash

# Script de deployment para Bukialo CRM
# Uso: ./scripts/deploy.sh [environment] [options]

set -e  # Exit en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
PROJECT_NAME="bukialo-crm"
DOCKER_REGISTRY="your-registry.com"  # Cambiar por tu registry
BACKUP_DIR="./backups"
ENV_FILE=".env"

# Funciones
show_help() {
    cat << EOF
Bukialo CRM Deployment Script

USAGE:
    ./scripts/deploy.sh [ENVIRONMENT] [OPTIONS]

ENVIRONMENTS:
    dev         Deploy to development environment
    staging     Deploy to staging environment
    production  Deploy to production environment

OPTIONS:
    --build-only        Only build images, don't deploy
    --no-backup        Skip database backup
    --force            Force deployment without confirmations
    --help             Show this help message

EXAMPLES:
    ./scripts/deploy.sh dev
    ./scripts/deploy.sh production --no-backup
    ./scripts/deploy.sh staging --build-only

EOF
}

# Verificar prerequisitos
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi

    # Verificar archivo .env
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file $ENV_FILE not found"
        log_info "Copy .env.example to .env and configure your variables"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Cargar variables de entorno
load_environment() {
    local env_file=".env"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        env_file=".env.production"
    elif [[ "$ENVIRONMENT" == "staging" ]]; then
        env_file=".env.staging"
    fi

    if [[ -f "$env_file" ]]; then
        log_info "Loading environment from $env_file"
        export $(grep -v '^#' "$env_file" | xargs)
    else
        log_warning "Environment file $env_file not found, using default .env"
        export $(grep -v '^#' .env | xargs)
    fi
}

# Backup de base de datos
backup_database() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log_warning "Skipping database backup"
        return 0
    fi

    log_info "Creating database backup..."
    
    # Crear directorio de backup si no existe
    mkdir -p "$BACKUP_DIR"
    
    # Nombre del backup con timestamp
    BACKUP_FILE="$BACKUP_DIR/bukialo_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Realizar backup
    if docker-compose exec -T postgres pg_dump -U bukialo_user bukialo_crm > "$BACKUP_FILE"; then
        log_success "Database backup created: $BACKUP_FILE"
        
        # Comprimir backup
        gzip "$BACKUP_FILE"
        log_success "Backup compressed: $BACKUP_FILE.gz"
        
        # Mantener solo los últimos 10 backups
        find "$BACKUP_DIR" -name "bukialo_backup_*.sql.gz" -type f | sort -r | tail -n +11 | xargs -r rm
        log_info "Old backups cleaned up"
    else
        log_error "Database backup failed"
        if [[ "$FORCE_DEPLOY" != "true" ]]; then
            exit 1
        fi
    fi
}

# Construir imágenes
build_images() {
    log_info "Building Docker images..."
    
    # Build backend
    log_info "Building backend image..."
    if docker build -f docker/Dockerfile.backend -t "$PROJECT_NAME-backend:latest" .; then
        log_success "Backend image built successfully"
    else
        log_error "Backend build failed"
        exit 1
    fi
    
    # Build frontend
    log_info "Building frontend image..."
    if docker build -f docker/Dockerfile.frontend -t "$PROJECT_NAME-frontend:latest" .; then
        log_success "Frontend image built successfully"
    else
        log_error "Frontend build failed"
        exit 1
    fi

    # Tag images with environment and timestamp
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag "$PROJECT_NAME-backend:latest" "$PROJECT_NAME-backend:$ENVIRONMENT-$TIMESTAMP"
    docker tag "$PROJECT_NAME-frontend:latest" "$PROJECT_NAME-frontend:$ENVIRONMENT-$TIMESTAMP"
    
    log_success "Images tagged for environment: $ENVIRONMENT"
}

# Verificar salud de servicios
health_check() {
    log_info "Performing health checks..."
    
    local max_attempts=30
    local attempt=1
    
    # Verificar backend
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:5000/health &> /dev/null; then
            log_success "Backend health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Backend health check failed after $max_attempts attempts"
            return 1
        fi
        
        log_info "Backend health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    # Verificar frontend
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "Frontend health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Frontend health check failed after $max_attempts attempts"
            return 1
        fi
        
        log_info "Frontend health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    log_success "All health checks passed"
}

# Ejecutar migraciones de base de datos
run_migrations() {
    log_info "Running database migrations..."
    
    if docker-compose exec -T backend npm run db:migrate; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# Deploy del entorno
deploy_environment() {
    local compose_file="docker-compose.yml"
    local compose_override=""
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        compose_file="docker-compose.prod.yml"
    elif [[ "$ENVIRONMENT" == "staging" ]]; then
        compose_override="-f docker-compose.staging.yml"
    fi

    log_info "Deploying to $ENVIRONMENT environment..."
    
    # Parar servicios existentes
    log_info "Stopping existing services..."
    docker-compose -f "$compose_file" $compose_override down --remove-orphans
    
    # Limpiar imágenes no utilizadas
    log_info "Cleaning up unused images..."
    docker image prune -f
    
    # Iniciar servicios
    log_info "Starting services..."
    if docker-compose -f "$compose_file" $compose_override up -d; then
        log_success "Services started successfully"
    else
        log_error "Failed to start services"
        exit 1
    fi
    
    # Esperar a que los servicios estén listos
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Ejecutar migraciones
    run_migrations
    
    # Verificar salud
    if health_check; then
        log_success "Deployment completed successfully!"
    else
        log_error "Deployment completed but health checks failed"
        exit 1
    fi
}

# Rollback del deployment
rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    # Obtener el backup más reciente
    LATEST_BACKUP=$(find "$BACKUP_DIR" -name "bukialo_backup_*.sql.gz" -type f | sort -r | head -n 1)
    
    if [[ -n "$LATEST_BACKUP" ]]; then
        log_info "Restoring database from: $LATEST_BACKUP"
        
        # Descomprimir y restaurar
        gunzip -c "$LATEST_BACKUP" | docker-compose exec -T postgres psql -U bukialo_user -d bukialo_crm
        
        log_success "Database restored from backup"
    else
        log_warning "No backup found for rollback"
    fi
    
    # Volver a la versión anterior de los contenedores
    docker-compose down
    docker-compose up -d
    
    log_success "Rollback completed"
}

# Limpiar recursos
cleanup() {
    log_info "Cleaning up resources..."
    
    # Limpiar imágenes sin tag
    docker image prune -f
    
    # Limpiar volúmenes no utilizados
    docker volume prune -f
    
    # Limpiar networks no utilizados
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Mostrar status del deployment
show_status() {
    log_info "Deployment Status:"
    echo ""
    
    # Status de servicios
    docker-compose ps
    echo ""
    
    # Uso de recursos
    log_info "Resource Usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
    echo ""
    
    # Logs recientes
    log_info "Recent logs:"
    docker-compose logs --tail=5
}

# Parsear argumentos
ENVIRONMENT=""
BUILD_ONLY=false
SKIP_BACKUP=false
FORCE_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        --status)
            show_status
            exit 0
            ;;
        --rollback)
            rollback_deployment
            exit 0
            ;;
        --cleanup)
            cleanup
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validar argumentos
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment is required"
    show_help
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    show_help
    exit 1
fi

# Confirmación para producción
if [[ "$ENVIRONMENT" == "production" && "$FORCE_DEPLOY" != "true" ]]; then
    echo ""
    log_warning "You are about to deploy to PRODUCTION!"
    read -p "Are you sure you want to continue? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
fi

# Ejecutar deployment
main() {
    log_info "Starting Bukialo CRM deployment to $ENVIRONMENT..."
    log_info "Timestamp: $(date)"
    echo ""
    
    # Verificar prerequisitos
    check_prerequisites
    
    # Cargar variables de entorno
    load_environment
    
    # Backup de base de datos
    if [[ "$ENVIRONMENT" != "dev" ]]; then
        backup_database
    fi
    
    # Construir imágenes
    build_images
    
    # Solo build si se especifica
    if [[ "$BUILD_ONLY" == "true" ]]; then
        log_success "Build completed successfully!"
        exit 0
    fi
    
    # Deploy del entorno
    deploy_environment
    
    # Mostrar status final
    echo ""
    show_status
    
    echo ""
    log_success "🚀 Bukialo CRM deployment to $ENVIRONMENT completed successfully!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:5000"
    log_info "Admin Panel: http://localhost:8080 (dev only)"
}

# Trap para cleanup en caso de error
trap 'log_error "Deployment failed!"; exit 1' ERR

# Ejecutar función principal
main "$@"