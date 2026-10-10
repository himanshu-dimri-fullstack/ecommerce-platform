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

const App = () => {
  return (
    <>
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
        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App