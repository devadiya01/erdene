import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Package, Plus, Loader, FileText } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  quantity: number;
  unit: string;
  category: string;
  specifications: string;
}

interface Match {
  id: string;
  product: Product;
  request: {
    title: string;
    budget: number;
    buyer: { email: string };
  };
  status: string;
  fee: number;
}

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsData, matchesData] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("matches").select(`
            id,
            status,
            fee,
            product:products(*),
            request:requests(title, budget, buyer:users(email))
          `)
      ]);

      if (productsData.error) throw productsData.error;
      if (matchesData.error) throw matchesData.error;

      setProducts(productsData.data || []);
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
      const { error } = await supabase.from("products").insert([
        {
          title,
          description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          unit,
          category,
          specifications
        }
      ]);

      if (error) throw error;

      setTitle("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setUnit("");
      setCategory("");
      setSpecifications("");
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
          <Package className="w-6 h-6 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold">Бүтээгдэхүүн нэмэх</h1>
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
                Үнэ
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border px-4 py-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
            Бүтээгдэхүүн нэмэх
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Таны бүтээгдэхүүнүүд</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Үнэ:</span> $
                  {product.price.toFixed(2)}
                </p>
                <p>
                  <span className="font-medium">Тоо хэмжээ:</span>{" "}
                  {product.quantity} {product.unit}
                </p>
                <p>
                  <span className="font-medium">Ангилал:</span>{" "}
                  {product.category}
                </p>
                <p className="text-gray-600">{product.description}</p>
                {product.specifications && (
                  <div className="mt-2">
                    <p className="font-medium">Техникийн үзүүлэлт:</p>
                    <p className="text-gray-600">{product.specifications}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  {product.status}
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
        {products.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            Одоогоор бүтээгдэхүүн байхгүй байна!
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Админы тохируулсан харилцагчид
        </h2>
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Таны бүтээгдэхүүн</h3>
                  <p>{match.product.title}</p>
                  <p className="text-sm text-gray-500">
                    Үнэ: ${match.product.price}
                  </p>
                  <p className="text-sm text-gray-500">
                    Тоо хэмжээ: {match.product.quantity} {match.product.unit}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Худалдан авагчийн хүсэлт</h3>
                  <p>{match.request.title}</p>
                  <p className="text-sm text-gray-500">
                    Төсөв: ${match.request.budget}
                  </p>
                  <p className="text-sm text-gray-500">
                    Худалдан авагч: {match.request.buyer.email}
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
            Одоогоор тохируулсан харилцагч байхгүй байна!
          </p>
        )}
      </div>
    </div>
  );
}
