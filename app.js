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
    
    // Set canvas dimensions - optimized for better proportions
    canvas.width = 1500;
    canvas.height = 850; // Further optimized height for better proportions with horizontal arrangement
    
    // Define drawInfoSection function for better organization
    function drawInfoSection(ctx, suspectData) {
        // Draw info section with subtle gradient background for more elegant look
        const infoY = 270; // Slightly higher position
        const infoGradient = ctx.createLinearGradient(0, infoY, 0, canvas.height);
        infoGradient.addColorStop(0, '#ffffff');
        infoGradient.addColorStop(1, '#f9f9f9');
        ctx.fillStyle = infoGradient;
        ctx.fillRect(0, infoY, canvas.width, canvas.height - infoY - 60);
        
        // Add subtle decorative elements
        ctx.fillStyle = 'rgba(52, 152, 219, 0.05)';
        ctx.fillRect(40, infoY + 10, canvas.width - 80, canvas.height - infoY - 80);
        
        // Draw info section title with improved styling
        ctx.font = 'bold 30px Arial'; // Slightly smaller for better proportions
        ctx.fillStyle = '#2980b9'; // Slightly darker blue for better contrast
        ctx.textAlign = 'center';
        
        // Add subtle shadow to title
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText('معلومات المشتبه به', canvas.width / 2, infoY + 45);
        ctx.shadowColor = 'transparent'; // Reset shadow
        
        // Add decorative underline
        const titleWidth = ctx.measureText('معلومات المشتبه به').width;
        const underlineGradient = ctx.createLinearGradient(
            canvas.width/2 - titleWidth/2, infoY + 50,
            canvas.width/2 + titleWidth/2, infoY + 50
        );
        underlineGradient.addColorStop(0, 'rgba(52, 152, 219, 0.3)');
        underlineGradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.7)');
        underlineGradient.addColorStop(1, 'rgba(52, 152, 219, 0.3)');
        ctx.fillStyle = underlineGradient;
        ctx.fillRect(canvas.width/2 - titleWidth/2, infoY + 50, titleWidth, 2);
    }
    
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
        ctx.font = 'bold 24px Arial'; // Further reduced font size for better layout
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info
        const startY = infoY + 90; // Reduced space after header for more compact layout
        
        // Optimized line heights for better layout
        const oldLineHeight = 42; // More compact spacing for original fields
        const newLineHeight = 38; // Compact spacing for new fields
        
        // Draw original fields (top section) - more compact
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, 80);
        drawInfoBox('ژدایـــكبون:', data.birthdate, startY + oldLineHeight, 80);
        drawInfoBox('ئاكنجی بوون:', data.address, startY + oldLineHeight * 2, 80);
        drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + oldLineHeight * 3, 80);
        drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + oldLineHeight * 4, 80);
        drawInfoBox('كارێ وی:', data.job, startY + oldLineHeight * 5, 80);
        
        // Draw conditional fields
        let conditionalFieldsY = startY + oldLineHeight * 6;
        
        if (data.imprisonment) {
            drawInfoBox('زیندانكرن:', data.imprisonment, conditionalFieldsY, 80);
            conditionalFieldsY += oldLineHeight;
        }
        
        if (data.phone) {
            drawInfoBox('ژمارا موبایلی:', data.phone, conditionalFieldsY, 80);
            conditionalFieldsY += oldLineHeight;
        }
        
        if (data.sentTo) {
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, conditionalFieldsY, 80);
            conditionalFieldsY += oldLineHeight;
        }
        
        // Draw separator line with improved styling
        ctx.fillStyle = '#3498db';
        ctx.fillRect(80, conditionalFieldsY + 5, canvas.width - 160, 2);
        
        // Draw new fields section title with improved styling
        ctx.font = 'bold 22px Arial'; // Smaller font for title
        ctx.fillStyle = '#555555'; // Darker gray for better readability
        ctx.textAlign = 'center';
        ctx.fillText('معلومات إضافية', canvas.width / 2, conditionalFieldsY + 25); // Further reduced spacing
        
        // Calculate optimal layout for new fields with better horizontal arrangement
        const newFieldsY = conditionalFieldsY + 50; // Reduced spacing
        const columnGap = 30; // Gap between columns
        const leftColX = 80;
        const rightColX = canvas.width / 2 - 50; // Better positioned right column
        
        // Draw new fields in improved horizontal layout
        drawInfoBox('دەمژمێر:', data.time + ' - ' + data.dayNight, newFieldsY, leftColX, '#777777');
        drawInfoBox('جهێ ئاریشێ:', data.problemLocation, newFieldsY, rightColX, '#777777');
        drawInfoBox('ناڤێ شوفێری:', data.driverName, newFieldsY + newLineHeight, leftColX, '#777777');
        drawInfoBox('خالا:', data.point, newFieldsY + newLineHeight, rightColX, '#777777');
        
        // Add footer with elegant gradient background (adjusted for smaller canvas)
        const footerY = newFieldsY + newLineHeight + 50; // Position footer based on content, not canvas height
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.95)');
        footerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.95)');
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, footerY, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        // Add decorative line above footer with gradient
        const lineGradient = ctx.createLinearGradient(50, 0, canvas.width - 100, 0);
        lineGradient.addColorStop(0, '#f39c12');
        lineGradient.addColorStop(0.5, '#f1c40f');
        lineGradient.addColorStop(1, '#f39c12');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(50, footerY - 5, canvas.width - 100, 2);
        
        // Add timestamp with enhanced shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold italic 22px Arial'; // Bold italic for more elegant look
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, footerY + 30);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function drawInfoBox(label, value, y, boxX = 80, labelColor = '#3498db') {
        // Define info box dimensions based on the info section and whether it's old or new info
        const isNewInfo = labelColor === '#777777';
        
        // Optimized dimensions for better appearance
        const boxHeight = isNewInfo ? 36 : 42; // Balanced height for better proportions
        const boxWidth = canvas.width / 2 - 70; // Slightly narrower for better alignment
        const fontSize = isNewInfo ? 18 : 20; // Reduced font sizes for cleaner look
        const labelWidth = isNewInfo ? 150 : 170; // Adjusted label width for better proportions
        const borderRadius = isNewInfo ? 6 : 8; // Smaller radius for new info boxes
        
        // Enhanced colors for better contrast
        const labelBgColor = isNewInfo ? 'rgba(119, 119, 119, 0.15)' : 'rgba(52, 152, 219, 0.15)';
        ctx.fillStyle = labelBgColor;
        roundRect(ctx, boxX, y - boxHeight/2, labelWidth, boxHeight, 
                 {tl: borderRadius, bl: borderRadius, tr: 0, br: 0}, true, false);
        
        // Draw value box with enhanced background
        ctx.fillStyle = isNewInfo ? '#f8f8f8' : '#ffffff';
        roundRect(ctx, boxX + labelWidth, y - boxHeight/2, boxWidth - labelWidth, boxHeight, 
                 {tl: 0, bl: 0, tr: borderRadius, br: borderRadius}, true, false);
        
        // Add decorative separator with subtle gradient
        const sepColor = isNewInfo ? '#777777' : '#3498db';
        ctx.fillStyle = sepColor;
        ctx.fillRect(boxX + labelWidth - 2, y - boxHeight/2, 2, boxHeight);
        
        // Draw label with improved text positioning
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#555555' : '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + labelWidth/2, y);
        
        // Draw value with improved text positioning
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#666666' : '#34495e';
        ctx.textAlign = 'right';
        
        // Handle long text with ellipsis if needed
        const maxValueWidth = boxWidth - labelWidth - 25;
        let displayValue = value;
        ctx.font = `${fontSize}px Arial`; // Set font before measuring
        if (ctx.measureText(value).width > maxValueWidth) {
            // Truncate text and add ellipsis
            let truncated = value;
            while (ctx.measureText(truncated + '...').width > maxValueWidth && truncated.length > 0) {
                truncated = truncated.slice(0, -1);
            }
            displayValue = truncated + '...';
        }
        
        ctx.fillText(displayValue, boxX + boxWidth - 12, y);
        
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