const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'data.db');

// 中间件
app.use(cors());
app.use(express.json());

let db;

// 初始化数据库
async function initDB() {
  const SQL = await initSqlJs();
  
  // 尝试加载已有数据库
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      remark TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  saveDB();
}

// 保存数据库到文件
function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// API 路由

// 获取所有记录
app.get('/api/records', (req, res) => {
  const { search } = req.query;
  let sql = 'SELECT * FROM records ORDER BY createdAt DESC';
  let params = [];
  
  if (search) {
    sql = `SELECT * FROM records WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? ORDER BY createdAt DESC`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }
  
  try {
    const stmt = db.prepare(sql);
    if (params.length) {
      stmt.bind(params);
    }
    
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加记录
app.post('/api/records', (req, res) => {
  const { name, phone, email, address, remark } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: '姓名不能为空' });
  }
  
  try {
    db.run(`
      INSERT INTO records (name, phone, email, address, remark)
      VALUES (?, ?, ?, ?, ?)
    `, [name, phone || '', email || '', address || '', remark || '']);
    
    const result = db.exec('SELECT last_insert_rowid() as id');
    const id = result[0].values[0][0];
    
    saveDB();
    res.json({ id, message: '添加成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除记录
app.delete('/api/records/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.run('DELETE FROM records WHERE id = ?', [id]);
    saveDB();
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新记录
app.put('/api/records/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, remark } = req.body;
  
  try {
    db.run(`
      UPDATE records SET name = ?, phone = ?, email = ?, address = ?, remark = ?
      WHERE id = ?
    `, [name, phone || '', email || '', address || '', remark || '', id]);
    
    saveDB();
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('数据库初始化失败:', err);
  process.exit(1);
});
