# Divine Suites

Interactive system architecture and product specification for **Divine Suites**, a luxury property management platform powered by AI.

## Project Description

Divine Suites is a comprehensive platform designed to manage luxury properties with intelligent automation. Built with modern web technologies and AI integration, it provides a responsive interface for property managers and operators to oversee their portfolios efficiently. The application leverages Google's Gemini AI API to deliver intelligent features and insights.

## Features

- 🏠 **Luxury Property Management** - Streamlined interface for managing multiple high-end properties
- 🤖 **AI-Powered Insights** - Integration with Google Gemini API for intelligent recommendations
- 📊 **Real-time Analytics** - Track metrics and performance with PostHog analytics
- 💾 **Data Persistence** - Supabase integration for reliable data storage and synchronization
- 🎨 **Modern UI/UX** - Built with React and Tailwind CSS for a beautiful, responsive design
- ⚡ **Fast Development** - Vite-powered development server with hot module reloading
- 🔄 **Flexible Deployment** - Optimized for Google AI Studio and Cloud Run deployment

## Tech Stack

**Frontend:**
- [React](https://react.dev/) 19.0.1 - UI library
- [Vite](https://vitejs.dev/) 6.2.3 - Build tool and dev server
- [TypeScript](https://www.typescriptlang.org/) 5.8 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) 4.1.14 - Utility-first CSS framework
- [Lucide React](https://lucide.dev/) - Icon library
- [Motion](https://motion.dev/) - Animation library

**Backend & Services:**
- [Express](https://expressjs.com/) 4.21.2 - Server framework
- [Google Gemini AI](https://ai.google.dev/) 2.4.0 - AI API integration
- [Supabase](https://supabase.com/) 2.110.0 - Database and auth

**Analytics & Monitoring:**
- [PostHog](https://posthog.com/) 1.396.6 - Product analytics

**Development Tools:**
- [Node.js](https://nodejs.org/) with npm
- [ESBuild](https://esbuild.github.io/) - Fast TypeScript/JavaScript compiler

## Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- A **Google Gemini API key**

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/httpdeanna-beep/divine-suites.git
   cd divine-suites
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration (see [Environment Variables](#environment-variables))

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ | `AIzaSyD...` |
| `APP_URL` | The URL where the app is hosted | ✅ | `https://divine-suites.example.com` |
| `VITE_SUPABASE_URL` | Supabase project URL | ❌ | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ❌ | `eyJhbGc...` |
| `VITE_POSTHOG_KEY` | PostHog analytics key | ❌ | `phc_xxx` |
| `VITE_POSTHOG_HOST` | PostHog host URL | ❌ | `https://us.i.posthog.com` |

**Notes:**
- `GEMINI_API_KEY` and `APP_URL` are required for core functionality
- When running on Google AI Studio, `GEMINI_API_KEY` and `APP_URL` are automatically injected at runtime
- Supabase variables are optional; the app will run in **Local Sandbox Mode** using `localStorage` if omitted
- PostHog will run in sandbox mode (console logging) if not configured

## Running Locally

### Development Mode

Start the development server with hot module reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Features:**
- Hot Module Reloading (HMR) for instant updates
- File watching enabled for automatic recompilation
- Access via `--host=0.0.0.0` for network accessibility

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

### Linting & Type Checking

Check for TypeScript errors:

```bash
npm run lint
```

### Clean Build Artifacts

Remove generated files:

```bash
npm run clean
```

## Deployment Instructions

### Google Cloud Run (Recommended)

Divine Suites is optimized for deployment on Google Cloud Run and integrates seamlessly with Google AI Studio.

1. **Build the Docker image:**
   ```bash
   npm run build
   ```

2. **Push to Google Cloud:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/divine-suites
   gcloud run deploy divine-suites \
     --image gcr.io/PROJECT_ID/divine-suites \
     --platform managed \
     --region us-central1 \
     --set-env-vars GEMINI_API_KEY=your_key,APP_URL=your_url
   ```

3. **Configure AI Studio:**
   - Deploy as an app in Google AI Studio
   - The platform will automatically inject `GEMINI_API_KEY` and `APP_URL` from your secrets

### Environment Variables in Production

Set these environment variables in your deployment platform:

- `GEMINI_API_KEY` - Your Google Gemini API key
- `APP_URL` - The public URL of your deployed app
- `VITE_SUPABASE_URL` - Production Supabase URL (if using)
- `VITE_SUPABASE_ANON_KEY` - Production Supabase key (if using)
- `VITE_POSTHOG_KEY` - Analytics key (if using)

### Database Setup (Supabase)

If using Supabase for data persistence:

1. Create a Supabase project
2. Set up your database schema
3. Add the connection credentials to your environment variables
4. Deploy database migrations if needed

### Health Checks

After deployment, verify the app is running:

```bash
curl https://your-deployed-app.com
```

## Project Structure

```
divine-suites/
├── src/                    # Source code (React components, pages)
├── dist/                   # Production build output
├── public/                 # Static assets
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run clean` | Remove build artifacts |
| `npm run lint` | Run TypeScript type checking |

## Support & Contributing

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/httpdeanna-beep/divine-suites).

## License

Check the repository for license information.

---

**Built with ❤️ for luxury property management**
