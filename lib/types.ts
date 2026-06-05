export type UserRole = "customer" | "business" | "admin";

export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  isActive?: boolean;
  isProtected?: boolean;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type AppointmentsResponse = PaginatedResponse<Appointment>;

export type Appointment = {
  _id: string;
  businessId: { _id: string; name: string };
  serviceId: { _id: string; name: string };
  customerId: { _id: string; name: string };
  serviceName?: string;
  customerName?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type BusinessDashboard = {
  todayAppointments: Appointment[];
  stats: {
    totalAppointments: number;
    pendingAppointments: number;
    confirmedAppointments: number;
    totalServices: number;
    totalCustomers: number;
  };
};

export type WorkingHours = {
  isOpen: boolean;
  start: string;
  end: string;
};

export type Category = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type Subscription = {
  plan: Plan;
  status?: "active" | "past_due" | "canceled" | "inactive";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type Business = {
  _id: string;
  name: string;
  description?: string;
  category?: string | Category;
  currency?: string;
  location?: {
    country?: string;
    city?: string;
    address?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  ownerId?: string | Pick<User, "_id" | "id" | "name" | "email">;
  timezone?: string;
  workingHours?: Record<string, WorkingHours>;
  subscription?: Subscription;
  status?: "draft" | "published" | "suspended";
  cancellationWindowHours?: number;
  appointmentsCount?: number;
  createdAt?: string;
};

export type BusinessesResponse = PaginatedResponse<Business>;

export type BusinessPayload = {
  name: string;
  description: string;
  category: string;
  currency: string;
  location: {
    country: string;
    city: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  timezone: string;
  cancellationWindowHours: number;
  workingHours?: Record<string, WorkingHours>;
};

export type ServicesResponse = PaginatedResponse<Service>;

export type Service = {
  _id: string;
  businessId: string;
  name: string;
  description: string;
  durationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  isActive: boolean;
};

export type Customer = {
  _id: string;
  name: string;
  email: string;
  totalAppointments: number;
  lastAppointmentDate: string;
  status: "active" | "inactive";
};

export type CustomersResponse = PaginatedResponse<Customer>;

export type Notification = {
  _id: string;
  userId: string;
  type: "appointment" | "reminder" | "system";
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type Plan = "free" | "pro" | "premium";

export type AdminStats = {
  totalBusinesses: number;
  totalUsers: number;
  totalAppointments: number;
  activeSubscriptions: number;
};
