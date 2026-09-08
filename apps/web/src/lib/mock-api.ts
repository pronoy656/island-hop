import type { ApiResponse } from "@repo/types";

import { cookie } from "@/lib/cookie-client";
import { sleep } from "@/lib/utils";

import type { AuthUser, LoginCredentials, SignupCredentials } from "@/types";

const MOCK_USERS_KEY = "islandhop_mock_users";

const DEFAULT_USERS: Array<AuthUser & { password: string }> = [
  {
    id: "usr_admin_01",
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    role: "ADMIN",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    verified: true
  },
  {
    id: "usr_operator_01",
    name: "Fast Ferry Operator",
    email: "operator@islandhop.com",
    password: "123456",
    role: "OPERATOR",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    verified: true
  },
  {
    id: "usr_passenger_01",
    name: "Traveler Jane",
    email: "jane@islandhop.com",
    password: "123456",
    role: "PASSENGER",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    verified: true
  }
];

function getStoredUsers(): Array<AuthUser & { password: string }> {
  if (typeof window === "undefined") return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const stored: Array<AuthUser & { password: string }> = JSON.parse(raw);
    // Merge: ensure all DEFAULT_USERS exist and are up to date, plus any newly registered users
    const defaultEmails = new Set(DEFAULT_USERS.map((u) => u.email.toLowerCase()));
    const customUsers = stored.filter((u) => !defaultEmails.has(u.email.toLowerCase()));
    const merged = [...DEFAULT_USERS, ...customUsers];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: Array<AuthUser & { password: string }>) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }
}

function getCurrentUserFromToken(): AuthUser | null {
  const users = getStoredUsers();
  if (typeof window === "undefined") {
    const defaultOp = users.find((u) => u.role === "OPERATOR") || users[0];
    if (!defaultOp) return null;
    const { password: _p, ...safe } = defaultOp;
    return safe;
  }
  const token = cookie.get("accessToken");
  const foundUser = token
    ? users.find((u) => token.includes(u.id)) || users.find((u) => u.role === "OPERATOR") || users[0]
    : users.find((u) => u.role === "OPERATOR") || users[0];

  if (!foundUser) return null;

  const { password: _password, ...safeUser } = foundUser;
  void _password;
  return safeUser;
}

export const mockApi = {
  login: async (
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ accessToken: string; refreshToken?: string; user?: AuthUser }>> => {
    await sleep(400);
    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.password === credentials.password
    );

    if (!found) {
      throw new Error(
        "Invalid email or password. Please try demo credentials: admin@example.com / 123456"
      );
    }

    const { password: _pwd, ...user } = found;
    void _pwd;
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      success: true,
      statusCode: 200,
      message: "Welcome back! Login successful (Mock Mode).",
      data: {
        accessToken: token,
        refreshToken: `mock-refresh-${user.id}`,
        user
      }
    };
  },

  signup: async (credentials: SignupCredentials): Promise<ApiResponse<AuthUser>> => {
    await sleep(450);
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const newUser: AuthUser & { password: string } = {
      id: `usr_${Date.now().toString(36)}`,
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      role: "PASSENGER",
      verified: true
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _newPwd, ...safeUser } = newUser;
    void _newPwd;

    return {
      success: true,
      statusCode: 201,
      message: "Account created successfully! You can now sign in.",
      data: safeUser
    };
  },

  getProfile: async (): Promise<ApiResponse<AuthUser>> => {
    await sleep(200);
    const user = getCurrentUserFromToken();
    if (!user) {
      throw new Error("Unauthorized or session expired.");
    }

    return {
      success: true,
      statusCode: 200,
      message: "Profile retrieved successfully",
      data: user
    };
  }
};
