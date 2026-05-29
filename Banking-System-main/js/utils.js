// ==================== SHARED UTILITIES & HELPERS ====================

let uploadedPhotoBase64 = null;

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
    }
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
