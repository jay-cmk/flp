# Flipkart - MERN
Full-Stack Flipkart with Admin Dashboard and guest checkout using UPI payment intents.

[Visit Now](https://flipkartweb-mern.vercel.app) 🚀

## 🖥️ Tech Stack
**Frontend:**

![reactjs](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)&nbsp;
![react-router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)&nbsp;
![redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)&nbsp;
![tailwindcss](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)&nbsp;
![mui](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)&nbsp;
![chart-js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)&nbsp;

**Backend:**

![nodejs](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)&nbsp;
![expressjs](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)&nbsp;
![mongodb](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)&nbsp;
![jwt](	https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)&nbsp;

**Payment:**

UPI payment intents for PhonePe and Google Pay, plus an admin-managed payment QR image shown to customers who choose Scan QR. Payment QR images are stored in MongoDB; Cloudinary is not required for QR uploads.
Direct UPI intents and manually scanned QR payments do not confirm payment. Orders remain pending until a payment gateway with server-side verification is configured.

## Local setup and separate deployment

The frontend and backend are independent applications. Install dependencies from their own directories; no root package manifest is required.

### Run locally

1. Copy `backend/.env.example` to `backend/.env` and provide the required MongoDB, JWT, and payment settings. Configure Cloudinary credentials if you use product image or avatar uploads.
2. In one terminal, run `cd backend`, `npm install`, then `npm start`.
3. In another terminal, run `cd frontend`, `npm install`, then `npm start`.
4. The frontend runs at `http://localhost:5173`. Set `REACT_APP_API_URL=http://localhost:4000` to use a locally running backend, or use the configured Render API URL to develop against the deployed backend. The backend development CORS configuration allows the exact `http://localhost:5173` origin.

An existing ignored `backend/config/config.env` is still accepted as a local configuration fallback; new setups should use `backend/.env`.

Backend variables: `PORT`, `MONGO_URI`, `FRONTEND_URL`, `JWT_SECRET`, `JWT_EXPIRE`, `COOKIE_EXPIRE`, `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `PAYMENT_UPI_ID`, `PAYMENT_RECEIVER_NAME`, and `NODE_ENV`. `PORT` is supplied by Render in deployment. `FRONTEND_URL` must contain exact browser origins (scheme, hostname, and optional port) and accepts multiple comma-separated origins. Do not put the API/backend URL here. Production startup fails when no frontend origin is configured. The local frontend origin is `http://localhost:5173`; when using the deployed API during development, include it in Render's `FRONTEND_URL` as well. For production, set `REACT_APP_API_URL` in the frontend deployment to the actual backend API origin and set backend `FRONTEND_URL` to the actual frontend's browser origin from that deployment. The two values must not be substituted for each other. `REACT_APP_API_URL` is public and must never contain a secret.

### First admin account

To create the first admin without touching customer, product, or order data, set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the backend environment and run `npm run setup-admin` from `backend`. The password must contain at least 8 characters and is hashed by the existing user model. Setup stops if any admin already exists or the email is already in use. Remove `ADMIN_PASSWORD` from the environment after setup. Never use the destructive development seed to create an admin on a database with data you need to keep.

To reset one existing admin password, run `npm run reset-admin -- <admin-email> --confirm` from `backend`. The command targets only that email with the admin role, generates a cryptographically random temporary password, writes it through the existing model hashing hook, and verifies it with `comparePassword` before printing it once to the local terminal. Store the credential securely and change it after sign-in. The command does not print database connection details or alter other account data.

### Render backend

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Set the backend environment variables in Render, including `NODE_ENV=production`, `MONGO_URI`, a strong `JWT_SECRET`, and `FRONTEND_URL` set to the exact deployed frontend origin. For Netlify, include its actual site origin (for example, `https://your-actual-site.netlify.app`) and preserve any existing production frontend origins as comma-separated values. Do not include paths or the backend URL. Add Cloudinary credentials if you use product image or avatar uploads. The backend listens on Render's `PORT` and `0.0.0.0`.

### Netlify frontend

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`

Set `REACT_APP_API_URL` in the Netlify site environment variables to `https://flp-59cw.onrender.com` (without a trailing slash). Create React App embeds `REACT_APP_*` variables at build time, so trigger a new deploy after changing this value. The `public/_redirects` rule serves the React app for direct routes and page refreshes. Admin authentication uses credentialed cookies; `FRONTEND_URL` on Render must include the exact Netlify origin.

### Vercel frontend

- Root Directory: `frontend`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

Set `REACT_APP_API_URL` in Vercel to the deployed Render backend origin, without a trailing slash (for example, `https://your-api.onrender.com`). The Vercel rewrite configuration supports refreshing React Router paths. Admin authentication uses credentialed, secure cross-site cookies; the Render CORS origin must match the Vercel origin exactly.

### Database seed warning

Run `npm run seed` from the `backend` directory only for manual development/demo setup. It requires locally configured `SEED_ADMIN_PASSWORD` and `SEED_USER_PASSWORD`, deletes existing user, product, and order records before inserting sample data, and never runs automatically. Never run it against a production database.

## Test on a Local Mobile Device

The backend and frontend development servers bind to all network interfaces. Start both on the same computer, connect the phone to the same trusted Wi-Fi network, find the computer's IPv4 address with `ipconfig`, then open `http://<computer-ipv4>:3000` on the phone. Allow the development server through Windows Firewall on the private network if prompted. Frontend API requests use relative URLs and the development server proxies them to the backend, so do not set the phone's API host to `localhost`.

**Cloud Storage:** [Cloudinary](https://cloudinary.com/)

## 🚀 Features

**Guest Shopping Experience**
- No customer login or signup required for browsing, cart, checkout, and order placement.
- Delivery details are captured directly during checkout without creating a customer account.

**Admin Authentication**
- Admin login remains protected by JWT cookies and role-based authorization.

**Shopping Cart**
- Add/Remove Items: 🛒 Users can add items to their shopping cart or remove them as needed.
- Update Quantities: 🔢 Quantities of items in the cart can be adjusted.

**Saved Items**
- Save For Later: 💾 Users can move items from the cart to a "Saved For Later" list or remove them from it.

**Wishlist**
- Add/Remove Items: ❤️ Users can add items to their wishlist or remove them from it.

**Product Browsing**
- Pagination: 📚 Products are paginated, with 12 products displayed per page by default.
- Search: 🔍 Users can search for products.
- Filters: 🎛️ Products can be filtered based on categories, ratings, and price range.

**Checkout Process**
- Shipping Info: 🚚 Shipping information is captured during guest checkout.
- Payment: 💳 PhonePe and Google Pay launch a standard UPI payment intent; Scan QR displays the active image configured by an admin; Cash on Delivery is unavailable.
- Payment verification: Direct UPI intents remain pending; no payment gateway or verification callback is configured.

**Order Management**
- My Orders: 📦 Authenticated users can view their order history.
- Order Details: ℹ️ Details of all ordered items are accessible.
- Order Confirmation: ✉️ Orders are created with payment status tracking rather than frontend-only payment confirmation.

**Product Interaction**
- Review Products: 🌟 Users can review products.

**Admin Features**
- Dashboard: 🖥️ Admins have access to a dedicated dashboard.
- Order Management: 📊 Admins can update order statuses and delete orders.
- Product Management: 📝 Admins can add/update products.
- User Management: 👥 Admins can update user data and delete users.
- Review Management: 📜 Admins can view and delete product reviews.
- Payment Settings: 🧾 Admins can upload, preview, replace, and remove the active customer payment QR.
- Stock Management: 📉 Product stock is automatically decreased upon shipment.

## Sneak Peek of Admin Dashboard 🙈 :
![Capture](https://user-images.githubusercontent.com/64949957/153995268-0cb769b9-e0ee-48ea-83c1-09b881df4101.PNG)

<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/64949957/153995383-367cbcc0-cce5-4523-a999-b8d92e44d6ab.jpg" alt="mockup" /></td>
    <td><img src="https://user-images.githubusercontent.com/64949957/153995406-45e36cbc-8d42-4416-b23a-08ad592e4ebc.jpg" alt="mockups" /></td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/64949957/153996560-bd631f30-46f0-4248-83b3-d8ce44a8f9e4.PNG" alt="mockup" /></td>
    <td><img src="https://user-images.githubusercontent.com/64949957/153996577-57b1a82d-064a-49dc-9055-e2bceb854ab2.PNG" alt="mockups" /></td>
  </tr>
</table>

<h2>📬 Contact</h2>

Feel free to reach me through the below handles if you'd like to contact me.

[![linkedin](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jigar-sablee)
[![instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/jigarsable.dev)
