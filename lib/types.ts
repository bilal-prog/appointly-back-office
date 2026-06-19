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
  accessToken: string;
  refreshToken: string;
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
  logoFileId?: string;
  coverFileId?: string;
  galleryFileIds?: string[];
  logoUrl?: string;
  coverUrl?: string;
  galleryUrls?: string[];
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
  logoFileId?: string;
  coverFileId?: string;
  galleryFileIds?: string[];
};

export type ServicesResponse = PaginatedResponse<Service>;

export type Service = {
  _id: string;
  businessId: string;
  categoryId?: string | Category;
  name: string;
  description: string;
  durationInMinutes: number;
  bufferTimeInMinutes: number;
  price: number;
  isActive: boolean;
  imageFileIds?: string[];
  imageUrls?: string[];
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
  type: "appointment" | "reminder" | "system" | "marketing";
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  recipientCount?: number;
};

export type NotificationsResponse = PaginatedResponse<Notification>;

export type MarketingPayload = {
  target: "all" | "specific";
  userIds?: string[];
  title: string;
  message: string;
  imageUrl?: string;
};

export type Plan = "free" | "pro" | "premium";

export type AdminStats = {
  totalBusinesses: number;
  totalUsers: number;
  totalAppointments: number;
  activeSubscriptions: number;
};

export type Review = {
  _id: string;
  serviceId: { _id: string; name: string } | string;
  businessId: { _id: string; name: string } | string;
  customerId: { _id: string; name: string } | string;
  appointmentId: string;
  rating: number;
  comment?: string;
  status: "published" | "flagged" | "removed";
  createdAt: string;
  updatedAt: string;
};

export type ReviewsResponse = PaginatedResponse<Review>;

export type AuditAction =
  | "login"
  | "register"
  | "password_reset"
  | "appointment_created"
  | "appointment_updated"
  | "appointment_cancelled"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_payment_failed"
  | "reminder_sent"
  | "business_updated";

export type AuditLog = {
  _id: string;
  userId?: Pick<User, "_id" | "id" | "name" | "email">;
  businessId?: Pick<Business, "_id" | "name">;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
};

export type AuditLogsResponse = PaginatedResponse<AuditLog>;
