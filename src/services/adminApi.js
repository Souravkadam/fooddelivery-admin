import axios from "axios";
import { API_BASE_URL } from "../util/constants";

// ── Auth header helper ────────────────────────────────────────────────────────
const authHeader = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const fetchDashboardStats = () =>
  axios.get(`${API_BASE_URL}/admin/stats`, { headers: authHeader() });

// ── Foods ─────────────────────────────────────────────────────────────────────
export const fetchAllFoods = () =>
  axios.get(`${API_BASE_URL}/foods`);

export const addFood = (formData) =>
  axios.post(`${API_BASE_URL}/foods`, formData, { headers: authHeader() });

export const updateFood = (id, formData) =>
  axios.put(`${API_BASE_URL}/foods/${id}`, formData, { headers: authHeader() });

export const deleteFood = (id) =>
  axios.delete(`${API_BASE_URL}/foods/${id}`, { headers: authHeader() });

export const toggleFoodAvailability = (id) =>
  axios.patch(`${API_BASE_URL}/foods/${id}/toggle`, {}, { headers: authHeader() });

// ── Orders ────────────────────────────────────────────────────────────────────
export const fetchAllOrders = () =>
  axios.get(`${API_BASE_URL}/orders/all`, { headers: authHeader() });

export const updateOrderStatus = (orderId, status) =>
  axios.patch(
    `${API_BASE_URL}/orders/status/${orderId}?status=${encodeURIComponent(status)}`,
    {},
    { headers: authHeader() }
  );

// ── Users ─────────────────────────────────────────────────────────────────────
export const fetchAllUsers = () =>
  axios.get(`${API_BASE_URL}/users`, { headers: authHeader() });

export const searchUsers = (query) =>
  axios.get(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: authHeader(),
  });

export const getUserById = (id) =>
  axios.get(`${API_BASE_URL}/users/${id}`, { headers: authHeader() });

export const updateUser = (id, data) =>
  axios.put(`${API_BASE_URL}/users/${id}`, data, { headers: authHeader() });

export const blockUser = (id) =>
  axios.patch(`${API_BASE_URL}/users/${id}/block`, {}, { headers: authHeader() });

export const unblockUser = (id) =>
  axios.patch(`${API_BASE_URL}/users/${id}/unblock`, {}, { headers: authHeader() });

export const deleteUser = (id) =>
  axios.delete(`${API_BASE_URL}/users/${id}`, { headers: authHeader() });

export const resetUserPassword = (id, password) =>
  axios.patch(
    `${API_BASE_URL}/users/${id}/reset-password`,
    { password },
    { headers: authHeader() }
  );

// ── Admin Login ───────────────────────────────────────────────────────────────
export const adminLogin = (email, password) =>
  axios.post(`${API_BASE_URL}/login`, { email, password });
