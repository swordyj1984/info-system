// 简单的内存数据库（Vercel Serverless 环境）
// 注意：Serverless 函数是无状态的，每次调用可能不保留数据
// 这是一个演示版本

interface Record {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  remark: string;
  createdAt: string;
}

// 模拟数据库
let records: Record[] = [
  { id: 1, name: '张三', phone: '13800138000', email: 'zhangsan@example.com', address: '北京市朝阳区', remark: 'VIP客户', createdAt: '2024-01-15' },
  { id: 2, name: '李四', phone: '13900139000', email: 'lisi@example.com', address: '上海市浦东新区', remark: '', createdAt: '2024-01-16' },
  { id: 3, name: '王五', phone: '13700137000', email: 'wangwu@example.com', address: '广州市天河区', remark: '重要客户', createdAt: '2024-01-17' },
];

let nextId = 4;

export default function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const search = url.searchParams.get('search');

  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // GET /api/records - 获取所有记录
    if (req.method === 'GET' && path === '/api/records') {
      let result = records;
      
      if (search) {
        const s = search.toLowerCase();
        result = records.filter(r => 
          r.name.toLowerCase().includes(s) ||
          r.phone.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s)
        );
      }
      
      // 按创建时间倒序
      result = [...result].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return new Response(JSON.stringify(result), { headers });
    }

    // POST /api/records - 添加记录
    if (req.method === 'POST' && path === '/api/records') {
      const body = req.json();
      const { name, phone, email, address, remark } = body;
      
      if (!name) {
        return new Response(JSON.stringify({ error: '姓名不能为空' }), { 
          status: 400, headers 
        });
      }
      
      const newRecord: Record = {
        id: nextId++,
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        remark: remark || '',
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      records.push(newRecord);
      
      return new Response(JSON.stringify({ id: newRecord.id, message: '添加成功' }), { 
        status: 201, headers 
      });
    }

    // PUT /api/records/:id - 更新记录
    if (req.method === 'PUT' && path.match(/^\/api\/records\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      const body = req.json();
      const { name, phone, email, address, remark } = body;
      
      const index = records.findIndex(r => r.id === id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: '记录不存在' }), { 
          status: 404, headers 
        });
      }
      
      records[index] = {
        ...records[index],
        name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        remark: remark || ''
      };
      
      return new Response(JSON.stringify({ message: '更新成功' }), { headers });
    }

    // DELETE /api/records/:id - 删除记录
    if (req.method === 'DELETE' && path.match(/^\/api\/records\/\d+$/)) {
      const id = parseInt(path.split('/').pop() || '0');
      const index = records.findIndex(r => r.id === id);
      
      if (index === -1) {
        return new Response(JSON.stringify({ error: '记录不存在' }), { 
          status: 404, headers 
        });
      }
      
      records.splice(index, 1);
      
      return new Response(JSON.stringify({ message: '删除成功' }), { headers });
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, headers 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), { 
      status: 500, headers 
    });
  }
}
