import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, AlertTriangle, X } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { useTripStore, type Expense } from '@/store/useTripStore';

export default function Budget() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, expenses, addExpense, removeExpense, budgets, updateBudget } = useTripStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'food' as Expense['category'],
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });

  const trip = trips.find((t) => t.id === tripId) || trips[0];
  const tripExpenses = expenses.filter((e) => e.tripId === tripId);
  const budget = budgets.find((b) => b.tripId === tripId) || {
    tripId: tripId || '1',
    totalBudget: trip?.budget || 3000,
    transportation: 1000,
    accommodation: 1500,
    food: 1000,
    ticket: 500,
    shopping: 500,
    other: 500,
  };

  const totalSpent = tripExpenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = budget.totalBudget - totalSpent;
  const percentUsed = budget.totalBudget > 0 ? (totalSpent / budget.totalBudget) * 100 : 0;

  const categoryMap = {
    transportation: { label: '交通', color: 'bg-blue-500', textColor: 'text-blue-500' },
    accommodation: { label: '住宿', color: 'bg-purple-500', textColor: 'text-purple-500' },
    food: { label: '餐饮', color: 'bg-red-500', textColor: 'text-red-500' },
    ticket: { label: '门票', color: 'bg-green-500', textColor: 'text-green-500' },
    shopping: { label: '购物', color: 'bg-pink-500', textColor: 'text-pink-500' },
    other: { label: '其他', color: 'bg-gray-500', textColor: 'text-gray-500' },
  };

  const categoryBudgets = (['transportation', 'accommodation', 'food', 'ticket', 'shopping', 'other'] as const).map((key) => ({
    key,
    budget: budget[key],
    spent: tripExpenses.filter(e => e.category === key).reduce((a, e) => a + e.amount, 0),
  }));

  const handleAddExpense = () => {
    if (!newExpense.amount || !tripId) return;
    const expense: Expense = {
      id: `exp-${Date.now()}`,
      tripId,
      category: newExpense.category,
      amount: Number(newExpense.amount),
      date: newExpense.date,
      note: newExpense.note || categoryMap[newExpense.category].label,
    };
    addExpense(expense);
    setShowAddModal(false);
    setNewExpense({
      category: 'food',
      amount: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">预算管理</h1>
        </div>

        {/* Budget Overview */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">总预算</p>
              <p className="text-3xl font-bold gradient-text">¥{budget.totalBudget.toLocaleString()}</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${percentUsed * 2.51} 251`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-800">{Math.round(percentUsed)}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-500">剩余预算</p>
              <p className={`text-xl font-bold ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{remaining.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">已花费</p>
              <p className="text-xl font-bold text-gray-700">¥{totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {remaining < budget.totalBudget * 0.2 && remaining > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-start gap-2">
              <AlertTriangle size={18} className="text-amber-500 mt-0.5" />
              <p className="text-sm text-amber-700">预算即将用完，请注意控制花费</p>
            </div>
          )}
        </GlassCard>

        {/* Category Budgets */}
        <div className="mb-6">
          <h2 className="font-bold text-gray-800 mb-4">分类预算</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryBudgets.map((cat) => {
              const percent = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
              return (
                <GlassCard key={cat.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${categoryMap[cat.key].color}`} />
                      <span className="font-medium text-gray-700">
                        {categoryMap[cat.key].label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ¥{cat.spent} / ¥{cat.budget}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${categoryMap[cat.key].color}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Expense Records */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">消费记录</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="gradient-button text-sm px-4 py-2 flex items-center gap-1"
            >
              <Plus size={16} />
              记一笔
            </button>
          </div>

          <div className="space-y-3">
            {tripExpenses.length > 0 ? (
              tripExpenses.map((expense) => (
                <GlassCard key={expense.id} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${categoryMap[expense.category].color}/10`}>
                    <span className={`text-sm font-bold ${categoryMap[expense.category].textColor}`}>
                      {categoryMap[expense.category].label[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{expense.note}</p>
                    <p className="text-xs text-gray-500">{expense.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">
                      -¥{expense.amount}
                    </span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </GlassCard>
              ))
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="text-gray-500 mb-2">暂无消费记录</p>
                <p className="text-sm text-gray-400">点击右上角"记一笔"开始记录</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-bounce-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">记一笔</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Category selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">消费类别</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(categoryMap) as Expense['category'][]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewExpense((prev) => ({ ...prev, category: cat }))}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        newExpense.category === cat
                          ? `${categoryMap[cat].color} text-white shadow-lg`
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {categoryMap[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">金额</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">¥</span>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 outline-none text-2xl font-bold text-gray-800 transition-all"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 outline-none transition-all"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
                <input
                  type="text"
                  value={newExpense.note}
                  onChange={(e) => setNewExpense((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="添加备注（可选）"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-mid focus:ring-2 focus:ring-primary-mid/20 outline-none transition-all"
                />
              </div>

              {/* Submit button */}
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.amount}
                className="w-full py-3 rounded-xl bg-gradient-primary text-white font-medium disabled:opacity-50 transition-all shadow-lg shadow-primary-mid/30 hover:shadow-xl hover:shadow-primary-mid/40"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
