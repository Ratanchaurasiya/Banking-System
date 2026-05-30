// ==================== LOANS & EMI CONTROLLERS ====================

function autoFillLoanDetails() {
    let accountNumber;
    if (activeRole === 'customer' && activeSessionUser) {
        accountNumber = activeSessionUser.account_number;
        document.getElementById('loanAcc').value = accountNumber;
    } else {
        accountNumber = document.getElementById('loanAcc').value;
    }
    
    if (!accountNumber) return;
    
    const account = bank.getAccount(accountNumber);
    if (account) {
        document.getElementById('loanName').value = account.candidate_name;
    } else {
        document.getElementById('loanName').value = '';
    }
}

function calculateEMI() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const tenure = parseInt(document.getElementById('loanTenure').value);
    const rate = parseFloat(document.getElementById('loanRate').value);

    if (!amount || amount <= 0) {
        showMessage('Please enter loan amount!', 'error', 'loanResult');
        return;
    }

    const result = bank.calculateEMI(amount, rate, tenure);
    
    document.getElementById('emiCalculator').style.display = 'block';
    
    document.getElementById('calcLoanAmount').textContent = amount.toLocaleString();
    document.getElementById('calcTenure').textContent = tenure;
    document.getElementById('calcRate').textContent = rate;
    document.getElementById('calcEMI').textContent = result.emi;
    document.getElementById('calcTotalInterest').textContent = result.totalInterest;
    document.getElementById('calcTotalPayment').textContent = result.totalPayment;
}

function applyForLoan() {
    const accountNumber = document.getElementById('loanAcc').value;
    const pin = document.getElementById('loanPin').value;
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const tenure = parseInt(document.getElementById('loanTenure').value);
    const rate = parseFloat(document.getElementById('loanRate').value);

    if (!accountNumber || !pin || !amount || !tenure) {
        showMessage('Please fill all required fields!', 'error', 'loanResult');
        return;
    }

    const calculated = bank.calculateEMI(amount, rate, tenure);
    const emiBox = document.getElementById('calcEMI');
    const emi = emiBox && parseFloat(emiBox.textContent) > 0 ? emiBox.textContent : calculated.emi;

    const data = {
        type: document.getElementById('loanType').value,
        amount: amount,
        tenure: tenure,
        rate: rate,
        emi: emi,
        purpose: document.getElementById('loanPurpose').value,
        income: document.getElementById('loanIncome').value,
        employment: document.getElementById('loanEmployment').value
    };

    const result = bank.applyLoan(accountNumber, data, pin);
    
    if (result.success) {
        const receipt = createReceiptRecord({
            id: `LOAN-${result.loanId}`,
            title: 'Loan Application Receipt',
            rows: [
                { label: 'Application ID', value: result.loanId },
                { label: 'Account Number', value: accountNumber },
                { label: 'Applicant', value: document.getElementById('loanName').value || 'N/A' },
                { label: 'Loan Type', value: data.type },
                { label: 'Loan Amount', value: `Rs. ${amount.toLocaleString()}` },
                { label: 'Tenure', value: `${tenure} months` },
                { label: 'Monthly EMI', value: `Rs. ${data.emi}` },
                { label: 'Status', value: 'Pending Admin Review' }
            ]
        });
        document.getElementById('loanResult').innerHTML = `
            <div class="message message-success">
                <h4><i class="fas fa-check-circle"></i> Loan Application Submitted!</h4>
                <p><strong>Application ID:</strong> ${result.loanId}</p>
                <p><strong>Applicant:</strong> ${document.getElementById('loanName').value}</p>
                <p><strong>Loan Type:</strong> ${data.type}</p>
                <p><strong>Loan Amount:</strong> Rs. ${amount.toLocaleString()}</p>
                <p><strong>Monthly EMI:</strong> Rs. ${data.emi}</p>
                <p><strong>Status:</strong> Pending Admin Review</p>
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        
        clearLoanForm();
    } else {
        document.getElementById('loanResult').innerHTML = `
            <div class="message message-error">
                <h4><i class="fas fa-exclamation-circle"></i> Loan Application Failed</h4>
                <p>${result.message}</p>
            </div>
        `;
    }
}

function clearLoanForm() {
    document.getElementById('loanAcc').value = '';
    document.getElementById('loanName').value = '';
    document.getElementById('loanAmount').value = '';
    document.getElementById('loanIncome').value = '';
    document.getElementById('loanPurpose').value = '';
    document.getElementById('loanPin').value = '';
    document.getElementById('emiCalculator').style.display = 'none';
}

function updateLoanReviewQueueUI() {
    const tbody = document.getElementById('loanReviewTableBody');
    if (!tbody) return;
    
    const pendingLoans = bank.loans.filter(l => l.status === 'Pending').sort((a,b) => b.id - a.id);
    
    if (pendingLoans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 15px;">No pending loan applications for review</td></tr>`;
    } else {
        tbody.innerHTML = pendingLoans.map(l => `
            <tr>
                <td>${l.id}</td>
                <td>${l.account_number}</td>
                <td>${l.applicant_name}</td>
                <td>${l.loan_type}</td>
                <td style="font-weight: 600;">Rs. ${(l.amount || 0).toLocaleString()}</td>
                <td>Rs. ${l.emi ? parseFloat(l.emi).toLocaleString() : '0'}</td>
                <td>Rs. ${l.income ? parseFloat(l.income).toLocaleString() : '0'}</td>
                <td>
                    <button class="btn btn-success" onclick="approveLoan(${l.id})" style="padding: 4px 8px; font-size:12px; margin: 2px;">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectLoan(${l.id})" style="padding: 4px 8px; font-size:12px; margin: 2px;">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function getActiveLoans() {
    return bank.loans
        .filter(l => (l.status === 'Active' || l.status === 'Approved') && parseFloat(l.outstanding || l.amount || 0) > 0)
        .sort((a, b) => b.id - a.id);
}

function formatLoanMoney(value) {
    return `Rs. ${parseFloat(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateActiveLoansUI() {
    const tbody = document.getElementById('activeLoansTableBody');
    if (!tbody) return;

    const loans = getActiveLoans();
    if (loans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 15px;">No active loans found</td></tr>`;
        return;
    }

    tbody.innerHTML = loans.map(l => {
        const paid = parseFloat(l.paid_amount || 0);
        const total = parseFloat(l.total_payable || (parseFloat(l.emi || 0) * parseInt(l.tenure || 0)) || l.amount || 0);
        const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

        return `
            <tr>
                <td>${l.id}</td>
                <td>${l.account_number}</td>
                <td>${escapeHtml(l.applicant_name || '')}</td>
                <td>${escapeHtml(l.loan_type || '')}</td>
                <td>${formatLoanMoney(l.amount)}</td>
                <td>${formatLoanMoney(l.emi)}</td>
                <td>${formatLoanMoney(l.outstanding || total)}</td>
                <td>
                    <div class="loan-progress">
                        <span style="width: ${progress}%;"></span>
                    </div>
                    <small>${progress}% paid</small>
                </td>
                <td>${l.remaining_tenure ?? l.tenure ?? 0} months</td>
            </tr>
        `;
    }).join('');
}

function updateCustomerLoansUI() {
    const tbody = document.getElementById('customerLoansTableBody');
    const summary = document.getElementById('customerLoanSummary');
    if (!tbody || !activeSessionUser) return;

    const loans = bank.loans
        .filter(l => l.account_number == activeSessionUser.account_number)
        .sort((a, b) => b.id - a.id);
    const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Approved');
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + parseFloat(l.outstanding || 0), 0);

    if (summary) {
        summary.innerHTML = `
            <div class="loan-summary-card">
                <span>Active Loans</span>
                <strong>${activeLoans.length}</strong>
            </div>
            <div class="loan-summary-card">
                <span>Total Outstanding</span>
                <strong>${formatLoanMoney(totalOutstanding)}</strong>
            </div>
            <div class="loan-summary-card">
                <span>Account Balance</span>
                <strong>${formatLoanMoney(bank.getAccount(activeSessionUser.account_number)?.balance || 0)}</strong>
            </div>
        `;
    }

    if (loans.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 15px;">No loan applications found</td></tr>`;
        return;
    }

    tbody.innerHTML = loans.map(l => {
        const canPay = l.status === 'Active' || l.status === 'Approved';
        const defaultAmount = Math.min(parseFloat(l.emi || 0), parseFloat(l.outstanding || l.emi || 0)).toFixed(2);
        return `
            <tr>
                <td>${l.id}</td>
                <td>${escapeHtml(l.loan_type || '')}</td>
                <td>${formatLoanMoney(l.amount)}</td>
                <td>${formatLoanMoney(l.emi)}</td>
                <td>${formatLoanMoney(l.outstanding || 0)}</td>
                <td>${l.remaining_tenure ?? l.tenure ?? 0}</td>
                <td><span class="status-pill status-${String(l.status || '').toLowerCase()}">${l.status}</span></td>
                <td>
                    ${canPay ? `<input type="number" id="emiAmount-${l.id}" min="1" max="${parseFloat(l.outstanding || 0)}" step="0.01" value="${defaultAmount}" style="width: 120px;">` : '-'}
                </td>
                <td>
                    ${canPay ? `<button class="btn btn-success" onclick="payLoanEmi(${l.id})" style="padding: 6px 10px; font-size: 12px;"><i class="fas fa-credit-card"></i> Pay</button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function payLoanEmi(loanId) {
    const amount = document.getElementById(`emiAmount-${loanId}`)?.value;
    const pin = document.getElementById('loanRepayPin')?.value;
    if (!amount || !pin) {
        showMessage('Please enter EMI amount and PIN.', 'error', 'customerLoansResult');
        return;
    }

    const result = bank.payLoanEmi(loanId, amount, pin);
    if (result.success) {
        document.getElementById('loanRepayPin').value = '';
        const loan = bank.loans.find(l => l.id == loanId);
        const receipt = createReceiptRecord({
            id: `TXN-${result.transaction.id}`,
            title: 'Loan EMI Payment Receipt',
            rows: [
                { label: 'Transaction ID', value: `TXN-${result.transaction.id}` },
                { label: 'Loan ID', value: loanId },
                { label: 'Account Number', value: loan?.account_number || 'N/A' },
                { label: 'Loan Type', value: loan?.loan_type || 'N/A' },
                { label: 'Amount Paid', value: formatLoanMoney(amount) },
                { label: 'Outstanding', value: formatLoanMoney(result.outstanding) },
                { label: 'New Account Balance', value: formatLoanMoney(result.newBalance) },
                { label: 'Loan Status', value: loan?.status || 'N/A' }
            ]
        });
        document.getElementById('customerLoansResult').innerHTML = `
            <div class="message message-success">
                <i class="fas fa-check-circle"></i>
                ${result.message}. Outstanding: ${formatLoanMoney(result.outstanding)}
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        notifyUser('Loan EMI paid', `EMI payment of ${formatLoanMoney(amount)} completed.`, 'success');
        updateCustomerLoansUI();
        updateCustomerDashboardUI();
        updateDashboardUI();
    } else {
        showMessage(result.message, 'error', 'customerLoansResult');
    }
}

function approveLoan(loanId) {
    const result = bank.approveLoan(loanId);
    if (result.success) {
        const loan = bank.loans.find(l => l.id == loanId);
        const receipt = result.transaction ? createReceiptRecord({
            id: `TXN-${result.transaction.id}`,
            title: 'Loan Disbursal Receipt',
            rows: [
                { label: 'Transaction ID', value: `TXN-${result.transaction.id}` },
                { label: 'Loan ID', value: loanId },
                { label: 'Account Number', value: loan?.account_number || 'N/A' },
                { label: 'Customer', value: loan?.applicant_name || 'N/A' },
                { label: 'Loan Type', value: loan?.loan_type || 'N/A' },
                { label: 'Amount Credited', value: formatLoanMoney(loan?.amount || 0) },
                { label: 'Monthly EMI', value: formatLoanMoney(loan?.emi || 0) },
                { label: 'Outstanding Payable', value: formatLoanMoney(loan?.outstanding || 0) }
            ]
        }) : null;
        document.getElementById('loanApprovalResult').innerHTML = `
            <div class="message message-success">
                <i class="fas fa-check-circle"></i>
                ${result.message}
                ${renderReceiptDownloadButton(receipt)}
            </div>
        `;
        notifyUser('Loan approved', result.message, 'success');
        updateLoanReviewQueueUI();
        updateActiveLoansUI();
        updateDashboardUI();
    } else {
        showMessage(result.message, 'error', 'loanApprovalResult');
    }
}

function rejectLoan(loanId) {
    const result = bank.rejectLoan(loanId);
    if (result.success) {
        showMessage(result.message, 'warning', 'loanApprovalResult');
        updateLoanReviewQueueUI();
        updateDashboardUI();
    } else {
        showMessage(result.message, 'error', 'loanApprovalResult');
    }
}


