// ==================== MODALS & LOADER OVERLAYS HTML TEMPLATE ====================

const modalsTemplate = `
    <!-- Loading Overlay -->
    <div class="loading" id="loading">
        <div class="spinner"></div>
    </div>

    <!-- Edit Account Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-user-edit"></i> Edit Account Details</h3>
                <span class="close-modal" onclick="closeEditModal()">&times;</span>
            </div>
            <div class="modal-body">
                <input type="hidden" id="editAccNo">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" id="editName">
                    </div>
                    <div class="form-group">
                        <label>Father's Name *</label>
                        <input type="text" id="editFather">
                    </div>
                    <div class="form-group">
                        <label>Phone Number *</label>
                        <input type="tel" id="editPhone">
                    </div>
                    <div class="form-group">
                        <label>Email Address *</label>
                        <input type="email" id="editEmail">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Account Type</label>
                        <select id="editType">
                            <option value="Savings">Savings Account</option>
                            <option value="Current">Current Account</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Account Status</label>
                        <select id="editStatus">
                            <option value="active">Active</option>
                            <option value="locked">Locked</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea id="editAddress" rows="2"></textarea>
                </div>
                <div class="form-group">
                    <label>Reset PIN (4 digits, leave blank to keep current)</label>
                    <input type="password" id="editPin" maxlength="4" placeholder="Enter new PIN">
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-danger" onclick="closeEditModal()">Cancel</button>
                    <button class="btn btn-success" onclick="saveAccountEdits()">Save Changes</button>
                </div>
                <div id="editResult"></div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header" style="background: var(--accent-color); color: white;">
                <h3><i class="fas fa-exclamation-triangle"></i> Close/Delete Account</h3>
                <span class="close-modal" onclick="closeDeleteModal()" style="color: white;">&times;</span>
            </div>
            <div class="modal-body" style="text-align: center; padding: 25px;">
                <input type="hidden" id="deleteAccNo">
                <i class="fas fa-university" style="font-size: 48px; color: var(--accent-color); margin-bottom: 15px;"></i>
                <p style="font-size: 16px; margin-bottom: 15px;">Are you sure you want to close account <strong id="deleteAccDisplay"></strong>?</p>
                <p style="color: #666; font-size: 14px; margin-bottom: 25px;">This will permanently close the account and remove it from active records. All balance must be withdrawn first.</p>
                
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button class="btn" onclick="closeDeleteModal()">No, Keep Open</button>
                    <button class="btn btn-danger" onclick="deleteAccount()">Yes, Close Account</button>
                </div>
                <div id="deleteResult" style="margin-top: 15px;"></div>
            </div>
        </div>
    </div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    div.id = 'modalsWrapper';
    div.innerHTML = modalsTemplate;
    document.body.appendChild(div);
});
