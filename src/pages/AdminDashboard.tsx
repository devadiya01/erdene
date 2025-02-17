import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BarChart2, Users, DollarSign, Loader, Search } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  seller: { email: string };
  quantity: number;
  unit: string;
  category: string;
}

interface Request {
  id: string;
  title: string;
  budget: number;
  buyer: { email: string };
  quantity: number;
  unit: string;
  category: string;
  delivery_date: string;
}

interface Match {
  id: string;
  product: Product;
  request: Request;
  status: string;
  fee: number;
  created_at: string;
}

interface Stats {
  totalMatches: number;
  totalRevenue: number;
  averageFee: number;
  activeProducts: number;
  activeRequests: number;
  matchRate: number;
  categoryStats: { [key: string]: number };
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedRequest, setSelectedRequest] = useState("");
  const [fee, setFee] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalMatches: 0,
    totalRevenue: 0,
    averageFee: 0,
    activeProducts: 0,
    activeRequests: 0,
    matchRate: 0,
    categoryStats: {}
  });

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsData, requestsData, matchesData] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, title, price, quantity, unit, category, seller:users(email)"
          )
          .eq("status", "active"),
        supabase
          .from("requests")
          .select(
            "id, title, budget, quantity, unit, category, delivery_date, buyer:users(email)"
          )
          .eq("status", "active"),
        supabase
          .from("matches")
          .select(
            `
            id, 
            status, 
            fee,
            created_at,
            product:products(id, title, price, quantity, unit, category, seller:users(email)), 
            request:requests(id, title, budget, quantity, unit, category, delivery_date, buyer:users(email))
          `
          )
          .order("created_at", { ascending: false })
      ]);

      if (productsData.error) throw productsData.error;
      if (requestsData.error) throw requestsData.error;
      if (matchesData.error) throw matchesData.error;

      setProducts(productsData.data || []);
      setRequests(requestsData.data || []);
      setMatches(matchesData.data || []);

      // Calculate statistics
      const totalMatches = matchesData.data?.length || 0;
      const totalRevenue =
        matchesData.data?.reduce((sum, match) => sum + (match.fee || 0), 0) ||
        0;
      const averageFee = totalMatches > 0 ? totalRevenue / totalMatches : 0;
      const activeProducts = productsData.data?.length || 0;
      const activeRequests = requestsData.data?.length || 0;
      const matchRate =
        activeProducts > 0 ? (totalMatches / activeProducts) * 100 : 0;

      // Calculate category statistics
      const categoryStats = productsData.data?.reduce(
        (acc: { [key: string]: number }, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        },
        {}
      );

      setStats({
        totalMatches,
        totalRevenue,
        averageFee,
        activeProducts,
        activeRequests,
        matchRate,
        categoryStats: categoryStats || {}
      });
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateMatch(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { error } = await supabase.from("matches").insert([
        {
          product_id: selectedProduct,
          request_id: selectedRequest,
          fee: parseFloat(fee),
          status: "pending"
        }
      ]);

      if (error) throw error;

      setSelectedProduct("");
      setSelectedRequest("");
      setFee("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  const filteredMatches = matches.filter((match) => {
    const matchDate = new Date(match.created_at);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    return (
      (searchTerm === "" ||
        match.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.request.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "" ||
        match.product.category === categoryFilter ||
        match.request.category === categoryFilter) &&
      (statusFilter === "" || match.status === statusFilter) &&
      (!startDate || matchDate >= startDate) &&
      (!endDate || matchDate <= endDate)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Нийт тохиргоо</p>
              <h3 className="text-2xl font-bold">{stats.totalMatches}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Нийт орлого</p>
              <h3 className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </h3>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Дундаж шимтгэл</p>
              <h3 className="text-2xl font-bold">
                ${stats.averageFee.toFixed(2)}
              </h3>
            </div>
            <BarChart2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Тохиргооны хувь</p>
              <h3 className="text-2xl font-bold">
                {stats.matchRate.toFixed(1)}%
              </h3>
            </div>
            <BarChart2 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Шинэ тохиргоо үүсгэх</h2>
        <form onSubmit={handleCreateMatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Бүтээгдэхүүн сонгох
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border py-2 px-4 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="">Бүтээгдэхүүн сонгох...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} - ${product.price} ({product.quantity}{" "}
                    {product.unit}) - {product?.seller?.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Хүсэлт сонгох
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border py-2 px-4 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}>
                <option value="">Хүсэлт сонгох...</option>
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.title} - ${request.budget} ({request.quantity}{" "}
                    {request.unit}) - {request?.buyer?.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Шимтгэлийн хэмжээ
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block border py-2 px-4 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Тохиргоо үүсгэх
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Тохиргоонууд</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Хайх..."
                className="pl-10 pr-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border rounded-md px-4 py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">Бүх ангилал</option>
              {Object.keys(stats.categoryStats).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="border rounded-md px-4 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Бүх төлөв</option>
              <option value="pending">Хүлээгдэж буй</option>
              <option value="accepted">Зөвшөөрсөн</option>
              <option value="completed">Дууссан</option>
            </select>
            <div className="flex space-x-2">
              <input
                type="date"
                className="border rounded-md px-4 py-2"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
              <input
                type="date"
                className="border rounded-md px-4 py-2"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold">Бүтээгдэхүүн</h3>
                  <p>{match.product.title}</p>
                  <p className="text-sm text-gray-500">
                    Үнэ: ${match.product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Тоо хэмжээ: {match.product.quantity} {match.product.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Борлуулагч: {match.product.seller?.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Хүсэлт</h3>
                  <p>{match.request.title}</p>
                  <p className="text-sm text-gray-500">
                    Төсөв: ${match.request.budget}
                  </p>
                  <p className="text-sm text-gray-500">
                    Тоо хэмжээ: {match.request.quantity} {match.request.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    Худалдан авагч: {match.request.buyer?.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Тохиргооны мэдээлэл</h3>
                  <p className="text-sm text-gray-500">
                    Огноо: {new Date(match.created_at).toLocaleDateString()}
                  </p>
                  <p className="font-bold text-blue-600 text-lg mt-2">
                    Шимтгэл: ${match.fee}
                  </p>
                  <div className="mt-4">
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={match.status}
                      onChange={async (e) => {
                        const { error } = await supabase
                          .from("matches")
                          .update({ status: e.target.value })
                          .eq("id", match.id);
                        if (!error) fetchData();
                      }}>
                      <option value="pending">Хүлээгдэж буй</option>
                      <option value="accepted">Зөвшөөрсөн</option>
                      <option value="completed">Дууссан</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredMatches.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Одоогоор тохиргоо байхгүй байна!
          </p>
        )}
      </div>
    </div>
  );
}
