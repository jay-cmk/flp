import WebFont from 'webfontloader';
import Footer from './components/Layouts/Footer/Footer';
import Header from './components/Layouts/Header/Header';
import Login from './components/User/Login';
import Register from './components/User/Register';
import AdminLogin from './components/User/AdminLogin';
import { Routes, Route, useLocation } from 'react-router-dom';
import { loadUser } from './actions/userAction';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import UpdateProfile from './components/User/UpdateProfile';
import UpdatePassword from './components/User/UpdatePassword';
import ForgotPassword from './components/User/ForgotPassword';
import ResetPassword from './components/User/ResetPassword';
import Account from './components/User/Account';
import ProtectedRoute from './Routes/ProtectedRoute';
import Home from './components/Home/Home';
import ProductDetails from './components/ProductDetails/ProductDetails';
import Products from './components/Products/Products';
import Cart from './components/Cart/Cart';
import Shipping from './components/Cart/Shipping';
import OrderConfirm from './components/Cart/OrderConfirm';
import Payment from './components/Cart/Payment';
import OrderStatus from './components/Cart/OrderStatus';
import MyOrders from './components/Order/MyOrders';
import OrderDetails from './components/Order/OrderDetails';
import Dashboard from './components/Admin/Dashboard';
import MainData from './components/Admin/MainData';
import OrderTable from './components/Admin/OrderTable';
import UpdateOrder from './components/Admin/UpdateOrder';
import ProductTable from './components/Admin/ProductTable';
import NewProduct from './components/Admin/NewProduct';
import UpdateProduct from './components/Admin/UpdateProduct';
import UserTable from './components/Admin/UserTable';
import UpdateUser from './components/Admin/UpdateUser';
import ReviewsTable from './components/Admin/ReviewsTable';
import Wishlist from './components/Wishlist/Wishlist';
import NotFound from './components/NotFound';
import Contact from './components/Pages/Contact';
import ReturnPolicy from './components/Pages/ReturnPolicy';
import PrivacyPolicy from './components/Pages/PrivacyPolicy';
import PaymentSettings from './components/Admin/PaymentSettings';

function App() {

  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Roboto:300,400,500,600,700']
      },
    });
  });

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:keyword" element={<Products />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/order/confirm" element={<OrderConfirm />} />
        <Route path="/process/payment" element={<Payment />} />

        <Route path="/order/:id" element={<OrderStatus />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/order_details/:id" element={<OrderDetails />} />

        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />

        <Route path="/account/update" element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        } />

        <Route path="/password/update" element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        } />

        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route path="/wishlist" element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={0}>
              <MainData />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={1}>
              <OrderTable />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/order/:id" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={1}>
              <UpdateOrder />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/products" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={2}>
              <ProductTable />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/new_product" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={3}>
              <NewProduct />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/product/:id" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={2}>
              <UpdateProduct />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={4}>
              <UserTable />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/user/:id" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={4}>
              <UpdateUser />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/reviews" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={5}>
              <ReviewsTable />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="/admin/payment-qr" element={
          <ProtectedRoute isAdmin={true}>
            <Dashboard activeTab={6}>
              <PaymentSettings />
            </Dashboard>
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </>
  );
}

export default App;
