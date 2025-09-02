"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar } from 'recharts'

export function CostsPie({ data }: { data: Array<{ name: string; value: number }> }) {
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DailyBar({ data }: { data: Array<{ day: string; custo: number }> }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" hide />
          <YAxis />
          <Legend />
          <Tooltip />
          <Bar dataKey="custo" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


