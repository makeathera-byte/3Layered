# 3 Layered - E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js 15, React 19, TypeScript, and Supabase. Features include product catalog, shopping cart, order management, admin panel, and 3D product visualization.

## 🚀 Features

- **Product Catalog**: Browse products with images, descriptions, and pricing
- **Shopping Cart**: Add, update, and manage cart items
- **User Authentication**: Sign up, login, and profile management
- **Order Management**: Place orders, track status, and view order history
- **Admin Panel**: Complete admin dashboard for managing products, orders, and users
- **3D Visualization**: Interactive 3D product previews using Three.js
- **Custom Orders**: Support for customized product orders
- **Payment Integration**: Multiple payment methods support
- **Responsive Design**: Mobile-optimized with modern UI/UX

## 🛠️ Tech Stack

- **Framework**: Next.js 15.1.2
- **React**: 19.0.0
- **TypeScript**: 5.7.2
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/3-layered.git
   cd 3-layered
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Admin Authentication (generate a strong random string)
   ADMIN_SECRET_KEY=your_secure_admin_secret_key_here
   
   # Site Configuration (Optional)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL migrations in the `supabase/` directory (if available)
   - Or use the SQL scripts in the root directory:
     - `CREATE_ORDERS_TABLE.sql`
     - `CREATE_CUSTOMIZED_ORDERS_TABLE.sql`
     - `COMPLETE_SUPABASE_SETUP.sql`
   - Set up storage buckets for product images

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
3-layered/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin.3layered.06082008/  # Admin panel
│   ├── checkout/          # Checkout page
│   ├── products/          # Product pages
│   └── ...
├── components/            # React components
│   ├── GlassScene.tsx    # 3D product visualization
│   └── ...
├── lib/                   # Utility libraries
│   ├── backend/          # Backend utilities
│   ├── security/         # Security utilities
│   └── supabase/         # Supabase clients
├── public/                # Static assets
├── supabase/             # Supabase migrations (if available)
└── ...
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `ADMIN_SECRET_KEY` | Secret key for admin authentication | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for production) | Optional |

## 🗄️ Database Setup

The application requires several database tables. Key tables include:

- `products` - Product catalog
- `orders` - Customer orders
- `customized_orders` - Custom product orders
- `users` - User accounts
- `cart_items` - Shopping cart items
- `media` - Product images and media

Run the SQL migration scripts in your Supabase SQL Editor to set up the database schema.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Make sure to set all required environment variables in your hosting platform.

## 🔒 Security Features

- Input sanitization and validation
- CSRF protection
- Rate limiting
- Secure authentication
- SQL injection prevention
- XSS protection
- Security headers (HSTS, CSP, etc.)

## 📝 Admin Panel

Access the admin panel at `/admin.3layered.06082008`

Default admin credentials should be set up in your database. Make sure to:
1. Create an admin user in the `users` table with `role = 'admin'`
2. Use the admin login page to authenticate

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📚 Documentation

Additional documentation files are available in the root directory:
- `API_DOCUMENTATION.md` - API endpoints documentation
- `DEPLOYMENT_INSTRUCTIONS.md` - Deployment guide
- `SECURITY_SUMMARY.md` - Security features overview
- `BACKEND_OPTIMIZATION_SUMMARY.md` - Backend optimizations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
- Check the documentation files in the root directory
- Review the SQL migration scripts for database setup
- Check Supabase dashboard for database issues

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Three.js community for 3D graphics support

---

**Note**: Make sure to never commit `.env.local` or any files containing secrets to version control.

