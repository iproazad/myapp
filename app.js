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
    timestamp: null,
    orientation: 'portrait' // Default orientation is portrait
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
    
    // Orientation toggle buttons
    const portraitBtn = document.getElementById('portrait-orientation');
    const landscapeBtn = document.getElementById('landscape-orientation');
    
    portraitBtn.addEventListener('click', () => {
        setOrientation('portrait');
        portraitBtn.classList.add('active');
        landscapeBtn.classList.remove('active');
    });
    
    landscapeBtn.addEventListener('click', () => {
        setOrientation('landscape');
        landscapeBtn.classList.add('active');
        portraitBtn.classList.remove('active');
    });

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
    
    // Set canvas dimensions - portrait by default
    let canvasWidth = 800;
    let canvasHeight = 1000;
    
    // Check if we need landscape orientation
    if (data.orientation === 'landscape') {
        canvasWidth = 1200; // Increased width for landscape mode
        canvasHeight = 800;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
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
    
    // Add photo if available
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Draw photo background and frame
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 220, 125, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Add photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 220, 125, 0, Math.PI * 2, true);
        ctx.stroke();
        
        // Add decorative elements around photo
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x = canvas.width / 2 + Math.cos(angle) * 145;
            const y = 220 + Math.sin(angle) * 145;
            
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2, true);
            ctx.fill();
        }
        
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
        // No photo, draw a placeholder
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 220, 120, 0, Math.PI * 2, true);
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
        ctx.arc(canvas.width / 2, 200, 50, 0, Math.PI * 2, true);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 320, 70, Math.PI, 0, true);
        ctx.fill();
        
        // Continue with drawing text
        drawSuspectInfo();
        currentSuspectData.cardImage = canvas.toDataURL('image/png');
    }
    
    function drawSuspectInfo() {
        // Adjust layout based on orientation
        let infoSectionY, infoSectionHeight, photoY;
        let startY, lineHeight;
        
        if (data.orientation === 'landscape') {
            // Landscape layout - photo on left, info on right
            photoY = canvas.height / 2;
            infoSectionY = 50;
            infoSectionHeight = canvas.height - 100;
            startY = 120;
            lineHeight = 45;
            
            // Draw info section background - takes right side of canvas
            ctx.fillStyle = '#f8f9fa';
            roundRect(ctx, canvas.width / 2 - 50, infoSectionY, canvas.width / 2, infoSectionHeight, 10, true, false);
            
            // Reposition photo to left side
            if (data.photo) {
                // Redraw photo on left side
                ctx.save();
                ctx.beginPath();
                ctx.arc(canvas.width / 4, photoY, 150, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.clip();
                
                const img = new Image();
                img.src = data.photo;
                img.onload = function() {
                    ctx.drawImage(img, canvas.width / 4 - 150, photoY - 150, 300, 300);
                    ctx.restore();
                };
            }
        } else {
            // Portrait layout - original layout
            infoSectionY = 350;
            infoSectionHeight = 550;
            startY = 450;
            lineHeight = 55;
            
            // Draw info section background
            ctx.fillStyle = '#f8f9fa';
            roundRect(ctx, 50, infoSectionY, canvas.width - 100, infoSectionHeight, 10, true, false);
        }
        
        // Add section title
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#2980b9';
        ctx.textAlign = 'center';
        
        if (data.orientation === 'landscape') {
            ctx.fillText('زانیاریێن كەسی', canvas.width * 0.75, infoSectionY + 50);
            // Add decorative line under section title
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(canvas.width * 0.75 - 100, infoSectionY + 65, 200, 2);
        } else {
            ctx.fillText('زانیاریێن كەسی', canvas.width / 2, 390);
            // Add decorative line under section title
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(canvas.width / 2 - 100, 405, 200, 2);
        }
        
        // Text settings
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw info boxes with labels and values
        if (data.orientation === 'landscape') {
            // Adjust position for landscape mode
            const infoX = canvas.width - 80; // Right align position
            
            drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, infoX);
            drawInfoBox('ژدایـــكبون:', formatDate(data.birthdate), startY + lineHeight, infoX);
            drawInfoBox('ئاكنجی بوون:', data.address, startY + lineHeight * 2, infoX);
            drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + lineHeight * 3, infoX);
            drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + lineHeight * 4, infoX);
            drawInfoBox('كارێ وی:', data.job, startY + lineHeight * 5, infoX);
            
            let additionalFields = 0;
            
            if (data.imprisonment) {
                drawInfoBox('زیندانكرن:', data.imprisonment, startY + lineHeight * (6 + additionalFields), infoX);
                additionalFields++;
            }
            
            if (data.phone) {
                drawInfoBox('ژمارا موبایلی:', data.phone, startY + lineHeight * (6 + additionalFields), infoX);
                additionalFields++;
            }
            
            if (data.sentTo) {
                drawInfoBox('رەوانەكرن بـــو:', data.sentTo, startY + lineHeight * (6 + additionalFields), infoX);
            }
        } else {
            // Original portrait layout
            drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY);
            drawInfoBox('ژدایـــكبون:', formatDate(data.birthdate), startY + lineHeight);
            drawInfoBox('ئاكنجی بوون:', data.address, startY + lineHeight * 2);
            drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + lineHeight * 3);
            drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + lineHeight * 4);
            drawInfoBox('كارێ وی:', data.job, startY + lineHeight * 5);
            
            let additionalFields = 0;
            
            if (data.imprisonment) {
                drawInfoBox('زیندانكرن:', data.imprisonment, startY + lineHeight * (6 + additionalFields));
                additionalFields++;
            }
            
            if (data.phone) {
                drawInfoBox('ژمارا موبایلی:', data.phone, startY + lineHeight * (6 + additionalFields));
                additionalFields++;
            }
            
            if (data.sentTo) {
                drawInfoBox('رەوانەكرن بـــو:', data.sentTo, startY + lineHeight * (6 + additionalFields));
            }
        }
        
        // Add footer with timestamp
        ctx.fillStyle = '#34495e';
        roundRect(ctx, 20, canvas.height - 80, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        ctx.font = 'italic 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, canvas.height - 40);
    }
    
    function drawInfoBox(label, value, y, rightX) {
        // Set default rightX if not provided (for portrait mode)
        rightX = rightX || (canvas.width - 100);
        
        // Calculate box width based on orientation
        let boxWidth;
        let boxX;
        
        if (data.orientation === 'landscape') {
            boxWidth = canvas.width / 2 - 80;
            boxX = canvas.width / 2 - 30;
        } else {
            boxWidth = canvas.width - 160;
            boxX = 80;
        }
        
        // Draw box background
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, boxX, y - 30, boxWidth, 45, 8, true, false);
        
        // Add left accent
        ctx.fillStyle = '#3498db';
        roundRect(ctx, boxX, y - 30, 10, 45, {tl: 4, bl: 4, tr: 0, br: 0}, true, false);
        
        // Draw label
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(label, rightX, y);
        
        // Draw value
        ctx.font = '26px Arial';
        ctx.fillStyle = '#34495e';
        ctx.fillText(value, rightX - 220, y);
    }
    
    // Keep old function for compatibility
    function drawTextLine(label, value, y) {
        drawInfoBox(label, value, y);
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
        
        // Set filename with suspect name for better organization
        const suspectName = currentSuspectData.fullname || 'suspect';
        const fileName = 'بطاقة_' + suspectName.replace(/\s+/g, '_') + '_' + new Date().getTime() + '.png';
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
            alert('كارت هاتە خەزنكرن ل جهازێ تە');
        }, 100);
    } catch (error) {
        console.error('Error saving image:', error);
        alert('هەلەك چێبوو دەمێ خەزنكرنا وێنەی. تكایە دووبارە هەول بدە.');
    }
}

// Set card orientation
function setOrientation(orientation) {
    currentSuspectData.orientation = orientation;
}

// Reset form for new entry
function resetForm() {
    suspectForm.reset();
    selectedPhoto.style.display = 'none';
    defaultPhotoIcon.style.display = 'block';
    currentSuspectData = {
        photo: null,
        timestamp: null,
        orientation: 'portrait' // Reset to default portrait orientation
    };
    successModal.style.display = 'none';
    
    // Reset orientation buttons
    document.getElementById('portrait-orientation').classList.add('active');
    document.getElementById('landscape-orientation').classList.remove('active');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);