# 💰 Expense Tracker

A full-stack personal expense management application built with **HTML, CSS, JavaScript, Node.js, Express.js, and MySQL**.

The application allows users to record income and expenses, organize transactions by category, view their financial balance, analyze spending patterns, search and filter transaction history, and delete transactions through a clean responsive dashboard.

## ✨ Features

- 📊 Dashboard with:
  - Net balance
  - Total income
  - Total expenses
- ➕ Add income and expense transactions
- 🗂️ Category-based transaction management
- 📈 Expense analytics with Chart.js
- 🔎 Search transactions by description/category
- 🔽 Filter by transaction type and category
- ↕️ Sort by date or amount
- 🗑️ Delete transactions with confirmation
- 💾 MySQL persistent storage
- 🔄 REST API based frontend/backend communication
- 🛡️ Frontend and backend validation
- 🔐 Parameterized SQL queries
- ⚡ MySQL connection pooling
- 📱 Responsive modern UI
- 💾 Local-storage backup for previously synchronized transaction data
- 🟢 Database/API connection status feedback

## 🖥️ Application Overview

The application follows a simple workflow:

```text
User
  ↓
Frontend (HTML + CSS + JavaScript)
  ↓
REST API
  ↓
Node.js + Express.js
  ↓
MySQL
  ↓
JSON Response
  ↓
Dashboard / Analytics / Transaction History
```

## 🏗️ System Architecture

```text
┌───────────────────────────────┐
│          Frontend             │
│ HTML • CSS • JavaScript       │
│ Chart.js                      │
└───────────────┬───────────────┘
                │
                │ HTTP / REST API
                ▼
┌───────────────────────────────┐
│           Backend             │
│ Node.js • Express.js          │
│ Validation • API Logic        │
└───────────────┬───────────────┘
                │
                │ SQL
                ▼
┌───────────────────────────────┐
│           Database            │
│            MySQL              │
│       transactions table      │
└───────────────────────────────┘
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure |
| CSS3 | Responsive UI and styling |
| JavaScript | Frontend logic and state management |
| Node.js | Backend runtime |
| Express.js | REST API server |
| MySQL | Persistent transaction storage |
| mysql2 | MySQL connection and queries |
| Chart.js | Expense visualization |
| Boxicons | Interface icons |
| dotenv | Environment variables |
| CORS | Cross-origin request handling |
| Nodemon | Development server |

## 📁 Project Structure

```text
Expense-Tracker/
│
├── index.html          # Main application UI
├── styles.css          # Application styling
├── app.js              # Frontend logic and API integration
├── server.js           # Express server and REST APIs
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Dependency lock file
└── .gitignore          # Git ignored files
```

## 📊 Dashboard

The dashboard automatically calculates:

### Net Balance

```text
Net Balance = Total Income - Total Expenses
```

### Total Income

Sum of all transactions with type `income`.

### Total Expenses

Sum of all transactions with type `expense`.

All values are displayed using Indian Rupee (`₹`) formatting.

## 💳 Transaction Management

Each transaction contains:

- Amount
- Type
- Category
- Date
- Optional description

### Income Categories

- Salary
- Freelance
- Investments
- Gifts
- Other Income

### Expense Categories

- Food & Dining
- Housing & Rent
- Utilities
- Transportation
- Entertainment
- Subscriptions
- Health & Fitness
- Other

## 📈 Expense Analytics

Expense data is grouped by category and visualized using Chart.js.

For each category, the application calculates:

```text
Category Percentage =
Category Expense / Total Expenses × 100
```

The analytics section provides both:

- Doughnut chart visualization
- Category-wise spending information

This makes it easier to identify where most of the user's money is being spent.

## 🔎 Search, Filter & Sort

### Search

Transactions can be searched using their description or category.

### Filter

Transactions can be filtered by:

```text
All Types
Income
Expenses
```

and by category.

### Sort

Available sorting options include:

```text
Newest First
Oldest First
Amount: High to Low
Amount: Low to High
```

## 🔌 REST API

The backend exposes the following transaction APIs.

### Get All Transactions

```http
GET /api/transactions
```

Returns all stored transactions.

### Create Transaction

```http
POST /api/transactions
Content-Type: application/json
```

Example request:

```json
{
  "amount": 5000,
  "type": "income",
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2026-08-25"
}
```

### Delete Transaction

```http
DELETE /api/transactions/:id
```

Example:

```http
DELETE /api/transactions/15
```

## 🗄️ Database

The application uses MySQL for persistent storage.

### Database

```text
expense_tracker
```

### Table

```text
transactions
```

### Main Fields

| Field | Description |
|---|---|
| `id` | Primary key and auto-increment ID |
| `amount` | Transaction amount |
| `type` | `income` or `expense` |
| `category` | Transaction category |
| `description` | Optional description |
| `date` | Transaction date |
| `created_at` | Record creation timestamp |

The backend initializes the required database/table when necessary.

## 🔐 Validation & Security

Validation is performed on both frontend and backend.

The server checks:

- Amount is present
- Amount is numeric
- Amount is greater than zero
- Transaction type is valid
- Category is provided
- Date is provided

Database operations use parameterized SQL queries rather than directly concatenating user input.

Example:

```javascript
await dbPool.query(
  'INSERT INTO transactions (amount, type, category, description, date) VALUES (?, ?, ?, ?, ?)',
  [amount, type, category, description, date]
);
```

This helps reduce SQL injection risk.

## 💾 Local Storage Fallback

After successfully loading transactions from the backend, the frontend stores a backup in browser local storage.

If the API/database is temporarily unavailable, the application can attempt to display the most recently synchronized data.

```text
MySQL/API available
       ↓
Fetch transactions
       ↓
Save local backup

MySQL/API unavailable
       ↓
API request fails
       ↓
Load local backup
       ↓
Display previously synchronized data
```

The local-storage backup is only a resilience feature and is not a replacement for the MySQL database.

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
DB_PORT=3306
```

### Important

Never commit your real `.env` file or database password to GitHub.

Make sure `.env` is included in `.gitignore`.

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/oms123484/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MySQL

Make sure MySQL Server is installed and running.

Create/configure the `.env` file using the example above.

The backend is responsible for initializing the required database/table when configured correctly.

### 4. Start the application

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

Then open:

```text
http://localhost:5000
```

## 🧪 Example

Suppose the user adds:

```text
Income
Amount: ₹50,000
Category: Salary
Description: Monthly salary
```

and then adds:

```text
Expense
Amount: ₹5,000
Category: Food & Dining
Description: Monthly groceries
```

The dashboard automatically updates:

```text
Total Income      ₹50,000
Total Expenses     ₹5,000
Net Balance       ₹45,000
```

The expense analytics also update automatically to include the new Food & Dining expense.

## 🔄 Application Flow

### Adding a Transaction

```text
User enters transaction
        ↓
Frontend validation
        ↓
POST /api/transactions
        ↓
Express.js receives request
        ↓
Backend validation
        ↓
Parameterized SQL query
        ↓
MySQL
        ↓
JSON response
        ↓
Frontend state updated
        ↓
Dashboard + analytics refreshed
```

### Deleting a Transaction

```text
User clicks Delete
        ↓
Confirmation
        ↓
DELETE /api/transactions/:id
        ↓
Express.js
        ↓
MySQL DELETE
        ↓
Success response
        ↓
Frontend refresh
```

## 🎨 UI/UX

The application uses a modern dark-themed interface with:

- Glassmorphism cards
- Responsive layout
- Rounded components
- Gradient visual effects
- Interactive controls
- Income/expense visual indicators
- Financial dashboard cards
- Chart-based analytics

The interface is designed to remain usable across desktop and smaller screen sizes.

## 📸 Screenshots

Add screenshots to a `screenshots/` directory and update this section:

```markdown
## Dashboard

![Dashboard](screenshots/dashboard.png)

## Add Transaction

![Add Transaction](screenshots/add-transaction.png)

## Analytics

![Analytics](screenshots/analytics.png)
```

Recommended screenshots:

1. Main dashboard
2. Add transaction form
3. Expense analytics
4. Transaction history
5. Search/filter functionality

## 🔮 Future Enhancements

Potential improvements include:

- 👤 User authentication and authorization
- 🔑 Login/register functionality
- 📅 Monthly and yearly reports
- 💰 Budget limits by category
- 🔁 Recurring transactions
- ✏️ Edit existing transactions
- 📤 CSV/Excel/PDF export
- 📊 Advanced financial analytics
- 📈 Monthly income vs expense trends
- 💡 Savings recommendations
- 📄 Pagination for large transaction histories
- ☁️ Cloud deployment
- 📱 Progressive Web App support

## 📚 Learning Outcomes

This project demonstrates practical experience with:

- Full-stack web development
- REST API design
- Node.js and Express.js
- MySQL database integration
- SQL queries and parameterized queries
- Connection pooling
- JavaScript asynchronous programming
- Fetch API
- DOM manipulation
- Form validation
- Client-side state management
- Data visualization with Chart.js
- Local storage
- Responsive UI development
- Error handling

## 💼 Resume Description

**Expense Tracker — Full-Stack Web Application**

> Developed a full-stack personal expense management application using Node.js, Express.js, MySQL, HTML, CSS and JavaScript. Implemented REST APIs for transaction management, MySQL persistence with parameterized queries and connection pooling, dynamic financial dashboards, category-wise expense analytics using Chart.js, search/filter/sort functionality, validation, and local-storage fallback for improved resilience.

## ⭐ Project Highlights

- Full-stack architecture
- RESTful APIs
- MySQL persistence
- CRUD-style transaction management
- Dynamic financial calculations
- Category-wise expense analytics
- Chart.js visualization
- Search, filter and sorting
- Frontend + backend validation
- Parameterized SQL queries
- Connection pooling
- Local storage fallback
- Responsive modern UI

## 👨‍💻 Author

**Om Sangole**

GitHub: [@oms123484](https://github.com/oms123484)

Repository: [Expense-Tracker](https://github.com/oms123484/Expense-Tracker)

## 📄 License

This project was created for educational and portfolio purposes.

---

⭐ If you found this project useful, consider giving the repository a star.
