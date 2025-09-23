# **Zen 🪷**
### Spa Management Application

## Introduction

Welcome to **Zen** 🪷, a modern and intuitive management dashboard designed specifically for spa businesses. This application offers a comprehensive suite of tools to efficiently track sales, manage expenses, monitor staff attendance, and provide valuable business insights, helping spa owners streamline operations and enhance client experiences.

**Zen** 🪷 stands out with its:
- 💰 Comprehensive sales management with detailed tracking
- 👥 Efficient staff and attendance management
- 📊 Real-time performance dashboards with monthly goals
- 🔄 Dynamic data filtering and reporting
- 🎨 Clean, responsive, and user-friendly interface

Perfect for spa organizations looking to:
- Optimize sales tracking and reporting
- Simplify staff and attendance oversight
- Gain actionable insights into business performance
- Ensure transparent and organized record-keeping

## ✨ Key Features

### 🌸 **Spa Management**
- Detailed sales recording with customizable therapy types and payment methods
- Month-wise sales filtering for flexible data analysis
- Comprehensive view of sales by therapist, therapy type, and payment method
- Management of rooms and therapies offered

### 🔐 **Authentication & Security**
- Secure login system with persistent session management
- Session state preserved across browser reloads/refreshes
- Protected routes with automatic redirection
- Role-based access control for different user types

### 📊 **Real-Time Dashboard**
- At-a-glance overview of daily, month-to-date, and year-to-date sales
- **Monthly Sales Goal tracker** to monitor progress against targets
- Reorganized layout for clear presentation of key metrics
- Real-time updates as sales data changes

### ⏰ **Smart Attendance Management**
- Visual attendance system with calendar view
- Drag-and-drop board to update staff status (Present, Late, Absent)
- Detailed attendance records for individual staff members

### 👥 **Staff & Sales Management**
- Full staff lifecycle management (add, edit, view, delete)
- Detailed staff profiles with role and experience information
- Individual attendance history
- **Sales Table**: Individual sales records presented in a sortable and editable table
    - Includes columns for Sl No, Sales Date, Customer, Customer Phone Number, Payment Mode, Amount, Therapist, Room, CheckIn:Checkout, and Therapy.
    - **Inline editing for all columns** with input fields for direct data modification.
    - **Dropdowns for columns with predefined values** (Payment Mode, Therapist, Room, Therapy) for easy selection.
    - **Row-specific "Save" and "Cancel" buttons** (replacing the "Edit" button) to manage changes only for the active row.
    - **Row selection and bulk deletion** functionality.
    - **Daily row selection** to select/deselect all sales for a particular day.
    - Visual separators to indicate day switching for better readability.
    - Automatic scrolling to edited rows after save operations for improved user experience.

#### 📈 **Comprehensive Sales System**
- Automated calculation of total sales for various periods
- Daily Sales Trend vertical bar chart for month-to-date performance
- Vertical bar charts for sales breakdowns by Therapist, Therapy, and Payment Method
- Consistent and correct rendering of the Indian Rupee symbol (₹) across all charts.

### 📈 **Analytics & Reporting**
- Daily, Month-to-Date, and Year-to-Date sales summaries
- Visual trends of daily total sales
- Export sales data to CSV for offline analysis

### 🎯 **User Experience**
- Fully responsive design optimized for various devices
- Dark/light theme support for personalized viewing
- Smooth animations and transitions
- Intuitive navigation
- Resolved client-side hydration errors caused by browser extensions

### 🗄️ **Data Persistence**
- In-memory data store for demonstration purposes. Changes reset upon server restart.
- Utilizes `SQLite` database for persistent storage in a production environment.

---

## Screenshots

_Placeholder for Zen application screenshots._

---

## 👋 About

1xAI is a pioneering technology company specializing in AI-powered business solutions. As the creator of Zen 🪷, we focus on developing intelligent applications that transform traditional business processes through automation and data-driven insights.

### Connect With Us

- 📧 **Email**: [onexai.inc@gmail.com](mailto:onexai.inc@gmail.com)
- 💼 **LinkedIn**: [1xAI on LinkedIn](https://www.linkedin.com/company/1xai)
- 🐦 **X (Twitter)**: [@onexai_inc](https://x.com/onexai_inc)

---

## 🛠️ Tech Stack

This project is built with a modern, production-ready technology stack:

### **Core Framework**
- **[Next.js](https://nextjs.org/)** (using the App Router)
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and enhanced developer experience
- **[React](https://react.dev/)** - Modern React with hooks

### **State Management**
- **React Context API with Hooks** - Centralized state management
- **Local Storage** - Session persistence

### **UI & Styling**
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - High-quality accessible components
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent iconography
- **[date-fns](https://date-fns.org/)** - Modern date utility library

### **Forms & Validation**
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with minimal re-renders
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolvers for React Hook Form

### **Charts**
- **[Chart.js](https://www.chartjs.org/)** with **[react-chartjs-2](https://react-chartjs-2.js.org/)**

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Turbopack](https://turbo.build/pack)** - Lightning-fast build tool (if configured)
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with modern tooling and best practices.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:deepujain/zen.git
    cd zen
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

4.  **Open the application:**
    Navigate to [http://localhost:9002](http://localhost:9002) in your browser.

### Initial Setup

The application uses an in-memory data store for demonstration purposes, so any changes made during a session will be reset upon restarting the server. For persistent storage, the application is configured to use SQLite.

### 📋 Available Scripts

```bash
# Development
npm run dev          # Start development server on port 9002
npm run build        # Build the application for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality checks
npm run typecheck    # Run TypeScript type checking without building
```

### 🏗️ Project Structure

```
zen/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   └── (app)/           # Main application pages
│   │       ├── about/
│   │       ├── expenses/
│   │       ├── sales/
│   │       └── staff/
│   ├── components/          # Reusable UI components
│   │   └── ui/             # Shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and database
│       ├── database/       # SQLite operations and schema
│       └── types.ts        # TypeScript type definitions
├── public/                 # Static assets
└── wavesflow.db           # SQLite database file
```

### 🚀 Deployment

1.  Build the application:
    ```bash
    npm run build
    ```

2.  Start the production server:
    ```bash
    npm run start
    ```
    The production server will run on port 3000 (default Next.js production port).

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
- Development server runs on port 9002
- Production server runs on port 3000 (default Next.js production port)
- Change ports in `package.json` if needed

**Data not persisting:**
The application uses an in-memory data store for demonstration. For persistent data, ensure `wavesflow.db` exists and is properly configured with SQLite.

**Database errors:**
If you encounter database-related errors, ensure the SQLite database file `wavesflow.db` is not corrupted and the schema is correctly initialized.

## 🤝 Contributing

This is a private project. For feature requests or bug reports, please contact the development team.

## 📄 License

© 2025 1xAI. All rights reserved.

This software and its documentation are protected by copyright law. All rights to this software, including but not limited to the application code, documentation, and design elements, are exclusively owned by 1xAI. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
