"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import type { Product, ProductCategory, ProductCreate } from "@/lib/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const CATEGORY_COLORS: Record<ProductCategory, "blue" | "green" | "purple" | "yellow"> = {
  hardware: "blue",
  software: "green",
  service: "purple",
  bundle: "yellow",
};

const STATUS_COLORS = {
  draft: "gray",
  active: "green",
  archived: "gray",
  under_review: "yellow",
} as const;

const EMPTY_FORM: ProductCreate = {
  sku: "",
  name: "",
  description: "",
  category: "software",
  price: undefined,
};

export default function ProductsPage() {
  const { data: products, isLoading } = useSWR<Product[]>("/products", () =>
    api.products.list()
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductCreate>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.products.create(form);
      mutate("/products");
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;
    await api.products.delete(id);
    mutate("/products");
  }

  return (
    <div>
      <Header
        title="Products"
        subtitle={`총 ${products?.length ?? 0}개 제품`}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            제품 등록
          </button>
        }
      />

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6 border-brand-200">
          <h2 className="font-semibold text-gray-800 mb-4">새 제품 등록</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">SKU *</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="BB-001"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">제품명 *</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bluebird X1"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">설명</label>
              <textarea
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="제품 설명을 입력하세요"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">카테고리 *</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="service">Service</option>
                <option value="bundle">Bundle</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">가격 (USD)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={form.price ?? ""}
                onChange={(e) => setForm({ ...form, price: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="299.99"
              />
            </div>
            {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm rounded-lg disabled:opacity-50"
              >
                {submitting ? "등록 중..." : "등록"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Product List */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">로딩 중...</p>
      ) : products?.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-8 text-sm">등록된 제품이 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {products?.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                </div>
                <Badge
                  label={p.category}
                  variant={CATEGORY_COLORS[p.category]}
                />
                <Badge
                  label={p.status}
                  variant={STATUS_COLORS[p.status]}
                />
                {p.price != null && (
                  <span className="text-sm font-medium text-gray-700">
                    ${p.price.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/analyze?product_id=${p.id}&product_name=${encodeURIComponent(p.name)}`}
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> AI 분석
                </a>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
