// Vercel 部署时 API 在 /api/ 目录下

interface Record {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  remark: string;
  createdAt: string;
}

const api = {
  // 获取所有记录
  async getRecords(search?: string): Promise<Record[]> {
    try {
      const url = search 
        ? `/api/records?search=${encodeURIComponent(search)}`
        : '/api/records';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    } catch (err) {
      console.error('获取数据失败:', err);
      return [];
    }
  },
  
  // 添加记录
  async addRecord(data: { name: string; phone?: string; email?: string; address?: string; remark?: string }): Promise<{ id: number }> {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  // 更新记录
  async updateRecord(id: number, data: { name: string; phone?: string; email?: string; address?: string; remark?: string }): Promise<void> {
    await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  
  // 删除记录
  async deleteRecord(id: number): Promise<void> {
    await fetch(`/api/records/${id}`, {
      method: 'DELETE'
    });
  }
};

export default api;
