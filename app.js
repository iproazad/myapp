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
    canvas.width = 1600; // عرض مناسب للبطاقة الأفقية
    canvas.height = 900; // ارتفاع مناسب للبطاقة الأفقية
    canvas.id = 'cardCanvas'; // إضافة معرف للكانفاس
    const ctx = canvas.getContext('2d');
    
    // تطبيق خلفية بتدرج لوني أنيق
    const mainBgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    mainBgGradient.addColorStop(0, '#1a237e'); // لون أزرق داكن
    mainBgGradient.addColorStop(0.7, '#283593');
    mainBgGradient.addColorStop(1, '#303f9f');
    ctx.fillStyle = mainBgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إضافة نمط خفيف للخلفية
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
            ctx.beginPath();
            ctx.arc(i, j, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // إضافة خلفية البطاقة الرئيسية بتدرج لوني أنيق
    const cardBgGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    cardBgGradient.addColorStop(0, '#ffffff');
    cardBgGradient.addColorStop(0.5, '#f8f9fa');
    cardBgGradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = cardBgGradient;
    roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 25, true, false);
    
    // إضافة تأثير الظل للبطاقة الرئيسية
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 10;
    roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 25, true, false);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // إضافة حدود أنيقة
    ctx.strokeStyle = '#3f51b5'; // أزرق أنيق
    ctx.lineWidth = 4;
    roundRect(ctx, 45, 45, canvas.width - 90, canvas.height - 90, 22, false, true);
    
    // إضافة حدود داخلية ثانية بلمسة ذهبية
    ctx.strokeStyle = '#ffc107'; // لون ذهبي
    ctx.lineWidth = 2;
    roundRect(ctx, 50, 50, canvas.width - 100, canvas.height - 100, 20, false, true);
    
    // إضافة رأس عصري بتدرج لوني
    const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    headerGradient.addColorStop(0, '#d32f2f'); // أحمر داكن
    headerGradient.addColorStop(0.5, '#f44336'); // أحمر
    headerGradient.addColorStop(1, '#d32f2f'); // أحمر داكن مرة أخرى
    ctx.fillStyle = headerGradient;
    roundRect(ctx, 50, 50, canvas.width - 100, 120, {tl: 20, tr: 20, bl: 0, br: 0}, true, false);
    
    // إضافة نمط أنيق للرأس
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 50; i < canvas.width - 50; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 50);
        ctx.lineTo(i + 10, 50);
        ctx.lineTo(i, 170);
        ctx.lineTo(i - 10, 170);
        ctx.closePath();
        ctx.fill();
    }
    
    // إضافة خط ذهبي تحت الرأس
    const goldGradient = ctx.createLinearGradient(50, 0, canvas.width - 100, 0);
    goldGradient.addColorStop(0, '#ffd54f');
    goldGradient.addColorStop(0.5, '#ffeb3b');
    goldGradient.addColorStop(1, '#ffd54f');
    ctx.fillStyle = goldGradient;
    roundRect(ctx, 70, 175, canvas.width - 140, 4, 2, true, false);
    
    // إضافة العنوان مع تأثير ظل محسن
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 3;
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('بطاقة المشتبه به', canvas.width / 2, 120);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw case information header
    const headerY = 190;
    const headerHeight = 150;
    
    // Draw header background with gradient
    const infoHeaderGradient = ctx.createLinearGradient(canvas.width, headerY, 0, headerY + headerHeight);
    infoHeaderGradient.addColorStop(0, '#1565c0');
    infoHeaderGradient.addColorStop(1, '#0d47a1');
    ctx.fillStyle = infoHeaderGradient;
    roundRect(ctx, 70, headerY, canvas.width - 140, headerHeight, 15, true, false);
    
    // إضافة نمط خلفية مميز
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 70; i < canvas.width - 70; i += 40) {
        for (let j = headerY; j < headerY + headerHeight; j += 40) {
            ctx.beginPath();
            ctx.arc(i, j, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Add decorative border
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 3;
    roundRect(ctx, 80, headerY + 10, canvas.width - 160, headerHeight - 20, 10, false, true);
    
    // إضافة عنوان لقسم معلومات القضية
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('معلومات القضية', canvas.width / 2, headerY + 35);
    
    // إضافة خط فاصل تحت العنوان
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(120, headerY + 45, canvas.width - 240, 2);
    
    // إنشاء وظيفة لرسم حقول المعلومات بشكل أنيق
    function drawCaseInfoField(label, value, x, y, align) {
        // رسم خلفية للحقل
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        const fieldWidth = 300;
        const fieldHeight = 30;
        const fieldX = align === 'right' ? x - fieldWidth : x;
        roundRect(ctx, fieldX, y - 25, fieldWidth, fieldHeight, 5, true, false);
        
        // كتابة النص
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = align;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${label}: ${value || ''}`, x, y);
    }
    
    // First row
    drawCaseInfoField('جورێ ئاریشێ', data.issueType, canvas.width - 120, headerY + 80, 'right');
    drawCaseInfoField('دەمژمێر', `${data.time || ''} ${data.dayNight || ''}`, canvas.width - 120, headerY + 120, 'right');
    
    // Second row (left side)
    drawCaseInfoField('ناڤێ شوفێری', data.driverName, 120, headerY + 80, 'left');
    drawCaseInfoField('خالا', data.point, 120, headerY + 120, 'left');
    
    // Add current date
    const currentDate = new Date().toLocaleDateString('ar-IQ');
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`تاریخ: ${currentDate}`, canvas.width / 2, headerY + 120);
    
    // Add photo if available with enhanced styling - تعديل موضع الصورة للتصميم الأفقي
    const photoX = canvas.width - 380; // وضع الصورة في الجانب الأيمن
    const photoY = 360; // زيادة المسافة من الأعلى
    const photoWidth = 280; // عرض مناسب للصورة 
    const photoHeight = 350; // ارتفاع مناسب للصورة
    
    if (data.photo) {
        const img = new Image();
        img.src = data.photo;
        
        // Add shadow effect to photo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // Draw photo background with gradient
        const photoGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoWidth, photoY + photoHeight);
        photoGradient.addColorStop(0, '#ffffff');
        photoGradient.addColorStop(1, '#f5f5f5');
        ctx.fillStyle = photoGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, true, false);
        
        // Reset shadow for clean borders
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add photo frame with elegant double border
        ctx.strokeStyle = '#3f51b5';
        ctx.lineWidth = 6;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, false, true);
        
        // Add inner gold accent border
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 3;
        roundRect(ctx, photoX + 6, photoY + 6, photoWidth - 12, photoHeight - 12, 10, false, true);
        
        // Add decorative elements around photo (corners) with enhanced styling
        const cornerPositions = [
            {x: photoX - 8, y: photoY - 8}, // Top left
            {x: photoX + photoWidth + 8, y: photoY - 8}, // Top right
            {x: photoX + photoWidth + 8, y: photoY + photoHeight + 8}, // Bottom right
            {x: photoX - 8, y: photoY + photoHeight + 8} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            // Add gradient to corner decorations
            const cornerGradient = ctx.createRadialGradient(pos.x, pos.y, 3, pos.x, pos.y, 12);
            cornerGradient.addColorStop(0, '#ffd54f'); // Gold center
            cornerGradient.addColorStop(1, '#ff9800'); // Orange edge
            ctx.fillStyle = cornerGradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2, true);
            ctx.fill();
            
            // إضافة حدود للزخارف
            ctx.strokeStyle = '#f57c00';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2, true);
            ctx.stroke();
        });
        
        // Draw rectangular photo
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, photoX + 6, photoY + 6, photoWidth - 12, photoHeight - 12, 10, false, false);
        ctx.clip();
        
        // تحسين طريقة عرض الصورة مع الحفاظ على النسب
        const imgAspect = img.width / img.height;
        const frameAspect = (photoWidth - 12) / (photoHeight - 12);
        
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspect > frameAspect) {
            // الصورة أعرض من الإطار
            drawHeight = photoHeight - 12;
            drawWidth = drawHeight * imgAspect;
            offsetX = (photoWidth - 12 - drawWidth) / 2;
        } else {
            // الصورة أطول من الإطار
            drawWidth = photoWidth - 12;
            drawHeight = drawWidth / imgAspect;
            offsetY = (photoHeight - 12 - drawHeight) / 2;
        }
        
        ctx.drawImage(img, photoX + 6 + offsetX, photoY + 6 + offsetY, drawWidth, drawHeight);
        ctx.restore();
        
        // إضافة تأثير تظليل خفيف على الصورة
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, photoX + 6, photoY + 6, photoWidth - 12, photoHeight - 12, 10, false, false);
        ctx.clip();
        ctx.fillRect(photoX + 6, photoY + 6, photoWidth - 12, photoHeight - 12);
        ctx.restore();
    } else {
        // Draw placeholder if no image is available
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // Draw photo background with gradient
        const photoGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoWidth, photoY + photoHeight);
        photoGradient.addColorStop(0, '#f5f5f5');
        photoGradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = photoGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, true, false);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add photo frame
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 6;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, false, true);
        
        // Add user icon
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        // Head
        ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2 - 40, 60, 0, Math.PI * 2, true);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.moveTo(photoX + photoWidth/2, photoY + photoHeight/2 + 40);
        ctx.arc(photoX + photoWidth/2, photoY + photoHeight/2 + 40, 80, Math.PI * 0.7, Math.PI * 0.3, true);
        ctx.fill();
        
        // إضافة نص بديل
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#616161';
        ctx.textAlign = 'center';
        ctx.fillText('لا توجد صورة', photoX + photoWidth/2, photoY + photoHeight - 30);
    }
    
    // Draw suspect information section - تعديل موضع قسم المعلومات للتصميم الأفقي
    const infoY = headerY + headerHeight + 30;
    const infoWidth = canvas.width - 450; // عرض قسم المعلومات مع ترك مساحة للصورة
    
    // Draw section background with gradient
    const infoGradient = ctx.createLinearGradient(0, infoY, 0, infoY + 600);
    infoGradient.addColorStop(0, '#f8f9fa');
    infoGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = infoGradient;
    roundRect(ctx, 50, infoY, infoWidth, 600, 10, true, false);
    
    // Add elegant border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 3;
    roundRect(ctx, 50, infoY, infoWidth, 600, 10, false, true);
    
    // Add section title with enhanced styling
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('پێزانین تومەتبار', infoWidth / 2 + 50, infoY + 40);
    
    // Add gold accent line under title
    const lineY = infoY + 60;
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(100, lineY, infoWidth - 100, 2);
    
    // Draw suspect information in two columns - تعديل توزيع الأعمدة للتصميم الأفقي
    const leftColX = 100;
    const rightColX = infoWidth - 50;
    let rowY = infoY + 100;
    const lineHeight = 45; // المسافة بين الصفوف
    const fieldWidth = infoWidth / 2 - 80; // عرض حقل المعلومات
    const fieldHeight = 35; // ارتفاع حقل المعلومات
    
    // وظيفة لرسم حقل معلومات مع خلفية رمادية شفافة
    function drawInfoField(label, value, x, y, align) {
        // رسم الخلفية الرمادية الشفافة
        ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        const fieldX = align === 'right' ? x - fieldWidth : x;
        roundRect(ctx, fieldX, y - fieldHeight + 5, fieldWidth, fieldHeight, 5, true, false);
        
        // إضافة حدود خفيفة
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 1;
        roundRect(ctx, fieldX, y - fieldHeight + 5, fieldWidth, fieldHeight, 5, false, true);
        
        // كتابة النص
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = align;
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(`${label}: ${value || ''}`, x, y);
    }
    
    // Right column (personal info)
    ctx.textAlign = 'right';
    drawInfoField('ناڤ و پاشناڤ', data.fullName, rightColX, rowY, 'right');
    rowY += lineHeight;
    drawInfoField('ناڤێ بابێ', data.fatherName, rightColX, rowY, 'right');
    rowY += lineHeight;
    drawInfoField('ناڤێ دایكێ', data.motherName, rightColX, rowY, 'right');
    rowY += lineHeight;
    drawInfoField('ساخبوون', data.birthYear, rightColX, rowY, 'right');
    rowY += lineHeight;
    drawInfoField('جهێ ساخبوونێ', data.birthPlace, rightColX, rowY, 'right');
    
    // Reset for left column
    rowY = infoY + 100;
    
    // Left column (case info)
    drawInfoField('جهێ نیشتەجێبوونێ', data.residencePlace, leftColX, rowY, 'left');
    rowY += lineHeight;
    drawInfoField('ژمارا مۆبایلێ', data.phoneNumber, leftColX, rowY, 'left');
    rowY += lineHeight;
    drawInfoField('جۆرێ تاوانێ', data.crimeType, leftColX, rowY, 'left');
    rowY += lineHeight;
    drawInfoField('ژمارا دۆسیێ', data.fileNumber, leftColX, rowY, 'left');
    rowY += lineHeight;
    drawInfoField('تێبینی', data.notes, leftColX, rowY, 'left');
    
    // Add separator - تعديل موضع الفاصل للتصميم الأفقي
    const separatorY = infoY + 600 + 20;
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
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`تم إنشاء هذه البطاقة في: ${timestamp}`, canvas.width / 2, footerY + 50);
    
    // Save the final image
    return canvas.toDataURL('image/png');
}