export type UserRole = "business" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId?: string;
  isActive?: boolean;
};

export type LoginResponse = {
  user: User;
  token: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Appointment = {
  _id: string;
  businessId: string;
  serviceId: string;
  customerId: string;
  businessName?: string;
  customerName?: string;
  serviceName?: string;
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

export type BusinessPayload = {
  name: string;
  description: string;
  location: {
    country: string;
    city: string;
    address: string;
  };
  timezone: string;
};

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

export type Notification = {
  _id: string;
  userId: string;
  type: "appointment" | "subscription" | "system";
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
