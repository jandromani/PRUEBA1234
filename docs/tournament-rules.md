# Motor de torneos tipo trivia

## Esquema D1

El esquema `database/d1-schema.sql` define las entidades solicitadas (`User`, `Tournament`, `QuestionSet`, `Question`, `PlayerTournament`, `Answer`, `Pot`, `Payout`) con claves foráneas y validaciones de estado para `Tournament`.

## Durable Object `TournamentRoom`

`tournamentRoom.ts` implementa un Durable Object minimalista que mantiene la progresión de cada sala con los estados `scheduled → open → locked → in_progress → finished → settled`. En modo `in_progress` controla la ventana de 14 segundos (o `timeoutSeconds` por pregunta) y avanza automáticamente al siguiente índice o marca el torneo como `finished`.

## API REST/SSE

Los handlers bajo `app/api/tournaments` exponen los endpoints REST requeridos:

- `GET /api/tournaments/active` lista torneos activos o próximos.
- `GET /api/tournaments/:id/state` devuelve estado y pregunta actual.
- `GET /api/tournaments/:id/questions/current` publica la pregunta en curso y tiempo restante.
- `POST /api/tournaments/:id/answer` registra una respuesta del jugador.
- `GET /api/tournaments/:id/result` entrega pagos y ranking final.
- `POST /api/tournaments/:id/join` registra la inscripción y actualiza el bote.
- `POST /api/tournaments/:id/join/callback` procesa callbacks externos de pago/World ID.

Los endpoints pueden difundirse también vía SSE/WebSocket reutilizando el servicio `TournamentService` como fuente de estado.

## Cron jobs

`workers/cron.ts` incluye un handler `scheduled` para Cloudflare Cron que avanza los estados en lote llamando a `scheduleTick()` y un helper `createDailyTournament` que programa la creación de torneos diarios a una hora UTC determinada.

## Reglas de desempate y bote

- **Desempate**: Se ordena primero por número de aciertos y luego por menor latencia promedio de respuesta (`avgLatency`). La latencia se calcula desde el inicio de cada pregunta hasta el `submittedAt` de la respuesta.
- **Bote / Rake**: Cada aporte (`contribution`) suma al `pot.gross`. El rake se aplica como `net = gross - gross * rakePercent`. En el ejemplo se reparte el `net` en 60%/25%/15% para los tres primeros lugares.
