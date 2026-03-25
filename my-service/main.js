const express = require("express")
const db = require("./db")
const bcr = require("bcryptjs")
const app = express()
const SECRET = "dfgdgf"
const jwt = require("jsonwebtoken")
app.use(express.json())

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) return res
        .status(401)
        .json({ error: "Missing auth header " })
    const token = authHeader.split(" ")[1]

    if (!token) return res.status(401)
        .json({ error: "Wrong token format " })
    try {
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    } catch (error) {
        console.error(error)
    }
}

app.post("/api/auth/register", (req, res) => {
    const { email, username, password, role } = req.body
    try {
        if (!email || !username || !password)
            return res
                .status(400)
                .json({ error: "Не хватает папы" })
        const syncSalt = bcr.genSaltSync(10)
        const hashed = bcr.hashSync(password, syncSalt)
        const query = db.prepare(`INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, ?)`).run(username, email, hashed, role)
        const newUser = db.prepare("SELECT * FROM user WHERE id  = ?").get(query.lastInsertRowid)
        const { password: _, ...safeUser } = newUser
        res.status(201).json(safeUser)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Что-то пошло не так" })
    }
})

app.post("/api/auth/login", (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "я не вижу че там написано" })
        }
        const user = db.prepare("SELECT * FROM user WHERE email = ?").get(email)
        if (!user) return res.status(401).json({ error: "ты накосячил гдетол" })
        const hashed = bcr.compareSync(password, user.password)
        if (!hashed) return res.status(401).json({ error: "не правильго" })
        const { password: _, ...safeUser } = user
        const token = jwt.sign(safeUser, SECRET, { expiresIn: "24h" })
        return (res)
            .status(200)
            .json({ succes: true, token, error: null })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

app.get("/api/auth/profile", auth, (req, res) => {
    try {
        const user = db.prepare("SELECT * FROM User WHERE id = ?").get(req.user.id)
        if (!user) return res.status(401).json({ error: "ты накосячил гдетол" })
        const { password: _, ...safeUser } = user
        return res.json({ succes: true, safeUser, error: null })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong" })
    }
})

app.listen(3000)