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
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 1000; // عرض مناسب للبطاقة
    canvas.height = 1400; // ارتفاع مناسب للبطاقة
    canvas.id = 'cardCanvas'; // إضافة معرف للكانفاس
    const ctx = canvas.getContext('2d');
    
    // تطبيق خلفية بتدرج لوني أنيق
    const mainBgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    mainBgGradient.addColorStop(0, '#ffffff');
    mainBgGradient.addColorStop(1, '#f0f0f0');
    ctx.fillStyle = mainBgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إضافة نمط خفيف للخلفية
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < canvas.width; i += 60) {
        for (let j = 0; j < canvas.height; j += 60) {
            ctx.fillRect(i, j, 30, 30);
        }
    }
    
    // إضافة خلفية البطاقة الرئيسية بتدرج لوني أنيق
    const cardBgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    cardBgGradient.addColorStop(0, '#ffffff');
    cardBgGradient.addColorStop(1, '#f8f9fa');
    ctx.fillStyle = cardBgGradient;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 20, true, false);
    
    // إضافة تأثير الظل للبطاقة الرئيسية
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;
    roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 20, true, false);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // إضافة حدود أنيقة بلمسة ذهبية
    ctx.strokeStyle = '#3498db'; // أزرق أساسي
    ctx.lineWidth = 3;
    roundRect(ctx, 25, 25, canvas.width - 50, canvas.height - 50, 18, false, true);
    
    // إضافة حدود داخلية ثانية بلمسة ذهبية
    ctx.strokeStyle = '#f1c40f'; // لون ذهبي
    ctx.lineWidth = 1;
    roundRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 16, false, true);
    
    // إضافة رأس عصري بتدرج لوني
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#2980b9'); // أزرق داكن
    headerGradient.addColorStop(0.5, '#3498db'); // أزرق متوسط
    headerGradient.addColorStop(1, '#2980b9'); // أزرق داكن مرة أخرى
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 30, 30, canvas.width - 60, 110, {tl: 16, tr: 16, bl: 0, br: 0}, true, false);
    
    // إضافة نمط أنيق للرأس
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += 30) {
        ctx.fillRect(i, 30, 15, 110);
    }
    
    // إضافة خط ذهبي تحت الرأس
    ctx.fillStyle = '#f1c40f'; // لون ذهبي
    ctx.fillRect(50, 145, canvas.width - 100, 2);
    
    // إضافة العنوان مع تأثير ظل محسن
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('بەشێ پولیسێن هەوارهاتنێ', canvas.width / 2, 90);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw case information header
    const headerY = 150;
    const headerHeight = 120;
    
    // Draw header background with gradient
    const infoHeaderGradient = ctx.createLinearGradient(0, headerY, 0, headerY + headerHeight);
    infoHeaderGradient.addColorStop(0, '#3498db');
    infoHeaderGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = infoHeaderGradient;
    ctx.fillRect(50, headerY, canvas.width - 100, headerHeight);
    
    // Add decorative border
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, headerY + 10, canvas.width - 120, headerHeight - 20);
    
    // Add case information
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    
    // First row
    ctx.fillText(`جورێ ئاریشێ: ${data.issueType || ''}`, canvas.width - 100, headerY + 40);
    ctx.fillText(`دەمژمێر: ${data.time || ''} ${data.dayNight || ''}`, canvas.width - 100, headerY + 70);
    ctx.fillText(`جهێ ئاریشێ: ${data.problemLocation || ''}`, canvas.width - 100, headerY + 100);
    
    // Second row (left side)
    ctx.textAlign = 'left';
    ctx.fillText(`ناڤێ شوفێری: ${data.driverName || ''}`, 100, headerY + 40);
    ctx.fillText(`خالا: ${data.point || ''}`, 100, headerY + 70);
    ctx.fillText(`رەوانەكرن بـــو: ${data.sentTo || ''}`, 100, headerY + 100);
    
    // Add current date
    const currentDate = new Date().toLocaleDateString('ar-IQ');
    ctx.textAlign = 'center';
    ctx.font = '18px Arial';
    ctx.fillText(`تاریخ: ${currentDate}`, canvas.width / 2, headerY + 100);
    
    // Add photo if available with enhanced styling
    const photoX = canvas.width / 2 - 150; // وضع الصورة في المنتصف
    const photoY = 300; // زيادة المسافة من الأعلى
    const photoWidth = 300; // عرض مناسب للصورة
    const photoHeight = 350; // ارتفاع مناسب للصورة
    
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
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
        
        // تحسين طريقة عرض الصورة مع الحفاظ على النسب
        const imgAspect = img.width / img.height;
        const frameAspect = (photoWidth - 10) / (photoHeight - 10);
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspect > frameAspect) {
            // الصورة أعرض من الإطار
            drawHeight = photoHeight - 10;
            drawWidth = drawHeight * imgAspect;
            offsetX = (photoWidth - 10 - drawWidth) / 2;
        } else {
            // الصورة أطول من الإطار
            drawWidth = photoWidth - 10;
            drawHeight = drawWidth / imgAspect;
            offsetY = (photoHeight - 10 - drawHeight) / 2;
        }
        
        ctx.drawImage(img, photoX + 5 + offsetX, photoY + 5 + offsetY, drawWidth, drawHeight);
        ctx.restore();
    } else {
        // Draw placeholder if no image is available
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Draw photo background with gradient
        const photoGradient = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
        photoGradient.addColorStop(0, '#f5f5f5');
        photoGradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = photoGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, true, false);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add photo frame
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 10, false, true);
        
        // Add user icon
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        // Head
        ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2 - 30, 50, 0, Math.PI * 2, true);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.moveTo(photoX + photoWidth/2, photoY + photoHeight/2 + 30);
        ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2 + 30, 70, Math.PI * 0.7, Math.PI * 0.3, true);
        ctx.fill();
    }
    
    // Draw suspect information section
    const infoY = photoY + photoHeight + 30;
    
    // Draw section background with gradient
    const infoGradient = ctx.createLinearGradient(0, infoY, 0, infoY + 400);
    infoGradient.addColorStop(0, '#f8f9fa');
    infoGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = infoGradient;
    roundRect(ctx, 50, infoY, canvas.width - 100, 400, 10, true, false);
    
    // Add elegant border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    roundRect(ctx, 50, infoY, canvas.width - 100, 400, 10, false, true);
    
    // Add section title with enhanced styling
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('پێزانین تومەتبار', canvas.width / 2, infoY + 40);
    
    // Add gold accent line under title
    const lineY = infoY + 60;
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(100, lineY, canvas.width - 200, 2);
    
    // Draw suspect information in two columns
    const leftColX = 100;
    const rightColX = canvas.width - 100;
    let rowY = infoY + 100;
    const lineHeight = 40;
    
    // Set text style for information
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#2c3e50';
    
    // Right column (personal info)
    ctx.fillText(`ناڤ و پاشناڤ: ${data.fullName || ''}`, rightColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`ناڤێ بابێ: ${data.fatherName || ''}`, rightColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`ناڤێ دایكێ: ${data.motherName || ''}`, rightColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`ساخبوون: ${data.birthYear || ''}`, rightColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`جهێ ساخبوونێ: ${data.birthPlace || ''}`, rightColX, rowY);
    
    // Reset for left column
    rowY = infoY + 100;
    ctx.textAlign = 'left';
    
    // Left column (case info)
    ctx.fillText(`جهێ نیشتەجێبوونێ: ${data.residencePlace || ''}`, leftColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`ژمارا مۆبایلێ: ${data.phoneNumber || ''}`, leftColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`جۆرێ تاوانێ: ${data.crimeType || ''}`, leftColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`ژمارا دۆسیێ: ${data.fileNumber || ''}`, leftColX, rowY);
    rowY += lineHeight;
    ctx.fillText(`تێبینی: ${data.notes || ''}`, leftColX, rowY);
    
    // Add separator
    const separatorY = infoY + 400 + 20;
    ctx.fillStyle = '#3498db';
    ctx.fillRect(50, separatorY, canvas.width - 100, 2);
    
    // Add footer with timestamp
    const footerY = separatorY + 20;
    
    // Add elegant footer with gradient
    const footerGradient = ctx.createLinearGradient(0, footerY, 0, footerY + 80);
    footerGradient.addColorStop(0, '#3498db');
    footerGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = footerGradient;
    roundRect(ctx, 50, footerY, canvas.width - 100, 80, 10, true, false);
    
    // Add pattern to footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, footerY, 10, 80);
    }
    
    // Add gold accent line
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(70, footerY + 15, canvas.width - 140, 2);
    
    // Add timestamp with enhanced styling
    const timestamp = new Date().toLocaleString('ar-IQ');
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`تم إنشاء هذه البطاقة في: ${timestamp}`, canvas.width / 2, footerY + 50);
    
    // Save the final image
    return canvas.toDataURL('image/png');
}