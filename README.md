# 💰 Budget Management System — Internship Project

A full-stack personal finance web application for tracking income, expenses, and monthly budgets — **built during my internship at Vinsup Infotech Pvt Ltd**. I owned the **backend end-to-end** (Spring Boot, PostgreSQL, REST APIs, Hibernate/JPA) and contributed responsiveness and bug fixes on the frontend as part of a 5-member Agile team.

![Java](https://img.shields.io/badge/Java-17%2B-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.x-6DB33F?logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-BCrypt-6DB33F?logo=springsecurity&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Hibernate](https://img.shields.io/badge/Hibernate-JPA-59666C?logo=hibernate&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)

---

## 📖 Overview

Budget Management System is a two-tier web app I built as part of a **backend developer internship**: a **Spring Boot REST API** backend backed by **PostgreSQL**, and an **HTML/CSS/JavaScript** frontend that consumes it over `fetch()`. It covers the full budgeting loop — register, log in, record income/expenses, set a monthly budget, and see where the money went, with everything backed by real persisted data rather than mocks.

**Backend (my primary contribution):** REST API design, database schema, JPA entity relationships, authentication/security, and business logic for expenses, income, and budgets.
**Frontend:** Built collaboratively by the team; I contributed fixes for responsiveness issues and JavaScript bugs (see [My Role](#-my-role) below).

## ✨ Features

- 🔐 **Authentication** — Register, Login, Forgot Password / Reset Password, with passwords hashed using **BCrypt** (Spring Security) — never stored or transmitted in plain text
- 💸 **Expense Tracking** — Add, edit, delete expenses with category and date
- 💵 **Income Tracking** — Add, edit, delete income entries by source
- 🎯 **Monthly Budgets** — Set a budget per month, tracked against actual spending
- 📊 **Dashboard** — Live totals for income, expenses, net savings, and transaction count
- 📋 **Transaction History** — Search and filter by type, category, and date range
- 📁 **Export** — Download transaction history as CSV or PDF
- 🔁 **Recurring Expenses** — Auto-log recurring costs on their scheduled day
- 📱 **Fully Responsive** — Desktop down to mobile, with a collapsible sidebar and bottom nav on small screens

## 🛠️ Tech Stack

**Backend**
- Java 17+, Spring Boot 4.x
- Spring Data JPA (Hibernate) — ORM and entity relationships (`User` ↔ `Expense` / `Income` / `Budget`)
- Spring Security — BCrypt password hashing, CORS configuration
- PostgreSQL — relational database
- Jackson — JSON serialization, with `JavaTimeModule` for proper `LocalDate` handling
- Maven — build & dependency management

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no framework)
- Chart.js — dashboard visualizations
- `fetch()` API for all backend communication

## 📂 Project Structure

```
budget-management-system/
├── backend/
│   └── src/main/java/com/BudgetManagement/BMSApp/
│       ├── config/         # Spring Security & Jackson configuration
│       ├── controller/     # REST endpoints
│       ├── dto/            # Request payload objects
│       ├── model/          # JPA entities (User, Expense, Income, Budget)
│       ├── repository/     # Spring Data JPA repositories
│       ├── service/        # Business logic
│       └── BmsAppApplication.java
│   └── src/main/resources/
│       └── application.properties
│
└── frontend/
    ├── welcome.html         # Landing page
    ├── login.html
    ├── register.html
    ├── forgot.html
    ├── recover.html
    ├── index.html           # Main dashboard (post-login)
    ├── auth.css / auth.js   # Shared auth-page styling & logic
    └── index.css / index.js # Dashboard styling & logic
```

## 🚀 Getting Started

### Prerequisites
- JDK 17 or higher
- Maven
- PostgreSQL (running locally or accessible remotely)
- Any static file server for the frontend (VS Code **Live Server** extension is the easiest option)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/budget-management-system.git
cd budget-management-system
```

### 2. Set up the database
```sql
CREATE DATABASE budget_management_db;
```
Tables are created automatically on first run via `spring.jpa.hibernate.ddl-auto=update` — no manual schema needed.

### 3. Configure the backend
Update `src/main/resources/application.properties` with your local PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/budget_management_db
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
```

### 4. Run the backend
```bash
cd backend
mvn spring-boot:run
```
API will start on **http://localhost:8080**.

### 5. Run the frontend
Open the `frontend/` folder in VS Code and launch `welcome.html` with **Live Server** (or any static server, e.g. `python -m http.server 5500`). The frontend expects the API at `http://localhost:8080/api`.

## 🔌 API Overview

| Method | Endpoint                     | Description                     |
|--------|-------------------------------|----------------------------------|
| POST   | `/api/auth/register`          | Create a new account             |
| POST   | `/api/auth/login`              | Authenticate and return user info |
| POST   | `/api/verify-email`            | Check email exists (forgot password step 1) |
| POST   | `/api/reset-password`          | Reset password for verified email |
| GET    | `/api/user/{userId}`           | Fetch a user's profile           |
| POST   | `/api/expenses/add`            | Add an expense                   |
| GET    | `/api/expenses/user/{userId}`  | List a user's expenses           |
| PUT    | `/api/expenses/{id}`           | Update an expense                |
| DELETE | `/api/expenses/{id}`           | Delete an expense                |
| POST   | `/api/income/add`              | Add an income entry              |
| GET    | `/api/income/user/{userId}`    | List a user's income              |
| PUT    | `/api/income/{id}`             | Update an income entry           |
| DELETE | `/api/income/{id}`             | Delete an income entry           |
| POST   | `/api/budget/budget/add`       | Set/update monthly budget        |
| GET    | `/api/budget/user/{userId}`    | Get current budget                |

## 🔒 Security Notes

- Passwords are hashed with **BCrypt** (`Spring Security PasswordEncoder`) before storage — verified via `passwordEncoder.matches()` on login, never compared or stored in plain text.
- CORS is restricted to local development origins (`localhost` / `127.0.0.1`), not left open to `*`.
- Sensitive fields (e.g. password hash) are excluded from API responses via `@JsonIgnore`.

## 🙋 My Role

This was a hands-on backend-focused internship project where I owned the server side and supported the frontend team:

- **Designed and built the REST API** in Spring Boot powering every core feature — authentication, expense/income CRUD, budget management, and dashboard data aggregation.
- **Modeled the database schema** and entity relationships (`User` ↔ `Expense`, `Income`, `Budget`) using Spring Data JPA / Hibernate on PostgreSQL.
- **Implemented secure authentication** using Spring Security with BCrypt password hashing, replacing an earlier plain-text approach, and fixed an email case-sensitivity bug that could cause login/password-reset mismatches.
- **Hardened the API layer** — tightened CORS from a wildcard origin to explicit local dev origins, and cleaned up redundant dependency-injection patterns across the service layer.
- **Enhanced frontend functionality** — fixed a JavaScript bug where inline `onclick` handlers embedding JSON data silently broke the Edit Transaction button, and resolved a CSS overflow issue that clipped the bottom of longer forms on smaller screens.
- **Worked within a 5-member Agile team**, using Git for version control and coordinating API contracts for smooth frontend–backend integration.

## 📚 Challenges & Learning

- **Secure Password Handling:** Moving from plain-text password storage to BCrypt hashing (and updating the login flow to verify hashes instead of matching raw strings) gave me hands-on insight into how authentication security actually works under the hood, not just how to call a library.
- **Security Migrations Aren't Just Code Changes:** After switching to BCrypt, existing accounts created under the old plain-text scheme could no longer log in — a stored plain-text string can never satisfy a BCrypt comparison. Diagnosing this taught me that a security upgrade to *how* credentials are checked also needs a plan for *existing* data, not just new signups; the fix was directing affected users through the password-reset flow to get a freshly hashed password.
- **Consistency Across Endpoints:** Found and fixed a subtle bug where the password-reset endpoint normalized emails (`trim()` + `lowercase()`) but registration and login didn't — meaning an account registered as `John@Gmail.com` could fail to match on a case-different login or reset attempt. It was a good reminder to normalize input at a single, shared point rather than repeating (and slightly diverging) the same logic in multiple places.
- **Agile Collaboration:** Working across a 5-person team reinforced the importance of clear API contracts, consistent naming, and communicating changes early so backend and frontend don't drift apart.

## 🙏 Acknowledgements

A huge thanks to **Vinsup Infotech Pvt Ltd** for guiding me through this project during my internship — it was a real turning point in my learning journey.

## 👤 Author

**Ganning Joel J**
Backend Developer Intern — Budget Management System (Internship Project, Vinsup Infotech Pvt Ltd)
📧 your.email@example.com · 🔗 [LinkedIn](https://linkedin.com/in/ganningjoelj1609) · 🔗 [GitHub](https://github.com/your-username)

## 📄 License

This project is available for educational and portfolio purposes. Feel free to fork and build on it.
