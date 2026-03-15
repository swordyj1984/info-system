// Vercel Serverless API - 简化版

const records = [
  { id: 1, name: '张三', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区', remark: 'VIP客户', createdAt: '2024-01-15' },
  { id: 2, name: '李四', phone: '13900139000', email: 'lisi@example.com', address: '上海市浦东新区', remark: '', createdAt: '2024-01-16' },
  { id: 3, name: '王五', phone: '13700137000', email: 'wangwu@example.com', address: '广州市天河区', remark: '重要客户', createdAt: '2024-01-17' },
];

let nextId = 4;

module.exports = async function(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const url = req.url || '';
  const searchIndex = url.indexOf('?');
  const path = searchIndex >= 0 ? url.substring(0, searchIndex) : url;
  const searchParams = searchIndex >= 0 ? url.substring(searchIndex + 1) : '';
  
  // 解析 search 参数
  let search = '';
  searchParams.split('&').forEach(param => {
    if (param.startsWith('search=')) {
      search = decodeURIComponent(param.substring(7));
    }
  });

  try {
    // GET /api/records - 获取所有记录
    if (req.method === 'GET' && path === '/api/records') {
      let result = [...records];
      
      if (search) {
        const s = search.toLowerCase();
        result = result.filter(r => 
          r.name.toLowerCase().includes(s) ||
          r.phone.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s)
        );
      }
      
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.status(200).json(result);
      return;
    }

    // POST /api/records - 添加记录
    if (req.method === 'POST' && path === '/api/records') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const data = JSON.parse(body);
      const { name, phone, email, address, remark } = data;
      
      if (!name) {
        res.status(400).json({ error: '姓名不能为空' });
        return;
      }
      
      const newRecord = {
        id: nextId++,
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        remark: remark || '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      records.push(newRecord);
      
      res.status(201).json({ id: newRecord.id, message: '添加成功' });
      return;
    }

    // PUT /api/records/:id - 更新记录
    if (req.method === 'PUT' && path.match(/^\/api\/records\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const data = JSON.parse(body);
      const { name, phone, email, address, remark } = data;
      
      const index = records.findIndex(r => r.id === id);
      if (index === -1) {
        res.status(404).json({ error: '记录不存在' });
        return;
      }
      
      records[index] = {
        ...records[index],
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        remark: remark || ''
      };
      
      res.status(200).json({ message: '更新成功' });
      return;
    }

    // DELETE /api/records/:id - 删除记录
    if (req.method === 'DELETE' && path.match(/^\/api\/records\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      const index = records.findIndex(r => r.id === id);
      
      if (index === -1) {
        res.status(404).json({ error: '记录不存在' });
        return;
      }
      
      records.splice(index, 1);
      
      res.status(200).json({ message: '删除成功' });
      return;
    }

    res.status(404).json({ error: 'Not found' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
