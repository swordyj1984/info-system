import { useState, useEffect } from 'react';
import api from './api';

interface Record {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  remark: string;
  createdAt: string;
}

export default function InfoSystem() {
  const [records, setRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    remark: ''
  });

  // 获取列表
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await api.getRecords(search || undefined);
      setRecords(data);
    } catch (err) {
      console.error('获取数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [search]);

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        await api.updateRecord(editingRecord.id, formData);
      } else {
        await api.addRecord(formData);
      }
      
      setShowModal(false);
      setEditingRecord(null);
      setFormData({ name: '', phone: '', email: '', address: '', remark: '' });
      fetchRecords();
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请稍后重试');
    }
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await api.deleteRecord(id);
      fetchRecords();
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败，请稍后重试');
    }
  };

  // 编辑记录
  const handleEdit = (record: Record) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      phone: record.phone,
      email: record.email,
      address: record.address,
      remark: record.remark
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📋 信息管理系统</h1>
          <p className="text-white/80">简单的信息录入与查询系统</p>
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="🔍 搜索姓名、电话或邮箱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                setEditingRecord(null);
                setFormData({ name: '', phone: '', email: '', address: '', remark: '' });
                setShowModal(true);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>➕</span> 添加信息
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p>加载中...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">暂无记录</p>
              <p className="text-sm">点击"添加信息"按钮开始录入</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">姓名</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">电话</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">邮箱</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">地址</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">备注</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{record.name}</td>
                      <td className="px-6 py-4 text-gray-600">{record.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{record.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{record.address || '-'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{record.remark || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {records.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
              共 {records.length} 条记录
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRecord ? '编辑信息' : '添加信息'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入电话"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  placeholder="请输入备注"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRecord(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingRecord ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
