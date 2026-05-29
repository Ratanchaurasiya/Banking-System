// ==================== APP ROUTING, MODALS & EVENT HANDLERS ====================

function showSection(sectionId) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Highlight sidebar items
    const sidebar = document.querySelector('.sidebar');
    const links = sidebar.querySelectorAll('.menu-item');
    links.forEach(item => {
        const onClickText = item.getAttribute('onclick');
        if (onClickText && onClickText.includes(`'${sectionId}'`)) {
            item.classList.add('active');
        }
    });

    // Toggle active sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Trigger updates
    if (sectionId === 'accounts') {
        resetAccountsDirectoryFilters();
        bank.updateAllAccountsTable();
    } else if (sectionId === 'dashboard') {
        updateDashboardUI();
    } else if (sectionId === 'custDashboard') {
        updateCustomerDashboardUI();
    } else if (sectionId === 'loanApprovals') {
        updateLoanReviewQueueUI();
    } else if (sectionId === 'payBills') {
        onBillTypeChange();
    } else if (sectionId === 'cards') {
        loadCardSettingsUI();
    } else if (sectionId === 'transfer') {
        if (activeRole === 'customer' && activeSessionUser) {
            document.getElementById('transferFrom').value = activeSessionUser.account_number;
            document.getElementById('transferFrom').readOnly = true;
            autoFillTransferDetails();
        } else {
            document.getElementById('transferFrom').readOnly = false;
        }
    } else if (sectionId === 'loan') {
        if (activeRole === 'customer' && activeSessionUser) {
            document.getElementById('loanAcc').value = activeSessionUser.account_number;
            document.getElementById('loanAcc').readOnly = true;
            autoFillLoanDetails();
        } else {
            document.getElementById('loanAcc').readOnly = false;
        }
    }
}

function resetAccountsDirectoryFilters() {
    const searchInput = document.getElementById('accountsSearch');
    const statusFilter = document.getElementById('accountsStatusFilter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = 'all';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    
    const themeBtn = document.querySelector('.theme-toggle');
    const icon = themeBtn.querySelector('i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    themeBtn.innerHTML = `<i class="${icon.className}"></i> ${newTheme === 'dark' ? 'Light' : 'Dark'} Mode`;
}

function parseActionCall(actionCall) {
    const match = actionCall.trim().match(/^([A-Za-z_$][\w$]*)\((.*)\)$/);
    if (!match) return null;

    const rawArgs = match[2].trim();
    const args = rawArgs
        ? rawArgs.split(',').map(arg => {
            const value = arg.trim();
            if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
                return value.slice(1, -1);
            }

            return Number.isNaN(Number(value)) ? value : Number(value);
        })
        : [];

    return { name: match[1], args };
}

function bindDeclaredActions() {
    document.querySelectorAll('[onclick]').forEach(element => {
        const actionCall = element.getAttribute('onclick');
        if (!actionCall) return;

        element.dataset.actionCall = actionCall;
        element.removeAttribute('onclick');
    });

    document.addEventListener('click', event => {
        const actionElement = event.target.closest('[data-action-call]');
        if (!actionElement) return;

        const action = parseActionCall(actionElement.dataset.actionCall);
        if (!action || typeof window[action.name] !== 'function') {
            showMessage(`Button action not found: ${actionElement.dataset.actionCall}`, 'error', 'authResult');
            return;
        }

        event.preventDefault();
        window[action.name](...action.args);
    });
}

// --- Search Accounts ---
function searchAccount() {
    const accountNumber = document.getElementById('searchAccInput').value;
    if (!accountNumber) {
        showMessage('Please enter an account number!', 'error', 'searchResult');
        return;
    }

    const account = bank.getAccount(accountNumber);
    if (!account) {
        showMessage('Account not found!', 'error', 'searchResult');
        return;
    }

    const resultHTML = `
        <div class="search-results">
            <h3><i class="fas fa-user-circle"></i> Account Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <p><strong>Account Number:</strong> ${account.account_number}</p>
                    <p><strong>Full Name:</strong> ${account.candidate_name}</p>
                    <p><strong>Father's Name:</strong> ${account.father_name}</p>
                    <p><strong>Phone:</strong> ${account.phone}</p>
                    <p><strong>Email:</strong> ${account.email}</p>
                </div>
                <div>
                    <p><strong>Account Type:</strong> ${account.account_type}</p>
                    <p><strong>Current Balance:</strong> ₹${account.balance.toLocaleString()}</p>
                    <p><strong>Account Created:</strong> ${new Date(account.created_at).toLocaleDateString()}</p>
                    <p><strong>Aadhaar:</strong> ${account.aadhaar_number}</p>
                    <p><strong>Status:</strong> ${account.locked ? '🔒 Locked' : '✅ Active'}</p>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4>Quick Actions</h4>
                <button class="btn" onclick="quickDeposit(${account.account_number})" style="margin-right: 10px;">
                    <i class="fas fa-money-bill-wave"></i> Deposit
                </button>
                <button class="btn" onclick="quickWithdraw(${account.account_number})" style="margin-right: 10px;">
                    <i class="fas fa-wallet"></i> Withdraw
                </button>
                <button class="btn" onclick="quickTransfer(${account.account_number})">
                    <i class="fas fa-exchange-alt"></i> Transfer
                </button>
            </div>
        </div>
    `;

    document.getElementById('searchResult').innerHTML = resultHTML;
}

function quickSearchAccount() {
    const accountNumber = document.getElementById('quickSearch').value;
    if (!accountNumber) return;

    const account = bank.getAccount(accountNumber);
    if (!account) {
        document.getElementById('quickSearchResult').innerHTML = `
            <div class="message message-error">
                <i class="fas fa-exclamation-circle"></i> Account not found!
            </div>
        `;
        return;
    }

    document.getElementById('quickSearchResult').innerHTML = `
        <div class="search-results">
            <h4>Account Found</h4>
            <p><strong>Account Number:</strong> ${account.account_number}</p>
            <p><strong>Name:</strong> ${account.candidate_name}</p>
            <p><strong>Balance:</strong> ₹${account.balance.toLocaleString()}</p>
            <p><strong>Type:</strong> ${account.account_type}</p>
            <button class="btn" onclick="showFullAccount(${account.account_number})" style="margin-top: 10px;">
                <i class="fas fa-eye"></i> View Full Details
            </button>
        </div>
    `;
}

function showFullAccount(accountNumber) {
    showSection('accounts');
    document.getElementById('accountsSearch').value = accountNumber;
    const statusFilter = document.getElementById('accountsStatusFilter');
    if (statusFilter) statusFilter.value = 'all';
    bank.updateAllAccountsTable();
}

function filterAccounts() {
    bank.updateAllAccountsTable();
}

function viewAccountDetails(accountNumber) {
    showSection('accounts');
    document.getElementById('accountsSearch').value = accountNumber;
    const statusFilter = document.getElementById('accountsStatusFilter');
    if (statusFilter) statusFilter.value = 'all';
    bank.updateAllAccountsTable();
}

function openDashboardMetric(metric) {
    const searchInput = document.getElementById('accountsSearch');
    const statusFilter = document.getElementById('accountsStatusFilter');

    if (metric === 'activeLoans') {
        showSection('loanApprovals');
        return;
    }

    showSection('accounts');

    if (searchInput) searchInput.value = '';
    if (statusFilter) {
        statusFilter.value = metric === 'activeAccounts'
            ? 'active'
            : metric === 'lockedAccounts'
                ? 'locked'
                : 'all';
    }

    bank.updateAllAccountsTable();
}

// --- Staff Account Creation ---
function createAccount() {
    const data = {
        name: document.getElementById('createName').value.trim(),
        father: document.getElementById('createFather').value.trim(),
        phone: document.getElementById('createPhone').value.trim(),
        email: document.getElementById('createEmail').value.trim(),
        aadhaar: document.getElementById('createAadhaar').value.trim(),
        pin: document.getElementById('createPin').value.trim(),
        type: document.getElementById('createType').value,
        deposit: document.getElementById('createDeposit').value,
        address: document.getElementById('createAddress').value.trim(),
        photo: uploadedPhotoBase64
    };

    if (!data.name || !data.father || !data.phone || !data.email ||
        !data.aadhaar || data.aadhaar.length !== 12 ||
        !data.pin || data.pin.length !== 4 || !data.deposit || parseFloat(data.deposit) <= 0) {
        showMessage('Please fill all required fields correctly!', 'error', 'createResult');
        return;
    }

    if (!/^\d{10}$/.test(data.phone)) {
        showMessage('Please enter a valid 10-digit phone number!', 'error', 'createResult');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showMessage('Please enter a valid email address!', 'error', 'createResult');
        return;
    }

    const newAccount = bank.createAccount(data);

    document.getElementById('summaryContent').innerHTML = `
        <p><strong>Account Number:</strong> ${newAccount.account_number}</p>
        <p><strong>Account Holder:</strong> ${newAccount.candidate_name}</p>
        <p><strong>Father's Name:</strong> ${newAccount.father_name}</p>
        <p><strong>Phone:</strong> ${newAccount.phone}</p>
        <p><strong>Email:</strong> ${newAccount.email}</p>
        <p><strong>Aadhaar:</strong> ${newAccount.aadhaar_number}</p>
        <p><strong>Account Type:</strong> ${newAccount.account_type}</p>
        <p><strong>Opening Balance:</strong> ₹${newAccount.balance.toLocaleString()}</p>
        <p><strong>Debit Card:</strong> ${newAccount.card_number}</p>
        <p><strong>Created At:</strong> ${new Date(newAccount.created_at).toLocaleString()}</p>
    `;
    document.getElementById('accountSummary').style.display = 'block';
    showMessage('Account created successfully!', 'success', 'createResult');

    ['createName', 'createFather', 'createPhone', 'createEmail', 'createAadhaar', 'createPin', 'createDeposit', 'createAddress'].forEach(id => {
        document.getElementById(id).value = '';
    });

    const photoPreview = document.getElementById('photoPreview');
    const photoInput = document.getElementById('photoInput');
    if (photoPreview) photoPreview.src = 'https://via.placeholder.com/150';
    if (photoInput) photoInput.value = '';
    uploadedPhotoBase64 = null;

    updateDashboardUI();
}

// --- Edit/Delete Modals ---
function editAccount(accountNumber) {
    const account = bank.getAccount(accountNumber);
    if (!account) return;
    
    document.getElementById('editAccNo').value = account.account_number;
    document.getElementById('editName').value = account.candidate_name;
    document.getElementById('editFather').value = account.father_name;
    document.getElementById('editPhone').value = account.phone;
    document.getElementById('editEmail').value = account.email;
    document.getElementById('editType').value = account.account_type;
    document.getElementById('editAddress').value = account.address;
    document.getElementById('editStatus').value = account.locked ? 'locked' : 'active';
    document.getElementById('editPin').value = '';
    
    const resultDiv = document.getElementById('editResult');
    if (resultDiv) resultDiv.innerHTML = '';
    
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

function saveAccountEdits() {
    const accNo = document.getElementById('editAccNo').value;
    const data = {
        name: document.getElementById('editName').value.trim(),
        father: document.getElementById('editFather').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        type: document.getElementById('editType').value,
        address: document.getElementById('editAddress').value.trim(),
        status: document.getElementById('editStatus').value,
        pin: document.getElementById('editPin').value.trim()
    };
    
    if (!data.name || !data.father || !data.phone || !data.email) {
        showMessage('Please fill all required fields correctly!', 'error', 'editResult');
        return;
    }
    
    if (!/^\d{10}$/.test(data.phone)) {
        showMessage('Please enter a valid 10-digit phone number!', 'error', 'editResult');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        showMessage('Please enter a valid email address!', 'error', 'editResult');
        return;
    }
    
    if (data.pin && data.pin.length !== 4) {
        showMessage('PIN must be exactly 4 digits!', 'error', 'editResult');
        return;
    }
    
    const result = bank.updateAccount(accNo, data);
    
    if (result.success) {
        showMessage('Changes saved successfully!', 'success', 'editResult');
        setTimeout(() => {
            closeEditModal();
        }, 1500);
    } else {
        showMessage(result.message, 'error', 'editResult');
    }
}

function confirmDeleteAccount(accountNumber) {
    const account = bank.getAccount(accountNumber);
    if (!account) return;
    
    if (account.balance > 0) {
        showMessage('Cannot close account with positive balance! Please withdraw all funds first (Balance: ₹' + account.balance.toLocaleString() + ').', 'error', 'accounts');
        return;
    }
    
    document.getElementById('deleteAccNo').value = account.account_number;
    document.getElementById('deleteAccDisplay').textContent = `${account.candidate_name} (${account.account_number})`;
    
    const resultDiv = document.getElementById('deleteResult');
    if (resultDiv) resultDiv.innerHTML = '';
    
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function deleteAccount() {
    const accNo = document.getElementById('deleteAccNo').value;
    const result = bank.deleteAccount(accNo);
    
    if (result.success) {
        showMessage('Account closed successfully!', 'success', 'deleteResult');
        setTimeout(() => {
            closeDeleteModal();
        }, 1500);
    } else {
        showMessage(result.message, 'error', 'deleteResult');
    }
}

// --- File Exports & Summary ---
function exportAccounts() {
    const accounts = bank.accounts;
    let csv = 'Account No,Name,Father Name,Phone,Email,Type,Balance,Status\n';
    
    accounts.forEach(account => {
        csv += `${account.account_number},"${account.candidate_name}","${account.father_name}",${account.phone},${account.email},${account.account_type},${account.balance},${account.locked ? 'Locked' : 'Active'}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showMessage('Accounts exported successfully!', 'success', 'accounts');
}

function printAccountSummary() {
    const summary = document.getElementById('accountSummary');
    if (!summary) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Account Opening Receipt</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; background: #f8fafc; }');
    printWindow.document.write('.header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 30px; }');
    printWindow.document.write('.header h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; letter-spacing: 0.5px; }');
    printWindow.document.write('.header p { font-size: 13px; color: #64748b; margin-top: 5px; }');
    printWindow.document.write('.receipt-body { background: #ffffff; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }');
    printWindow.document.write('.receipt-body h4 { display: none; }');
    printWindow.document.write('.receipt-body p { margin-bottom: 10px; font-size: 14px; color: #334155; line-height: 1.6; }');
    printWindow.document.write('.receipt-body strong { color: #0f172a; width: 180px; display: inline-block; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div class="header"><h2>SECURE BANKING SYSTEM</h2><p>Official Account Opening Receipt & Record</p></div>');
    printWindow.document.write('<div class="receipt-body">');
    printWindow.document.write(document.getElementById('summaryContent').innerHTML);
    printWindow.document.write('</div>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// --- Quick Action Bridges ---
function quickDeposit(accountNumber) {
    showSection('deposit');
    document.getElementById('depositAcc').value = accountNumber;
    document.getElementById('depositAcc').focus();
}

function quickWithdraw(accountNumber) {
    showSection('withdraw');
    document.getElementById('withdrawAcc').value = accountNumber;
    autoFillWithdrawDetails();
    document.getElementById('withdrawAmount').focus();
}

function quickTransfer(accountNumber) {
    showSection('transfer');
    document.getElementById('transferFrom').value = accountNumber;
    autoFillTransferDetails();
    document.getElementById('transferTo').focus();
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
    try {
        bindDeclaredActions();
        updateDashboardUI();
        setupOTPInputs();
        onReportTypeChange();
    } catch (error) {
        console.error('App startup failed:', error);
        const authResult = document.getElementById('authResult');
        if (authResult) {
            authResult.innerHTML = `
                <div class="message message-error">
                    JavaScript startup error: ${error.message}
                </div>
            `;
        }
    }

    document.getElementById('withdrawAcc')?.addEventListener('blur', autoFillWithdrawDetails);
    document.getElementById('transferFrom')?.addEventListener('blur', autoFillTransferDetails);
    document.getElementById('transferTo')?.addEventListener('blur', autoFillTransferDetails);
    document.getElementById('loanAcc')?.addEventListener('blur', autoFillLoanDetails);
    
    document.getElementById('searchAccInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchAccount();
    });
    
    document.getElementById('quickSearch')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') quickSearchAccount();
    });

    document.querySelectorAll('.stat-card-clickable').forEach(card => {
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                card.click();
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        if (e.target === editModal) {
            closeEditModal();
        }
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
});
