# Personal Finance

A modern personal finance management application built with React, TypeScript, and Tailwind CSS.

## Features

- Track income and expenses
- Set monthly budgets
- View financial analytics with charts
- Dark mode support
- Responsive design
- Real-time data with Supabase

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spend-sphere-main
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:

   a. Create a new project at [supabase.com](https://supabase.com)

   b. Go to Settings > API to get your project URL and anon key

   c. Create the following tables in your Supabase database:

   **transactions table:**
   ```sql
   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     amount DECIMAL(10,2) NOT NULL,
     type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
     category TEXT NOT NULL,
     description TEXT NOT NULL,
     date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **budgets table:**
   ```sql
   CREATE TABLE budgets (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     month TEXT NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     spent DECIMAL(10,2) DEFAULT 0
   );
   ```

   d. Update the `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://mwwkrtcvvyxidzxbnghk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13d2tydGN2dnl4aWR6eGJuZ2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzI3MzIsImV4cCI6MjA4OTA0ODczMn0.b9z87ICTWsUbm5Hzx-Y9jqp-4t44zcNItb2u69aSC9k
   ```

4. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Charts**: Recharts
- **Database**: Supabase
- **State Management**: React Context
- **Forms**: React Hook Form
- **Icons**: Lucide React
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

