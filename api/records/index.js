// Vercel Serverless API - 极简版（先测试基本功能）

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 静态数据（测试用）
  const records = [
    { id: 1, name: '张三', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区', remark: 'VIP客户', createdAt: '2024-01-15' },
    { id: 2, name: '李四', phone: '13900139000', email: 'lisi@example.com', address: '上海市浦东新区', remark: '', createdAt: '2024-01-16' },
    { id: 3, name: '王五', phone: '13700137000', email: 'wangwu@example.com', address: '广州市天河区', remark: '重要客户', createdAt: '2024-01-17' },
  ];

  const url = req.url || '';
  const searchIndex = url.indexOf('?');
  const path = searchIndex >= 0 ? url.substring(0, searchIndex) : url;

  try {
    // GET /api/records - 获取所有记录
    if (req.method === 'GET' && path === '/api/records') {
      res.status(200).json(records);
      return;
    }

    // POST /api/records - 添加记录
    if (req.method === 'POST' && path === '/api/records') {
      res.status(201).json({ id: 4, message: '添加成功' });
      return;
    }

    // PUT /api/records/:id - 更新记录
    if (req.method === 'PUT' && path.match(/^\/api\/records\/\d+$/)) {
      res.status(200).json({ message: '更新成功' });
      return;
    }

    // DELETE /api/records/:id - 删除记录
    if (req.method === 'DELETE' && path.match(/^\/api\/records\/\d+$/)) {
      res.status(200).json({ message: '删除成功' });
      return;
    }

    res.status(404).json({ error: 'Not found' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
