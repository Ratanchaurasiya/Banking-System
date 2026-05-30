// ==================== SHARED UTILITIES & HELPERS ====================

let uploadedPhotoBase64 = null;
const receiptMemoryStore = {};

function readLocalArray(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        return [];
    }
}

function writeLocalArray(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Unable to save ${key}.`, error);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    return container;
}

function showToast(title, message, type = 'info') {
    if (!document.body) return;

    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(message)}</p>
        </div>
        <button class="toast-close" type="button" aria-label="Close notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });

    container.prepend(toast);
    setTimeout(() => {
        toast.classList.add('toast-leaving');
        setTimeout(() => toast.remove(), 250);
    }, 4500);
}

function getCurrentNotificationScope() {
    if (typeof activeRole !== 'undefined' && activeRole === 'customer' && activeSessionUser) {
        return {
            audience: 'customer',
            accountNumber: String(activeSessionUser.account_number)
        };
    }

    if (typeof activeRole !== 'undefined' && activeRole === 'staff') {
        return {
            audience: 'staff',
            accountNumber: null
        };
    }

    return {
        audience: 'system',
        accountNumber: null
    };
}

function isNotificationVisible(item) {
    const scope = getCurrentNotificationScope();

    if (scope.audience === 'customer') {
        return item.audience === 'customer' && String(item.accountNumber) === scope.accountNumber;
    }

    if (scope.audience === 'staff') {
        return item.audience !== 'customer';
    }

    return item.audience === 'system';
}

function notifyUser(title, message, type = 'info') {
    const cleanTitle = String(title || 'Notification');
    const cleanMessage = String(message || '');
    const scope = getCurrentNotificationScope();
    const notifications = readLocalArray('bankNotifications');
    notifications.unshift({
        id: Date.now(),
        title: cleanTitle,
        message: cleanMessage,
        type,
        audience: scope.audience,
        accountNumber: scope.accountNumber,
        date: new Date().toISOString()
    });

    writeLocalArray('bankNotifications', notifications.slice(0, 25));
    renderNotifications();
    showToast(cleanTitle, cleanMessage, type);
}

function getNotificationLabel(type) {
    if (type === 'success') return 'Success';
    if (type === 'error') return 'Error';
    if (type === 'warning') return 'Warning';
    return 'Info';
}

function logAudit(action, detail, metadata = {}) {
    const auditTrail = readLocalArray('bankAuditTrail');
    auditTrail.unshift({
        id: Date.now(),
        action,
        detail,
        metadata,
        role: typeof activeRole !== 'undefined' && activeRole ? activeRole : 'system',
        user: typeof activeSessionUser !== 'undefined' && activeSessionUser
            ? activeSessionUser.candidate_name || activeSessionUser
            : 'Guest',
        date: new Date().toISOString()
    });

    writeLocalArray('bankAuditTrail', auditTrail.slice(0, 100));
}

function renderNotifications() {
    const countElement = document.getElementById('notificationCount');
    const listElement = document.getElementById('notificationList');
    const previewElement = document.getElementById('latestNotificationPreview');
    const summaryElement = document.getElementById('notificationSummary');
    if (!countElement || !listElement) return;

    const notifications = readLocalArray('bankNotifications')
        .filter(item => item && (item.title || item.message))
        .map((item, index) => ({
            id: item.id || Date.now() + index,
            title: String(item.title || 'Notification'),
            message: String(item.message || 'No details available.'),
            type: item.type || 'info',
            audience: item.audience || 'system',
            accountNumber: item.accountNumber ? String(item.accountNumber) : null,
            date: item.date || new Date().toISOString()
        }))
        .filter(isNotificationVisible);

    countElement.textContent = notifications.length > 9 ? '9+' : notifications.length;
    countElement.classList.toggle('has-items', notifications.length > 0);

    if (notifications.length === 0) {
        listElement.innerHTML = '<p class="empty-state">No notifications yet.</p>';
        if (previewElement) previewElement.textContent = 'No new updates';
        if (summaryElement) summaryElement.textContent = 'No notifications yet.';
        return;
    }

    if (previewElement) {
        const latest = notifications[0];
        previewElement.textContent = `${latest.title}: ${latest.message}`;
    }

    if (summaryElement) {
        summaryElement.textContent = `Showing ${notifications.length} notification${notifications.length === 1 ? '' : 's'}`;
    }

    listElement.innerHTML = notifications.map((item, index) => `
        <div class="notification-item notification-${item.type || 'info'}">
            <div class="notification-meta-row">
                <span class="notification-type-badge">#${index + 1} ${getNotificationLabel(item.type)}</span>
                <span class="notification-time">${new Date(item.date).toLocaleString()}</span>
            </div>
            <strong class="notification-title">${escapeHtml(item.title)}</strong>
            <p class="notification-message">${escapeHtml(item.message || 'No details available.')}</p>
        </div>
    `).join('');
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;

    panel.classList.toggle('active');
    renderNotifications();
}

function clearNotifications() {
    const remainingNotifications = readLocalArray('bankNotifications')
        .filter(item => !isNotificationVisible({
            ...item,
            audience: item.audience || 'system',
            accountNumber: item.accountNumber ? String(item.accountNumber) : null
        }));

    writeLocalArray('bankNotifications', remainingNotifications);
    renderNotifications();
}

function renderAuditTrail() {
    const tbody = document.getElementById('auditTrailBody');
    if (!tbody) return;

    const auditTrail = readLocalArray('bankAuditTrail');
    if (auditTrail.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 18px;">No audit records yet.</td></tr>';
        return;
    }

    tbody.innerHTML = auditTrail.map(item => `
        <tr>
            <td>${new Date(item.date).toLocaleString()}</td>
            <td>${item.role}</td>
            <td>${item.user}</td>
            <td>${item.action}</td>
            <td>${item.detail}</td>
        </tr>
    `).join('');
}

function clearAuditTrail() {
    writeLocalArray('bankAuditTrail', []);
    renderAuditTrail();
    notifyUser('Audit trail cleared', 'All local audit records were removed.', 'warning');
}

function showMessage(message, type, elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="message message-${type}">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            element.innerHTML = '';
        }, 5000);

        if (type === 'success' || type === 'warning' || type === 'error') {
            const title = type === 'success' ? 'Action completed' : type === 'warning' ? 'Attention needed' : 'Action failed';
            notifyUser(title, message.replace(/<[^>]*>/g, ''), type);
        }
    }
}

function createReceiptRecord(details) {
    const receipt = {
        id: details.id || `RCP-${Date.now().toString().slice(-8)}`,
        bankName: 'HexChal Digital Bank',
        createdAt: details.createdAt || new Date().toISOString(),
        title: details.title || 'Transaction Receipt',
        status: details.status || 'Successful',
        rows: details.rows || []
    };

    const receipts = readLocalArray('bankReceipts');
    receipts.unshift(receipt);
    writeLocalArray('bankReceipts', receipts.slice(0, 100));
    receiptMemoryStore[receipt.id] = receipt;
    return receipt;
}

function renderReceiptDownloadButton(receipt) {
    if (!receipt) return '';
    return `
        <button class="btn receipt-download-btn" type="button" data-receipt-id="${escapeHtml(receipt.id)}" style="margin-top: 10px;">
            <i class="fas fa-download"></i> Download Receipt
        </button>
        <button class="btn receipt-open-btn" type="button" data-receipt-id="${escapeHtml(receipt.id)}" style="margin-top: 10px;">
            <i class="fas fa-eye"></i> Open Receipt
        </button>
    `;
}

function getReceiptById(receiptId) {
    return receiptMemoryStore[receiptId] || readLocalArray('bankReceipts').find(item => item.id === receiptId);
}

function buildReceiptHtml(receipt) {
    const rows = receipt.rows.map(row => `
        <tr>
            <th>${escapeHtml(row.label)}</th>
            <td>${escapeHtml(row.value)}</td>
        </tr>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(receipt.title)} - ${escapeHtml(receipt.id)}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 32px; }
        .receipt { max-width: 720px; margin: 0 auto; background: #fff; border: 1px solid #dbe3ef; border-radius: 10px; padding: 28px; }
        h1 { margin: 0; color: #1d4ed8; font-size: 24px; }
        h2 { margin: 8px 0 20px; font-size: 18px; color: #334155; }
        .meta { color: #64748b; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
        th { width: 38%; color: #475569; background: #f8fafc; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; }
        .footer { margin-top: 24px; color: #64748b; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="receipt">
        <h1>${escapeHtml(receipt.bankName)}</h1>
        <h2>${escapeHtml(receipt.title)}</h2>
        <p class="meta">Receipt ID: <strong>${escapeHtml(receipt.id)}</strong> | Date: ${new Date(receipt.createdAt).toLocaleString()}</p>
        <p><span class="status">${escapeHtml(receipt.status)}</span></p>
        <table>${rows}</table>
        <p class="footer">This is a computer generated receipt for demo banking records.</p>
    </div>
</body>
</html>`;
}

function downloadReceipt(receiptId) {
    const receipt = getReceiptById(receiptId);
    if (!receipt) {
        showToast('Receipt missing', 'Receipt data was not found. Please try the transaction again.', 'error');
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        openReceipt(receiptId);
        showToast('PDF tool loading', 'Receipt opened for viewing. Please try Download Receipt again in a moment for PDF.', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = 18;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 34, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(receipt.bankName, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Official Digital Banking Receipt', margin, y + 8);

    y = 48;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(receipt.title, margin, y);

    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Receipt ID: ${receipt.id}`, margin, y);
    doc.text(`Date: ${new Date(receipt.createdAt).toLocaleString()}`, pageWidth - margin, y, { align: 'right' });

    y += 10;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(margin, y - 6, 68, 9, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.status, margin + 3, y);

    y += 13;
    doc.setTextColor(15, 23, 42);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);

    receipt.rows.forEach(row => {
        const label = String(row.label);
        const valueLines = doc.splitTextToSize(String(row.value ?? ''), pageWidth - margin * 2 - 60);
        const rowHeight = Math.max(10, valueLines.length * 5 + 5);

        if (y + rowHeight > pageHeight - 22) {
            doc.addPage();
            y = 18;
        }

        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, 55, rowHeight, 'F');
        doc.rect(margin + 55, y, pageWidth - margin * 2 - 55, rowHeight);
        doc.rect(margin, y, 55, rowHeight);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text(label, margin + 3, y + 7);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(valueLines, margin + 60, y + 7);
        y += rowHeight;
    });

    y += 10;
    if (y > pageHeight - 20) {
        doc.addPage();
        y = 18;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer generated receipt for demo banking records.', pageWidth / 2, y, { align: 'center' });

    const fileTitle = receipt.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
    doc.save(`${receipt.id}-${fileTitle}.pdf`);
    showToast('Receipt ready', 'PDF receipt download has started.', 'success');
}

document.addEventListener('click', event => {
    const button = event.target.closest('.receipt-download-btn, .receipt-open-btn');
    if (!button) return;

    event.preventDefault();
    if (button.classList.contains('receipt-open-btn')) {
        openReceipt(button.dataset.receiptId);
    } else {
        downloadReceipt(button.dataset.receiptId);
    }
});

function openReceipt(receiptId) {
    const receipt = getReceiptById(receiptId);
    if (!receipt) return;

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
        showToast('Popup blocked', 'Allow popups or use Download Receipt again.', 'warning');
        return;
    }

    receiptWindow.document.write(buildReceiptHtml(receipt));
    receiptWindow.document.close();
}

function previewPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('photoPreview').src = e.target.result;
            uploadedPhotoBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function moveToNext(el, nextIndex) {
    const inputs = document.querySelectorAll('.otp-inputs input');
    if (inputs[nextIndex - 1]) {
        inputs[nextIndex - 1].focus();
    }
}

function setupOTPInputs() {
    const inputs = document.querySelectorAll('.otp-inputs input');
    
    inputs.forEach((input, index) => {
        // Clear direct inline attribute if dynamic behavior overrides
        input.removeAttribute('oninput');
        
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (input.value === '' && index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = '';
                } else {
                    input.value = '';
                }
                e.preventDefault();
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
            if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
                for (let i = 0; i < 6; i++) {
                    inputs[i].value = pasteData[i];
                }
                inputs[5].focus();
            }
        });
    });
}


