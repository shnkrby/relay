# Relay

**Relay** is a powerful Task Management System designed specifically for student organizations, clubs, and committees. It helps student leaders organize their events, manage board duties, track progress, and seamlessly coordinate tasks within a unified workspace.

## Features

- **Organization Portals:** Create or join dedicated workspaces for your student organizations using unique invite codes.
- **Committee Management:** Organize members into specialized committees with dedicated tasks and progress tracking.
- **Event Planning:** Plan events, assign duties to members, and track the overall completion status of your initiatives.
- **Role-based Access:** Differentiated access levels for Owners, Admins, and Members to ensure secure management.
- **Modern Authentication:** Secure login and sign-up flows with Supabase Auth (including Google OAuth integration).
- **Responsive UI:** A beautifully designed interface featuring a seamless Light and Dark mode, built with Tailwind CSS and shadcn/ui.

## Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **Database:** PostgreSQL (via Supabase)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- Node.js (v18 or newer)
- npm or pnpm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shnkrby/relay.git
   cd relay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Structure

- `/app`: Next.js App Router containing pages and layouts.
  - `(public)`: Public facing pages such as the landing page and authentication.
  - `(authenticated)`: Secure pages requiring login, including the portal and organization dashboards.
- `/components`: Reusable UI components.
- `/lib`: Utility functions and configuration (e.g., Supabase client setup).
- `/types`: Global TypeScript definitions.
- `/docs`: Project guidelines and blueprints.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute. Please follow the commit guidelines specified in `docs/.commit_guide.md`.
