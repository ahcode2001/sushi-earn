// 1. Register the Service Worker for Offline Capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered.'))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// 2. Initialize Local Data Stores
let expenses = JSON.parse(localStorage.getItem('gig_expenses')) || [];
let earnings = JSON.parse(localStorage.getItem('gig_earnings')) || [];

let vehicleConfig = JSON.parse(localStorage.getItem('gig_vehicle_config')) || {
    plate_number: 'abc123',
    evp_expiry_date: '',
    psv_expiry_date: ''
};

// Global Chart Instance
let trendChartInstance = null;
Chart.defaults.color = '#aaa';
Chart.defaults.borderColor = '#333';

// 3. Tab Switching Logic
function switchTab(tabName) {
    document.getElementById('view-dashboard').classList.remove('active-view');
    document.getElementById('view-licenses').classList.remove('active-view');
    document.getElementById('view-settings').classList.remove('active-view');
    document.getElementById('view-' + tabName).classList.add('active-view');

    document.getElementById('nav-dashboard').classList.remove('active');
    document.getElementById('nav-licenses').classList.remove('active');
    document.getElementById('nav-settings').classList.remove('active');
    document.getElementById('nav-' + tabName).classList.add('active');

    const titles = {
        'dashboard': 'Sushi earn',
        'licenses': 'Compliance',
        'settings': 'Settings'
    };
    document.getElementById('header-title').innerText = titles[tabName];
}

// 4. Core Logic: Save Earnings
function saveEarning() {
    const amountInput = document.getElementById('earning-amount').value;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    earnings.push({
        id: Date.now(),
        amount: amount,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('gig_earnings', JSON.stringify(earnings));
    document.getElementById('earning-amount').value = '';
    
    updateSummary();
}

// 5. Core Logic: Save Micro-Expenses
function saveExpense() {
    const type = document.getElementById('expense-type').value;
    const amountInput = document.getElementById('expense-amount').value;
    const amount = parseFloat(amountInput);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }

    expenses.push({
        id: Date.now(),
        type: type,
        amount: amount,
        date: new Date().toISOString()
    });

    localStorage.setItem('gig_expenses', JSON.stringify(expenses));
    document.getElementById('expense-amount').value = '';
    
    updateSummary();
}

// 6. Update Summary & Render Chart
function updateSummary() {
    const today = new Date().toISOString().split('T')[0];
    
    const todayExpenses = expenses
        .filter(e => e.date.startsWith(today))
        .reduce((total, e) => total + e.amount, 0);
                                  
    const todayEarnings = earnings
        .filter(e => e.date.startsWith(today))
        .reduce((total, e) => total + e.amount, 0);

    const netProfit = todayEarnings - todayExpenses;

    document.getElementById('daily-expenses').innerText = todayExpenses.toFixed(2);
    document.getElementById('daily-earnings').innerText = todayEarnings.toFixed(2);
    document.getElementById('net-profit').innerText = netProfit.toFixed(2);
    
    renderChart();
}

// 7. Render 7-Day Trend Chart
function renderChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const labels = [];
    const earningsData = [];
    const expensesData = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const dateString = d.toISOString().split('T')[0];
        const displayLabel = d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' });
        
        labels.push(displayLabel);
        
        const dayEarn = earnings
            .filter(e => e.date.startsWith(dateString))
            .reduce((sum, e) => sum + e.amount, 0);
            
        const dayExp = expenses
            .filter(e => e.date.startsWith(dateString))
            .reduce((sum, e) => sum + e.amount, 0);
            
        earningsData.push(dayEarn);
        expensesData.push(dayExp);
    }

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Earnings (RM)',
                    data: earningsData,
                    borderColor: '#00ffcc',
                    backgroundColor: 'rgba(0, 255, 204, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Expenses (RM)',
                    data: expensesData,
                    borderColor: '#ff4757',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 8. Core Logic: License Management & 30-Day Alerting
function loadLicenses() {
    document.getElementById('vehicle-plate').value = vehicleConfig.plate_number;
    document.getElementById('psv-date').value = vehicleConfig.psv_expiry_date;
    document.getElementById('evp-date').value = vehicleConfig.evp_expiry_date;
    checkExpirations();
}

function saveLicenses() {
    vehicleConfig.plate_number = document.getElementById('vehicle-plate').value;
    vehicleConfig.psv_expiry_date = document.getElementById('psv-date').value;
    vehicleConfig.evp_expiry_date = document.getElementById('evp-date').value;
    
    localStorage.setItem('gig_vehicle_config', JSON.stringify(vehicleConfig));
    checkExpirations();
    alert('Permit information saved securely to device.');
}

function checkExpirations() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updateBadge = (dateValue, elementId) => {
        const badge = document.getElementById(elementId);
        
        if (!dateValue) {
            badge.innerText = 'Not Set';
            badge.className = 'status-badge status-neutral';
            return;
        }

        const expiryDate = new Date(dateValue);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            badge.innerText = `EXPIRED (${Math.abs(diffDays)} days ago)`;
            badge.className = 'status-badge status-danger';
        } else if (diffDays <= 30) {
            badge.innerText = `ACTION REQUIRED: Expires in ${diffDays} days`;
            badge.className = 'status-badge status-warning';
        } else {
            badge.innerText = `Valid (${diffDays} days remaining)`;
            badge.className = 'status-badge status-success';
        }
    };

    updateBadge(document.getElementById('psv-date').value, 'psv-status');
    updateBadge(document.getElementById('evp-date').value, 'evp-status');
}

// 9. Data Management: Clear History
function clearHistory() {
    if (confirm("Are you sure you want to permanently delete all earnings and expenses?")) {
        expenses = [];
        earnings = [];
        
        localStorage.removeItem('gig_expenses');
        localStorage.removeItem('gig_earnings');
        
        updateSummary();
        alert("History cleared successfully!");
        switchTab('dashboard');
    }
}

// 10. Data Management: Export CSV
function exportCSV() {
    // Define headers
    let csvContent = "RecordType,ID,Category,Amount,Date\n";

    // Append earnings
    earnings.forEach(e => {
        csvContent += `Earning,${e.id},Shift,${e.amount},${e.date}\n`;
    });

    // Append expenses
    expenses.forEach(e => {
        csvContent += `Expense,${e.id},${e.type},${e.amount},${e.date}\n`;
    });

    // Create a downloadable blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `sushi_earn_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 11. Data Management: Import CSV
function triggerImport() {
    document.getElementById('csv-file-input').click();
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n');

        let importedEarnings = [];
        let importedExpenses = [];

        // Loop through CSV lines, skipping the header (i=1)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',');
            if (parts.length >= 5) {
                const recordType = parts[0];
                const id = parseInt(parts[1]);
                const category = parts[2];
                const amount = parseFloat(parts[3]);
                const date = parts[4];

                if (recordType === 'Earning') {
                    importedEarnings.push({ id: id, amount: amount, date: date });
                } else if (recordType === 'Expense') {
                    importedExpenses.push({ id: id, type: category, amount: amount, date: date });
                }
            }
        }

        if (importedEarnings.length > 0 || importedExpenses.length > 0) {
            if (confirm(`Found ${importedEarnings.length} earnings and ${importedExpenses.length} expenses. Do you want to REPLACE your current data with this backup?`)) {
                earnings = importedEarnings;
                expenses = importedExpenses;
                
                localStorage.setItem('gig_earnings', JSON.stringify(earnings));
                localStorage.setItem('gig_expenses', JSON.stringify(expenses));
                
                updateSummary();
                alert("Data restored successfully!");
                switchTab('dashboard');
            }
        } else {
            alert("No valid data found in the selected CSV file.");
        }
        
        // Clear the input so the user can import the same file again if needed
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Initialize the app states on load
updateSummary();
loadLicenses();