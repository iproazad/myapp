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
        issueType: document.getElementById('issue-type').value,
        familyStatus: document.getElementById('family-status').value,
        job: document.getElementById('job').value,
        imprisonment: document.getElementById('imprisonment').value,
        phone: document.getElementById('phone').value,
        sentTo: document.getElementById('sent-to').value,
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
    canvas.width = 1000;
    canvas.height = 800;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f5f7fa');
    gradient.addColorStop(1, '#e4e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add rounded rectangle background
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 15, true, false);
    
    // Add border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 15, false, true);
    
    // Add header with gradient
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#3498db');
    headerGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 20, 20, canvas.width - 40, 100, {tl: 15, tr: 15, bl: 0, br: 0}, true, false);
    
    // Add decorative line under header
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(50, 130, canvas.width - 100, 3);
    
    // Add title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 42px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('كارتا زانیاریێن تومەتباری', canvas.width / 2, 80);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw suspect info first
    drawSuspectInfo();
    
    // Add photo if available
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Draw photo background and frame - positioned on the right side
        const photoX = canvas.width - 250; // Right side position
        const photoY = canvas.height / 2; // Vertical center
        const photoRadius = 150;
        
        // Draw photo background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Add photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius, 0, Math.PI * 2, true);
        ctx.stroke();
        
        // Add decorative elements around photo
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x = photoX + Math.cos(angle) * (photoRadius + 20);
            const y = photoY + Math.sin(angle) * (photoRadius + 20);
            
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2, true);
            ctx.fill();
        }
        
        // Draw circular photo
        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius - 5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        // Wait for image to load
        img.onload = function() {
            // Draw the image to fill the circular area
            ctx.drawImage(img, photoX - (photoRadius - 5), photoY - (photoRadius - 5), (photoRadius - 5) * 2, (photoRadius - 5) * 2);
            ctx.restore();
            
            // Save the final image
            currentSuspectData.cardImage = canvas.toDataURL('image/png');
        };
    } else {
        // No photo, draw a placeholder on the right side
        const photoX = canvas.width - 250; // Right side position
        const photoY = canvas.height / 2; // Vertical center
        const photoRadius = 150;
        
        // Background circle
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(photoX, photoY, photoRadius - 5, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Add photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 220, 125, 0, Math.PI * 2, true);
        ctx.stroke();
        
        // Draw user icon
        ctx.fillStyle = '#bdc3c7';
        // Head
        ctx.beginPath();
        ctx.arc(photoX, photoY - 50, 60, 0, Math.PI * 2, true);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.arc(photoX, photoY + 70, 80, Math.PI, 0, true);
        ctx.fill();
        
        // Continue with drawing text
        drawSuspectInfo();
        currentSuspectData.cardImage = canvas.toDataURL('image/png');
    }
    
    function drawSuspectInfo() {
        // Draw info section background - positioned on the left side
        const infoX = 50;
        const infoY = 150;
        const infoWidth = canvas.width - 400; // Leave space for photo on right
        const infoHeight = canvas.height - 250; // Leave space for header and footer
        
        ctx.fillStyle = '#f8f9fa';
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, true, false);
        
        // Add section title
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + (infoWidth / 2), infoY + 40);
        
        // Add decorative line under section title
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(infoX + (infoWidth / 2) - 100, infoY + 55, 200, 2);
        
        // Text settings
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info
        const startY = infoY + 100;
        const lineHeight = 55;
        
        // Draw info boxes with labels and values
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, infoX, infoWidth);
        drawInfoBox('ژدایـــكبون:', formatDate(data.birthdate), startY + lineHeight, infoX, infoWidth);
        drawInfoBox('ئاكنجی بوون:', data.address, startY + lineHeight * 2, infoX, infoWidth);
        drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + lineHeight * 3, infoX, infoWidth);
        drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + lineHeight * 4, infoX, infoWidth);
        drawInfoBox('كارێ وی:', data.job, startY + lineHeight * 5, infoX, infoWidth);
        
        let additionalFields = 0;
        
        if (data.imprisonment) {
            drawInfoBox('زیندانكرن:', data.imprisonment, startY + lineHeight * (6 + additionalFields), infoX, infoWidth);
            additionalFields++;
        }
        
        if (data.phone) {
            drawInfoBox('ژمارا موبایلی:', data.phone, startY + lineHeight * (6 + additionalFields), infoX, infoWidth);
            additionalFields++;
        }
        
        if (data.sentTo) {
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, startY + lineHeight * (6 + additionalFields), infoX, infoWidth);
        }
        
        // Add footer with timestamp
        ctx.fillStyle = '#34495e';
        roundRect(ctx, 20, canvas.height - 80, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, canvas.height - 40);
    }
    
    function drawInfoBox(label, value, y, infoX, infoWidth) {
        // Draw box background
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, infoX + 30, y - 30, infoWidth - 60, 45, 8, true, false);
        
        // Add left accent
        ctx.fillStyle = '#3498db';
        roundRect(ctx, infoX + 30, y - 30, 10, 45, {tl: 4, bl: 4, tr: 0, br: 0}, true, false);
        
        // Draw label
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(label, infoX + infoWidth - 50, y);
        
        // Draw value
        ctx.font = '26px Arial';
        ctx.fillStyle = '#34495e';
        ctx.fillText(value, infoX + infoWidth - 270, y);
    }
    
    // Keep old function for compatibility
    function drawTextLine(label, value, y) {
        // For backward compatibility, call drawInfoBox with default info area parameters
        const infoX = 50;
        const infoWidth = canvas.width - 400;
        drawInfoBox(label, value, y, infoX, infoWidth);
    }
}

// Format date to Kurdish format
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Using Kurdish locale if available, falling back to Arabic if not
    return date.toLocaleDateString('ckb-IR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// Function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        radius = {...{tl: 0, tr: 0, br: 0, bl: 0}, ...radius};
    }
    
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    
    if (fill) {
        ctx.fill();
    }
    
    if (stroke) {
        ctx.stroke();
    }
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
            alert('كارت هاتە خەزنكرن ل جهازێ تە');
        }, 100);
    } catch (error) {
        console.error('Error saving image:', error);
        alert('هەلەك چێبوو دەمێ خەزنكرنا وێنەی. تكایە دووبارە هەول بدە.');
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