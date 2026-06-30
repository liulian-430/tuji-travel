import { useParams } from 'react-router-dom';
import { ChevronLeft, Plus, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { mockBudgets, mockExpenses } from '../data/mock';

export default function Budget() {
  const { tripId } = useParams();
  const budget = mockBudgets.find((b) => b.tripId === tripId) || mockBudgets[0];
  const expenses = mockExpenses.filter((e) => e.tripId === tripId);

  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const remaining = budget.totalBudget - totalSpent;
  const percentUsed = (totalSpent / budget.totalBudget) * 100;

  const categoryMap = {
    transportation: { label: '交通', color: 'bg-blue-500' },
    accommodation: { label: '住宿', color: 'bg-purple-500' },
    food: { label: '餐饮', color: 'bg-red-500' },
    ticket: { label: '门票', color: 'bg-green-500' },
    shopping: { label: '购物', color: 'bg-pink-500' },
    other: { label: '其他', color: 'bg-gray-500' },
  };

  const categoryBudgets = [
    { key: 'transportation', ...budget, spent: expenses.filter(e => e.category === 'transportation').reduce((a, e) => a + e.amount, 0) },
    { key: 'accommodation', ...budget, spent: expenses.filter(e => e.category === 'accommodation').reduce((a, e) => a + e.amount, 0) },
    { key: 'food', ...budget, spent: expenses.filter(e => e.category === 'food').reduce((a, e) => a + e.amount, 0) },
    { key: 'ticket', ...budget, spent: expenses.filter(e => e.category === 'ticket').reduce((a, e) => a + e.amount, 0) },
    { key: 'shopping', ...budget, spent: expenses.filter(e => e.category === 'shopping').reduce((a, e) => a + e.amount, 0) },
    { key: 'other', ...budget, spent: expenses.filter(e => e.category === 'other').reduce((a, e) => a + e.amount, 0) },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-20 md:pt-24 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => history.back()}
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
              const catBudget = budget[cat.key as keyof typeof budget] as number;
              const percent = (cat.spent / catBudget) * 100 || 0;
              return (
                <GlassCard key={cat.key} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${categoryMap[cat.key as keyof typeof categoryMap].color}`} />
                      <span className="font-medium text-gray-700">
                        {categoryMap[cat.key as keyof typeof categoryMap].label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ¥{cat.spent} / ¥{catBudget}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${categoryMap[cat.key as keyof typeof categoryMap].color}`}
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
            <button className="gradient-button text-sm px-4 py-2 flex items-center gap-1">
              <Plus size={16} />
              添加
            </button>
          </div>

          <div className="space-y-3">
            {expenses.map((expense) => (
              <GlassCard key={expense.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  categoryMap[expense.category].color.replace('bg-', 'bg-') + '/10'
                }`}>
                  <span className={`text-sm font-bold ${categoryMap[expense.category].color.replace('bg-', 'text-')}`}>
                    {categoryMap[expense.category].label[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{expense.note}</p>
                  <p className="text-xs text-gray-500">{expense.date}</p>
                </div>
                <span className="font-bold text-gray-800">
                  -¥{expense.amount}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
