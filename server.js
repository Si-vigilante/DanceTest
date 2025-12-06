// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 积分数据文件（简单持久化，可选）
const SCORE_FILE = path.join(__dirname, 'scores.json');

// 默认积分
let scores = {
  camp1: 0,
  camp2: 0,
  camp3: 0,
  camp4: 0
};

// 从文件加载积分（如果存在）
function loadScores() {
  if (fs.existsSync(SCORE_FILE)) {
    try {
      const raw = fs.readFileSync(SCORE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      scores = { ...scores, ...data }; // 合并防止缺字段
      console.log('已从文件加载积分：', scores);
    } catch (e) {
      console.error('读取积分文件失败，使用默认值：', e);
    }
  }
}

// 将积分写入文件
function saveScores() {
  fs.writeFile(SCORE_FILE, JSON.stringify(scores, null, 2), err => {
    if (err) {
      console.error('保存积分失败：', err);
    }
  });
}

loadScores();

// 静态文件（前端页面）
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 允许简单跨域（如果你前后端分离部署会用到）
// const cors = require('cors');
// app.use(cors());

// 获取当前积分
app.get('/api/scores', (req, res) => {
  res.json(scores);
});

// 给某个阵营 +1
app.post('/api/scores/:camp/increment', (req, res) => {
  const campKey = req.params.camp;

  if (!scores.hasOwnProperty(campKey)) {
    return res.status(400).json({ error: '未知阵营: ' + campKey });
  }

  scores[campKey] += 1;
  saveScores();
  console.log(`阵营 ${campKey} +1 ，当前积分：`, scores[campKey]);
  res.json({ success: true, scores });
});

// 重置所有积分（需要简单密码）
app.post('/api/reset', (req, res) => {
  const { password } = req.body || {};
  if (password !== '0712') {
    return res.status(403).json({ error: '密码错误' });
  }

  scores = {
    camp1: 0,
    camp2: 0,
    camp3: 0,
    camp4: 0
  };
  saveScores();
  console.log('所有积分已重置');
  res.json({ success: true, scores });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`积分服务器已启动：http://localhost:${PORT}`);
});
