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
    
    // Set canvas dimensions - further optimized for better proportions
    canvas.width = 1500;
    canvas.height = 800; // Further reduced height for more compact layout
    
    // Define drawHeader function for better organization
    function drawHeader(ctx, suspectData) {
        // Draw header with gradient background for more elegant look
        const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        headerGradient.addColorStop(0, '#2980b9');
        headerGradient.addColorStop(0.5, '#3498db');
        headerGradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvas.width, 120);
        
        // Add subtle header decoration
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 100, canvas.width, 2);
        
        // Draw header text with shadow for depth
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText('بطاقة معلومات', canvas.width / 2, 70);
        ctx.shadowColor = 'transparent';
        
        // Draw suspect image if available with improved styling
        if (suspectData.image) {
            const img = new Image();
            img.src = suspectData.image;
            
            // Draw circular image with improved positioning
            ctx.save();
            ctx.beginPath();
            const centerX = canvas.width / 2;
            const centerY = 190; // Slightly higher position
            const radius = 75; // Slightly smaller for better proportions
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            // Draw the image
            ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
            
            // Restore context
            ctx.restore();
            
            // Add circular border with gradient
            const borderGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
            borderGradient.addColorStop(0, '#2980b9');
            borderGradient.addColorStop(1, '#3498db');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
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
        const infoHeight = 650; // Reduced height for more compact layout
        
        // Draw info section background with subtle gradient
        const bgGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + infoHeight);
        bgGradient.addColorStop(0, 'rgba(52, 152, 219, 0.05)');
        bgGradient.addColorStop(1, 'rgba(52, 152, 219, 0.02)');
        ctx.fillStyle = bgGradient;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, true, false);
        
        // Add border to info section
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, false, true);
        
        // Add section title background with enhanced gradient
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
        titleGradient.addColorStop(0, '#3498db');
        titleGradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 60, {tl: 10, tr: 10, bl: 0, br: 0}, true, false);
        
        // Add section title with shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 30px Arial'; // Slightly smaller for better proportions
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 40);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Add decorative elements
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(infoX + infoWidth / 2, infoY + 70, 5, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Text settings
        ctx.font = 'bold 20px Arial'; // Further reduced font size for better layout
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info
        const startY = infoY + 90; // Reduced space after header for more compact layout
        
        // Optimized line heights for better layout
        const oldLineHeight = 38; // More compact spacing for original fields
        const newLineHeight = 34; // Compact spacing for new fields
        
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
        const separatorGradient = ctx.createLinearGradient(80, 0, canvas.width - 160, 0);
        separatorGradient.addColorStop(0, '#3498db');
        separatorGradient.addColorStop(0.5, '#2980b9');
        separatorGradient.addColorStop(1, '#3498db');
        ctx.fillStyle = separatorGradient;
        ctx.fillRect(80, conditionalFieldsY + 5, canvas.width - 160, 2);
        
        // Draw new fields section title with improved styling
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.font = 'bold 22px Arial'; // Optimized font size
        ctx.fillStyle = '#2c3e50'; // Darker color for better contrast
        ctx.textAlign = 'center';
        ctx.fillText('معلومات إضافية', canvas.width / 2, conditionalFieldsY + 25); // Better vertical spacing
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Add decorative underline for the title
        const titleUnderlineGradient = ctx.createLinearGradient(canvas.width/2 - 80, 0, canvas.width/2 + 80, 0);
        titleUnderlineGradient.addColorStop(0, 'rgba(44, 62, 80, 0.1)');
        titleUnderlineGradient.addColorStop(0.5, 'rgba(44, 62, 80, 0.5)');
        titleUnderlineGradient.addColorStop(1, 'rgba(44, 62, 80, 0.1)');
        ctx.fillStyle = titleUnderlineGradient;
        ctx.fillRect(canvas.width/2 - 80, conditionalFieldsY + 30, 160, 1);
        
        // Calculate optimal layout for new fields with better horizontal arrangement
        const newFieldsY = conditionalFieldsY + 45; // Optimized spacing
        
        // Calculate column positions for better alignment
        const leftMargin = 80;
        const rightMargin = 80;
        const availableWidth = canvas.width - leftMargin - rightMargin - 550; // Account for photo space
        const columnWidth = availableWidth / 2;
        const columnGap = 40; // Optimized gap between columns
        
        const leftColX = leftMargin;
        const rightColX = leftMargin + columnWidth + columnGap;
        
        // Check if we have any additional fields to display
        const hasAdditionalFields = data.time || data.problemLocation || data.driverName || data.point;
        
        let footerY;
        
        if (hasAdditionalFields) {
            // Draw new fields in improved horizontal layout
            // First row
            let firstRowUsed = false;
            
            if (data.time) {
                drawInfoBox('دەمژمێر:', data.time + ' - ' + data.dayNight, newFieldsY, leftColX, '#777777');
                firstRowUsed = true;
            }
            
            if (data.problemLocation) {
                drawInfoBox('جهێ ئاریشێ:', data.problemLocation, newFieldsY, rightColX, '#777777');
                firstRowUsed = true;
            }
            
            // Second row with proper spacing
            const secondRowY = firstRowUsed ? newFieldsY + newLineHeight : newFieldsY;
            let secondRowUsed = false;
            
            if (data.driverName) {
                drawInfoBox('ناڤێ شوفێری:', data.driverName, secondRowY, leftColX, '#777777');
                secondRowUsed = true;
            }
            
            if (data.point) {
                drawInfoBox('خالا:', data.point, secondRowY, rightColX, '#777777');
                secondRowUsed = true;
            }
            
            // Calculate footer position based on content
            footerY = secondRowUsed ? secondRowY + newLineHeight + 30 : 
                      firstRowUsed ? newFieldsY + newLineHeight + 30 : 
                      newFieldsY + 30;
        } else {
            // If no additional fields, display a message
            ctx.font = 'italic 16px Arial';
            ctx.fillStyle = '#777777';
            ctx.textAlign = 'center';
            ctx.fillText('لا توجد معلومات إضافية', canvas.width / 2, newFieldsY + 15);
            
            // Set footer position for no additional fields
            footerY = newFieldsY + 40;
        }
        
        // Add decorative line above footer with gradient
        const lineGradient = ctx.createLinearGradient(50, 0, canvas.width - 100, 0);
        lineGradient.addColorStop(0, '#f39c12');
        lineGradient.addColorStop(0.5, '#f1c40f');
        lineGradient.addColorStop(1, '#f39c12');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(50, footerY - 5, canvas.width - 100, 2);
        
        // Add footer with elegant gradient background
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.95)');
        footerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.95)');
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, footerY, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        // Add timestamp with enhanced shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold italic 20px Arial'; // Slightly smaller for better proportions
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
        
        // Further optimized dimensions for better appearance
        const boxHeight = isNewInfo ? 34 : 38; // Reduced height for better proportions
        const boxWidth = isNewInfo ? 320 : 380; // Fixed width for better alignment
        const fontSize = isNewInfo ? 16 : 18; // Further reduced font sizes for cleaner look
        const labelWidth = isNewInfo ? 140 : 160; // Adjusted label width for better proportions
        const borderRadius = isNewInfo ? 5 : 6; // Smaller radius for new info boxes
        
        // Enhanced colors for better contrast and elegance
        const labelBgColor = isNewInfo ? 'rgba(119, 119, 119, 0.12)' : 'rgba(52, 152, 219, 0.12)';
        ctx.fillStyle = labelBgColor;
        roundRect(ctx, boxX, y - boxHeight/2, labelWidth, boxHeight, 
                 {tl: borderRadius, bl: borderRadius, tr: 0, br: 0}, true, false);
        
        // Draw value box with enhanced background
        ctx.fillStyle = isNewInfo ? '#f9f9f9' : '#ffffff';
        roundRect(ctx, boxX + labelWidth, y - boxHeight/2, boxWidth - labelWidth, boxHeight, 
                 {tl: 0, bl: 0, tr: borderRadius, br: borderRadius}, true, false);
        
        // Add subtle box shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        roundRect(ctx, boxX, y - boxHeight/2, boxWidth, boxHeight, 
                 {tl: borderRadius, bl: borderRadius, tr: borderRadius, br: borderRadius}, true, false);
        ctx.shadowColor = 'transparent';
        
        // Add decorative separator with subtle gradient
        const sepColor = isNewInfo ? '#777777' : '#3498db';
        ctx.fillStyle = sepColor;
        ctx.fillRect(boxX + labelWidth - 2, y - boxHeight/2, 2, boxHeight);
        
        // Draw label with improved text positioning
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#555555' : '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + labelWidth/2, y + 1); // Slight vertical adjustment
        
        // Draw value with improved text positioning
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#666666' : '#34495e';
        ctx.textAlign = 'right';
        
        // Handle long text with ellipsis if needed
        const maxValueWidth = boxWidth - labelWidth - 20;
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
        
        ctx.fillText(displayValue, boxX + boxWidth - 10, y + 1); // Slight vertical adjustment
        
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