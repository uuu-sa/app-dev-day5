const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const port = 3000;

// データベースの設定
const db = new Database('votes.db');

// テーブルの自動作成
db.prepare(`
    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        makeup_option TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

app.use(express.json());
app.use(express.static(__dirname));

// 投票を保存する
app.post('/vote', (req, res) => {
    const { option } = req.body;
    if (!option) {
        return res.status(400).json({ error: 'Option is required' });
    }

    try {
        const stmt = db.prepare('INSERT INTO votes (makeup_option) VALUES (?)');
        stmt.run(option);
        res.json({ success: true, message: 'Vote recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 集計結果を取得する
app.get('/votes', (req, res) => {
    try {
        const stmt = db.prepare(`
            SELECT makeup_option as option, COUNT(*) as count 
            FROM votes 
            GROUP BY makeup_option
        `);
        const rows = stmt.all();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
