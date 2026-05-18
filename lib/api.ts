import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type {
  AdminStats,
  BusinessDashboard,
  BusinessPayload,
  Customer,
  LoginResponse,
  Service
} from "@/lib/types";

const TOKEN_COOKIE = "appointly_token";
const USER_COOKIE = "appointly_user";

export const cookieNames = { token: TOKEN_COOKIE, user: USER_COOKIE };

export async function getServerUser() {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export async function setAuthCookies(response: LoginResponse) {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, response.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });
  jar.set(USER_COOKIE, encodeURIComponent(JSON.stringify(response.user)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(TOKEN_COOKIE);
  jar.delete(USER_COOKIE);
}

function backendUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return `${base.replace(/\/$/, "")}${path}`;
}

async function authHeaders() {
  const jar = await cookies();
  const token = jar.get(TOKEN_COOKIE)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function backendGet<T>(path: string): Promise<T> {
  try {
    const response = await axios.get<T>(backendUrl(path), { headers: await authHeaders() });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401) await clearAuthCookies();
    throw error;
  }
}

async function backendPost<T>(path: string, body: unknown, withAuth = true): Promise<T> {
  try {
    const response = await axios.post<T>(backendUrl(path), body, {
      headers: withAuth ? await authHeaders() : undefined
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401) await clearAuthCookies();
    throw error;
  }
}

export async function login(body: { email: string; password: string }) {
  return backendPost<LoginResponse>("/api/auth/login", body, false);
}

export async function getBusinessDashboard() {
  return backendGet<BusinessDashboard>("/api/businesses/dashboard");
}

export async function getBusinessCalendar(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  return backendGet(`/api/businesses/calendar?${params.toString()}`);
}

export async function createBusiness(body: BusinessPayload) {
  return backendPost("/api/businesses", body);
}

export async function createCheckoutSession(plan: "pro" | "premium") {
  return backendPost<{ status: "success"; url: string }>("/api/subscriptions/checkout", { plan });
}

export async function getServices(): Promise<Service[]> {
  return [
    {
      _id: "svc-1",
      businessId: "business-1",
      name: "General Consultation",
      description: "30 minute consultation",
      durationInMinutes: 30,
      bufferTimeInMinutes: 10,
      price: 250,
      isActive: true
    }
  ];
}

export async function getCustomers(): Promise<Customer[]> {
  return [
    {
      _id: "cus-1",
      name: "Jane Doe",
      email: "jane@example.com",
      totalAppointments: 4,
      lastAppointmentDate: "2026-05-13T10:00:00.000Z",
      status: "active"
    }
  ];
}

export async function getAdminStats(): Promise<AdminStats> {
  return {
    totalBusinesses: 128,
    totalUsers: 492,
    totalAppointments: 2138,
    activeSubscriptions: 74
  };
}
