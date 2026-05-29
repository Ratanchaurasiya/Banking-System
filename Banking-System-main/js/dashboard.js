// ==================== DASHBOARD RENDERING & STATE UPDATES ====================

function updateCustomerDashboardUI() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    // Fetch fresh details from storage
    const account = bank.getAccount(activeSessionUser.account_number);
    if (!account) return;
    activeSessionUser = account;
    
    // Render profile details
    document.getElementById('custBalanceDisplay').textContent = `₹${(account.balance || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
    document.getElementById('profAccNo').textContent = account.account_number || "N/A";
    document.getElementById('profAccType').textContent = (account.account_type || "Savings") + " Account";
    document.getElementById('profPhone').textContent = account.phone || "N/A";
    document.getElementById('profEmail').textContent = account.email || "N/A";
    document.getElementById('profAadhaar').textContent = account.aadhaar_number ? String(account.aadhaar_number).replace(/\d(?=\d{4})/g, "•") : "N/A";
    document.getElementById('profStatus').textContent = account.locked ? "🔒 Locked" : "✅ Active";
    document.getElementById('profAddress').textContent = account.address || "No address on record";

    // Card visual updates
    document.getElementById('cardNoDisplay').textContent = account.card_number || "•••• •••• •••• ••••";
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
                let isOut = tx.type.includes('Withdrawal') || tx.type.includes('Out') || tx.type.includes('Bill');
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
                        <td style="font-weight: 600; color: ${color};">${isOut ? '-' : '+'}₹${(tx.amount || 0).toLocaleString()}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function updateDashboardUI() {
    const totalDeposits = bank.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const activeAccounts = bank.accounts.filter(acc => !acc.locked).length;
    const lockedAccounts = bank.accounts.filter(acc => acc.locked).length;
    const activeLoans = bank.loans.length;

    const depositElem = document.getElementById('statTotalDeposits');
    if (depositElem) depositElem.textContent = `₹${totalDeposits.toLocaleString()}`;
    
    const activeElem = document.getElementById('statActiveAccounts');
    if (activeElem) activeElem.textContent = activeAccounts;
    
    const lockedElem = document.getElementById('statLockedAccounts');
    if (lockedElem) lockedElem.textContent = lockedAccounts;
    
    const loansElem = document.getElementById('statActiveLoans');
    if (loansElem) loansElem.textContent = activeLoans;

    const recentBody = document.getElementById('recentTransactionsBody');
    if (recentBody) {
        const sortedTransactions = [...bank.transactions].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        if (sortedTransactions.length === 0) {
            recentBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #666; padding: 15px;">No recent transactions</td></tr>`;
        } else {
            recentBody.innerHTML = sortedTransactions.map(tx => {
                let badgeColor = '#10b981';
                let isOut = tx.type.includes('Withdrawal') || tx.type.includes('Out') || tx.type.includes('Bill');
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
                        <td style="font-weight: 600; color: ${badgeColor};">${isOut ? '-' : '+'}₹${tx.amount.toLocaleString()}</td>
                        <td>${tx.mode}</td>
                        <td>${new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                `;
            }).join('');
        }
    }
}
