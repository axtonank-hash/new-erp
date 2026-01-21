import { useState, useEffect } from 'react';
import { TrendingUp, Users, FileCheck, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function StatsCard({ icon: Icon, title, value, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <Icon size={32} className="opacity-60" />
      </div>
    </div>
  );
}

export function DashboardStats({
  totalStudents = 0,
  totalTeachers = 0,
  pendingAdmissions = 0,
  pendingFees = 0,
  paidFees = 0,
  attendanceRate = 0,
  trends = {},
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <StatsCard
        icon={Users}
        title="Total Students"
        value={totalStudents}
        trend={trends.students}
        color="blue"
      />
      <StatsCard
        icon={Users}
        title="Total Teachers"
        value={totalTeachers}
        trend={trends.teachers}
        color="purple"
      />
      <StatsCard
        icon={FileCheck}
        title="Pending Admissions"
        value={pendingAdmissions}
        color="yellow"
      />
      <StatsCard
        icon={DollarSign}
        title="Pending Fees"
        value={`₹${pendingFees}`}
        color="red"
      />
      <StatsCard
        icon={CheckCircle}
        title="Fees Collected"
        value={`₹${paidFees}`}
        color="green"
      />
      <StatsCard
        icon={TrendingUp}
        title="Attendance Rate"
        value={`${attendanceRate}%`}
        color="blue"
      />
    </div>
  );
}

// Quick Actions Panel
export function QuickActions({ actions = [] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
          >
            {action.icon && <div className="mb-2 flex justify-center">{action.icon}</div>}
            <p className="font-semibold text-sm">{action.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Simple Bar Chart
export function SimpleBarChart({ title, data, height = 250 }) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));
  const scale = 100 / maxValue;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div style={{ minHeight: height }}>
        {data.map((item, idx) => (
          <div key={idx} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm font-semibold">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${item.color || 'bg-blue-600'}`}
                style={{ width: `${item.value * scale}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Activity
export function RecentActivity({ items = [] }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
              <div className="mt-1">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                <p className="text-xs text-gray-400 mt-1">{item.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}

// Stats Summary Table
export function StatsSummaryTable({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-800">{item.label}</td>
              <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.count}</td>
              <td className="px-6 py-4 text-sm font-semibold text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span>{item.percentage}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
