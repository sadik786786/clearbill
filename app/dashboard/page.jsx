"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import {
  FiFileText, FiDollarSign, FiCheckCircle, FiClock,
  FiAlertCircle, FiTrendingUp, FiUsers, FiCalendar,
  FiFilter, FiRefreshCw, FiChevronRight, FiEye,
  FiGlobe, FiPieChart
} from "react-icons/fi";
import { useRouter } from "next/navigation";

const STATUS_CONFIG = {
  paid: { label: "Paid", color: "#22c55e", icon: "✓" },
  pending: { label: "Pending", color: "#f59e0b", icon: "⏳" },
  unpaid: { label: "Unpaid", color: "#ef4444", icon: "⚠" },
  draft: { label: "Draft", color: "#7dd3fc", icon: "✎" }
};

const CURRENCY_CONFIG = {
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
  JPY: { symbol: "¥", code: "JPY", name: "Japanese Yen" },
  AUD: { symbol: "A$", code: "AUD", name: "Australian Dollar" },
  CAD: { symbol: "C$", code: "CAD", name: "Canadian Dollar" }
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
    fetchExchangeRates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const mockRates = {
        USD: 1,
        INR: 83.5,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 149.5,
        AUD: 1.52,
        CAD: 1.36
      };
      setExchangeRates(mockRates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  const convertCurrency = (amount, fromCurrency) => {
    if (!exchangeRates[fromCurrency] || !exchangeRates[displayCurrency]) return amount;
    
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[displayCurrency];
  };

  const formatCurrency = (amount, originalCurrency) => {
    let convertedAmount = amount;
    
    if (originalCurrency && originalCurrency !== displayCurrency) {
      convertedAmount = convertCurrency(amount, originalCurrency);
    }
    
    return new Intl.NumberFormat(getLocaleFromCurrency(displayCurrency), {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  const getLocaleFromCurrency = (currency) => {
    const locales = {
      INR: 'en-IN',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      JPY: 'ja-JP',
      AUD: 'en-AU',
      CAD: 'en-CA'
    };
    return locales[currency] || 'en-IN';
  };

  const getTotalRevenue = () => {
    if (!data?.recentInvoices) return 0;
    return data.recentInvoices.reduce((total, invoice) => {
      const amount = convertCurrency(invoice.total, invoice.currency || 'INR');
      return total + amount;
    }, 0);
  };

  const getStatusCount = (status) => {
    return data?.statusCounts?.find(s => s.status === status)?.count || 0;
  };

  const calculateCompletionRate = () => {
    if (!data?.totalInvoices) return 0;
    const paidInvoices = getStatusCount("paid");
    return Math.round((paidInvoices / data.totalInvoices) * 100);
  };

  const getRecentInvoices = () => {
    return data?.recentInvoices || [];
  };

  const getRevenueByCurrency = () => {
    if (!data?.recentInvoices) return [];
    
    const revenueByCurrency = {};
    data.recentInvoices.forEach(invoice => {
      const currency = invoice.currency || 'INR';
      revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + invoice.total;
    });
    
    return Object.entries(revenueByCurrency).map(([currency, revenue]) => ({
      currency,
      revenue,
      symbol: CURRENCY_CONFIG[currency]?.symbol || currency,
      count: data.recentInvoices.filter(inv => inv.currency === currency).length
    }));
  };

  const getMonthlyRevenueChartData = () => {
    if (!data?.monthlyRevenue) return [];
    
    return data.monthlyRevenue.map(item => {
      const revenue = convertCurrency(Number(item.revenue), item.currency || 'INR');
      return {
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenue,
        formattedRevenue: formatCurrency(revenue, displayCurrency)
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 text-lg font-medium">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No dashboard data available</div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-300 text-white rounded-lg hover:bg-blue-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate statistics from actual data
  const paidCount = getStatusCount("paid");
  const pendingCount = getStatusCount("pending");
  const unpaidCount = getStatusCount("unpaid");
  const completionRate = calculateCompletionRate();
  const totalRevenue = getTotalRevenue();
  
  // Prepare currency distribution data
  const currencyData = getRevenueByCurrency();
  const currencyChartData = currencyData.map(item => ({
    name: item.currency,
    value: item.revenue,
    count: item.count,
    symbol: item.symbol,
    color: getColorForCurrency(item.currency)
  }));

  function getColorForCurrency(currency) {
    const colors = {
      INR: '#22c55e',
      USD: '#3b82f6',
      EUR: '#8b5cf6',
      GBP: '#ef4444',
      JPY: '#f59e0b',
      AUD: '#10b981',
      CAD: '#ec4899'
    };
    return colors[currency] || '#6b7280';
  }

  // Prepare line chart data
  const revenueChartData = getMonthlyRevenueChartData();
  
  // Stat cards with actual data
  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue, displayCurrency),
      icon: <FiDollarSign className="w-6 h-6" />,
      trend: 12.5,
      description: `${currencyData.length} currencies, ${data.totalInvoices} invoices`,
      color: "bg-gradient-to-br from-blue-400 to-blue-500"
    },
    {
      title: "Total Invoices",
      value: data.totalInvoices,
      icon: <FiFileText className="w-6 h-6" />,
      trend: 8.2,
      description: `${completionRate}% completion rate`,
      color: "bg-gradient-to-br from-blue-300 to-blue-400"
    },
    {
      title: "Paid Invoices",
      value: paidCount,
      icon: <FiCheckCircle className="w-6 h-6" />,
      description: `${Math.round((paidCount / data.totalInvoices) * 100)}% of total`,
      color: "bg-gradient-to-br from-emerald-400 to-emerald-500"
    },
    {
      title: "Pending",
      value: pendingCount,
      icon: <FiClock className="w-6 h-6" />,
      description: `${Math.round((pendingCount / data.totalInvoices) * 100)}% of total`,
      color: "bg-gradient-to-br from-amber-400 to-amber-500"
    },
    {
      title: "Overdue",
      value: data.overdueInvoices || 0,
      icon: <FiAlertCircle className="w-6 h-6" />,
      description: "Requires attention",
      color: "bg-gradient-to-br from-rose-400 to-rose-500"
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, displayCurrency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CurrencyTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Revenue: {data.symbol}{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Invoices: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Multi-currency invoice insights</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
              <FiGlobe className="w-4 h-4 text-gray-500" />
              <select 
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                className="bg-transparent focus:outline-none text-gray-700 text-sm"
              >
                {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
                  <option key={code} value={code}>
                    {config.code} ({config.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
            >
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">This Year</option>
            </select>
            
            <button
              onClick={fetchDashboardData}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              title="Refresh data"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <div className={`text-xs font-medium ${stat.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.trend > 0 ? '↑' : '↓'}
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-1">{stat.value}</h2>
              <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
              
              {stat.description && (
                <p className="text-xs text-gray-500">{stat.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-gray-800">Monthly Revenue</h3>
              <p className="text-xs text-gray-500">Converted to {displayCurrency}</p>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Total: {formatCurrency(totalRevenue, displayCurrency)}
            </div>
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={11}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
                    return value;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7dd3fc"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7dd3fc" }}
                  activeDot={{ r: 4, fill: "#0ea5e9" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency Distribution */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-gray-800">Revenue by Currency</h3>
              <p className="text-xs text-gray-500">Original currency amounts</p>
            </div>
            <FiPieChart className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currencyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={11}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={11}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
                    return value;
                  }}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar
                  dataKey="value"
                  radius={[3, 3, 0, 0]}
                >
                  {currencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currencyData.slice(0, 6).map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getColorForCurrency(item.currency) }}
                ></div>
                <div className="truncate">
                  <p className="font-medium text-gray-800 truncate">{item.currency}</p>
                  <p className="text-gray-600 truncate">
                    {item.symbol}{item.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-md font-semibold text-gray-800">Recent Invoices</h3>
              <p className="text-xs text-gray-500">Latest invoice activity</p>
            </div>
            <button 
              onClick={() => router.push('/invoices')}
              className="flex items-center gap-1 text-blue-300 hover:text-blue-400 text-sm font-medium transition-colors"
            >
              View All
              <FiChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          {getRecentInvoices().length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {getRecentInvoices().slice(0, 5).map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900 text-sm truncate">{invoice.invoice_number}</div>
                    <div className="font-bold text-gray-900 text-sm">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-gray-600 truncate">{invoice.client?.name || 'N/A'}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {CURRENCY_CONFIG[invoice.currency]?.symbol || invoice.currency}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={invoice.status} />
                      <button
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                        className="text-blue-300 hover:text-blue-400"
                        title="View invoice"
                      >
                        <FiEye className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent invoices found
            </div>
          )}
        </div>

        {/* Quick Actions & Summary */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiUsers className="w-4 h-4 text-blue-300" />
              <h4 className="font-semibold text-gray-800 text-md">Quick Actions</h4>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/invoices')}
                className="w-full py-2.5 bg-blue-50 text-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
              >
                Create New Invoice
              </button>
              <button
                onClick={() => router.push('/clients')}
                className="w-full py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Manage Clients
              </button>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl shadow p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Performance Summary</h4>
            </div>
            <p className="text-xs opacity-90 mb-1">
              Total Revenue: {formatCurrency(totalRevenue, displayCurrency)}
            </p>
            <p className="text-xs opacity-90">
              {completionRate}% completion rate across {currencyData.length} currencies
            </p>
          </div>

          {/* Currency Summary */}
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FiGlobe className="w-4 h-4 text-blue-300" />
              <h4 className="font-semibold text-gray-800 text-sm">Currency Summary</h4>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Active currencies: {currencyData.length}</p>
              <p>Primary: {displayCurrency}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {currencyData.slice(0, 4).map((item) => (
                  <span key={item.currency} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {item.currency}
                  </span>
                ))}
                {currencyData.length > 4 && (
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    +{currencyData.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  
  return (
    <span 
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: `${config.color}20`,
        color: config.color
      }}
    >
      <span className="text-xs">{config.icon}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

function Cell({ children, ...props }) {
  return <g {...props}>{children}</g>;
}