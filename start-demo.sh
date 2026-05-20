#!/usr/bin/env bash
# =============================================================================
# ESN ATS/CRM — Démarrage automatisé pour démonstration
# Usage:
#   ./start-demo.sh          # Démarre MySQL, API, interface
#   ./start-demo.sh stop     # Arrête API + front (MySQL reste actif)
#   ./start-demo.sh stop --all   # Arrête tout y compris MySQL
#   ./start-demo.sh status   # État des services
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DEMO_DIR="${ROOT_DIR}/.demo"
PID_BACKEND="${DEMO_DIR}/backend.pid"
PID_FRONTEND="${DEMO_DIR}/frontend.pid"
LOG_BACKEND="${DEMO_DIR}/logs/backend.log"
LOG_FRONTEND="${DEMO_DIR}/logs/frontend.log"

API_PORT="${SERVER_PORT:-8080}"
UI_PORT="${UI_PORT:-4200}"
DB_PORT="${DB_PORT:-3307}"
API_HEALTH_URL="http://localhost:${API_PORT}/api/actuator/health"
UI_URL="http://localhost:${UI_PORT}"
SWAGGER_URL="http://localhost:${API_PORT}/api/swagger-ui.html"

BACKEND_TIMEOUT_SEC="${BACKEND_TIMEOUT_SEC:-180}"
FRONTEND_TIMEOUT_SEC="${FRONTEND_TIMEOUT_SEC:-120}"
MYSQL_TIMEOUT_SEC="${MYSQL_TIMEOUT_SEC:-90}"

# Couleurs (désactivées si pas de TTY)
if [[ -t 1 ]]; then
  C_RESET='\033[0m'
  C_GREEN='\033[0;32m'
  C_YELLOW='\033[1;33m'
  C_RED='\033[0;31m'
  C_CYAN='\033[0;36m'
  C_BOLD='\033[1m'
else
  C_RESET= C_GREEN= C_YELLOW= C_RED= C_CYAN= C_BOLD=
fi

info()  { printf "${C_CYAN}[INFO]${C_RESET} %s\n" "$*"; }
ok()    { printf "${C_GREEN}[OK]${C_RESET}   %s\n" "$*"; }
warn()  { printf "${C_YELLOW}[WARN]${C_RESET} %s\n" "$*"; }
err()   { printf "${C_RED}[ERR]${C_RESET}  %s\n" "$*" >&2; }

docker_compose() {
  if docker compose version &>/dev/null; then
    docker compose "$@"
  elif command -v docker-compose &>/dev/null; then
    docker-compose "$@"
  else
    err "Docker Compose introuvable."
    exit 1
  fi
}

require_commands() {
  local missing=()
  for cmd in docker java mvn node npm curl; do
    command -v "$cmd" &>/dev/null || missing+=("$cmd")
  done
  if ((${#missing[@]} > 0)); then
    err "Outils manquants : ${missing[*]}"
    err "Installez JDK 21, Maven 3.9+, Node 20 LTS, Docker et curl."
    exit 1
  fi
  ok "Outils requis présents (docker, java, mvn, node, npm, curl)"
}

resolve_java_home() {
  # JDK requis (javac) — pas seulement le JRE
  if [[ -n "${JAVA_HOME:-}" && -x "${JAVA_HOME}/bin/javac" ]]; then
    export JAVA_HOME
    export PATH="${JAVA_HOME}/bin:${PATH}"
    return 0
  fi
  local candidate
  for candidate in \
    /usr/lib/jvm/java-21-openjdk-amd64 \
    /usr/lib/jvm/java-21-amazon-corretto \
    /usr/lib/jvm/temurin-21-jdk-amd64 \
    /usr/lib/jvm/default-java; do
    if [[ -x "${candidate}/bin/javac" ]]; then
      export JAVA_HOME="${candidate}"
      export PATH="${JAVA_HOME}/bin:${PATH}"
      return 0
    fi
  done
  return 1
}

check_java_version() {
  if ! command -v java &>/dev/null; then
    err "java introuvable — installez OpenJDK 21."
    exit 1
  fi
  if ! resolve_java_home; then
    err "JDK 21 introuvable (javac manquant). Le JRE seul ne suffit pas."
    err "Ubuntu/Debian : sudo apt install openjdk-21-jdk-headless"
    err "Fedora : sudo dnf install java-21-openjdk-devel"
    exit 1
  fi
  local ver
  ver="$("${JAVA_HOME}/bin/java" -version 2>&1 | head -n1 || true)"
  info "Java détecté : ${ver:-inconnu}"
  info "JAVA_HOME=${JAVA_HOME}"
  ok "JDK disponible (javac présent)"
}

ensure_env_file() {
  if [[ ! -f "${ROOT_DIR}/.env" ]]; then
    cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env"
    ok "Fichier .env créé depuis .env.example"
  else
    info "Fichier .env existant conservé"
  fi

  # Port MySQL Docker (3307:3306)
  if grep -q '^DB_PORT=' "${ROOT_DIR}/.env"; then
    sed -i 's/^DB_PORT=.*/DB_PORT=3307/' "${ROOT_DIR}/.env"
  else
    echo 'DB_PORT=3307' >> "${ROOT_DIR}/.env"
  fi
  ok "DB_PORT=3307 configuré pour Docker Compose"

  if grep -qE '^OPENAI_API_KEY=.+$' "${ROOT_DIR}/.env" 2>/dev/null; then
    ok "OPENAI_API_KEY présente — matching IA et import CV disponibles"
  else
    warn "OPENAI_API_KEY absente — CRM OK, mais matching IA / import CV échoueront"
    warn "Ajoutez OPENAI_API_KEY=sk-... dans .env puis relancez ./start-demo.sh stop && ./start-demo.sh"
  fi
}

mkdir_demo_dirs() {
  mkdir -p "${DEMO_DIR}/logs"
}

is_pid_running() {
  local pidfile="$1"
  [[ -f "$pidfile" ]] || return 1
  local pid
  pid="$(cat "$pidfile")"
  kill -0 "$pid" 2>/dev/null
}

kill_tree() {
  local pid="$1"
  [[ -n "$pid" ]] || return 0
  local child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

stop_process() {
  local name="$1"
  local pidfile="$2"
  if is_pid_running "$pidfile"; then
    local pid
    pid="$(cat "$pidfile")"
    info "Arrêt ${name} (PID ${pid})..."
    kill_tree "$pid"
    sleep 2
    kill -9 "$pid" 2>/dev/null || true
    kill_tree "$pid"
    ok "${name} arrêté"
  fi
  rm -f "$pidfile"
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local timeout="$3"
  local elapsed=0
  info "Attente ${label} (${url}) — max ${timeout}s..."
  while (( elapsed < timeout )); do
    if curl -sf -o /dev/null "$url" 2>/dev/null; then
      ok "${label} disponible (${elapsed}s)"
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  err "${label} non disponible après ${timeout}s"
  return 1
}

wait_mysql_healthy() {
  local elapsed=0
  info "Attente MySQL (Docker) — max ${MYSQL_TIMEOUT_SEC}s..."
  while (( elapsed < MYSQL_TIMEOUT_SEC )); do
    if docker_compose ps mysql 2>/dev/null | grep -qE 'healthy|Up'; then
      if docker exec esn-ats-mysql mysqladmin ping -h localhost -u ats_user -pats_password --silent 2>/dev/null; then
        ok "MySQL prêt (${elapsed}s)"
        return 0
      fi
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  err "MySQL non prêt — vérifiez : docker compose logs mysql"
  return 1
}

start_mysql() {
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^esn-ats-mysql$'; then
    info "Conteneur MySQL déjà en cours d'exécution"
  else
    info "Démarrage MySQL (docker compose up -d)..."
    docker_compose up -d
  fi
  wait_mysql_healthy
}

install_frontend_deps() {
  if [[ ! -d "${ROOT_DIR}/frontend/node_modules" ]]; then
    info "Installation des dépendances npm (première fois)..."
    (cd "${ROOT_DIR}/frontend" && npm install)
    ok "npm install terminé"
  else
    ok "node_modules déjà présent"
  fi
}

build_backend() {
  info "Compilation backend (mvn install, modules ats-api)..."
  (
    cd "${ROOT_DIR}/backend"
    export ENV_FILE="${ROOT_DIR}/.env"
    mvn -q -pl ats-api -am install -DskipTests
  ) || {
    err "Échec compilation — installez JDK 21 (voir message ci-dessus)."
    exit 1
  }
  ok "Backend compilé"
}

start_backend() {
  if is_pid_running "$PID_BACKEND"; then
    warn "Backend déjà lancé (PID $(cat "$PID_BACKEND")) — arrêt préalable : ./start-demo.sh stop"
    return 0
  fi
  build_backend
  info "Démarrage API Spring Boot (profil dev, module ats-api)..."
  : >"$LOG_BACKEND"
  # spring-boot:run depuis le parent cible ats-platform (sans main) — lancer depuis ats-api
  (
    cd "${ROOT_DIR}/backend/ats-api"
    export ENV_FILE="${ROOT_DIR}/.env"
    nohup mvn -q spring-boot:run -Dspring-boot.run.profiles=dev \
      >>"$LOG_BACKEND" 2>&1 &
    echo $! >"$PID_BACKEND"
  )
  ok "Backend lancé (PID $(cat "$PID_BACKEND"), log: ${LOG_BACKEND})"
  wait_for_url "$API_HEALTH_URL" "API (actuator health)" "$BACKEND_TIMEOUT_SEC" || {
    err "Échec démarrage backend — dernières lignes du log :"
    tail -n 30 "$LOG_BACKEND" >&2 || true
    exit 1
  }
}

start_frontend() {
  if is_pid_running "$PID_FRONTEND"; then
    warn "Frontend déjà lancé (PID $(cat "$PID_FRONTEND"))"
    return 0
  fi
  info "Démarrage interface Angular (ng serve)..."
  : >"$LOG_FRONTEND"
  (
    cd "${ROOT_DIR}/frontend"
    nohup npm start >>"$LOG_FRONTEND" 2>&1 &
    echo $! >"$PID_FRONTEND"
  )
  ok "Frontend lancé (PID $(cat "$PID_FRONTEND"), log: ${LOG_FRONTEND})"
  wait_for_url "$UI_URL" "Interface Angular" "$FRONTEND_TIMEOUT_SEC" || {
    err "Échec démarrage frontend — dernières lignes du log :"
    tail -n 30 "$LOG_FRONTEND" >&2 || true
    exit 1
  }
}

print_results() {
  local openai_status="non configurée (CRM seul)"
  if grep -qE '^OPENAI_API_KEY=.+$' "${ROOT_DIR}/.env" 2>/dev/null; then
    openai_status="configurée"
  fi

  printf "\n"
  printf "${C_BOLD}════════════════════════════════════════════════════════════════${C_RESET}\n"
  printf "${C_BOLD}  DÉMO ESN ATS/CRM — PRÊTE${C_RESET}\n"
  printf "${C_BOLD}════════════════════════════════════════════════════════════════${C_RESET}\n"
  printf "\n"
  printf "${C_GREEN}Résultats attendus (vérifiés par le script) :${C_RESET}\n"
  printf "  • MySQL Docker     : conteneur esn-ats-mysql actif (port %s)\n" "$DB_PORT"
  printf "  • API REST         : %s\n" "$API_HEALTH_URL"
  printf "  • Swagger UI       : %s\n" "$SWAGGER_URL"
  printf "  • Interface web    : %s\n" "$UI_URL"
  printf "  • Clé OpenAI       : %s\n" "$openai_status"
  printf "\n"
  printf "${C_CYAN}Comptes de démonstration (mot de passe : password) :${C_RESET}\n"
  printf "  • Commercial / RH  : agent@esn.local\n"
  printf "  • Client externe   : client@esn.local\n"
  printf "  • Administrateur   : admin@esn.local\n"
  printf "\n"
  printf "${C_CYAN}Scénario suggéré pour le patron :${C_RESET}\n"
  printf "  1. Ouvrir %s\n" "$UI_URL"
  printf "  2. Connexion Agent → Clients CRM → Opportunités → Candidats\n"
  printf "  3. Fiche opportunité → Matching IA (si clé OpenAI)\n"
  printf "  4. Déconnexion → connexion Client (menu réduit)\n"
  printf "\n"
  printf "${C_CYAN}Commandes utiles :${C_RESET}\n"
  printf "  • Logs API  : tail -f %s\n" "$LOG_BACKEND"
  printf "  • Logs UI   : tail -f %s\n" "$LOG_FRONTEND"
  printf "  • Arrêter   : ./start-demo.sh stop\n"
  printf "  • Tout stop : ./start-demo.sh stop --all\n"
  printf "  • État      : ./start-demo.sh status\n"
  printf "\n"
  printf "${C_YELLOW}Document projet : DOSSIER_PROJET.md${C_RESET}\n"
  printf "\n"
}

cmd_status() {
  printf "${C_BOLD}État des services ESN ATS/CRM${C_RESET}\n\n"
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^esn-ats-mysql$'; then
    ok "MySQL : conteneur actif"
  else
    warn "MySQL : arrêté"
  fi
  if is_pid_running "$PID_BACKEND"; then
    ok "Backend : PID $(cat "$PID_BACKEND")"
    curl -sf -o /dev/null "$API_HEALTH_URL" 2>/dev/null && ok "  → health OK" || warn "  → health KO"
  else
    warn "Backend : arrêté"
  fi
  if is_pid_running "$PID_FRONTEND"; then
    ok "Frontend : PID $(cat "$PID_FRONTEND")"
    curl -sf -o /dev/null "$UI_URL" 2>/dev/null && ok "  → UI OK" || warn "  → UI KO"
  else
    warn "Frontend : arrêté"
  fi
  printf "\n"
}

cmd_stop() {
  local stop_db=false
  [[ "${1:-}" == "--all" ]] && stop_db=true

  stop_process "Backend" "$PID_BACKEND"
  stop_process "Frontend" "$PID_FRONTEND"

  if $stop_db; then
    info "Arrêt MySQL (docker compose down)..."
    docker_compose down
    ok "MySQL arrêté"
  else
    info "MySQL laissé actif (relance plus rapide). Pour tout arrêter : ./start-demo.sh stop --all"
  fi
  ok "Arrêt terminé"
}

cmd_start() {
  printf "${C_BOLD}ESN ATS/CRM — Démarrage démo automatisé${C_RESET}\n\n"
  require_commands
  check_java_version
  mkdir_demo_dirs
  ensure_env_file
  start_mysql
  install_frontend_deps
  start_backend
  start_frontend
  print_results
}

main() {
  case "${1:-start}" in
    start|"") cmd_start ;;
    stop)     cmd_stop "${2:-}" ;;
    status)   mkdir_demo_dirs; cmd_status ;;
    -h|--help)
      sed -n '3,9p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      err "Commande inconnue : $1 (utilisez start, stop, status, --help)"
      exit 1
      ;;
  esac
}

main "$@"
