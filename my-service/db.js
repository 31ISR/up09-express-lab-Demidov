const Database = require("better-sqlite3")

const db = new Database("database.db")

db.prepare(`
    CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password  TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`).run()

db.prepare(`
    CREATE TABLE IF NOT EXISTS Book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER NOT NULL,
        genre TEXT NOT NULL,
        description TEXT NOT NULL,
        createdBy INTEGER NOT NULL,
        FOREIGN KEY (createdBy) REFERENCES User(createdAt)
    )
`).run()
db.prepare(`
    CREATE TABLE IF NOT EXISTS Review (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER CHECK(rating>=1 and rating<=5) NOT NULL,
        comment TEXT NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bookId) REFERENCES Book(id),
        FOREIGN KEY (userId) REFERENCES User(id)
    )
`).run()

module.exports = db