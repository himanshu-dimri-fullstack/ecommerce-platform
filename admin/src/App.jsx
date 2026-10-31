import { Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Login from "./components/auth/LoginPage"
import ForgetPassword from './components/auth/ForgetPassword'
import ResetPassword from './components/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import AdminLayout from "./AdminLayout"
import Users from "./pages/users/Users"
import Signup from "./components/auth/Signup"
import UserDetail from "./pages/users/UserDetail"
import Category from "./pages/category/Category"
import CategoryDetail from "./pages/category/CategoryDetail"
import Subcategory from "./pages/subcategory/Subcategory"
import Role from "./pages/role/Role"
import SubcategoryDetail from "./pages/subcategory/SubcategoryDetail"
import Brand from "./pages/brand/Brand"
import RoleDetail from "./pages/role/RoleDetails"
import BrandDetail from "./pages/brand/BrandDetail"
import ScrollToTop from "./components/ScrollToTop"
import Product from "./pages/product/Product"
import ProductDetail from "./pages/product/ProductDetail"
import ProductVariant from "./pages/productVariant/ProductVariant"
import ProductVariantDetail from "./pages/productVariant/ProductVariantDetail"
import Store from "./pages/store/Store"
import StoreDetail from "./pages/store/StoreDetail"
import Inventory from "./pages/inventory/Inventory"
import InventoryDetail from "./pages/inventory/InventoryDetail"
import Banner from "./pages/banner/Banner"
import BannerDetail from "./pages/banner/BannerDetail"

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/users/:id" element={<UserDetail />} />
          <Route path="/admin/categories" element={<Category />} />
          <Route path="/admin/categories/:id" element={<CategoryDetail />} />
          <Route path="/admin/subcategories" element={<Subcategory />} />
          <Route path="/admin/subcategories/:id" element={<SubcategoryDetail />} />
          <Route path="/admin/roles" element={<Role />} />
          <Route path="/admin/brands" element={<Brand />} />
          <Route path="/admin/roles/:id" element={<RoleDetail />} />
          <Route path="/admin/brands/:id" element={<BrandDetail />} />
          <Route path="/admin/products" element={<Product />} />
          <Route path="/admin/products/:id" element={<ProductDetail />} />
          <Route path="/admin/product-variants" element={<ProductVariant />} />
          <Route path="/admin/product-variants/:id" element={<ProductVariantDetail />} />
          <Route path="/admin/stores" element={<Store />} />
          <Route path="/admin/stores/:id" element={<StoreDetail />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/inventory/:id" element={<InventoryDetail />} />
          <Route path="/admin/banner" element={<Banner />} />
          <Route path="/admin/banner/:id" element={<BannerDetail />} />
        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App