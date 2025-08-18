// Main Application Logic for Misconduct Logger

// DOM Elements
const photoButton = document.getElementById('photo-button');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const selectedPhoto = document.getElementById('selected-photo');
const defaultPhotoIcon = document.getElementById('default-photo-icon');
const suspectForm = document.getElementById('suspect-form');
const successModal = document.getElementById('success-modal');
const shareWhatsappBtn = document.getElementById('share-whatsapp');
const saveToDeviceBtn = document.getElementById('save-to-device');
const newEntryBtn = document.getElementById('new-entry');

// Current suspect data
let currentSuspectData = {
    photo: null,
    timestamp: null
};

// Initialize the application
function initApp() {
    // Photo capture/upload functionality
    photoButton.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                selectedPhoto.src = e.target.result;
                selectedPhoto.style.display = 'block';
                defaultPhotoIcon.style.display = 'none';
                currentSuspectData.photo = e.target.result;
            };
            
            reader.readAsDataURL(file);
        }
    });

    // Form submission
    suspectForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveSuspectData();
    });

    // Modal actions
    shareWhatsappBtn.addEventListener('click', shareViaWhatsapp);
    saveToDeviceBtn.addEventListener('click', saveImageToDevice);
    newEntryBtn.addEventListener('click', resetForm);

    // Check for camera support
    if (!('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)) {
        photoButton.textContent = 'تحميل صورة';
        console.log('Camera API not supported - falling back to file upload only');
    }
}

// Save suspect data
function saveSuspectData() {
    // Get form data
    const formData = {
        fullname: document.getElementById('fullname').value,
        birthdate: document.getElementById('birthdate').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        idNumber: document.getElementById('id-number').value,
        phone: document.getElementById('phone').value,
        notes: document.getElementById('notes').value,
        timestamp: new Date().toLocaleString('ar-SA')
    };

    // Combine with photo data
    currentSuspectData = {
        ...currentSuspectData,
        ...formData
    };

    // Save to local storage
    const savedEntries = JSON.parse(localStorage.getItem('suspectEntries') || '[]');
    savedEntries.push(currentSuspectData);
    localStorage.setItem('suspectEntries', JSON.stringify(savedEntries));

    // Generate card image
    generateSuspectCard(currentSuspectData);

    // Show success modal
    successModal.style.display = 'flex';
}

// Generate suspect info card as an image
function generateSuspectCard(data) {
    // Create a virtual canvas to generate the card image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 1000;
    
    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
    
    // Add header
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, 0, canvas.width, 100);
    
    // Add title
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('بطاقة معلومات المتهم', canvas.width / 2, 60);
    
    // Add photo if available
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Draw circular photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 220, 120, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Wait for image to load
        img.onload = function() {
            ctx.drawImage(img, canvas.width / 2 - 120, 100, 240, 240);
            ctx.restore();
            
            // Continue with drawing text after image loads
            drawSuspectInfo();
            
            // Save the final image
            currentSuspectData.cardImage = canvas.toDataURL('image/png');
        };
    } else {
        // No photo, just draw the info
        drawSuspectInfo();
        currentSuspectData.cardImage = canvas.toDataURL('image/png');
    }
    
    function drawSuspectInfo() {
        // Text settings
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info
        const startY = 380;
        const lineHeight = 60;
        
        // Draw labels and values
        drawTextLine('الاسم الكامل:', data.fullname, startY);
        drawTextLine('تاريخ الميلاد:', formatDate(data.birthdate), startY + lineHeight);
        drawTextLine('عنوان السكن:', data.address, startY + lineHeight * 2);
        drawTextLine('المدينة:', data.city, startY + lineHeight * 3);
        
        if (data.idNumber) {
            drawTextLine('رقم الهوية:', data.idNumber, startY + lineHeight * 4);
        }
        
        if (data.phone) {
            drawTextLine('رقم الهاتف:', data.phone, startY + lineHeight * 5);
        }
        
        if (data.notes) {
            ctx.font = 'bold 30px Arial';
            ctx.fillText('ملاحظات:', canvas.width - 50, startY + lineHeight * 6);
            
            ctx.font = '26px Arial';
            wrapText(ctx, data.notes, canvas.width - 50, startY + lineHeight * 6 + 40, canvas.width - 100, 30);
        }
        
        // Add timestamp
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#777777';
        ctx.textAlign = 'center';
        ctx.fillText('تاريخ التسجيل: ' + data.timestamp, canvas.width / 2, canvas.height - 50);
    }
    
    function drawTextLine(label, value, y) {
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#333333';
        ctx.fillText(label, canvas.width - 50, y);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = '#555555';
        ctx.fillText(value, canvas.width - 250, y);
    }
}

// Format date to Arabic format
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Wrap text function for canvas
function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    
    context.fillText(line, x, y);
}

// Share via WhatsApp
function shareViaWhatsapp() {
    if (currentSuspectData.cardImage) {
        // Save the image to device
        saveImageToDevice();
        
        // Prepare WhatsApp message
        const message = 'معلومات المتهم: ' + currentSuspectData.fullname;
        const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(message);
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    }
}

// Function to save image to device
function saveImageToDevice() {
    try {
        // Create a temporary link to download the image
        const tempLink = document.createElement('a');
        tempLink.href = currentSuspectData.cardImage;
        tempLink.download = 'suspect_card_' + new Date().getTime() + '.png';
        
        // Explicitly set attributes for better compatibility
        tempLink.setAttribute('download', 'suspect_card_' + new Date().getTime() + '.png');
        tempLink.setAttribute('href', currentSuspectData.cardImage.replace(/^data:image\/[^;]+/, 'data:application/octet-stream'));
        tempLink.setAttribute('target', '_blank');
        
        // Append to body, click, and remove
        document.body.appendChild(tempLink);
        tempLink.click();
        
        // Add a small delay before removing the link
        setTimeout(() => {
            document.body.removeChild(tempLink);
            alert('تم حفظ البطاقة في جهازك');
        }, 100);
    } catch (error) {
        console.error('Error saving image:', error);
        alert('حدث خطأ أثناء حفظ الصورة. يرجى المحاولة مرة أخرى.');
    }
}

// Reset form for new entry
function resetForm() {
    suspectForm.reset();
    selectedPhoto.style.display = 'none';
    defaultPhotoIcon.style.display = 'block';
    currentSuspectData = {
        photo: null,
        timestamp: null
    };
    successModal.style.display = 'none';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);