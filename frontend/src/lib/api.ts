function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return "http://localhost:8000/api/v1";
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorMsg = `HTTP ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Health
  async healthCheck() {
    return this.request<any>("/health");
  }

  // Auth
  async register(data: any) {
    return this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(credentials: { phone_or_email: string; password: string }) {
    return this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<any>("/auth/me");
  }

  async updateProfile(data: any) {
    return this.request<any>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Chat & RAG
  async sendChatMessage(payload: {
    message: string;
    session_id?: string;
    language: string;
    enable_voice_response?: boolean;
  }) {
    return this.request<any>("/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getChatSessions() {
    return this.request<any[]>("/chat/sessions");
  }

  async getChatHistory(sessionUuid: string) {
    return this.request<any>(`/chat/sessions/${sessionUuid}`);
  }

  // Schemes & Eligibility
  async getSchemes(params?: { category?: string; beneficiary?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.beneficiary) searchParams.append("beneficiary", params.beneficiary);
    if (params?.search) searchParams.append("search", params.search);
    const qs = searchParams.toString();
    return this.request<any[]>(`/schemes${qs ? `?${qs}` : ""}`);
  }

  async getScheme(idOrCode: string) {
    return this.request<any>(`/schemes/${idOrCode}`);
  }

  async checkEligibility(payload: {
    scheme_code: string;
    applicant_type: string;
    land_holding_acres?: number;
    is_pacs_member: boolean;
  }) {
    return this.request<any>("/schemes/check-eligibility", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Legal & Bye-laws
  async getLegalActs() {
    return this.request<any[]>("/legal/acts");
  }

  async getLegalAct(idOrCode: string) {
    return this.request<any>(`/legal/acts/${idOrCode}`);
  }

  async searchLegal(q: string, language: string = "en") {
    return this.request<any[]>(`/legal/sections/search?q=${encodeURIComponent(q)}&language=${language}`);
  }

  // Grievance
  async submitGrievance(data: any) {
    return this.request<any>("/grievances", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserGrievances() {
    return this.request<any[]>("/grievances");
  }

  async trackGrievance(ticketNumber: string) {
    return this.request<any>(`/grievances/track/${encodeURIComponent(ticketNumber)}`);
  }

  async updateGrievanceStatus(id: number, data: { status: string; resolution_notes?: string; assigned_to?: string }) {
    return this.request<any>(`/grievances/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Voice
  async generateTTS(text: string, language: string = "en") {
    return this.request<any>("/voice/tts", {
      method: "POST",
      body: JSON.stringify({ text, language }),
    });
  }

  async transcribeAudio(file: File, language?: string) {
    const formData = new FormData();
    formData.append("file", file);
    if (language) formData.append("language", language);

    return this.request<any>("/voice/stt", {
      method: "POST",
      body: formData,
    });
  }

  getAudioUrl(pathOrUrl: string) {
    if (!pathOrUrl) return "";
    if (pathOrUrl.startsWith("http")) return pathOrUrl;
    // Strip redundant prefix if needed
    const clean = pathOrUrl.startsWith("/api/v1") ? pathOrUrl : `/api/v1${pathOrUrl}`;
    const base = getBaseUrl().replace("/api/v1", "");
    return `${base}${clean}`;
  }
}

export const api = new ApiClient();
