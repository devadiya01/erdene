import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ShoppingBag, Plus, Loader, FileText } from "lucide-react";

interface Request {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  quantity: number;
  unit: string;
  category: string;
  specifications: string;
  delivery_date: string;
}

interface Match {
  id: string;
  request: Request;
  product: {
    title: string;
    price: number;
    seller: { email: string };
  };
  status: string;
  fee: number;
}

export default function BuyerDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [requestsData, matchesData] = await Promise.all([
        supabase
          .from("requests")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("matches").select(`
            id,
            status,
            fee,
            request:requests(*),
            product:products(title, price, seller:users(email))
          `)
      ]);

      if (requestsData.error) throw requestsData.error;
      if (matchesData.error) throw matchesData.error;

      setRequests(requestsData.data || []);
      setMatches(matchesData.data || []);
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { error } = await supabase.from("requests").insert([
        {
          title,
          description,
          budget: parseFloat(budget),
          quantity: parseInt(quantity),
          unit,
          category,
          specifications,
          delivery_date: deliveryDate
        }
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setBudget("");
      setQuantity("");
      setUnit("");
      setCategory("");
      setSpecifications("");
      setDeliveryDate("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <ShoppingBag className="w-6 h-6 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold">Худалдан авалтын хүсэлт</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Нэр
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Төсөв
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Тоо хэмжээ
              </label>
              <input
                type="number"
                required
                min="1"
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Нэгж
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ангилал
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Хүргэлтийн огноо
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Тайлбар
            </label>
            <textarea
              required
              className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Техникийн үзүүлэлт
            </label>
            <textarea
              className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="w-5 h-5 mr-2" />
            Хүсэлт нэмэх
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Таны хүсэлтүүд</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{request.title}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Төсөв:</span> $
                  {request.budget.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Тоо хэмжээ:</span>{" "}
                  {request.quantity} {request.unit}
                </p>
                <p>
                  <span className="font-medium">Ангилал:</span>{" "}
                  {request.category}
                </p>
                <p>
                  <span className="font-medium">Хүргэлт:</span>{" "}
                  {new Date(request.delivery_date).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{request.description}</p>
                {request.specifications && (
                  <div className="mt-2">
                    <p className="font-medium">Техникийн үзүүлэлт:</p>
                    <p className="text-gray-600">{request.specifications}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {request.status}
                </span>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    /* Add edit functionality */
                  }}>
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {requests.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Одоогоор хүсэлт байхгүй байна!
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Админы тохируулсан нийлүүлэгчид
        </h2>
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Таны хүсэлт</h3>
                  <p>{match.request.title}</p>
                  <p className="text-sm text-gray-500">
                    Төсөв: ${match.request.budget}
                  </p>
                  <p className="text-sm text-gray-500">
                    Тоо хэмжээ: {match.request.quantity} {match.request.unit}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Нийлүүлэгчийн бүтээгдэхүүн</h3>
                  <p>{match.product.title}</p>
                  <p className="text-sm text-gray-500">
                    Үнэ: ${match.product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Нийлүүлэгч: {match.product.seller.email}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold text-blue-600">
                  Шимтгэл: ${match.fee}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {match.status}
                </span>
              </div>
            </div>
          ))}
        </div>
        {matches.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Одоогоор тохируулсан нийлүүлэгч байхгүй байна!
          </p>
        )}
      </div>
    </div>
  );
}
