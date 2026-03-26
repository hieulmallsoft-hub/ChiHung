import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import HomePage from "../pages/user/HomePage";
import ProductListPage from "../pages/user/ProductListPage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import OrderHistoryPage from "../pages/user/OrderHistoryPage";
import OrderDetailPage from "../pages/user/OrderDetailPage";
import LoginPage from "../pages/user/LoginPage";
import RegisterPage from "../pages/user/RegisterPage";
import ProfilePage from "../pages/user/ProfilePage";
import ChatSupportPage from "../pages/user/ChatSupportPage";

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import CategoryManagementPage from "../pages/admin/CategoryManagementPage";
import BrandManagementPage from "../pages/admin/BrandManagementPage";
import ProductManagementPage from "../pages/admin/ProductManagementPage";
import InventoryManagementPage from "../pages/admin/InventoryManagementPage";
import OrderManagementPage from "../pages/admin/OrderManagementPage";
import RevenueReportPage from "../pages/admin/RevenueReportPage";
import ChatManagementPage from "../pages/admin/ChatManagementPage";

import NotFoundPage from "../pages/user/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/products"
        element={
          <MainLayout>
            <ProductListPage />
          </MainLayout>
        }
      />
      <Route
        path="/products/:id"
        element={
          <MainLayout>
            <ProductDetailPage />
          </MainLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <MainLayout>
            <CartPage />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout>
            <RegisterPage />
          </MainLayout>
        }
      />
      <Route
        path="/admin-login"
        element={
          <MainLayout>
            <AdminLoginPage />
          </MainLayout>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />
        <Route
          path="/orders"
          element={
            <MainLayout>
              <OrderHistoryPage />
            </MainLayout>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <MainLayout>
              <OrderDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <MainLayout>
              <ChatSupportPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<AdminRoute />}>
        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <UserManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminLayout>
              <CategoryManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <AdminLayout>
              <BrandManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <ProductManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminLayout>
              <InventoryManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <OrderManagementPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <RevenueReportPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/chats"
          element={
            <AdminLayout>
              <ChatManagementPage />
            </AdminLayout>
          }
        />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
