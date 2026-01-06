
set -e

DUMP_DIR="dumps"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILE="$DUMP_DIR/tournament_$TIMESTAMP.sql"

mkdir -p "$DUMP_DIR"

docker compose exec -T tournament-db \
  pg_dump -U postgres -d tournament --no-owner --no-privileges \
  > "$FILE"

echo "Dump created: $FILE"
