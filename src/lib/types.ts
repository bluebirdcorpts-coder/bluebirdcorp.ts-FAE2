// === Product ===

export type ProductStatus = "draft" | "active" | "archived" | "under_review";
export type ProductCategory = "hardware" | "software" | "service" | "bundle";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  status: ProductStatus;
  price: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  price?: number;
  metadata?: Record<string, unknown>;
}

// === Task ===

export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type TaskType =
  | "product_analysis"
  | "content_generation"
  | "pricing_optimization"
  | "competitive_research"
  | "trend_analysis";

export interface Task {
  id: number;
  task_type: TaskType;
  status: TaskStatus;
  payload: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  agent_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// === Orchestration ===

export interface OrchestrateRequest {
  task_type: TaskType;
  payload: Record<string, unknown>;
  async_mode?: boolean;
}

export interface OrchestrateResponse {
  task_id: number;
  status: TaskStatus;
  result: Record<string, unknown> | null;
  message: string;
}

// === Analysis Result shapes ===

export interface ProductAnalysisResult {
  summary: string;
  strengths?: string[];
  weaknesses?: string[];
  opportunities?: string[];
  recommendations: string[];
  confidence_score: number;
  analysis_type: string;
  raw_output?: string;
  parse_error?: boolean;
}

export interface ContentGenerationResult {
  title: string;
  short_description: string;
  long_description: string;
  tags: string[];
  seo_keywords: string[];
}
