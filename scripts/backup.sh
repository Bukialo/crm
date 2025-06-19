#!/bin/bash

# Script de backup automatizado para Bukialo CRM
# Uso: ./scripts/backup.sh [options]

set -e

# Configuración
BACKUP_DIR="/backups"
RETENTION_DAYS=30
DB_CONTAINER="bukialo-postgres"
DB_NAME="bukialo_crm"
DB_USER="bukialo_user"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$BACKUP_DIR/backup.log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funciones de logging
log_info() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

log_success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [SUCCESS] $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

log_warning() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [WARNING] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

log_error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

# Verificar prerequisitos
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Crear directorio de backup si no existe
    mkdir -p "$BACKUP_DIR"
    
    # Verificar que el contenedor de PostgreSQL existe
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "PostgreSQL container '$DB_CONTAINER' is not running"
        exit 1
    fi
    
    # Verificar conectividad a la base de datos
    if ! docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        log_error "Cannot connect to database"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Backup de la base de datos
backup_database() {
    local backup_file="$BACKUP_DIR/bukialo_db_backup_$TIMESTAMP.sql"
    local compressed_file="$backup_file.gz"
    
    log_info "Starting database backup..."
    log_info "Backup file: $backup_file"
    
    # Realizar el backup
    if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" \
        --verbose \
        --no-owner \
        --no-privileges \
        --create \
        --clean > "$backup_file" 2>/dev/null; then
        
        log_success "Database backup completed"
        
        # Comprimir el backup
        log_info "Compressing backup..."
        if gzip "$backup_file"; then
            log_success "Backup compressed: $compressed_file"
            
            # Verificar integridad del archivo comprimido
            if gzip -t "$compressed_file"; then
                log_success "Compressed backup integrity verified"
                
                # Obtener tamaño del archivo
                local file_size=$(du -h "$compressed_file" | cut -f1)
                log_info "Backup size: $file_size"
                
                return 0
            else
                log_error "Compressed backup integrity check failed"
                return 1
            fi
        else
            log_error "Failed to compress backup"
            return 1
        fi
    else
        log_error "Database backup failed"
        return 1
    fi
}

# Backup de archivos uploaded
backup_uploads() {
    local uploads_backup="$BACKUP_DIR/bukialo_uploads_backup_$TIMESTAMP.tar.gz"
    local uploads_dir="/app/uploads"
    
    log_info "Starting uploads backup..."
    
    # Verificar si el directorio exists
    if docker exec bukialo-backend ls "$uploads_dir" > /dev/null 2>&1; then
        # Crear backup de uploads
        if docker exec bukialo-backend tar -czf - -C "$uploads_dir" . > "$uploads_backup" 2>/dev/null; then
            log_success "Uploads backup completed: $uploads_backup"
            
            local file_size=$(du -h "$uploads_backup" | cut -f1)
            log_info "Uploads backup size: $file_size"
        else
            log_warning "Uploads backup failed"
        fi
    else
        log_warning "Uploads directory not found, skipping uploads backup"
    fi
}

# Backup de configuraciones
backup_configs() {
    local config_backup="$BACKUP_DIR/bukialo_configs_backup_$TIMESTAMP.tar.gz"
    
    log_info "Starting configuration backup..."
    
    # Archivos de configuración a respaldar
    local config_files=(
        "docker-compose.yml"
        "docker-compose.prod.yml"
        ".env.production"
        "docker/nginx.conf"
    )
    
    # Crear archivo temporal con las configuraciones
    local temp_dir="/tmp/bukialo_config_backup_$TIMESTAMP"
    mkdir -p "$temp_dir"
    
    for file in "${config_files[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$temp_dir/"
        fi
    done
    
    # Comprimir configuraciones
    if tar -czf "$config_backup" -C "$temp_dir" . 2>/dev/null; then
        log_success "Configuration backup completed: $config_backup"
        
        local file_size=$(du -h "$config_backup" | cut -f1)
        log_info "Configuration backup size: $file_size"
    else
        log_warning "Configuration backup failed"
    fi
    
    # Limpiar directorio temporal
    rm -rf "$temp_dir"
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    local deleted_count=0
    
    # Limpiar backups de base de datos
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        log_info "Deleted old backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "bukialo_db_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    # Limpiar backups de uploads
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        log_info "Deleted old upload backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "bukialo_uploads_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    # Limpiar backups de configuraciones
    while IFS= read -r -d '' file; do
        rm "$file"
        ((deleted_count++))
        log_info "Deleted old config backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "bukialo_configs_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    if [[ $deleted_count -eq 0 ]]; then
        log_info "No old backups to delete"
    else
        log_success "Deleted $deleted_count old backup files"
    fi
}

# Verificar backups existentes
verify_backups() {
    log_info "Verifying existing backups..."
    
    local backup_count=0
    local total_size=0
    
    # Contar y verificar backups de base de datos
    while IFS= read -r -d '' file; do
        ((backup_count++))
        local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        total_size=$((total_size + file_size))
        
        # Verificar integridad
        if gzip -t "$file" 2>/dev/null; then
            log_info "✓ $(basename "$file") - OK"
        else
            log_warning "✗ $(basename "$file") - CORRUPTED"
        fi
    done < <(find "$BACKUP_DIR" -name "bukialo_db_backup_*.sql.gz" -type f -print0)
    
    local total_size_human=$(echo "$total_size" | awk '{
        if ($1 >= 1073741824) printf "%.2f GB", $1/1073741824
        else if ($1 >= 1048576) printf "%.2f MB", $1/1048576
        else if ($1 >= 1024) printf "%.2f KB", $1/1024
        else printf "%d B", $1
    }')
    
    log_success "Found $backup_count database backups, total size: $total_size_human"
}

# Enviar notificación (webhook, email, etc.)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Webhook URL (configurar según necesidad)
    local webhook_url="${BACKUP_WEBHOOK_URL:-}"
    
    if [[ -n "$webhook_url" ]]; then
        local payload="{
            \"text\": \"Bukialo CRM Backup $status\",
            \"attachments\": [{
                \"color\": \"$([ "$status" = "SUCCESS" ] && echo "good" || echo "danger")\",
                \"fields\": [{
                    \"title\": \"Status\",
                    \"value\": \"$status\",
                    \"short\": true
                }, {
                    \"title\": \"Timestamp\",
                    \"value\": \"$(date)\",
                    \"short\": true
                }, {
                    \"title\": \"Message\",
                    \"value\": \"$message\",
                    \"short\": false
                }]
            }]
        }"
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$webhook_url" 2>/dev/null || log_warning "Failed to send notification"
    fi
}

# Función principal
main() {
    local start_time=$(date +%s)
    
    log_info "=== Bukialo CRM Backup Started ==="
    log_info "Timestamp: $(date)"
    log_info "Retention: $RETENTION_DAYS days"
    echo ""
    
    # Verificar prerequisitos
    check_prerequisites
    echo ""
    
    # Realizar backups
    if backup_database; then
        echo ""
        backup_uploads
        echo ""
        backup_configs
        echo ""
        cleanup_old_backups
        echo ""
        verify_backups
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "=== Backup completed successfully in ${duration}s ==="
        send_notification "SUCCESS" "All backups completed successfully"
    else
        log_error "=== Backup failed ==="
        send_notification "FAILED" "Database backup failed"
        exit 1
    fi
}

# Mostrar ayuda
show_help() {
    cat << EOF
Bukialo CRM Backup Script

USAGE:
    ./scripts/backup.sh [OPTIONS]

OPTIONS:
    --verify-only       Only verify existing backups
    --cleanup-only      Only cleanup old backups
    --db-only          Only backup database
    --help             Show this help message

ENVIRONMENT VARIABLES:
    BACKUP_WEBHOOK_URL  Webhook URL for notifications
    RETENTION_DAYS      Days to keep backups (default: 30)

EXAMPLES:
    ./scripts/backup.sh
    ./scripts/backup.sh --verify-only
    ./scripts/backup.sh --db-only

EOF
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --verify-only)
            verify_backups
            exit 0
            ;;
        --cleanup-only)
            cleanup_old_backups
            exit 0
            ;;
        --db-only)
            check_prerequisites
            backup_database
            exit 0
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Ejecutar función principal
main "$@"