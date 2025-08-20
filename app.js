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
        }, 800); // زيادة التأخير للتأكد من إنشاء الصورة أولاً
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
    
    // Set canvas dimensions - elegant widescreen format
    canvas.width = 1600;
    canvas.height = 900; // 16:9 aspect ratio for modern look
    
    // Create elegant gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#e8f4f8'); // Lighter blue-gray
    gradient.addColorStop(1, '#d4e6f1'); // Subtle blue tone
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle pattern to background for texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < canvas.width; i += 80) {
        for (let j = 0; j < canvas.height; j += 80) {
            ctx.fillRect(i, j, 40, 40);
        }
    }
    
    // Add main card background with elegant gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = bgGradient;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 20, true, false);
    
    // Add shadow effect to main card
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 20, true, false);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add elegant border with gold accent
    ctx.strokeStyle = '#3498db'; // Primary blue
    ctx.lineWidth = 3;
    roundRect(ctx, 25, 25, canvas.width - 50, canvas.height - 50, 18, false, true);
    
    // Add second inner border with gold accent
    ctx.strokeStyle = '#f1c40f'; // Gold accent
    ctx.lineWidth = 1;
    roundRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 16, false, true);
    
    // Add modern header with gradient
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#2980b9'); // Darker blue
    headerGradient.addColorStop(0.5, '#3498db'); // Medium blue
    headerGradient.addColorStop(1, '#2980b9'); // Darker blue again
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 30, 30, canvas.width - 60, 110, {tl: 16, tr: 16, bl: 0, br: 0}, true, false);
    
    // Add elegant pattern to header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, 30, 15, 110);
    }
    
    // Add gold accent line under header
    ctx.fillStyle = '#f1c40f'; // Gold color
    ctx.fillRect(50, 145, canvas.width - 100, 2);
    
    // Add title with enhanced shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('كارتا زانیاریێن تومەتباری', canvas.width / 2, 90);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Add photo if available with enhanced styling
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Draw rectangular photo background and frame with elegant styling
        const photoX = canvas.width - 470; // Position on the right side
        const photoY = 180;
        const photoWidth = 420;
        const photoHeight = 600; // زيادة طول الصورة العمودية
        
        // Add shadow effect to photo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Draw photo background with gradient
        const photoGradient = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
        photoGradient.addColorStop(0, '#ffffff');
        photoGradient.addColorStop(1, '#f8f9fa');
        ctx.fillStyle = photoGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, true, false);
        
        // Reset shadow for clean borders
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add photo frame with elegant double border
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, false, true);
        
        // Add inner gold accent border
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        roundRect(ctx, photoX + 5, photoY + 5, photoWidth - 10, photoHeight - 10, 8, false, true);
        
        // Add decorative elements around photo (corners) with enhanced styling
        const cornerPositions = [
            {x: photoX - 5, y: photoY - 5}, // Top left
            {x: photoX + photoWidth + 5, y: photoY - 5}, // Top right
            {x: photoX + photoWidth + 5, y: photoY + photoHeight + 5}, // Bottom right
            {x: photoX - 5, y: photoY + photoHeight + 5} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            // Add gradient to corner decorations
            const cornerGradient = ctx.createRadialGradient(pos.x, pos.y, 2, pos.x, pos.y, 8);
            cornerGradient.addColorStop(0, '#f1c40f'); // Gold center
            cornerGradient.addColorStop(1, '#f39c12'); // Orange edge
            ctx.fillStyle = cornerGradient;
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
        // Define info section dimensions with more space
        const infoX = 50;
        const infoY = 180;
        const infoWidth = canvas.width - 550; // Leave space for photo on the right
        const infoHeight = 700; // Maintain height for proper content spacing
        
        // Add shadow effect to info section
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw info section background with elegant gradient
        const infoGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + infoHeight);
        infoGradient.addColorStop(0, '#ffffff');
        infoGradient.addColorStop(1, '#f8f9fa');
        ctx.fillStyle = infoGradient;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 15, true, false);
        
        // Reset shadow for clean borders
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add elegant double border to info section
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 15, false, true);
        
        // Add inner gold accent border
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1;
        roundRect(ctx, infoX + 5, infoY + 5, infoWidth - 10, infoHeight - 10, 12, false, true);
        
        // Add section title background with modern gradient
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
        titleGradient.addColorStop(0, '#2980b9'); // Darker blue
        titleGradient.addColorStop(0.5, '#3498db'); // Medium blue
        titleGradient.addColorStop(1, '#2980b9'); // Darker blue again
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 70, {tl: 15, tr: 15, bl: 0, br: 0}, true, false);
        
        // Add elegant pattern to title background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < infoWidth; i += 30) {
            ctx.fillRect(infoX + i, infoY, 15, 70);
        }
        
        // Add section title with enhanced styling
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 45);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add decorative gold accent under title
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(infoX + 50, infoY + 75, infoWidth - 100, 2);
        
        // Add decorative elements - elegant dots
        const dotPositions = [
            {x: infoX + 50, y: infoY + 85},
            {x: infoX + infoWidth - 50, y: infoY + 85},
            {x: infoX + infoWidth/2, y: infoY + 85}
        ];
        
        dotPositions.forEach(pos => {
            // Create radial gradient for elegant dots
            const dotGradient = ctx.createRadialGradient(pos.x, pos.y, 1, pos.x, pos.y, 5);
            dotGradient.addColorStop(0, '#f1c40f'); // Gold center
            dotGradient.addColorStop(1, '#f39c12'); // Orange edge
            ctx.fillStyle = dotGradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2, true);
            ctx.fill();
        });
        
        // Text settings with improved styling
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#2c3e50'; // Darker, richer text color
        ctx.textAlign = 'right';
        
        // Organize information in two columns for better layout
        const startY = infoY + 130; // Increased spacing after title
        const colWidth = (infoWidth - 100) / 2;
        const col1X = infoX + 50;
        const col2X = infoX + 50 + colWidth + 20; // Add spacing between columns
        
        // Define line heights for better spacing
        const lineHeight = 55; // Proper spacing between rows
        
        // Left column - personal information
        let leftColY = startY;
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, leftColY, col1X, '#3498db');
        leftColY += lineHeight;
        
        drawInfoBox('ژدایـــكبون:', data.birthdate, leftColY, col1X, '#3498db');
        leftColY += lineHeight;
        
        drawInfoBox('ئاكنجی بوون:', data.address, leftColY, col1X, '#3498db');
        leftColY += lineHeight;
        
        if (data.phone) {
            drawInfoBox('ژمارا موبایلی:', data.phone, leftColY, col1X, '#3498db');
            leftColY += lineHeight;
        }
        
        if (data.familyStatus) {
            drawInfoBox('بارێ خێزانی:', data.familyStatus, leftColY, col1X, '#3498db');
            leftColY += lineHeight;
        }
        
        // Right column - case information
        let rightColY = startY;
        drawInfoBox('جورێ ئاریشێ:', data.issueType, rightColY, col2X, '#3498db');
        rightColY += lineHeight;
        
        drawInfoBox('كارێ وی:', data.job, rightColY, col2X, '#3498db');
        rightColY += lineHeight;
        
        if (data.imprisonment) {
            drawInfoBox('زیندانكرن:', data.imprisonment, rightColY, col2X, '#3498db');
            rightColY += lineHeight;
        }
        
        if (data.sentTo) {
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, rightColY, col2X, '#3498db');
            rightColY += lineHeight;
        }
        
        // Calculate the maximum Y position from both columns
        const maxFieldsY = Math.max(leftColY, rightColY) + 20;
        
        // Draw elegant separator with gradient
        const separatorGradient = ctx.createLinearGradient(infoX + 50, maxFieldsY, infoX + infoWidth - 50, maxFieldsY);
        separatorGradient.addColorStop(0, '#3498db');
        separatorGradient.addColorStop(0.5, '#f1c40f');
        separatorGradient.addColorStop(1, '#3498db');
        ctx.strokeStyle = separatorGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(infoX + 50, maxFieldsY);
        ctx.lineTo(infoX + infoWidth - 50, maxFieldsY);
        ctx.stroke();
        
        // Add additional information section with improved styling
        const additionalInfoY = maxFieldsY + 30;
        
        // Add section subtitle with elegant styling
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText('معلومات إضافية', infoX + infoWidth / 2, additionalInfoY);
        
        // Add decorative elements under subtitle
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(infoX + infoWidth/2 - 100, additionalInfoY + 10, 200, 2);
        
        // Draw additional information in two columns with elegant styling
        const addInfoStartY = additionalInfoY + 50;
        const addInfoLineHeight = 50;
        
        // Draw additional fields in two columns
        if (data.time) {
            drawInfoBox('دەمژمێر:', data.time + (data.dayNight ? ' - ' + data.dayNight : ''), addInfoStartY, col1X, '#2980b9');
        }
        
        if (data.problemLocation) {
            drawInfoBox('جهێ ئاریشێ:', data.problemLocation, addInfoStartY, col2X, '#2980b9');
        }
        
        if (data.driverName) {
            drawInfoBox('ناڤێ شوفێری:', data.driverName, addInfoStartY + addInfoLineHeight, col1X, '#2980b9');
        }
        
        if (data.point) {
            drawInfoBox('خالا:', data.point, addInfoStartY + addInfoLineHeight, col2X, '#2980b9');
        }
        
        // Calculate footer position based on content
        const footerY = addInfoStartY + addInfoLineHeight * 2 + 30;
        
        // Add elegant footer with enhanced gradient
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, '#2980b9'); // Darker blue
        footerGradient.addColorStop(0.5, '#3498db'); // Medium blue
        footerGradient.addColorStop(1, '#2980b9'); // Darker blue again
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, footerY, canvas.width - 40, 70, {tl: 0, tr: 0, bl: 20, br: 20}, true, false);
        
        // Add elegant pattern to footer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < canvas.width; i += 30) {
            ctx.fillRect(i, footerY, 15, 70);
        }
        
        // Add gold accent line above footer
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(50, footerY - 3, canvas.width - 100, 3);
        
        // Add timestamp with enhanced styling
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, footerY + 40);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function drawInfoBox(label, value, y, boxX = 80, labelColor = '#3498db', isHighlighted = false) {
        // Define info box dimensions with elegant proportions
        const isNewInfo = labelColor === '#777777' || labelColor === '#2980b9';
        const fontSize = isNewInfo ? 19 : 21; // Further reduced font size by 3%
        const labelWidth = isNewInfo ? 126 : 145; // Further reduced label width by 3%
        
        // Calculate if we need multiple lines for the value
        ctx.font = `${fontSize}px Arial`;
        const valueWidth = ctx.measureText(value || '-').width;
        // Increase value box width by reducing the gap between label and value
        const valueBoxWidth = canvas.width / 3.09 - 39 - labelWidth; // Reduced width by additional 3%
        const needsMultipleLines = valueWidth > valueBoxWidth - 14; // Reduced padding by 3%
        
        // Adjust box height based on content
        let boxHeight = isNewInfo ? 33 : 37; // Further reduced default height by 3%
        let lines = [];
        
        // If text is too long, calculate how many lines we need
         if (needsMultipleLines && value) {
             lines = wrapText(ctx, value, valueBoxWidth - 14, fontSize);
             // Increase box height to accommodate multiple lines with better spacing
             const lineSpacing = fontSize * 0.24; // Further reduced line spacing by 3%
             boxHeight = Math.max(boxHeight, lines.length * (fontSize + lineSpacing) + 9); // Reduced padding by 3%
         }
        
        const boxWidth = canvas.width / 3.09 - 39; // Reduced width by additional 3%
        
        // Add subtle shadow effect for depth
        if (!isNewInfo || isHighlighted) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
        }
        
        // Reverse the positions - Value box on left, Label on right with reduced gap
        const valueBoxX = boxX;
        const labelBoxX = boxX + boxWidth - labelWidth + 4; // Further reduced gap by 3%
        
        // Create gradient backgrounds for more elegant appearance
        // Value box gradient background (now on left)
        const valueGradient = ctx.createLinearGradient(valueBoxX, y - boxHeight/2, valueBoxX, y + boxHeight/2);
        if (isNewInfo) {
            valueGradient.addColorStop(0, '#f8f9fa');
            valueGradient.addColorStop(1, '#f5f5f5');
        } else {
            valueGradient.addColorStop(0, '#ffffff');
            valueGradient.addColorStop(1, '#f8f9fa');
        }
        ctx.fillStyle = valueGradient;
        roundRect(ctx, valueBoxX, y - boxHeight/2, boxWidth - labelWidth - 4, boxHeight, {tl: 10, bl: 10, tr: 0, br: 0}, true, false); // Further reduced width by 3%
        
        // Label background gradient (now on right)
        const labelGradient = ctx.createLinearGradient(labelBoxX, y - boxHeight/2, labelBoxX, y + boxHeight/2);
        if (isNewInfo) {
            labelGradient.addColorStop(0, 'rgba(41, 128, 185, 0.1)');
            labelGradient.addColorStop(1, 'rgba(41, 128, 185, 0.2)');
        } else {
            labelGradient.addColorStop(0, 'rgba(52, 152, 219, 0.15)');
            labelGradient.addColorStop(1, 'rgba(52, 152, 219, 0.25)');
        }
        ctx.fillStyle = labelGradient;
        roundRect(ctx, labelBoxX, y - boxHeight/2, labelWidth, boxHeight, {tl: 0, bl: 0, tr: 10, br: 10}, true, false);
        
        // Reset shadow for borders
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add elegant borders
        ctx.strokeStyle = isNewInfo ? '#2980b9' : '#3498db';
        ctx.lineWidth = 1;
        // Value border (now on left)
        roundRect(ctx, valueBoxX, y - boxHeight/2, boxWidth - labelWidth, boxHeight, {tl: 10, bl: 10, tr: 0, br: 0}, false, true);
        // Label border (now on right)
        roundRect(ctx, labelBoxX, y - boxHeight/2, labelWidth, boxHeight, {tl: 0, bl: 0, tr: 10, br: 10}, false, true);
        
        // Add decorative separator with gradient
        const separatorGradient = ctx.createLinearGradient(labelBoxX - 3, y - boxHeight/2, labelBoxX - 3, y + boxHeight/2);
        separatorGradient.addColorStop(0, isNewInfo ? '#2980b9' : '#3498db');
        separatorGradient.addColorStop(0.5, '#f1c40f'); // Gold accent in middle
        separatorGradient.addColorStop(1, isNewInfo ? '#2980b9' : '#3498db');
        ctx.fillStyle = separatorGradient;
        ctx.fillRect(labelBoxX - 3, y - boxHeight/2, 3, boxHeight);
        
        // Draw label with enhanced styling (now on right)
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#2c3e50' : '#2c3e50';
        ctx.textAlign = 'center';
        // Center label vertically in the box
        ctx.fillText(label, labelBoxX + labelWidth/2, y + (needsMultipleLines ? -boxHeight/4 : 2));
        
        // Draw value with enhanced styling (now on left)
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#34495e'; // Consistent color for better readability
        
        // Check if text is RTL (Arabic, Kurdish, etc.)
        const isRTL = value && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(value);
        
        // Set text alignment based on language direction
        ctx.textAlign = isRTL ? 'left' : 'left';
        
        if (needsMultipleLines && lines.length > 0) {
            // Draw multiple lines of text with improved spacing
            const lineSpacing = fontSize * 0.24; // Further reduced line spacing by 3%
            const lineHeight = fontSize + lineSpacing;
            
            // Calculate starting Y position to center text vertically in the box
            const totalTextHeight = lines.length * lineHeight;
            const startY = y - totalTextHeight / 2 + fontSize / 2;
            
            for (let i = 0; i < lines.length; i++) {
                // Position text closer to the label with less padding
                const xPosition = valueBoxX + 4; // Further reduced padding by 3%
                ctx.fillText(lines[i], xPosition, startY + i * lineHeight);
            }
        } else {
            // Draw single line of text
            const xPosition = valueBoxX + 4; // Further reduced padding by 3%
            ctx.fillText(value || '-', xPosition, y + 2);
        }
        
        // Reset text alignment for other text
        ctx.textAlign = 'right';
    }
    
    // Helper function to wrap text into multiple lines with RTL support
    function wrapText(context, text, maxWidth, fontSize) {
        if (!text) return ['-'];
        
        // Handle RTL languages (Arabic, Kurdish, etc.)
        const isRTL = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
        
        // Split by spaces, considering RTL text may need different handling
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0] || '';

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            // For RTL languages, we add the space after the word
            const testLine = isRTL ? word + ' ' + currentLine : currentLine + ' ' + word;
            const width = context.measureText(testLine).width;
            
            if (width < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines.length > 0 ? lines : ['-'];
    }
    
    // Keep old function for compatibility
    function drawTextLine(label, value, y, fontSize = 24, isHighlighted = false) {
        // Enhanced version for compatibility with older code
        // Uses the new drawInfoBox with improved styling
        drawInfoBox(label, value, y, 80, '#3498db', isHighlighted);
    }
}

// Format date to show only year for birthdate
function formatDate(dateString) {
    if (!dateString) return '-';
    
    // If dateString is just a year (number), return it directly
    if (!isNaN(dateString) && dateString.length >= 4) {
        return dateString; // Return the year as is
    }
    
    // For backward compatibility with date objects
    try {
        const date = new Date(dateString);
        // Using Gregorian calendar format with elegant formatting
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        // Return formatted date with consistent spacing
        return `${day}/${month}/${year}`;
    } catch (e) {
        // Return original on error, but ensure it's not empty
        return dateString || '-'; // Return as is if there's an error
    }
}

// Function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    // Enhanced roundRect function with improved corner handling
    
    // Handle radius parameter with more elegant defaults
    if (typeof radius === 'undefined') {
        radius = 8; // Slightly larger default radius for more elegant appearance
    }
    
    // Convert number to object with corner radii
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        // Set defaults for any undefined corners
        const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (const side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    
    // Begin drawing the rounded rectangle
    ctx.beginPath();
    
    // Top edge with top-left corner
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    
    // Top-right corner and right edge
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    
    // Bottom-right corner and bottom edge
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    
    // Bottom-left corner and left edge
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    
    // Top-left corner to complete the path
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    
    // Fill and stroke as requested
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
        // Save the image to device first
        saveImageToDevice();
        
        // Prepare WhatsApp message with suspect name
        const suspectName = currentSuspectData.fullname || 'suspect';
        const message = 'معلومات المتهم: ' + suspectName;
        const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent(message);
        
        // Add a small delay to ensure the image is saved before opening WhatsApp
        setTimeout(() => {
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
        }, 300);
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
        
        // Automatically use the suspect name as filename
        const fileName = suspectName + '_' + new Date().getTime() + '.png';
        
        // Set download attributes with PNG extension
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
            alert('تم حفظ البطاقة باسم المتهم في مجلد التنزيلات بصيغة PNG');
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