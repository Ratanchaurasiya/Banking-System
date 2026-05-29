// ==================== CARD SETTINGS CONTROLLERS ====================

function loadCardSettingsUI() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    const account = bank.getAccount(activeSessionUser.account_number);
    
    document.getElementById('settingsCardNo').textContent = account.card_number;
    document.getElementById('settingsCardHolder').textContent = account.candidate_name.toUpperCase();
    document.getElementById('settingsCardExpiry').textContent = account.card_expiry;
    document.getElementById('cardStatusToggle').checked = account.card_blocked;
    document.getElementById('cardAtmLimit').value = account.card_limit_atm;
    document.getElementById('cardOnlineLimit').value = account.card_limit_online;
    
    const settingsVisual = document.getElementById('settingsCardVisual');
    if (account.card_blocked) {
        settingsVisual.style.background = 'linear-gradient(135deg, #475569, #1e293b)';
        settingsVisual.style.opacity = '0.6';
    } else {
        settingsVisual.style.background = 'linear-gradient(135deg, #0f172a, #2563eb)';
        settingsVisual.style.opacity = '1';
    }
}

function toggleCardBlock() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    const account = bank.getAccount(activeSessionUser.account_number);
    const toggleChecked = document.getElementById('cardStatusToggle').checked;
    
    account.card_blocked = toggleChecked;
    bank.saveData();
    
    loadCardSettingsUI();
    
    const msg = toggleChecked ? "Debit Card frozen and blocked successfully." : "Debit Card unlocked and active.";
    showMessage(msg, toggleChecked ? 'warning' : 'success', 'cardSettingsResult');
}

function saveCardLimits() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    const account = bank.getAccount(activeSessionUser.account_number);
    const atm = parseFloat(document.getElementById('cardAtmLimit').value);
    const online = parseFloat(document.getElementById('cardOnlineLimit').value);
    
    if (isNaN(atm) || atm < 0 || isNaN(online) || online < 0) {
        showMessage('Please enter valid, positive numeric limits!', 'error', 'cardSettingsResult');
        return;
    }
    
    account.card_limit_atm = atm;
    account.card_limit_online = online;
    bank.saveData();
    
    showMessage('Daily card transaction limits saved successfully!', 'success', 'cardSettingsResult');
}

function changeCustomerPin() {
    if (activeRole !== 'customer' || !activeSessionUser) return;
    
    const oldPin = document.getElementById('settingsOldPin').value;
    const newPin = document.getElementById('settingsNewPin').value;
    const confPin = document.getElementById('settingsConfPin').value;
    
    if (!oldPin || !newPin || !confPin) {
        showMessage('Please fill all PIN boxes!', 'error', 'settingsResult');
        return;
    }
    
    if (newPin.length !== 4 || confPin.length !== 4) {
        showMessage('PIN must be exactly 4 digits!', 'error', 'settingsResult');
        return;
    }
    
    if (newPin !== confPin) {
        showMessage('New PIN and Confirm PIN do not match!', 'error', 'settingsResult');
        return;
    }
    
    const result = bank.changePin(activeSessionUser.account_number, oldPin, newPin);
    
    if (result.success) {
        showMessage('Security PIN updated successfully!', 'success', 'settingsResult');
        document.getElementById('settingsOldPin').value = '';
        document.getElementById('settingsNewPin').value = '';
        document.getElementById('settingsConfPin').value = '';
    } else {
        showMessage(result.message, 'error', 'settingsResult');
    }
}
