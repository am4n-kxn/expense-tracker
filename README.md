# Expense Tracker

A full-stack personal expense tracking application for managing transactions, budgets, and custom categories in one place. The application provides a clean dashboard for tracking spending and uses Google OAuth for authentication with persistent data stored in MongoDB.

## Tech Stack

* **Frontend:** React 19, Vite 8, React Router
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **Authentication:** Google OAuth 2.0
* **Data Visualization:** Recharts
* **HTTP/API:** Fetch API, Axios
* **Deployment:** Render
* **Version Control:** Git & GitHub

## Key Features

* 🔐 **Google Authentication** — Secure sign-in using Google OAuth 2.0.
* 💸 **Transaction Management** — Create, view, update, and delete income and expense transactions.
* 📊 **Dashboard & Analytics** — Visualize spending and financial activity through charts and summaries.
* 🎯 **Budget Management** — Create, update, and delete budgets to monitor spending limits.
* 🏷️ **Custom Categories** — Create, rename, and delete transaction categories.
* 💾 **Persistent Storage** — User and financial data are securely stored in MongoDB.
* 🔄 **Authenticated API** — Protected backend endpoints using token-based authentication.

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js 18+
* npm
* Git
* MongoDB database
* Google Cloud OAuth 2.0 credentials

### 1. Clone the Repository

```bash
git clone https://github.com/am4n-kxn/expense-tracker.git
cd expense-tracker
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `server` directory:

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
PORT=5000
```

Replace the placeholder values with your actual configuration.

### 4. Install Frontend Dependencies

Open a new terminal from the project root:

```bash
cd client
npm install
```

### 5. Configure Frontend Environment Variables

Create a `.env` file inside the `client` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

The Google Client ID should correspond to the OAuth application configured in Google Cloud Console.

### 6. Start the Backend

From the `server` directory:

```bash
npm start
```

The backend will run locally on:

```text
http://localhost:5000
```

### 7. Start the Frontend

From the `client` directory:

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

## Usage Example

Start both services locally:

```bash
# Terminal 1 — Backend
cd server
npm start

# Terminal 2 — Frontend
cd client
npm run dev
```

Then open the Vite development URL in your browser, sign in with Google, and begin managing your transactions, budgets, and categories.

For a production build:

```bash
cd client
npm run build
npm run preview
```

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/your-feature
```

3. Make your changes and test them locally.
4. Commit your changes:

```bash
git commit -m "Add your feature"
```

5. Push the branch:

```bash
git push origin feature/your-feature
```

6. Open a Pull Request against the `main` branch.
7. For bugs or feature requests, open an issue with a clear description and relevant reproduction steps.
