-- D1 数据库表结构：评论 + 回复

CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    identity TEXT NOT NULL,
    avatar TEXT NOT NULL,
    text TEXT NOT NULL,
    ratings TEXT NOT NULL DEFAULT '[]',
    avg INTEGER NOT NULL DEFAULT 5,
    likes INTEGER NOT NULL DEFAULT 0,
    time TEXT NOT NULL,
    authorId TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewId INTEGER NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT NOT NULL,
    text TEXT NOT NULL,
    time TEXT NOT NULL,
    authorId TEXT NOT NULL,
    FOREIGN KEY (reviewId) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_replies_review ON replies(reviewId);
