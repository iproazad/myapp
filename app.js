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
    
    // Set canvas dimensions - reduced height for more compact layout
    canvas.width = 1500;
    canvas.height = 900; // Reduced height for more compact layout with horizontal arrangement
    
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
        const photoHeight = 600; // طول الصورة العمودية
        
        // إضافة تأثير الظل للصورة
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        
        // رسم خلفية الصورة بتدرج لوني
        const photoBgGradient = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
        photoBgGradient.addColorStop(0, '#f5f7fa');
        photoBgGradient.addColorStop(1, '#e4e7eb');
        ctx.fillStyle = photoBgGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, true, false);
        
        // إضافة إطار للصورة بتدرج لوني
        const frameBorderGradient = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
        frameBorderGradient.addColorStop(0, '#3498db');
        frameBorderGradient.addColorStop(0.5, '#2980b9');
        frameBorderGradient.addColorStop(1, '#1a5276');
        ctx.strokeStyle = frameBorderGradient;
        ctx.lineWidth = 5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 15, false, true);
        
        // إيقاف تأثير الظل
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // إضافة زخارف على زوايا الصورة
        const cornerPositions = [
            {x: photoX - 5, y: photoY - 5}, // Top left
            {x: photoX + photoWidth + 5, y: photoY - 5}, // Top right
            {x: photoX + photoWidth + 5, y: photoY + photoHeight + 5}, // Bottom right
            {x: photoX - 5, y: photoY + photoHeight + 5} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            // إضافة دائرة ذهبية في كل زاوية
            const cornerGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
            cornerGradient.addColorStop(0, '#f1c40f');
            cornerGradient.addColorStop(1, '#f39c12');
            ctx.fillStyle = cornerGradient;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2, true);
            ctx.fill();
            
            // إضافة حدود للدائرة
            ctx.strokeStyle = '#e67e22';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2, true);
            ctx.stroke();
        });
        
        // رسم أيقونة المستخدم بشكل أكثر جاذبية
        const iconX = photoX + photoWidth / 2;
        const iconY = photoY + photoHeight / 2 - 50;
        
        // رسم خلفية دائرية للرأس
        const headGradient = ctx.createRadialGradient(iconX, iconY, 0, iconX, iconY, 70);
        headGradient.addColorStop(0, '#95a5a6');
        headGradient.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(iconX, iconY, 70, 0, Math.PI * 2, true);
        ctx.fill();
        
        // رسم الجسم بتدرج لوني
        const bodyGradient = ctx.createRadialGradient(iconX, iconY + 150, 0, iconX, iconY + 150, 100);
        bodyGradient.addColorStop(0, '#95a5a6');
        bodyGradient.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(iconX, iconY + 150, 100, Math.PI, 0, true);
        ctx.fill();
        
        // إضافة تفاصيل للوجه
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(iconX, iconY + 20, 20, 0, Math.PI, true);
        ctx.fill();
        
        // إضافة نص تحت الصورة
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#34495e';
        ctx.textAlign = 'center';
        ctx.fillText('وێنێ تومەتباری', iconX, photoY + photoHeight - 30);
        
        // Continue with drawing text
        drawSuspectInfo();
        currentSuspectData.cardImage = canvas.toDataURL('image/png');
    }
    
    function drawSuspectInfo() {
        // Define info section dimensions
        const infoX = 50;
        const infoY = 180;
        const infoWidth = canvas.width - 550; // Leave space for photo on the right
        // سنحدد ارتفاع الإطار لاحقاً بناءً على موضع التذييل
        let infoHeight;
        
        // سيتم رسم الإطار لاحقاً بعد حساب الارتفاع الديناميكي
        
        // إضافة تأثير الظل للعنوان
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Add section title background with modern gradient
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + 70);
        titleGradient.addColorStop(0, '#1a5276'); // أزرق داكن
        titleGradient.addColorStop(0.5, '#2980b9'); // أزرق متوسط
        titleGradient.addColorStop(1, '#3498db'); // أزرق فاتح
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 70, {tl: 15, tr: 15, bl: 0, br: 0}, true, false);
        
        // إضافة زخرفة على العنوان بتدرج لوني ذهبي
        const decorLineGradient = ctx.createLinearGradient(infoX + 30, infoY + 60, infoX + infoWidth - 30, infoY + 60);
        decorLineGradient.addColorStop(0, '#f1c40f');
        decorLineGradient.addColorStop(0.5, '#f39c12');
        decorLineGradient.addColorStop(1, '#e67e22');
        ctx.fillStyle = decorLineGradient;
        ctx.fillRect(infoX + 30, infoY + 60, infoWidth - 60, 3);
        
        // Add section title with shadow for better visibility
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 45);
        ctx.shadowColor = 'transparent'; // إيقاف تأثير الظل
        
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
        
        // Reduced line height for more compact layout
        const oldLineHeight = 50; // Smaller line height for original fields
        const newLineHeight = 40; // Even smaller line height for new fields
        
        // ترتيب الحقول الأصلية في أزواج أفقية لتوفير المساحة
        const origCol1X = 80;
        const origCol2X = canvas.width / 2;
        
        // الصف الأول
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, origCol1X);
        drawInfoBox('ژدایـــكبون:', data.birthdate, startY, origCol2X);
        
        // الصف الثاني
        drawInfoBox('ئاكنجی بوون:', data.address, startY + oldLineHeight, origCol1X);
        drawInfoBox('جورێ ئاریشێ:', data.issueType, startY + oldLineHeight, origCol2X);
        
        // الصف الثالث
        drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + oldLineHeight * 2, origCol1X);
        drawInfoBox('كارێ وی:', data.job, startY + oldLineHeight * 2, origCol2X);
        
        // ترتيب الحقول الشرطية في أزواج أفقية لتوفير المساحة
        let conditionalFieldsY = startY + oldLineHeight * 3;
        let hasLeftField = false;
        let hasRightField = false;
        
        // ترتيب الحقول الشرطية في صف واحد إذا كان هناك حقلان فقط
        if (data.imprisonment && data.phone && !data.sentTo) {
            drawInfoBox('زیندانكرن:', data.imprisonment, conditionalFieldsY, origCol1X);
            drawInfoBox('ژمارا موبایلی:', data.phone, conditionalFieldsY, origCol2X);
            conditionalFieldsY += oldLineHeight;
            hasLeftField = hasRightField = true;
        } else if (data.imprisonment && !data.phone && data.sentTo) {
            drawInfoBox('زیندانكرن:', data.imprisonment, conditionalFieldsY, origCol1X);
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, conditionalFieldsY, origCol2X);
            conditionalFieldsY += oldLineHeight;
            hasLeftField = hasRightField = true;
        } else if (!data.imprisonment && data.phone && data.sentTo) {
            drawInfoBox('ژمارا موبایلی:', data.phone, conditionalFieldsY, origCol1X);
            drawInfoBox('رەوانەكرن بـــو:', data.sentTo, conditionalFieldsY, origCol2X);
            conditionalFieldsY += oldLineHeight;
            hasLeftField = hasRightField = true;
        } else {
            // ترتيب الحقول الشرطية بشكل فردي إذا كان هناك حقل واحد أو ثلاثة حقول
            if (data.imprisonment) {
                drawInfoBox('زیندانكرن:', data.imprisonment, conditionalFieldsY, hasRightField ? origCol1X : (hasLeftField ? origCol2X : origCol1X));
                if (hasLeftField && !hasRightField) {
                    hasRightField = true;
                    conditionalFieldsY += oldLineHeight;
                } else if (!hasLeftField) {
                    hasLeftField = true;
                }
            }
            
            if (data.phone) {
                drawInfoBox('ژمارا موبایلی:', data.phone, conditionalFieldsY, hasRightField ? origCol1X : (hasLeftField ? origCol2X : origCol1X));
                if (hasLeftField && !hasRightField) {
                    hasRightField = true;
                    conditionalFieldsY += oldLineHeight;
                } else if (!hasLeftField) {
                    hasLeftField = true;
                }
            }
            
            if (data.sentTo) {
                drawInfoBox('رەوانەكرن بـــو:', data.sentTo, conditionalFieldsY, hasRightField ? origCol1X : (hasLeftField ? origCol2X : origCol1X));
                if (hasLeftField && !hasRightField) {
                    hasRightField = true;
                } else if (!hasLeftField) {
                    hasLeftField = true;
                }
                if (hasLeftField && hasRightField) {
                    conditionalFieldsY += oldLineHeight;
                }
            }
        }
        
        // تنظيم الحقول الإضافية مباشرة بعد الحقول الأساسية دون فاصل
        const newFieldsY = conditionalFieldsY + 10; // مسافة صغيرة بعد الحقول الأساسية
        const colWidth = (canvas.width - 160) / 2; // تقسيم العرض المتاح إلى عمودين متساويين
        const col1X = 80;
        const col2X = 80 + colWidth;
        
        // رسم الحقول في شكل شبكة 2×2 بنفس أسلوب الحقول الأساسية
        drawInfoBox('دەمژمێر:', data.time + ' - ' + data.dayNight, newFieldsY, col1X);
        drawInfoBox('ناڤێ شوفێری:', data.driverName, newFieldsY, col2X);
        drawInfoBox('جهێ ئاریشێ:', data.problemLocation, newFieldsY + newLineHeight, col1X);
        drawInfoBox('خالا:', data.point, newFieldsY + newLineHeight, col2X);
        
        // Add footer with timestamp - modern gradient background
        const footerY = newFieldsY + newLineHeight * 2 + 30; // زيادة المسافة قبل التذييل
        
        // حساب ارتفاع الإطار ديناميكياً بناءً على موضع التذييل
        infoHeight = footerY + 70 - infoY; // إضافة مساحة للتذييل (60 للتذييل + 10 هامش)
        
        // إعادة رسم الإطار بالارتفاع الجديد مع تدرج لوني خفيف
        const bgGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + infoHeight);
        bgGradient.addColorStop(0, 'rgba(236, 240, 241, 0.5)');
        bgGradient.addColorStop(1, 'rgba(225, 238, 250, 0.5)');
        ctx.fillStyle = bgGradient;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 15, true, false);
        
        // إعادة رسم حدود الإطار بتدرج لوني
        const borderGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + infoHeight);
        borderGradient.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
        borderGradient.addColorStop(0.5, 'rgba(41, 128, 185, 0.5)');
        borderGradient.addColorStop(1, 'rgba(52, 152, 219, 0.4)');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 2;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 15, false, true);
        
        // إضافة زخرفة قبل التذييل
        ctx.fillStyle = '#f39c12';
        for (let i = 0; i < 5; i++) {
            const dotX = infoX + infoWidth / 2 - 40 + i * 20;
            ctx.beginPath();
            ctx.arc(dotX, footerY - 15, 3, 0, Math.PI * 2, true);
            ctx.fill();
        }
        
        // رسم خلفية التذييل بتدرج لوني أكثر جاذبية
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, 'rgba(26, 82, 118, 0.95)');
        footerGradient.addColorStop(0.5, 'rgba(41, 128, 185, 0.95)');
        footerGradient.addColorStop(1, 'rgba(52, 152, 219, 0.95)');
        ctx.fillStyle = footerGradient;
        
        // إضافة تأثير الظل للتذييل
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        roundRect(ctx, 20, footerY, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 20, br: 20}, true, false);
        
        // إضافة زخرفة داخل التذييل
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(40, footerY + 10, canvas.width - 80, 2);
        
        // إضافة الطابع الزمني مع تأثير الظل
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, footerY + 35);
        
        // إيقاف تأثير الظل
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function drawInfoBox(label, value, y, boxX = 80) {
        // تحسين قياسات الحقول لتكون أكثر جاذبية
        const boxHeight = 50; // زيادة ارتفاع الحقول لمظهر أفضل
        const boxWidth = (canvas.width / 2) - 60; // عرض الحقول
        const fontSize = 18; // حجم الخط
        const labelWidth = 150; // زيادة عرض مربع العنوان للنصوص الطويلة
        
        // إضافة تأثير الظل للحقول
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // رسم خلفية مربع العنوان بتدرج لوني أكثر وضوحاً
        const labelGradient = ctx.createLinearGradient(boxX, y - boxHeight/2, boxX + labelWidth, y - boxHeight/2);
        labelGradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)');
        labelGradient.addColorStop(1, 'rgba(41, 128, 185, 0.9)');
        ctx.fillStyle = labelGradient;
        roundRect(ctx, boxX, y - boxHeight/2, labelWidth, boxHeight, {tl: 10, bl: 10, tr: 0, br: 0}, true, false);
        
        // رسم خلفية مربع القيمة بلون أبيض مع تدرج خفيف
        const valueGradient = ctx.createLinearGradient(boxX + labelWidth, y - boxHeight/2, boxX + boxWidth, y - boxHeight/2);
        valueGradient.addColorStop(0, '#ffffff');
        valueGradient.addColorStop(1, '#f8f9fa');
        ctx.fillStyle = valueGradient;
        roundRect(ctx, boxX + labelWidth, y - boxHeight/2, boxWidth - labelWidth, boxHeight, {tl: 0, bl: 0, tr: 10, br: 10}, true, false);
        
        // إيقاف تأثير الظل
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // إضافة فاصل زخرفي بتدرج لوني ذهبي
        const separatorGradient = ctx.createLinearGradient(boxX + labelWidth - 3, y - boxHeight/2, boxX + labelWidth - 3, y + boxHeight/2);
        separatorGradient.addColorStop(0, '#f1c40f');
        separatorGradient.addColorStop(0.5, '#f39c12');
        separatorGradient.addColorStop(1, '#e67e22');
        ctx.fillStyle = separatorGradient;
        ctx.fillRect(boxX + labelWidth - 3, y - boxHeight/2, 3, boxHeight);
        
        // إضافة حدود خفيفة للحقول
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 1;
        roundRect(ctx, boxX, y - boxHeight/2, boxWidth, boxHeight, {tl: 10, bl: 10, tr: 10, br: 10}, false, true);
        
        // رسم العنوان بخط غامق وظل خفيف
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + labelWidth/2, y + boxHeight/4);
        
        // رسم القيمة مع اقتطاع النص الطويل
        ctx.shadowColor = 'transparent';
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#34495e';
        ctx.textAlign = 'right';
        
        // قياس عرض النص للتأكد من أنه يناسب المساحة المتاحة
        const valueWidth = boxWidth - labelWidth - 20; // المساحة المتاحة للقيمة
        const displayValue = value || '';
        const textWidth = ctx.measureText(displayValue).width;
        
        if (textWidth > valueWidth) {
            // تقصير النص إذا كان طويلاً جداً
            let truncatedValue = displayValue;
            while (ctx.measureText(truncatedValue + '...').width > valueWidth && truncatedValue.length > 0) {
                truncatedValue = truncatedValue.slice(0, -1);
            }
            ctx.fillText(truncatedValue + '...', boxX + boxWidth - 15, y + boxHeight/4);
        } else {
            ctx.fillText(displayValue, boxX + boxWidth - 15, y + boxHeight/4);
        }
        
        // إعادة ضبط محاذاة النص للنصوص الأخرى
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