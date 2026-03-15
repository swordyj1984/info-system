// Vercel Serverless API - 使用 Upstash Redis

const INITIAL_RECORDS = [
  { id: 1, name: '张三', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区', remark: 'VIP客户', createdAt: '2024-01-15' },
  { id: 2, name: '李四', phone: '13900139000', email: 'lisi@example.com', address: '上海市浦东新区', remark: '', createdAt: '2024-01-16' },
  { id: 3, name: '王五', phone: '13700137000', email: 'wangwu@example.com', address: '广州市天河区', remark: '重要客户', createdAt: '2024-01-17' },
];

// 获取 Redis 连接
async function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    throw new Error('Redis 环境变量未配置');
  }
  
  return { url, token };
}

// 执行 Redis 命令
async function redisCommand(cmd) {
  const { url, token } = await getRedis();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cmd)
  });
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

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

  const url = req.url || '';
  const searchIndex = url.indexOf('?');
  const path = searchIndex >= 0 ? url.substring(0, searchIndex) : url;
  
  // 解析 search 参数
  let search = '';
  if (searchIndex >= 0) {
    const searchParams = url.substring(searchIndex + 1);
    searchParams.split('&').forEach(param => {
      if (param.startsWith('search=')) {
        search = decodeURIComponent(param.substring(7));
      }
    });
  }

  try {
    // 获取记录
    let recordsData = await redisCommand(['GET', 'records']);
    let records = recordsData ? JSON.parse(recordsData) : null;
    
    // 如果不存在，初始化
    if (!records) {
      records = INITIAL_RECORDS;
      await redisCommand(['SET', 'records', JSON.stringify(records)]);
      await redisCommand(['SET', 'nextId', '4']);
    }

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
      const data = req.body || {};
      const { name, phone, email, address, remark } = data;
      
      if (!name) {
        res.status(400).json({ error: '姓名不能为空' });
        return;
      }
      
      let nextIdData = await redisCommand(['GET', 'nextId']);
      let nextId = nextIdData ? parseInt(nextIdData) : 4;
      
      const newRecord = {
        id: nextId,
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        remark: remark || '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      records.push(newRecord);
      await redisCommand(['SET', 'records', JSON.stringify(records)]);
      await redisCommand(['SET', 'nextId', String(nextId + 1)]);
      
      res.status(201).json({ id: newRecord.id, message: '添加成功' });
      return;
    }

    // PUT /api/records/:id - 更新记录
    if (req.method === 'PUT' && path.match(/^\/api\/records\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      const data = req.body || {};
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
      
      await redisCommand(['SET', 'records', JSON.stringify(records)]);
      
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
      await redisCommand(['SET', 'records', JSON.stringify(records)]);
      
      res.status(200).json({ message: '删除成功' });
      return;
    }

    res.status(404).json({ error: 'Not found' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
