// Global Application State
let state = {
  transactions: [],
  selectedType: 'expense', // 'expense' or 'income'
  chartInstance: null
};

// Category Configuration (Colors, Icons, and Titles)
const CATEGORIES = {
  expense: {
    'Food & Dining': { color: '#f59e0b', icon: 'bx-restaurant' },
    'Housing & Rent': { color: '#3b82f6', icon: 'bx-home' },
    'Utilities': { color: '#06b6d4', icon: 'bx-plug' },
    'Transportation': { color: '#10b981', icon: 'bx-car' },
    'Entertainment': { color: '#8b5cf6', icon: 'bx-game' },
    'Subscriptions': { color: '#ec4899', icon: 'bx-tv' },
    'Health & Fitness': { color: '#f43f5e', icon: 'bx-heart' },
    'Other': { color: '#6b7280', icon: 'bx-help-circle' }
  },
  income: {
    'Salary': { color: '#10b981', icon: 'bx-briefcase' },
    'Freelance': { color: '#3b82f6', icon: 'bx-laptop' },
    'Investments': { color: '#8b5cf6', icon: 'bx-trending-up' },
    'Gifts': { color: '#ec4899', icon: 'bx-gift' },
    'Other Income': { color: '#6b7280', icon: 'bx-money-withdraw' }
  }
};

// DOM Elements
const elements = {
  currentDate: document.getElementById('currentDate'),
  connectionStatus: document.getElementById('connectionStatus'),
  dbErrorAlert: document.getElementById('dbErrorAlert'),
  dbErrorMessage: document.getElementById('dbErrorMessage'),
  closeAlertBtn: document.getElementById('closeAlertBtn'),
  
  // Metrics
  netBalance: document.getElementById('netBalance'),
  totalIncome: document.getElementById('totalIncome'),
  totalExpenses: document.getElementById('totalExpenses'),
  
  // Form
  transactionForm: document.getElementById('transactionForm'),
  typeExpense: document.getElementById('typeExpense'),
  typeIncome: document.getElementById('typeIncome'),
  amount: document.getElementById('amount'),
  category: document.getElementById('category'),
  date: document.getElementById('date'),
  description: document.getElementById('description'),
  submitBtn: document.getElementById('submitBtn'),
  btnText: document.getElementById('btnText'),
  btnSpinner: document.querySelector('.btn-spinner'),
  
  // Validation messages
  amountError: document.getElementById('amountError'),
  categoryError: document.getElementById('categoryError'),
  dateError: document.getElementById('dateError'),

  // Analytics
  categoryChart: document.getElementById('categoryChart'),
  chartEmptyState: document.getElementById('chartEmptyState'),
  categoryBarsList: document.getElementById('categoryBarsList'),

  // Filters & List
  historyCount: document.getElementById('historyCount'),
  searchInput: document.getElementById('searchInput'),
  filterType: document.getElementById('filterType'),
  filterCategory: document.getElementById('filterCategory'),
  sortBy: document.getElementById('sortBy'),
  transactionList: document.getElementById('transactionList'),
  listEmptyState: document.getElementById('listEmptyState')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  // Set today's date in header & date input
  const today = new Date();
  elements.currentDate.textContent = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  elements.date.value = today.toISOString().split('T')[0];

  // Set initial category options
  updateFormCategories();

  // Add Event Listeners
  elements.typeExpense.addEventListener('change', handleTypeChange);
  elements.typeIncome.addEventListener('change', handleTypeChange);
  elements.transactionForm.addEventListener('submit', handleFormSubmit);
  elements.closeAlertBtn.addEventListener('click', () => elements.dbErrorAlert.classList.add('hidden'));

  // Filtering and Sorting Listeners
  elements.searchInput.addEventListener('input', renderUI);
  elements.filterType.addEventListener('change', () => {
    updateFilterCategories();
    renderUI();
  });
  elements.filterCategory.addEventListener('change', renderUI);
  elements.sortBy.addEventListener('change', renderUI);

  // Fetch initial data
  fetchTransactions();
});

// Update Categories dropdown based on Income/Expense choice
function updateFormCategories() {
  const type = elements.typeExpense.checked ? 'expense' : 'income';
  state.selectedType = type;
  
  const categoriesList = Object.keys(CATEGORIES[type]);
  elements.category.innerHTML = '';
  
  categoriesList.forEach((cat, index) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (index === 0) option.selected = true;
    elements.category.appendChild(option);
  });
}

// Update filter Category Dropdown dynamically based on available transaction categories
function updateFilterCategories() {
  const selectedTypeFilter = elements.filterType.value;
  elements.filterCategory.innerHTML = '<option value="all">All Categories</option>';
  
  let allowedCategories = [];
  if (selectedTypeFilter === 'all') {
    allowedCategories = [
      ...Object.keys(CATEGORIES.expense),
      ...Object.keys(CATEGORIES.income)
    ];
  } else {
    allowedCategories = Object.keys(CATEGORIES[selectedTypeFilter]);
  }

  // Remove duplicates just in case
  allowedCategories = [...new Set(allowedCategories)];

  allowedCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    elements.filterCategory.appendChild(option);
  });
}

function handleTypeChange() {
  updateFormCategories();
}

// API Communication Helper: Display Connection Status
function setOnlineStatus(online, errMessage = '') {
  const indicator = elements.connectionStatus.querySelector('.status-indicator');
  const text = elements.connectionStatus.querySelector('.status-text');

  if (online) {
    indicator.className = 'status-indicator online';
    text.textContent = 'Connected to SQL DB';
    elements.dbErrorAlert.classList.add('hidden');
  } else {
    indicator.className = 'status-indicator offline';
    text.textContent = 'Disconnected (Offline Mode)';
    elements.dbErrorMessage.textContent = errMessage || 'Could not connect to the MySQL database. Running in local fallback.';
    elements.dbErrorAlert.classList.remove('hidden');
  }
}

// Fetch all transactions from the API
async function fetchTransactions() {
  try {
    const res = await fetch('/api/transactions');
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Server error');
    }
    const data = await res.json();
    
    // Success - Use backend data
    state.transactions = data;
    localStorage.setItem('entrata_transactions_backup', JSON.stringify(data));
    setOnlineStatus(true);
  } catch (err) {
    console.warn('API Fetch failed, fallback to local storage:', err.message);
    setOnlineStatus(false, err.message);
    
    // Fallback to local storage backup
    const backup = localStorage.getItem('entrata_transactions_backup');
    state.transactions = backup ? JSON.parse(backup) : [];
  }
  
  updateFilterCategories();
  renderUI();
}

// Post a new transaction to the API
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Form Validation
  let isValid = true;
  
  const amountVal = parseFloat(elements.amount.value);
  if (isNaN(amountVal) || amountVal <= 0) {
    elements.amountError.classList.add('visible');
    isValid = false;
  } else {
    elements.amountError.classList.remove('visible');
  }

  if (!elements.category.value) {
    elements.categoryError.classList.add('visible');
    isValid = false;
  } else {
    elements.categoryError.classList.remove('visible');
  }

  if (!elements.date.value) {
    elements.dateError.classList.add('visible');
    isValid = false;
  } else {
    elements.dateError.classList.remove('visible');
  }

  if (!isValid) return;

  // Build Payload
  const transactionData = {
    amount: amountVal,
    type: state.selectedType,
    category: elements.category.value,
    description: elements.description.value,
    date: elements.date.value
  };

  // Show UI spinner
  elements.submitBtn.disabled = true;
  elements.btnText.classList.add('hidden');
  elements.btnSpinner.classList.remove('hidden');

  try {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to save transaction');
    }

    // Success
    elements.amount.value = '';
    elements.description.value = '';
    elements.date.value = new Date().toISOString().split('T')[0];
    
    await fetchTransactions(); // Refresh
  } catch (err) {
    console.error('Error saving transaction:', err);
    alert('Could not save transaction: ' + err.message);
  } finally {
    // Hide UI spinner
    elements.submitBtn.disabled = false;
    elements.btnText.classList.remove('hidden');
    elements.btnSpinner.classList.add('hidden');
  }
}

// Delete a transaction from the database
async function handleDeleteTransaction(id) {
  if (!confirm('Are you sure you want to delete this transaction?')) return;

  try {
    const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to delete transaction');
    }
    
    await fetchTransactions(); // Refresh
  } catch (err) {
    console.error('Error deleting transaction:', err);
    alert('Could not delete transaction: ' + err.message);
  }
}

// Format currency helper
const formatCur = (num) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(num);
};

// Master Render Function
function renderUI() {
  updateMetrics();
  updateAnalyticsChart();
  renderTransactionList();
}

// Update Metrics: Income, Expenses, Balance
function updateMetrics() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  state.transactions.forEach(t => {
    const amt = parseFloat(t.amount);
    if (t.type === 'income') {
      incomeTotal += amt;
    } else {
      expenseTotal += amt;
    }
  });

  const netBal = incomeTotal - expenseTotal;

  elements.totalIncome.textContent = formatCur(incomeTotal);
  elements.totalExpenses.textContent = formatCur(expenseTotal);
  elements.netBalance.textContent = formatCur(netBal);

  // Update Net Balance card class depending on status
  const balCard = document.querySelector('.balance-card');
  if (netBal < 0) {
    balCard.style.borderLeftColor = 'var(--expense-color)';
  } else {
    balCard.style.borderLeftColor = 'var(--primary)';
  }
}

// Helper to get configuration color/icon for any transaction
function getCategoryMeta(type, categoryName) {
  const fallback = { color: '#6b7280', icon: 'bx-help-circle' };
  if (!CATEGORIES[type]) return fallback;
  return CATEGORIES[type][categoryName] || fallback;
}

// Update Analytics: Category Chart & Progress Bars
function updateAnalyticsChart() {
  // Aggregate expenses only
  const expenses = state.transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    elements.chartEmptyState.classList.remove('hidden');
    elements.categoryBarsList.innerHTML = '';
    if (state.chartInstance) {
      state.chartInstance.destroy();
      state.chartInstance = null;
    }
    return;
  }
  
  elements.chartEmptyState.classList.add('hidden');

  // Compute breakdown totals
  const breakdown = {};
  let totalSpent = 0;

  expenses.forEach(e => {
    const amt = parseFloat(e.amount);
    totalSpent += amt;
    breakdown[e.category] = (breakdown[e.category] || 0) + amt;
  });

  // Sort categories by expenditure value (highest first)
  const sortedCategories = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  const labels = [];
  const data = [];
  const bgColors = [];

  sortedCategories.forEach(([cat, val]) => {
    labels.push(cat);
    data.push(val);
    bgColors.push(getCategoryMeta('expense', cat).color);
  });

  // 1. Render Chart.js Doughnut Chart
  const ctx = elements.categoryChart.getContext('2d');
  
  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  state.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#111827', // Matching dark theme bg
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // We use our custom progress list details instead
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.raw;
              const pct = ((val / totalSpent) * 100).toFixed(1);
              return ` ${context.label}: ₹${val.toFixed(2)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '75%'
    }
  });

  // 2. Render Custom Progress Bars
  elements.categoryBarsList.innerHTML = '';
  
  sortedCategories.forEach(([cat, val]) => {
    const meta = getCategoryMeta('expense', cat);
    const pct = ((val / totalSpent) * 100).toFixed(1);
    
    const barHtml = `
      <div class="category-bar-item">
        <div class="bar-header">
          <div class="category-label-group">
            <span class="category-color-dot" style="background-color: ${meta.color}"></span>
            <span>${cat}</span>
            <span class="category-percent">${pct}%</span>
          </div>
          <span class="category-amount">₹${val.toFixed(2)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="background-color: ${meta.color}; width: ${pct}%"></div>
        </div>
      </div>
    `;
    elements.categoryBarsList.insertAdjacentHTML('beforeend', barHtml);
  });
}

// Render Transaction History Log List with active filters
function renderTransactionList() {
  const query = elements.searchInput.value.toLowerCase().trim();
  const typeFilter = elements.filterType.value;
  const categoryFilter = elements.filterCategory.value;
  const sorting = elements.sortBy.value;

  // Filter list
  let filtered = state.transactions.filter(t => {
    // 1. Text Search Filter (Description)
    const desc = t.description ? t.description.toLowerCase() : '';
    const matchesSearch = desc.includes(query) || t.category.toLowerCase().includes(query);

    // 2. Type Filter
    const matchesType = typeFilter === 'all' || t.type === typeFilter;

    // 3. Category Filter
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort list
  filtered.sort((a, b) => {
    if (sorting === 'date-desc') {
      return new Date(b.date) - new Date(a.date) || b.id - a.id;
    } else if (sorting === 'date-asc') {
      return new Date(a.date) - new Date(b.date) || a.id - b.id;
    } else if (sorting === 'amount-desc') {
      return parseFloat(b.amount) - parseFloat(a.amount);
    } else if (sorting === 'amount-asc') {
      return parseFloat(a.amount) - parseFloat(b.amount);
    }
    return 0;
  });

  // Update transaction count text
  elements.historyCount.textContent = `${filtered.length} Transaction${filtered.length === 1 ? '' : 's'}`;

  // Clear list
  elements.transactionList.innerHTML = '';

  if (filtered.length === 0) {
    elements.listEmptyState.classList.remove('hidden');
    return;
  }
  
  elements.listEmptyState.classList.add('hidden');

  // Build UI items
  filtered.forEach(t => {
    const meta = getCategoryMeta(t.type, t.category);
    const amt = parseFloat(t.amount);
    const dateFormatted = new Date(t.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC' // Keep date persistent across time zones
    });

    const isExpense = t.type === 'expense';
    const valPrefix = isExpense ? '-' : '+';
    const amountClass = isExpense ? 'expense' : 'income';

    const itemHtml = `
      <div class="transaction-item ${t.type}">
        <div class="item-left">
          <div class="item-icon-box">
            <i class="bx ${meta.icon}"></i>
          </div>
          <div class="item-meta">
            <span class="item-desc">${t.description || t.category}</span>
            <div class="item-details">
              <span class="item-cat">${t.category}</span>
              <span class="item-date"><i class="bx bx-calendar"></i> ${dateFormatted}</span>
            </div>
          </div>
        </div>
        <div class="item-right">
          <span class="item-val">${valPrefix}${formatCur(amt)}</span>
          <div class="item-actions">
            <button class="delete-btn" onclick="handleDeleteTransaction(${t.id})" title="Delete Transaction">
              <i class="bx bx-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    elements.transactionList.insertAdjacentHTML('beforeend', itemHtml);
  });
}

// Attach Delete function to global window scope so dynamic elements can trigger it
window.handleDeleteTransaction = handleDeleteTransaction;
