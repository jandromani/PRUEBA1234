-- D1 schema for tournament trivia engine
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  wallet_address TEXT,
  display_name TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS Tournament (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('scheduled','open','locked','in_progress','finished','settled')),
  entry_fee INTEGER NOT NULL,
  rake_percent REAL NOT NULL DEFAULT 0.1,
  scheduled_at INTEGER NOT NULL,
  open_at INTEGER NOT NULL,
  start_at INTEGER NOT NULL,
  locked_at INTEGER,
  finished_at INTEGER,
  settled_at INTEGER,
  question_set_id TEXT NOT NULL,
  pot_gross INTEGER DEFAULT 0,
  pot_net INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS QuestionSet (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Question (
  id TEXT PRIMARY KEY,
  question_set_id TEXT NOT NULL REFERENCES QuestionSet(id),
  text TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_option INTEGER NOT NULL,
  timeout_seconds INTEGER DEFAULT 14
);

CREATE TABLE IF NOT EXISTS PlayerTournament (
  tournament_id TEXT NOT NULL REFERENCES Tournament(id),
  player_id TEXT NOT NULL REFERENCES User(id),
  joined_at INTEGER DEFAULT (strftime('%s','now')),
  contribution INTEGER NOT NULL,
  PRIMARY KEY (tournament_id, player_id)
);

CREATE TABLE IF NOT EXISTS Answer (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id TEXT NOT NULL REFERENCES Tournament(id),
  player_id TEXT NOT NULL REFERENCES User(id),
  question_id TEXT NOT NULL REFERENCES Question(id),
  option_index INTEGER NOT NULL,
  submitted_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS Pot (
  tournament_id TEXT PRIMARY KEY REFERENCES Tournament(id),
  gross INTEGER NOT NULL,
  rake_percent REAL NOT NULL,
  net INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Payout (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id TEXT NOT NULL REFERENCES Tournament(id),
  player_id TEXT NOT NULL REFERENCES User(id),
  amount INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  avg_latency INTEGER NOT NULL
);
