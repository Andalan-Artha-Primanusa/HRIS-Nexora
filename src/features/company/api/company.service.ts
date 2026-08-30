import { api } from "@/shared/api/httpClient";

export type Company = {
  id: number;
  code?: string | null;
  name: string;
  legal_name?: string | null;
  tax_number?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  status?: "active" | "draft" | "inactive" | string;
  timezone?: string | null;
  currency?: string | null;
};

export type CompanyContext = {
  mode: "all" | "company";
  can_view_all: boolean;
  selected_company_id: number | null;
  default_company_id: number | null;
  companies: Company[];
};

type Paginated<T> = {
  data?: T[];
  current_page?: number;
  total?: number;
};

const unwrap = <T>(response: { data: { data?: T } | T }) => {
  const payload = response.data as { data?: T };
  return payload.data ?? (response.data as T);
};

export const companyService = {
  async list() {
    const response = await api.get("/companies", { params: { per_page: 100 } });
    const payload = unwrap<Paginated<Company> | Company[]>(response);
    return Array.isArray(payload) ? payload : payload.data ?? [];
  },

  async context() {
    const response = await api.get("/company/context");
    return unwrap<CompanyContext>(response);
  },

  async create(data: Partial<Company>) {
    const response = await api.post("/companies", data);
    return unwrap<Company>(response);
  },

  async update(id: number, data: Partial<Company>) {
    const response = await api.put(`/companies/${id}`, data);
    return unwrap<Company>(response);
  },

  async deactivate(id: number) {
    const response = await api.post(`/companies/${id}/deactivate`);
    return unwrap<Company>(response);
  },
};
