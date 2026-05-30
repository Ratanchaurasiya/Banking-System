// ==================== REPORTING & STATEMENT CONTROLLERS ====================

let reportChartInstance = null;
let currentReportData = null;

function onReportTypeChange() {
    const type = document.getElementById('reportType').value;
    const acctGroup = document.getElementById('reportAccountGroup');
    const controlsContainer = document.querySelector('.report-controls');
    
    if (type === 'statement') {
        acctGroup.style.display = 'block';
        if (controlsContainer) {
            controlsContainer.style.gridTemplateColumns = '1fr 1fr 1fr';
        }
        
        // If logged in as customer, auto fill and disable input
        if (activeRole === 'customer' && activeSessionUser) {
            document.getElementById('reportAccount').value = activeSessionUser.account_number;
            document.getElementById('reportAccount').disabled = true;
        } else {
            document.getElementById('reportAccount').disabled = false;
        }
    } else {
        acctGroup.style.display = 'none';
        if (controlsContainer) {
            controlsContainer.style.gridTemplateColumns = '1fr 1fr';
        }
    }
}

function generateReport() {
    const type = document.getElementById('reportType').value;
    const accountNo = document.getElementById('reportAccount').value;
    const resultDiv = document.getElementById('reportResult');
    const container = document.getElementById('reportContainer');
    
    resultDiv.innerHTML = '';
    container.style.display = 'none';
    
    if (type === 'statement') {
        if (!accountNo) {
            showMessage('Please enter an account number!', 'error', 'reportResult');
            return;
        }
        const account = bank.getAccount(accountNo);
        if (!account) {
            showMessage('Account not found!', 'error', 'reportResult');
            return;
        }
        
        const txs = bank.transactions.filter(t => t.account_number == accountNo).sort((a, b) => b.timestamp - a.timestamp);
        renderStatementReport(account, txs);
    } else if (type === 'transactions') {
        renderGlobalTransactionsReport();
    } else if (type === 'loans') {
        renderLoansReport();
    }
}

function renderStatementReport(account, txs) {
    const container = document.getElementById('reportContainer');
    container.style.display = 'block';
    
    currentReportData = {
        type: 'statement',
        account: account,
        transactions: txs
    };
    
    const totalDeposits = txs.filter(t => t.type === 'Deposit' || t.type === 'Transfer In').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawals = txs.filter(t => t.type === 'Withdrawal' || t.type === 'Transfer Out' || t.type === 'Bill Payment').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const summaryStats = document.getElementById('reportSummaryStats');
    summaryStats.innerHTML = `
        <h4 style="border-bottom: 2px solid var(--secondary-color); padding-bottom: 5px; margin-bottom: 10px; color: var(--secondary-color);">Account Summary</h4>
        <p><strong>Account Holder:</strong> ${account.candidate_name}</p>
        <p><strong>Account Type:</strong> ${account.account_type}</p>
        <p><strong>Current Balance:</strong> Rs. ${account.balance.toLocaleString()}</p>
        <p><strong>Total Money In:</strong> <span style="color: var(--success-color); font-weight: bold;">+Rs. ${totalDeposits.toLocaleString()}</span></p>
        <p><strong>Total Money Out:</strong> <span style="color: var(--accent-color); font-weight: bold;">-Rs. ${totalWithdrawals.toLocaleString()}</span></p>
    `;
    
    const ctx = document.getElementById('reportChart').getContext('2d');
    if (reportChartInstance) reportChartInstance.destroy();
    
    reportChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Money In (Deposits)', 'Money Out (Withdrawals)'],
            datasets: [{
                data: [totalDeposits, totalWithdrawals],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a' }
                }
            }
        }
    });
    
    const tableHeader = document.getElementById('reportTableHeader');
    tableHeader.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th>Mode</th>
            <th>Amount</th>
        </tr>
    `;
    
    const tableBody = document.getElementById('reportTableBody');
    if (txs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 15px;">No transactions found for this account.</td></tr>`;
    } else {
        tableBody.innerHTML = txs.map(t => {
            const isIn = t.type === 'Deposit' || t.type === 'Transfer In';
            const color = isIn ? 'var(--success-color)' : 'var(--accent-color)';
            return `
                <tr>
                    <td>${new Date(t.date).toLocaleString()}</td>
                    <td><span style="font-weight:bold; color:${color};">${t.type}</span></td>
                    <td>${t.description}</td>
                    <td>${t.mode}</td>
                    <td style="font-weight: 600; color:${color};">${isIn ? '+' : '-'}Rs. ${t.amount.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    }
}

function renderGlobalTransactionsReport() {
    const container = document.getElementById('reportContainer');
    container.style.display = 'block';
    
    const txs = bank.transactions.sort((a, b) => b.timestamp - a.timestamp);
    
    currentReportData = {
        type: 'transactions',
        transactions: txs
    };
    
    const totalDeposit = txs.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalWithdrawal = txs.filter(t => t.type === 'Withdrawal' || t.type === 'Bill Payment').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalTransfer = txs.filter(t => t.type.includes('Transfer')).reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const summaryStats = document.getElementById('reportSummaryStats');
    summaryStats.innerHTML = `
        <h4 style="border-bottom: 2px solid var(--secondary-color); padding-bottom: 5px; margin-bottom: 10px; color: var(--secondary-color);">Global Transaction Volume</h4>
        <p><strong>Total Deposits:</strong> Rs. ${totalDeposit.toLocaleString()}</p>
        <p><strong>Total Withdrawals/Bills:</strong> Rs. ${totalWithdrawal.toLocaleString()}</p>
        <p><strong>Total Transfers:</strong> Rs. ${(totalTransfer/2).toLocaleString()} (net)</p>
        <p><strong>Total System Transactions:</strong> ${txs.length}</p>
    `;
    
    const ctx = document.getElementById('reportChart').getContext('2d');
    if (reportChartInstance) reportChartInstance.destroy();
    
    reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Deposits', 'Withdrawals', 'Transfers (Vol)'],
            datasets: [{
                label: 'Transaction Value (Rs.)',
                data: [totalDeposit, totalWithdrawal, totalTransfer],
                backgroundColor: ['#10b981', '#ef4444', '#2563eb'],
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a' }
                },
                x: {
                    ticks: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a' }
                }
            }
        }
    });
    
    const tableHeader = document.getElementById('reportTableHeader');
    tableHeader.innerHTML = `
        <tr>
            <th>Acc No.</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Mode</th>
            <th>Description</th>
            <th>Date</th>
        </tr>
    `;
    
    const tableBody = document.getElementById('reportTableBody');
    if (txs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 15px;">No transactions in the system.</td></tr>`;
    } else {
        tableBody.innerHTML = txs.map(t => {
            const isOut = t.type === 'Withdrawal' || t.type === 'Transfer Out' || t.type === 'Bill Payment';
            const color = isOut ? 'var(--accent-color)' : 'var(--success-color)';
            return `
                <tr>
                    <td>${t.account_number}</td>
                    <td><span style="font-weight:bold; color:${color};">${t.type}</span></td>
                    <td style="font-weight: 600; color:${color};">${isOut ? '-' : '+'}Rs. ${t.amount.toLocaleString()}</td>
                    <td>${t.mode}</td>
                    <td>${t.description}</td>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                </tr>
            `;
        }).join('');
    }
}

function renderLoansReport() {
    const container = document.getElementById('reportContainer');
    container.style.display = 'block';
    
    const loans = bank.loans.sort((a, b) => b.id - a.id);
    
    currentReportData = {
        type: 'loans',
        loans: loans
    };
    
    const pendingCount = loans.filter(l => l.status === 'Pending').length;
    const activeCount = loans.filter(l => l.status === 'Active' || l.status === 'Approved').length;
    const closedCount = loans.filter(l => l.status === 'Closed').length;
    const totalLoanVal = loans.reduce((sum, l) => sum + l.amount, 0);
    
    const summaryStats = document.getElementById('reportSummaryStats');
    summaryStats.innerHTML = `
        <h4 style="border-bottom: 2px solid var(--secondary-color); padding-bottom: 5px; margin-bottom: 10px; color: var(--secondary-color);">Loan Application Status</h4>
        <p><strong>Total Applications:</strong> ${loans.length}</p>
        <p><strong>Pending Applications:</strong> ${pendingCount}</p>
        <p><strong>Active Loans:</strong> ${activeCount}</p>
        <p><strong>Closed Loans:</strong> ${closedCount}</p>
        <p><strong>Total Loan Value Requested:</strong> Rs. ${totalLoanVal.toLocaleString()}</p>
    `;
    
    const ctx = document.getElementById('reportChart').getContext('2d');
    if (reportChartInstance) reportChartInstance.destroy();
    
    reportChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'Active', 'Closed', 'Rejected'],
            datasets: [{
                data: [pendingCount, activeCount, closedCount, loans.filter(l => l.status === 'Rejected').length],
                backgroundColor: ['#f59e0b', '#10b981', '#2563eb', '#ef4444'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#0f172a' }
                }
            }
        }
    });
    
    const tableHeader = document.getElementById('reportTableHeader');
    tableHeader.innerHTML = `
        <tr>
            <th>Application ID</th>
            <th>Acc No.</th>
            <th>Applicant Name</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>EMI</th>
            <th>Status</th>
        </tr>
    `;
    
    const tableBody = document.getElementById('reportTableBody');
    if (loans.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 15px;">No loans in the system.</td></tr>`;
    } else {
        tableBody.innerHTML = loans.map(l => {
            let badge = '';
            if (l.status === 'Pending') badge = `<span style="padding: 3px 8px; border-radius: 12px; font-size:11px; font-weight:bold; background:#fff3cd; color:#856404; border: 1px solid #ffeaa7;">Pending</span>`;
            else if (l.status === 'Active' || l.status === 'Approved') badge = `<span style="padding: 3px 8px; border-radius: 12px; font-size:11px; font-weight:bold; background:#d4edda; color:#155724; border: 1px solid #c3e6cb;">Active</span>`;
            else if (l.status === 'Closed') badge = `<span style="padding: 3px 8px; border-radius: 12px; font-size:11px; font-weight:bold; background:#dbeafe; color:#1d4ed8; border: 1px solid #bfdbfe;">Closed</span>`;
            else badge = `<span style="padding: 3px 8px; border-radius: 12px; font-size:11px; font-weight:bold; background:#f8d7da; color:#721c24; border: 1px solid #f5c6cb;">Rejected</span>`;
            return `
                <tr>
                    <td>${l.id}</td>
                    <td>${l.account_number}</td>
                    <td>${l.applicant_name}</td>
                    <td>${l.loan_type}</td>
                    <td style="font-weight: 600;">Rs. ${l.amount.toLocaleString()}</td>
                    <td>Rs. ${parseFloat(l.emi).toLocaleString()}</td>
                    <td>${badge}</td>
                </tr>
            `;
        }).join('');
    }
}

function exportPDF() {
    if (!currentReportData) return;
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showMessage('PDF download tool is still loading. Please try again in a moment.', 'warning', 'reportResult');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('HexChal Digital Bank', 15, 22);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Official Account & Transaction Statement', 15, 29);
    
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated: ${dateStr}`, 130, 22);
    
    doc.setTextColor(15, 23, 42);
    
    if (currentReportData.type === 'statement') {
        const { account, transactions } = currentReportData;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Account Information', 15, 48);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Account Number: ${account.account_number}`, 15, 56);
        doc.text(`Account Holder: ${account.candidate_name}`, 15, 62);
        doc.text(`Father's Name: ${account.father_name}`, 15, 68);
        doc.text(`Phone Number: ${account.phone}`, 120, 56);
        doc.text(`Email Address: ${account.email}`, 120, 62);
        doc.text(`Current Balance: Rs. ${account.balance.toLocaleString()}`, 120, 68);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Transaction Details', 15, 82);
        
        const tableRows = transactions.map(t => [
            new Date(t.date).toLocaleString(),
            t.type,
            t.description,
            t.mode,
            (t.type === 'Deposit' || t.type === 'Transfer In' ? '+' : '-') + ` Rs. ${t.amount.toLocaleString()}`
        ]);
        
        doc.autoTable({
            startY: 88,
            head: [['Date', 'Type', 'Description', 'Mode', 'Amount']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        
        doc.save(`Statement-${account.account_number}.pdf`);
        
    } else if (currentReportData.type === 'transactions') {
        const { transactions } = currentReportData;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('System Transactions Summary', 15, 48);
        
        const tableRows = transactions.map(t => [
            t.account_number,
            t.type,
            `Rs. ${t.amount.toLocaleString()}`,
            t.mode,
            t.description,
            new Date(t.date).toLocaleDateString()
        ]);
        
        doc.autoTable({
            startY: 56,
            head: [['Acc No.', 'Type', 'Amount', 'Mode', 'Description', 'Date']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        
        doc.save(`All-Transactions-Report.pdf`);
        
    } else if (currentReportData.type === 'loans') {
        const { loans } = currentReportData;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Loan Applications Report', 15, 48);
        
        const tableRows = loans.map(l => [
            l.id,
            l.account_number,
            l.applicant_name,
            l.loan_type,
            `Rs. ${l.amount.toLocaleString()}`,
            `Rs. ${parseFloat(l.emi).toLocaleString()}`,
            l.status
        ]);
        
        doc.autoTable({
            startY: 56,
            head: [['ID', 'Acc No.', 'Applicant', 'Type', 'Amount', 'EMI', 'Status']],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        });
        
        doc.save(`Loans-Applications-Report.pdf`);
    }
}


