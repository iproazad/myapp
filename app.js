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
        // حفظ الصورة تلقائياً عند النقر على زر "خەزنكرنا كارتێ"
        setTimeout(() => {
            saveImageToDevice();
        }, 500); // تأخير قليل للتأكد من إنشاء الصورة أولاً
    });

    // Modal actions
    shareWhatsappBtn.addEventListener('click', shareViaWhatsapp);
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
        time: document.getElementById('time').value,
        dayNight: document.querySelector('input[name="day-night"]:checked').value,
        problemLocation: document.getElementById('problem-location').value,
        driverName: document.getElementById('driver-name').value,
        point: document.getElementById('point').value,
        phone: document.getElementById('phone').value,
        sentTo: document.getElementById('sent-to').value,
        timestamp: new Date().toLocaleString('en-US')
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
    
    // Set canvas dimensions - increased height for new fields
    canvas.width = 1500;
    canvas.height = 1000; // Reverted to original height as we're using horizontal layout
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f5f7fa');
    gradient.addColorStop(1, '#e4e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add rounded rectangle background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = bgGradient;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 15, true, false);
    
    // Add double border effect
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
    ctx.lineWidth = 5;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 15, false, true);
    
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    roundRect(ctx, 25, 25, canvas.width - 50, canvas.height - 50, 12, false, true);
    
    // Add header with gradient
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)');
    headerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.9)');
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 25, 25, canvas.width - 50, 100, {tl: 12, tr: 12, bl: 0, br: 0}, true, false);
    
    // Add decorative pattern to header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.fillRect(i, 25, 20, 100);
    }
    
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
    
    // Add photo if available
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Draw rectangular photo background and frame
        const photoX = canvas.width - 470; // Position on the right side
        const photoY = 180;
        const photoWidth = 420;
        const photoHeight = 600; // زيادة طول الصورة العمودية
        
        // Draw photo background
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, true, false);
        
        // Add photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, false, true);
        
        // Add decorative elements around photo (corners)
        const cornerPositions = [
            {x: photoX - 5, y: photoY - 5}, // Top left
            {x: photoX + photoWidth + 5, y: photoY - 5}, // Top right
            {x: photoX + photoWidth + 5, y: photoY + photoHeight + 5}, // Bottom right
            {x: photoX - 5, y: photoY + photoHeight + 5} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2, true);
            ctx.fill();
        });
        
        // Draw rectangular photo
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, photoX + 5, photoY + 5, photoWidth - 10, photoHeight - 10, 8, false, false);
        ctx.clip();
        
        // Wait for image to load
        img.onload = function() {
            ctx.drawImage(img, photoX + 5, photoY + 5, photoWidth - 10, photoHeight - 10);
            ctx.restore();
            
            // Continue with drawing text after image loads
            drawSuspectInfo();
            
            // Save the final image
            currentSuspectData.cardImage = canvas.toDataURL('image/png');
        };
    } else {
        // Define photo dimensions for consistency
        const photoX = canvas.width - 470; // Position on the right side
        const photoY = 180;
        const photoWidth = 420;
        const photoHeight = 600; // زيادة طول الصورة العمودية
        
        // No photo, draw a placeholder
        ctx.fillStyle = '#ecf0f1';
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, true, false);
        
        // Add photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, false, true);
        
        // Add decorative elements around photo (corners)
        const cornerPositions = [
            {x: photoX - 5, y: photoY - 5}, // Top left
            {x: photoX + photoWidth + 5, y: photoY - 5}, // Top right
            {x: photoX + photoWidth + 5, y: photoY + photoHeight + 5}, // Bottom right
            {x: photoX - 5, y: photoY + photoHeight + 5} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2, true);
            ctx.fill();
        });
        
        // Draw user icon
        ctx.fillStyle = '#bdc3c7';
        // Draw a simple user icon in the center of the photo area
        const iconX = photoX + photoWidth / 2;
        const iconY = photoY + photoHeight / 2 - 20;
        
        // Head
        ctx.beginPath();
        ctx.arc(iconX, iconY, 50, 0, Math.PI * 2, true);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.arc(iconX, iconY + 100, 70, Math.PI, 0, true);
        ctx.fill();
        
        // Continue with drawing text
        drawSuspectInfo();
        currentSuspectData.cardImage = canvas.toDataURL('image/png');
    }
    
    function drawSuspectInfo() {
        // Define info section dimensions
        const infoX = 50;
        const infoY = 180;
        const infoWidth = canvas.width - 550; // Leave space for photo on the right
        const infoHeight = 700; // Reverted to original height as we're using horizontal layout
        
        // Draw info section background with semi-transparent blue
        ctx.fillStyle = 'rgba(52, 152, 219, 0.05)';
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, true, false);
        
        // Add border to info section
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, false, true);
        
        // Add section title background
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
        titleGradient.addColorStop(0, '#3498db');
        titleGradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 60, {tl: 10, tr: 10, bl: 0, br: 0}, true, false);
        
        // Add section title
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 40);
        
        // Add decorative elements
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(infoX + infoWidth / 2, infoY + 70, 5, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Text settings
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info
        const startY = infoY + 120; // زيادة المسافة بعد العنوان
        const lineHeight = 65; // زيادة المسافة بين الأسطر
        
        // Draw info boxes with labels and values - Left column (original fields)
        const leftColumnX = 80;
        const rightColumnX = canvas.width / 2 + 20;
        
        // Left column - original fields
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, leftColumnX);
        drawInfoBox('ژدایـــكبون:', data.birthdate, startY + lineHeight, leftColumnX); // Display year directly
        drawInfoBox('ئاكنجی بوون:', data.address, startY + lineHeight * 2, leftColumnX);
        drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + lineHeight * 3, leftColumnX);
        drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + lineHeight * 4, leftColumnX);
        drawInfoBox('كارێ وی:', data.job, startY + lineHeight * 5, leftColumnX);
        
        // Right column - new fields
        drawInfoBox('دەمژمێر:', data.time + ' - ' + data.dayNight, startY, rightColumnX);
        drawInfoBox('جهێ ئاریشێ:', data.problemLocation, startY + lineHeight, rightColumnX);
        drawInfoBox('ناڤێ شوفێری:', data.driverName, startY + lineHeight * 2, rightColumnX);
        drawInfoBox('خالا:', data.point, startY + lineHeight * 3, rightColumnX);
        
        // Additional fields below in left column
        let additionalFieldsY = startY + lineHeight * 6;
        
        if (data.imprisonment) {
            drawInfoBox('زیندانكرن:', data.imprisonment, additionalFieldsY, leftColumnX);
            additionalFieldsY += lineHeight;
        }
        
        if (data.phone) {
            drawInfoBox('ژمارا موبایلی:', data.phone, additionalFieldsY, leftColumnX);
            additionalFieldsY += lineHeight;
        }
        
        if (data.sentTo) {
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, additionalFieldsY, leftColumnX);
        }
        
        // Add footer with timestamp - gradient background
        const footerGradient = ctx.createLinearGradient(0, canvas.height - 80, canvas.width, canvas.height - 80);
        footerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)');
        footerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.9)');
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, canvas.height - 80, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        // Add decorative line above footer
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(50, canvas.height - 85, canvas.width - 100, 2);
        
        // Add timestamp with shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, canvas.height - 40);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function drawInfoBox(label, value, y, boxX = 80) {
        // Define info box dimensions based on the info section
        const boxWidth = canvas.width / 2 - 60; // Adjusted for the two-column layout
        
        // Draw label box with semi-transparent blue background
        ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
        roundRect(ctx, boxX, y - 30, 180, 45, {tl: 8, bl: 8, tr: 0, br: 0}, true, false);
        
        // Draw value box with white background
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, boxX + 180, y - 30, boxWidth - 180, 45, {tl: 0, bl: 0, tr: 8, br: 8}, true, false);
        
        // Add decorative separator
        ctx.fillStyle = '#3498db';
        ctx.fillRect(boxX + 180 - 3, y - 30, 3, 45);
        
        // Draw label
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + 90, y);
        
        // Draw value
        ctx.font = '24px Arial';
        ctx.fillStyle = '#34495e';
        ctx.textAlign = 'right';
        ctx.fillText(value, boxX + boxWidth - 20, y);
        
        // Reset text alignment for other text
        ctx.textAlign = 'right';
    }
    
    // Keep old function for compatibility
    function drawTextLine(label, value, y) {
        drawInfoBox(label, value, y);
    }
}

// Format date to show only year for birthdate
function formatDate(dateString) {
    if (!dateString) return '';
    
    // If dateString is just a year (number), return it directly
    if (!isNaN(dateString) && dateString.length >= 4) {
        return dateString; // Return the year as is
    }
    
    // For backward compatibility with date objects
    try {
        const date = new Date(dateString);
        // Using Gregorian calendar format (year-month-day)
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
        return dateString; // Return as is if there's an error
    }
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
        
        // Use suspect name in the filename if available
        const suspectName = currentSuspectData.fullname || 'suspect';
        const fileName = 'بطاقة_' + suspectName + '_' + new Date().getTime() + '.png';
        tempLink.download = fileName;
        
        // Explicitly set attributes for better compatibility
        tempLink.setAttribute('download', fileName);
        tempLink.setAttribute('href', currentSuspectData.cardImage.replace(/^data:image\/[^;]+/, 'data:application/octet-stream'));
        tempLink.setAttribute('target', '_blank');
        
        // Append to body, click, and remove
        document.body.appendChild(tempLink);
        tempLink.click();
        
        // Add a small delay before removing the link
        setTimeout(() => {
            document.body.removeChild(tempLink);
            alert('تم حفظ البطاقة تلقائياً في مجلد التنزيلات بصيغة PNG');
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