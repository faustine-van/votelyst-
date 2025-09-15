# Votelyst - A Modern Polling Application

## Project Overview

Votelyst is a full-stack polling application built with Next.js and Supabase. It allows users to create, manage, and vote on polls, with real-time results and a comprehensive user dashboard. The application uses the Next.js App Router, with a server-centric approach to data fetching. The frontend is built with Tailwind CSS and Shadcn/UI for a modern and responsive user experience.

**Key Technologies:**

*   **Framework:** Next.js (App Router)
*   **Backend & Database:** Supabase
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn/UI
*   **Testing:** Jest & React Testing Library
*   **Language:** TypeScript

## Building and Running

### Prerequisites

*   Node.js (v18.0.0 or newer)
*   npm
*   A Supabase account

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/votelyst.git
    cd votelyst
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project on the [Supabase Dashboard](https://app.supabase.io).
    *   Run the SQL from `supabase/schema.sql` and `supabase/rls.sql` in the SQL Editor.
    *   Create a `.env.local` file and add your Supabase project URL and anon key:
        ```
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```

### Development

To run the development server:

```bash
npm run dev
```

### Building

To build the application for production:

```bash
npm run build
```

### Testing

To run the test suite:

```bash
npm test
```

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. Utility classes are preferred over custom CSS.
*   **Components:** Reusable UI components are located in the `components` directory. Shadcn/UI is used for the base component library.
*   **State Management:** For client-side state, React hooks are used. For server-side state, the Next.js App Router's data fetching capabilities are used.
*   **Testing:** Tests are written with Jest and React Testing Library. Test files are located in the `__tests__` directory.
*   **Linting & Formatting:** The project should be set up with ESLint and Prettier to enforce a consistent code style. (TODO: Add linting and formatting scripts to `package.json`).
*   **TypeScript:** Always check for type errors using `npx tsc` before committing changes.
*   **Context7:** Always use Context7 for code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.