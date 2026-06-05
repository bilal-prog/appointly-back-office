import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import type {
  AdminStats,
  Appointment,
  AppointmentsResponse,
  AppointmentStatus,
  BusinessesResponse,
  Business,
  BusinessDashboard,
  BusinessPayload,
  Category,
  Customer,
  CustomersResponse,
  LoginResponse,
  User,
  Service,
  ServicesResponse,
} from "@/lib/types";

const TOKEN_COOKIE = "appointly_token";
const USER_COOKIE = "appointly_user";

export const cookieNames = { token: TOKEN_COOKIE, user: USER_COOKIE };

export async function getServerUser() {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  const token = jar.get(TOKEN_COOKIE)?.value;
  let cookieUser: User | null = null;

  if (raw) {
    try {
      cookieUser = JSON.parse(decodeURIComponent(raw));
    } catch {
      cookieUser = null;
    }
  }

  if (token) {
    try {
      const response = await axios.get<User | { user: User }>(
        backendUrl("/api/users/me"),
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const user = "user" in response.data ? response.data.user : response.data;
      const data = "data" in user ? user.data : user;

      return data as User;
    } catch {
      return cookieUser;
    }
  }

  return cookieUser;
}

export async function setAuthCookies(response: LoginResponse) {
  const jar = await cookies();
  jar.set(TOKEN_COOKIE, response.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  jar.set(USER_COOKIE, encodeURIComponent(JSON.stringify(response.user)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function setUserCookie(user: User) {
  const jar = await cookies();
  jar.set(USER_COOKIE, encodeURIComponent(JSON.stringify(user)), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
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
    const response = await axios.get<T>(backendUrl(path), {
      headers: await authHeaders(),
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401)
      await clearAuthCookies();
    throw error;
  }
}

function withSearchParams(path: string, params?: URLSearchParams) {
  if (!params || !params.toString()) return path;
  return `${path}?${params.toString()}`;
}

async function backendPost<T>(
  path: string,
  body: unknown,
  withAuth = true,
): Promise<T> {
  try {
    const response = await axios.post<T>(backendUrl(path), body, {
      headers: withAuth ? await authHeaders() : undefined,
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401)
      await clearAuthCookies();
    throw error;
  }
}

async function backendPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const response = await axios.put<T>(backendUrl(path), body, {
      headers: await authHeaders(),
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401)
      await clearAuthCookies();
    throw error;
  }
}

async function backendPatch<T>(path: string, body: unknown): Promise<T> {
  try {
    const response = await axios.patch<T>(backendUrl(path), body, {
      headers: await authHeaders(),
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401)
      await clearAuthCookies();
    throw error;
  }
}

async function backendDelete<T>(path: string): Promise<T> {
  try {
    const response = await axios.delete<T>(backendUrl(path), {
      headers: await authHeaders(),
    });
    return response.data;
  } catch (error) {
    if ((error as AxiosError).response?.status === 401)
      await clearAuthCookies();
    throw error;
  }
}

export async function login(body: { email: string; password: string }) {
  return backendPost<LoginResponse>("/api/auth/login", body, false);
}

export async function getCurrentUser() {
  const response = await backendGet<User | { user: User }>("/api/users/me");

  const user = "user" in response ? response.user : response;

  const data = "data" in user ? user.data : user;

  await setUserCookie(data as User);
  return data as User;
}

export async function register(body: {
  name: string;
  email: string;
  password: string;
  role: "customer" | "business";
}) {
  return backendPost<LoginResponse>("/api/auth/register", body, false);
}

export async function getBusinessDashboard() {
  return backendGet<BusinessDashboard>("/api/businesses/dashboard");
}

export async function getBusinessCalendar(startDate: string, endDate: string) {
  const params = new URLSearchParams({ startDate, endDate });
  return backendGet(`/api/businesses/calendar?${params.toString()}`);
}

export async function getCategories(): Promise<Category[]> {
  const response = await backendGet<Category[] | { data: Category[] }>(
    "/api/categories",
  );
  return Array.isArray(response) ? response : response.data;
}

export async function createBusiness(body: BusinessPayload) {
  return backendPost("/api/businesses", body);
}

export async function updateBusiness(
  body: BusinessPayload,
  businessId: string,
) {
  return backendPut(`/api/businesses/${businessId}`, body);
}

export async function getBusinesses(
  params?: URLSearchParams,
): Promise<BusinessesResponse> {
  const path = withSearchParams("/api/businesses", params);
  const response = await backendGet<
    BusinessesResponse | Business[] | { businesses: Business[] }
  >(path);

  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        total: response.length,
        limit: response.length,
        offset: 0,
      },
    };
  }

  if ("businesses" in response) {
    return {
      data: response.businesses,
      meta: {
        total: response.businesses.length,
        limit: response.businesses.length,
        offset: 0,
      },
    };
  }

  return response;
}

export async function publishBusiness(businessId: string) {
  return backendPatch(`/api/businesses/${businessId}/publish`, {});
}

export async function suspendBusiness(businessId: string) {
  return backendPatch(`/api/businesses/${businessId}/suspend`, {});
}

export async function updateService(body: Service, serviceId: string) {
  return backendPut(`/api/services/${serviceId}`, body);
}

export async function deleteService(serviceId: string) {
  return backendDelete(`/api/services/${serviceId}`);
}

export async function getMyBusiness() {
  return backendGet("/api/businesses/my-business");
}

export async function createCheckoutSession(plan: "pro" | "premium") {
  return backendPost<{ status: "success"; url: string }>(
    "/api/subscriptions/checkout",
    { plan },
  );
}

export async function getServices(
  params?: URLSearchParams,
): Promise<ServicesResponse> {
  return backendGet(withSearchParams("/api/services", params));
}

export async function createService(body: Service) {
  return backendPost("/api/services", body);
}

export async function getCustomers(
  params?: URLSearchParams,
): Promise<CustomersResponse> {
  const appointments = await backendGet<AppointmentsResponse>(
    "/api/appointments?limit=1000&offset=0",
  );
  const customersById = new Map<string, Customer>();

  for (const appointment of appointments.data as Appointment[]) {
    const existing = customersById.get(appointment.customerId._id);
    const lastAppointmentDate =
      !existing ||
      new Date(appointment.startTime) > new Date(existing.lastAppointmentDate)
        ? appointment.startTime
        : existing.lastAppointmentDate;

    customersById.set(appointment.customerId._id, {
      _id: appointment.customerId._id,
      name: appointment.customerId.name,
      email: (appointment.customerId as { email?: string }).email ?? "",
      totalAppointments: (existing?.totalAppointments ?? 0) + 1,
      lastAppointmentDate,
      status: "active",
    });
  }

  const customers = [...customersById.values()].sort(
    (a, b) =>
      new Date(b.lastAppointmentDate).getTime() -
      new Date(a.lastAppointmentDate).getTime(),
  );
  const limit = Number(params?.get("limit") ?? 50);
  const offset = Number(params?.get("offset") ?? 0);

  return {
    data: customers.slice(offset, offset + limit),
    meta: {
      total: customers.length,
      limit,
      offset,
    },
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, appointments, businesses] = await Promise.all([
    backendGet<{ data: User[]; meta: { total: number } }>(
      "/api/users?limit=1000&offset=0",
    ),
    backendGet<AppointmentsResponse>(
      "/api/appointments?limit=1&offset=0",
    ).catch(() => null),
    getBusinesses(new URLSearchParams({ limit: "1000", offset: "0" })).catch(
      () => null,
    ),
  ]);

  return {
    totalBusinesses:
      businesses?.meta.total ??
      users.data.filter((user) => user.role === "business").length,
    totalUsers: users.meta.total,
    totalAppointments: appointments?.meta.total ?? 0,
    activeSubscriptions:
      businesses?.data.filter(
        (business) => business.subscription?.status === "active",
      ).length ?? 0,
  };
}

export async function getUsers(params?: URLSearchParams) {
  return backendGet(withSearchParams("/api/users", params));
}

export async function createUser(body: unknown) {
  return backendPost("/api/users", body);
}

export async function updateUser(userId: string, body: unknown) {
  return backendPatch(`/api/users/${userId}`, body);
}

export async function deleteUser(userId: string) {
  return backendDelete(`/api/users/${userId}`);
}

// Appointments
export async function getAppointments(
  params?: URLSearchParams,
): Promise<AppointmentsResponse> {
  return backendGet(withSearchParams("/api/appointments", params));
}

// Appointments
export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  return backendPut(`/api/appointments/${appointmentId}`, { status });
}

export async function deleteAppointment(appointmentId: string) {
  return backendDelete(`/api/appointments/${appointmentId}`);
}
