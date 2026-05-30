// ==================== DASHBOARD RENDERING & STATE UPDATES ====================

function updateCustomerDashboardUI() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    // Fetch fresh details from storage
    const account = bank.getAccount(activeSessionUser.account_number);
    if (!account) return;
    activeSessionUser = account;
    
    // Render profile details
    document.getElementById('custBalanceDisplay').textContent = `Rs. ${(account.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('profAccNo').textContent = account.account_number || "N/A";
    document.getElementById('profAccType').textContent = (account.account_type || "Savings") + " Account";
    document.getElementById('profPhone').textContent = account.phone || "N/A";
    document.getElementById('profEmail').textContent = account.email || "N/A";
    document.getElementById('profAadhaar').textContent = account.aadhaar_number ? String(account.aadhaar_number).replace(/\d(?=\d{4})/g, "*") : "N/A";
    document.getElementById('profStatus').textContent = account.locked ? "Locked" : "Active";
    document.getElementById('profAddress').textContent = account.address || "No address on record";

    // Card visual updates
    document.getElementById('cardNoDisplay').textContent = account.card_number || "**** **** **** ****";
    document.getElementById('cardHolderDisplay').textContent = (account.candidate_name || "Guest").toUpperCase();
    document.getElementById('cardExpiryDisplay').textContent = account.card_expiry || "12/30";
    
    const visualBox = document.getElementById('virtualCardVisual');
    if (visualBox) {
        if (account.card_blocked) {
            visualBox.style.background = 'linear-gradient(135deg, #475569, #1e293b)'; // Slate gray block style
            visualBox.style.opacity = '0.6';
        } else {
            visualBox.style.background = 'linear-gradient(135deg, #1e293b, #3b82f6)';
            visualBox.style.opacity = '1';
        }
    }

    // Render customer specific transactions
    const tbody = document.getElementById('custTransactionsBody');
    if (tbody) {
        const userTxs = (bank.transactions || []).filter(tx => tx.account_number == account.account_number).sort((a,b) => b.timestamp - a.timestamp);
        if (userTxs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 15px;">No transactions found</td></tr>`;
        } else {
            tbody.innerHTML = userTxs.map(tx => {
                let color = '#10b981';
                let isOut = tx.type.includes('Withdrawal') || tx.type.includes('Out') || tx.type.includes('Bill') || tx.type.includes('EMI');
                if (isOut) color = '#ef4444';
                
                return `
                    <tr>
                        <td>${new Date(tx.date).toLocaleDateString()} ${new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td>
                            <span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; background: ${color}15; color: ${color};">
                                ${tx.type}
                            </span>
                        </td>
                        <td>${tx.description || ''}</td>
                        <td>${tx.mode || 'Online'}</td>
                        <td style="font-weight: 600; color: ${color};">${isOut ? '-' : '+'}Rs. ${(tx.amount || 0).toLocaleString()}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function getLocalDateKey(dateValue) {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isCreditTransaction(tx) {
    return tx.type === 'Deposit' || tx.type === 'Transfer In';
}

function getCreditTransactions() {
    return (bank.transactions || []).filter(isCreditTransaction);
}

function updateCreditDateWiseUI() {
    const tbody = document.getElementById('depositDateWiseBody');
    if (!tbody) return;

    const totalsByDate = getCreditTransactions().reduce((groups, tx) => {
        const key = getLocalDateKey(tx.date || tx.timestamp || Date.now());
        if (!groups[key]) {
            groups[key] = { date: key, count: 0, total: 0 };
        }
        groups[key].count += 1;
        groups[key].total += parseFloat(tx.amount || 0);
        return groups;
    }, {});

    const rows = Object.values(totalsByDate)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10);

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 15px;">No credits recorded yet</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(row => `
        <tr>
            <td>${new Date(`${row.date}T00:00:00`).toLocaleDateString()}</td>
            <td>${row.count}</td>
            <td style="font-weight: 700; color: var(--success-color);">Rs. ${row.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
    `).join('');
}

function updateDashboardUI() {
    const todayKey = getLocalDateKey(new Date());
    const todayCredits = getCreditTransactions()
        .filter(tx => getLocalDateKey(tx.date || tx.timestamp || Date.now()) === todayKey)
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
    const activeAccounts = bank.accounts.filter(acc => !acc.locked).length;
    const lockedAccounts = bank.accounts.filter(acc => acc.locked).length;
    const activeLoans = bank.loans.filter(loan =>
        (loan.status === 'Active' || loan.status === 'Approved') &&
        parseFloat(loan.outstanding || loan.amount || 0) > 0
    ).length;

    const depositElem = document.getElementById('statTotalDeposits');
    if (depositElem) depositElem.textContent = `Rs. ${todayCredits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const activeElem = document.getElementById('statActiveAccounts');
    if (activeElem) activeElem.textContent = activeAccounts;
    
    const lockedElem = document.getElementById('statLockedAccounts');
    if (lockedElem) lockedElem.textContent = lockedAccounts;
    
    const loansElem = document.getElementById('statActiveLoans');
    if (loansElem) loansElem.textContent = activeLoans;

    updateCreditDateWiseUI();

    const recentBody = document.getElementById('recentTransactionsBody');
    if (recentBody) {
        const sortedTransactions = [...bank.transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        if (sortedTransactions.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666; padding: 15px;">No recent transactions</td></tr>`;
        } else {
            recentBody.innerHTML = sortedTransactions.map(tx => {
                let badgeColor = '#10b981';
                let isOut = tx.type.includes('Withdrawal') || tx.type.includes('Out') || tx.type.includes('Bill') || tx.type.includes('EMI');
                if (isOut) {
                    badgeColor = '#ef4444';
                }
                return `
                    <tr>
                        <td>${tx.account_number}</td>
                        <td>
                            <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}25;">
                                ${tx.type}
                            </span>
                        </td>
                        <td style="font-weight: 600; color: ${badgeColor};">${isOut ? '-' : '+'}Rs. ${tx.amount.toLocaleString()}</td>
                        <td>${tx.mode}</td>
                        <td>${new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}


