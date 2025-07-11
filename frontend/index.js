// Constants
const API_BASE_URL = "http://localhost:8080/api/expenses"; // Replace with your backend URL
const CATEGORY_COLORS = {
  "Entertainment": '#81C784',
  "Rent": '#EF5350',
  "Food": '#FFB74D',
  "Utilities": '#9575CD',
  "Transportation": '#4FC3F7',
  "Health": '#E57373',
  "Education": '#64B5F6',
  "Shopping": '#F06292',
  "Travel": '#4DB6AC',
  "Other": '#BDBDBD'
};

let expenses = [];
let incomeEntries = [];
let monthlyBudget = 0;

let categoryChart;
let monthlyChart;

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const fullName = localStorage.getItem("fullName");

  if (!token || !fullName) {
    window.location.href = "login.html";
    return;
  }

  // Set welcome message
  document.getElementById("welcomeUser").textContent = `Welcome ${fullName}`;

  loadUserData();
  updateDashboardSummary();
  updateCategoryChart();
  updateMonthlyChart();
  updateExpenseSummary();
  updateBudgetGoals();
  showSection("dashboard");
});

// Navigation logic
document.querySelectorAll(".menu li").forEach(item => {
  item.addEventListener("click", () => {
    if (item.dataset.action === "logout") {
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }

    document.querySelectorAll(".menu li").forEach(li => li.classList.remove("active-menu-item"));
    item.classList.add("active-menu-item");

    const sectionId = item.getAttribute("data-section");
    showSection(sectionId);
  });
});

// Show content section
function showSection(id) {
  document.querySelectorAll(".content-section").forEach(section => {
    section.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// Load user data
function loadUserData() {
  const fullName = localStorage.getItem("fullName");
  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");

  document.getElementById("userFullName").textContent = fullName;
  document.getElementById("userUsername").textContent = username;
  document.getElementById("userEmail").textContent = email;
}

// Save expense
document.getElementById("saveExpense").addEventListener("click", async () => {
  const title = document.getElementById("expenseTitle").value;
  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;
  const category = document.getElementById("expenseCategory").value;
  const description = document.getElementById("expenseDescription").value;

  if (!title || isNaN(amount) || !date || !category) {
    alert("Please fill in all required fields.");
    return;
  }

  const expense = { title, amount, date, category, description };

  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(expense)
    });

    if (!response.ok) throw new Error("Failed to save expense");

    const savedExpense = await response.json();

    expenses.push(savedExpense);

    updateDashboardSummary();
    updateCategoryChart();
    updateMonthlyChart();
    updateExpenseSummary();
    updateBudgetGoals();

    // Clear form
    document.getElementById("expenseTitle").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";
    document.getElementById("expenseCategory").value = "";
    document.getElementById("expenseDescription").value = "";

  } catch (err) {
    console.error("Error saving expense:", err);
    alert("Failed to save expense. Please try again.");
  }
});

// Save income
document.getElementById("saveIncome").addEventListener("click", async () => {
  const source = document.getElementById("incomeSource").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);
  const date = document.getElementById("incomeDate").value;

  if (!source || isNaN(amount) || !date) {
    alert("Please fill in all required fields.");
    return;
  }

  const income = { source, amount, date };

  try {
    const response = await fetch("http://localhost:8080/api/income/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(income)
    });

    if (!response.ok) throw new Error("Failed to save income");

    const savedIncome = await response.json();
    incomeEntries.push(savedIncome);

    updateDashboardSummary();
    updateExpenseSummary();
    updateBudgetGoals();

    // Clear form
    document.getElementById("incomeSource").value = "";
    document.getElementById("incomeAmount").value = "";
    document.getElementById("incomeDate").value = "";

  } catch (err) {
    console.error("Error saving income:", err);
    alert("Failed to save income.");
  }
});

// Set budget
document.getElementById("setBudget").addEventListener("click", () => {
  const budget = parseFloat(document.getElementById("monthlyBudget").value);
  if (!isNaN(budget)) {
    monthlyBudget = budget;
    updateBudgetGoals();
    document.getElementById("monthlyBudget").value = "";
  }
});

// ✅ Format date as YYYY-MM-DD
function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "Invalid Date";
  return date.toISOString().split("T")[0];
}

// ✅ Dashboard Summary (updated)
function updateDashboardSummary() {
  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const num = expenses.length;

  document.getElementById("totalAmount").textContent = `₹${total.toFixed(2)}`;
  document.getElementById("numberOfExpenses").textContent = num;

  const sorted = expenses.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  document.getElementById("firstExpenseDate").textContent = sorted[0] ? formatDisplayDate(sorted[0].date) : "N/A";
  document.getElementById("lastExpenseDate").textContent = sorted[num - 1] ? formatDisplayDate(sorted[num - 1].date) : "N/A";
}

// Category Chart (Pie)
function updateCategoryChart() {
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const data = Object.values(categoryTotals);
  const labels = Object.keys(categoryTotals);
  const colors = labels.map(cat => CATEGORY_COLORS[cat] || "#ccc");

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
      }],
    },
    options: {
      responsive: true,
      cutout: "60%",
    },
  });

  const container = document.querySelector(".category-list");
  container.innerHTML = "";
  labels.forEach((cat, index) => {
    const item = document.createElement("div");
    item.classList.add("category-item");
    item.innerHTML = `
      <div><span class="color-dot" style="background-color:${colors[index]}"></span><p>${cat}</p></div>
      <span>₹${data[index].toFixed(2)}</span>
    `;
    container.appendChild(item);
  });

  document.getElementById("dashboardTotalExpenses").textContent = `₹${data.reduce((a, b) => a + b, 0).toFixed(2)}`;
}

// Monthly Chart (Bar)
function updateMonthlyChart() {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const totals = new Array(12).fill(0);

  expenses.forEach(exp => {
    const month = new Date(exp.date).getMonth();
    totals[month] += exp.amount;
  });

  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Expenses per Month",
        data: totals,
        backgroundColor: "#42a5f5",
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// Expense Summary
function updateExpenseSummary() {
  const totalIncome = incomeEntries.reduce((a, b) => a + b.amount, 0);
  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
  const savings = totalIncome - totalExpenses;

  document.getElementById("summaryTotalIncome").textContent = `₹${totalIncome.toFixed(2)}`;
  document.getElementById("summaryTotalExpensesActual").textContent = `₹${totalExpenses.toFixed(2)}`;
  document.getElementById("summarySavings").textContent = `₹${savings.toFixed(2)}`;
}

// Budget Goals
function updateBudgetGoals() {
  const currentMonth = new Date().getMonth();
  const monthlyIncome = incomeEntries
    .filter(i => new Date(i.date).getMonth() === currentMonth)
    .reduce((a, b) => a + b.amount, 0);
  const monthlyExpenses = expenses
    .filter(e => new Date(e.date).getMonth() === currentMonth)
    .reduce((a, b) => a + b.amount, 0);

  const remaining = monthlyBudget - monthlyExpenses;

  document.getElementById("currentMonthlyIncome").textContent = `₹${monthlyIncome.toFixed(2)}`;
  document.getElementById("currentMonthlyExpenses").textContent = `₹${monthlyExpenses.toFixed(2)}`;
  document.getElementById("displayBudget").textContent = `₹${monthlyBudget.toFixed(2)}`;
  document.getElementById("budgetRemaining").textContent = `₹${remaining.toFixed(2)}`;
}