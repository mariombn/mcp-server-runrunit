import { env } from "./env.js";

const API_BASE_URL = "https://runrun.it/api/v1.0";

// ─── API response interfaces ──────────────────────────────────────────────────

export interface RunrunitTask {
  id: number;
  title: string;
  description?: string;
  task_status_name?: string;
  board_stage_name?: string;
  state?: string;
  responsible_id?: string;
  responsible_name?: string;
  project_id?: number;
  project_name?: string;
  team_id?: number;
  team_name?: string;
  board_stage_id?: number;
  overdue?: string;
  created_at?: string;
  estimated_delivery_date?: string;
  time_worked: number;
  time_total: number;
  current_estimate_seconds?: number;
  priority?: number;
  is_closed?: boolean;
  is_urgent?: boolean;
  points?: number;
  [key: string]: unknown;
}

export interface RunrunitTaskDescription {
  body?: string;
  description?: string;
  user?: Record<string, unknown>;
  editor?: string;
  editing_since?: string;
  updated_at?: string;
  edited_at?: string;
  locked_at?: string;
}

export interface RunrunitUser {
  id: string;
  name: string;
  email?: string;
  position?: string;
  is_manager?: boolean;
  time_zone?: string;
  team_ids?: number[];
  on_vacation?: boolean;
  [key: string]: unknown;
}

export interface RunrunitProject {
  id: number;
  name: string;
  client_name?: string;
  [key: string]: unknown;
}

export interface RunrunitTimeEntry {
  id: number;
  task_id: number;
  user_id: string;
  amount: number;
  date: string;
  description?: string;
  created_at?: string;
  [key: string]: unknown;
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

export async function runrunitFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<unknown> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "App-Key": env.RUNRUNIT_APP_KEY,
    "User-Token": env.RUNRUNIT_USER_TOKEN,
    Accept: "application/json",
  };

  if (
    options.body !== undefined ||
    options.method === "POST" ||
    options.method === "PATCH" ||
    options.method === "PUT"
  ) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!response.ok) {
    const errorText = await response.text();
    const appKeyLen = env.RUNRUNIT_APP_KEY.length;
    const userTokenLen = env.RUNRUNIT_USER_TOKEN.length;
    throw new Error(
      `Runrun.it API error: ${response.status} ${response.statusText} (K:${appKeyLen}, T:${userTokenLen}) - ${errorText}`,
    );
  }

  return response.json();
}
