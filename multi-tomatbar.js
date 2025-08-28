document.addEventListener('DOMContentLoaded', initApp);

// Global variables
const personCount = 1; // ثابت لأننا نسمح بشخص واحد فقط
// تم إزالة MAX_PERSONS لأننا نسمح بشخص واحد فقط
let personPhotos = {};
let savedRecords = [];
const STORAGE_KEY = 'tomaryTomatbarRecords';
let currentViewingRecordId = null; // معرف السجل الحالي الذي يتم عرضه

function initApp() {
    // تأكد من وجود العناصر قبل إضافة مستمعي الأحداث
    const multiPersonForm = document.getElementById('multi-person-form');
    if (multiPersonForm) {
        multiPersonForm.addEventListener('submit', saveMultiPersonData);
    }
    
    const shareWhatsappBtn = document.getElementById('share-whatsapp');
    if (shareWhatsappBtn) {
        shareWhatsappBtn.addEventListener('click', shareViaWhatsapp);
    }
    
    const newEntryBtn = document.getElementById('new-entry');
    if (newEntryBtn) {
        newEntryBtn.addEventListener('click', resetForm);
    }
    
    const closeRecordsModalBtn = document.getElementById('close-records-modal');
    if (closeRecordsModalBtn) {
        closeRecordsModalBtn.addEventListener('click', hideRecordsModal);
    }
    
    // تهيئة أزرار التبويبات
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-tab');
            
            // تحديث الأزرار النشطة
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // تحديث المحتوى النشط
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            // تحديث قائمة السجلات عند الانتقال إلى تبويب السجلات
            if (targetId === 'records-list') {
                renderRecordsList();
            }
        });
    });
    
    // تهيئة حقل البحث
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.trim() === '') {
                renderRecordsList(); // عرض جميع السجلات إذا كان حقل البحث فارغًا
            } else {
                filterRecords(searchTerm); // تصفية السجلات بناءً على مصطلح البحث
            }
        });
    }
    
    // إضافة زر مسح البحث
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton && searchInput) {
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            renderRecordsList();
        });
    }
    
    // Initialize photo buttons for the first person
    initializePhotoButton(1);
    
    // Load saved records from localStorage
    loadSavedRecords();
    
    // تنشيط تبويب "سجل جديد" افتراضيًا
    const newRecordTab = document.querySelector('.tab-btn[data-tab="new-record"]');
    if (newRecordTab) {
        newRecordTab.click();
    }
    
    // إضافة وظيفة updateRecordsList لتوافق التصميم الجديد
    window.updateRecordsList = function() {
        renderRecordsList();
    };
}

function initializePhotoButton(personId) {
    const photoButton = document.querySelector(`.photo-button[data-person-id="${personId}"]`);
    const photoInput = document.getElementById(`photo-input-${personId}`);
    
    photoButton.addEventListener('click', () => {
        photoInput.click();
    });
    
    photoInput.addEventListener('change', (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const selectedPhoto = document.getElementById(`selected-photo-${personId}`);
                const defaultIcon = document.getElementById(`default-photo-icon-${personId}`);
                
                selectedPhoto.src = e.target.result;
                selectedPhoto.style.display = 'block';
                defaultIcon.style.display = 'none';
                
                // Store the photo data
                personPhotos[personId] = e.target.result;
            };
            
            reader.readAsDataURL(event.target.files[0]);
        }
    });
}



function updatePersonNumbers() {
    const personContainers = document.querySelectorAll('.person-container');
    let visibleCount = 0;
    
    personContainers.forEach((container, index) => {
        visibleCount++;
        const numberElement = container.querySelector('.person-number');
        numberElement.textContent = visibleCount;
        
        // Also update the photo number
        const photoNumber = container.querySelector('.person-photo-number');
        photoNumber.textContent = visibleCount;
    });
    // تم إزالة الجزء المتعلق بزر إضافة شخص آخر
}

function saveMultiPersonData(event) {
    event.preventDefault();
    
    // Collect data for all visible persons
    const personContainers = document.querySelectorAll('.person-container');
    const personsData = [];
    
    personContainers.forEach(container => {
        const personId = container.dataset.personId;
        // تم إزالة personType لأنه غير موجود في HTML
        const fullName = document.getElementById(`fullname-${personId}`)?.value || '';
        const birthdate = document.getElementById(`birthdate-${personId}`)?.value || '';
        const address = document.getElementById(`address-${personId}`)?.value || '';
        const phone = document.getElementById(`phone-${personId}`)?.value || '';
        const maritalStatus = document.getElementById(`marital-status-${personId}`)?.value || '';
        const imprisoned = document.getElementById(`imprisonment-${personId}`)?.value || '';
        const idNumber = document.getElementById(`id-number-${personId}`)?.value || '';
        const occupation = document.getElementById(`occupation-${personId}`)?.value || '';
        const photo = personPhotos[personId] || null;
        
        personsData.push({
            id: personId,
            name: fullName,
            birthdate: birthdate,
            address: address,
            phone: phone,
            maritalStatus: maritalStatus,
            imprisoned: imprisoned,
            idNumber: idNumber,
            occupation: occupation,
            photo: photo
        });
    });
    
    // Collect case information
    const caseData = {
        issueType: document.getElementById('issue-type')?.value || '',
        timeFrom: document.getElementById('time-from')?.value || '',
        timeTo: document.getElementById('time-to')?.value || '',
        period: document.getElementById('period')?.value || '',
        location: document.getElementById('problem-location')?.value || '',
        driverName: document.getElementById('driver-name')?.value || '',
        point: document.getElementById('point')?.value || '',
        sentTo: document.getElementById('sent-to')?.value || '',
        notes: document.getElementById('notes')?.value || ''
    };
    
    // Generate and save the multi-person card
    const cardImage = generateMultiPersonCard(personsData, caseData);
    
    // Save record to localStorage with date for better sorting
    const date = new Date();
    saveRecord(personsData, caseData, cardImage, date);
    
    // تحديث قائمة السجلات بعد الحفظ
    renderRecordsList();
    
    // Show success modal
    document.getElementById('success-modal').style.display = 'flex';
}

function generateMultiPersonCard(personsData, caseData) {
    const canvas = document.createElement('canvas');
    canvas.id = 'multiPersonCanvas';
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on number of persons with higher resolution
    const personHeight = 1050; // زيادة ارتفاع الشخص لاستيعاب الصورة الأكثر عمودية
    const headerHeight = 440; // Doubled height for case information
    const notesHeight = caseData.notes ? 200 : 0; // Doubled height for notes section if notes exist
    const canvasWidth = 2000; // Doubled width for higher resolution
    const canvasHeight = headerHeight + (personsData.length * personHeight) + notesHeight + 100; // Added footer space
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Fill background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGradient.addColorStop(0, '#f5f5f5');
    bgGradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add subtle pattern to background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let i = 0; i < canvasWidth; i += 30) {
        for (let j = 0; j < canvasHeight; j += 30) {
            ctx.fillRect(i, j, 15, 15);
        }
    }
    
    // Add card border
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
    
    // Draw header with case information
    drawCaseHeader(ctx, caseData, canvasWidth, headerHeight);
    
    // Draw each person's information with improved spacing
    personsData.forEach((person, index) => {
        const yOffset = headerHeight + (index * personHeight);
        drawPersonInfo(ctx, person, yOffset, canvasWidth, personHeight);
        
        // Add separator between persons (except after the last one)
        if (index < personsData.length - 1) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(50, yOffset + personHeight - 10);
            ctx.lineTo(canvasWidth - 50, yOffset + personHeight - 10);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    });
    
    // Draw notes section if notes exist
    if (caseData.notes) {
        const notesY = headerHeight + (personsData.length * personHeight) + 10;
        drawNotesSection(ctx, caseData.notes, canvasWidth, notesY, notesHeight - 10);
    }
    
    // Add footer
    const footerY = headerHeight + (personsData.length * personHeight) + notesHeight + 10;
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(0, footerY, canvasWidth, 80);
    
    // Add footer text
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const timestamp = new Date().toLocaleString('ar-IQ');
    ctx.fillText(`تم إنشاء هذه البطاقة في: ${timestamp}`, canvasWidth / 2, footerY + 50);
    
    // Convert canvas to image and save with high quality
    const cardImage = canvas.toDataURL('image/png', 1.0);
    saveImageToDevice(cardImage);
    
    // Return the card image for saving in records
    return cardImage;
}

function drawCaseHeader(ctx, caseData, width, height) {
    // Draw header background with enhanced gradient
    const headerGradient = ctx.createLinearGradient(0, 0, 0, height);
    headerGradient.addColorStop(0, '#c0392b');
    headerGradient.addColorStop(0.5, '#e74c3c');
    headerGradient.addColorStop(1, '#c0392b');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern to header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 40) {
        for (let j = 0; j < height; j += 40) {
            ctx.fillRect(i, j, 20, 20);
        }
    }
    
    // Add elegant decorative border
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // Add inner border for more elegance
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);
    
    // Add title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.font = 'bold 76px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('تومەتبار', width / 2, 100);
    ctx.shadowColor = 'transparent';
    
    // Add gold accent line under title
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 120);
    ctx.lineTo(width / 2 + 200, 120);
    ctx.stroke();
    
    // Add case information with improved styling
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    
    // First row (right side) with improved spacing and alignment
    ctx.fillText(`جورێ ئاریشێ: ${caseData.issueType || '-'}`, width - 80, 190);
    
    // Handle both old and new time format
    let timeDisplay = '';
    if (caseData.timeFrom && caseData.timeTo) {
        // New format with timeFrom and timeTo
        timeDisplay = `${formatTime12Hour(caseData.timeFrom) || '-'} - ${formatTime12Hour(caseData.timeTo) || '-'} (${caseData.period || '-'})`;
    } else if (caseData.time) {
        // Old format with time and dayNight
        timeDisplay = `${formatTime12Hour(caseData.time) || '-'} (${caseData.dayNight || '-'})`;
    } else {
        timeDisplay = '-';
    }
    
    ctx.fillText(`دەمژمێر: ${timeDisplay}`, width - 80, 250);
    ctx.fillText(`جهێ ئاریشێ: ${caseData.location || '-'}`, width - 80, 310);
    
    // Second row (left side) with improved spacing and alignment
    ctx.textAlign = 'left';
    ctx.fillText(`ناڤێ شوفێری: ${caseData.driverName || '-'}`, 80, 190);
    ctx.fillText(`خالا: ${caseData.point || '-'}`, 80, 250);
    ctx.fillText(`رەوانەكرن بـــو: ${caseData.sentTo || '-'}`, 80, 310);
    
    // Add current date with improved styling
    const currentDate = new Date().toLocaleDateString('ar-IQ');
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px Arial';
    
    // Add date background
    const dateWidth = 400;
    const dateHeight = 60;
    const dateX = (width / 2) - (dateWidth / 2);
    const dateY = 340;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(dateX, dateY, dateWidth, dateHeight, 30);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`تاریخ: ${currentDate}`, width / 2, dateY + 40);
}

function drawNotesSection(ctx, notes, width, yOffset, height) {
    // Draw notes container background with similar style to person container
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, yOffset, width, height);
    
    // Add border similar to person container
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, yOffset + 20, width - 40, height - 40);
    
    // Add notes title with similar styling to person info
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#2c3e50';
    ctx.fillText('تێبینی:', width - 80, yOffset + 70);
    
    // Add notes content with word wrapping
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#2c3e50';
    
    const maxWidth = width - 160;
    const lineHeight = 50;
    let y = yOffset + 140; // Increased vertical spacing from title
    
    // Word wrap function for notes text
    const words = notes.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, width - 80, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, width - 80, y);
}

function drawPersonInfo(ctx, person, yOffset, width, height) {
    // Draw person container background with alternating colors
    const isEven = parseInt(person.id) % 2 === 0;
    ctx.fillStyle = isEven ? '#ecf0f1' : '#ffffff';
    ctx.fillRect(0, yOffset, width, height);
    
    // Add border
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, yOffset + 20, width - 40, height - 40);
    
    // Draw person number badge
    const badgeSize = 80;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(width - 60, yOffset + 60, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(person.id, width - 60, yOffset + 76);
    
    // Draw photo or placeholder - تم تكبير الصورة بنسبة 40% وجعلها أكثر عمودية
    const photoWidth = 440 * 1.4; // تكبير العرض بنسبة 40%
    const photoHeight = 440 * 1.8; // تكبير الارتفاع بنسبة 80% لجعلها أكثر عمودية
    const photoX = 160;
    const photoY = yOffset + 80;
    
    // Draw photo background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
    
    // Draw photo border
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 8;
    ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
    
    // Draw actual photo or placeholder icon
    if (person.photo) {
        // Create image and set source
        const img = new Image();
        img.src = person.photo;
        
        // Draw image immediately (synchronously)
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX + 4, photoY + 4, photoWidth - 8, photoHeight - 8);
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
        ctx.restore();
        
        // Draw photo number badge
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.rect(photoX + photoWidth - 60, photoY + photoHeight - 60, 60, 60);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(person.id, photoX + photoWidth - 30, photoY + photoHeight - 20);
    } else {
        // Draw placeholder icon
        ctx.fillStyle = '#bdc3c7';
        ctx.font = '200px FontAwesome';
        ctx.textAlign = 'center';
        ctx.fillText('\uf007', photoX + (photoWidth / 2), photoY + (photoHeight / 2) + 70);
        
        // Draw photo number badge
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.rect(photoX + photoWidth - 60, photoY + photoHeight - 60, 60, 60);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(person.id, photoX + photoWidth - 30, photoY + photoHeight - 20);
    }
    
    // تم إزالة شارة نوع الشخص لأن person.type غير موجود في personsData
    
    // Draw person information - تم تعديل موقع النص ليناسب الصورة المكبرة
    const infoX = photoX + photoWidth + 60; // تعديل موقع النص ليناسب الصورة المكبرة
    const infoY = yOffset + 120;
    
    // إضافة خلفية أنيقة للمعلومات
    const infoWidth = width - infoX - 80;
    const infoHeight = 700;
    const infoBackgroundGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
    infoBackgroundGradient.addColorStop(0, 'rgba(236, 240, 241, 0.8)');
    infoBackgroundGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    ctx.fillStyle = infoBackgroundGradient;
    
    // رسم خلفية المعلومات مع حواف مستديرة
    ctx.beginPath();
    ctx.moveTo(infoX, infoY);
    ctx.lineTo(infoX + infoWidth - 20, infoY);
    ctx.quadraticCurveTo(infoX + infoWidth, infoY, infoX + infoWidth, infoY + 20);
    ctx.lineTo(infoX + infoWidth, infoY + infoHeight - 20);
    ctx.quadraticCurveTo(infoX + infoWidth, infoY + infoHeight, infoX + infoWidth - 20, infoY + infoHeight);
    ctx.lineTo(infoX + 20, infoY + infoHeight);
    ctx.quadraticCurveTo(infoX, infoY + infoHeight, infoX, infoY + infoHeight - 20);
    ctx.lineTo(infoX, infoY + 20);
    ctx.quadraticCurveTo(infoX, infoY, infoX + 20, infoY);
    ctx.closePath();
    ctx.fill();
    
    // إضافة إطار أنيق للمعلومات
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // إضافة تأثير ظل خفيف للنص
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // تحسين نمط النص
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 44px Arial';
    ctx.textAlign = 'right';
    
    // تحسين تباعد النص وإضافة أيقونات
    const lineHeight = 80;
    const textX = width - 100;
    
    // رسم خط فاصل زخرفي أعلى المعلومات
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(infoX + 50, infoY + 40);
    ctx.lineTo(width - 100, infoY + 40);
    ctx.stroke();
    
    // رسم المعلومات مع تأثيرات أفضل
    // وظيفة لرسم العنوان داخل إطار أحمر والمعلومات داخل إطار شفاف
    function drawInfoLine(label, value, lineNumber) {
        // رسم إطار أحمر للعنوان
        const labelWidth = ctx.measureText(label).width;
        const labelX = textX - labelWidth - 20;
        const labelY = infoY + lineHeight * lineNumber - 40;
        
        // خلفية العنوان
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(labelX - 10, labelY, labelWidth + 20, 50);
        
        // نص العنوان
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'right';
        ctx.fillText(label, textX - 20, infoY + lineHeight * lineNumber);
        
        // رسم إطار شفاف للمعلومات
        const valueWidth = ctx.measureText(value).width;
        const valueX = textX - labelWidth - 40;
        
        // خلفية المعلومات
        ctx.fillStyle = 'rgba(236, 240, 241, 0.5)';
        ctx.fillRect(valueX - valueWidth - 10, labelY, valueWidth + 20, 50);
        
        // نص المعلومات
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'right';
        ctx.fillText(value, valueX, infoY + lineHeight * lineNumber);
    }
    
    // رسم المعلومات بالتنسيق الجديد
    drawInfoLine("ناڤێ تومەتباری", person.name, 1);
    drawInfoLine("ژدایـــكبون", person.birthdate, 2);
    drawInfoLine("ئاكنجی بوون", person.address, 3);
    drawInfoLine("ژمارا موبایلی", person.phone || 'غير متوفر', 4);
    drawInfoLine("بارێ خێزانی", person.maritalStatus || 'غير متوفر', 5);
    drawInfoLine("زیندانكرن", person.imprisoned || 'غير متوفر', 6);
    drawInfoLine("ژمارا ناسنامێ", person.idNumber || 'غير متوفر', 7);
    drawInfoLine("كارێ وی", person.occupation || 'غير متوفر', 8);
    
    // رسم خط فاصل زخرفي أسفل المعلومات
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(infoX + 50, infoY + lineHeight * 8.5);
    ctx.lineTo(width - 100, infoY + lineHeight * 8.5);
    ctx.stroke();
    
    // إعادة تعيين تأثير الظل
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function saveImageToDevice(dataUrl) {
    // Create a high-quality version of the image
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `توماری-ئاریشە-${timestamp}.png`;
    // Ensure we're saving with maximum quality (1.0)
    link.href = dataUrl.replace(/;base64,/, ';base64,').replace(/quality=\d+(\.\d+)?/, 'quality=1.0');
    link.click();
    
    // Also display the image in the success modal
    const modal = document.getElementById('success-modal');
    
    // Check if there's already an image and remove it
    const existingImg = modal.querySelector('.card-preview-image');
    if (existingImg) {
        existingImg.remove();
    }
    
    // Create image container with fixed aspect ratio
    const imgContainer = document.createElement('div');
    imgContainer.className = 'card-preview-container';
    imgContainer.style.width = '100%';
    imgContainer.style.maxWidth = '500px';
    imgContainer.style.margin = '0 auto';
    imgContainer.style.position = 'relative';
    imgContainer.style.overflow = 'hidden';
    imgContainer.style.maxHeight = '60vh';
    
    // Create and add the new image
    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'card-preview-image';
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.marginTop = '20px';
    img.style.borderRadius = '10px';
    img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    img.style.objectFit = 'contain';
    
    imgContainer.appendChild(img);
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.appendChild(imgContainer);
}

function shareViaWhatsapp() {
    // First save the image locally
    const canvas = document.createElement('canvas');
    // Regenerate the card image here (simplified for brevity)
    // ...
    
    // Then share via WhatsApp
    alert('سيتم حفظ الصورة أولاً، ثم يمكنك مشاركتها عبر واتساب');
    // Save image first
    saveImageToDevice(canvas.toDataURL('image/png'));
    
    // Open WhatsApp
    setTimeout(() => {
        window.open('https://wa.me/?text=توماری ئاریشە', '_blank');
    }, 1000);
}

// وظيفة لحذف سجل
function deleteRecord(recordId) {
    // تأكيد الحذف
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        return;
    }
    
    // البحث عن فهرس السجل
    const recordIndex = savedRecords.findIndex(record => record.id === recordId);
    if (recordIndex === -1) return;
    
    // حذف السجل من المصفوفة
    savedRecords.splice(recordIndex, 1);
    
    // حفظ التغييرات في التخزين المحلي
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    
    // تحديث قائمة السجلات
    renderRecordsList();
}

// وظيفة لتنسيق الوقت بصيغة 12 ساعة
function formatTime12Hour(timeString) {
    if (!timeString) return '';
    
    try {
        // تقسيم الوقت إلى ساعات ودقائق
        const [hours, minutes] = timeString.split(':').map(Number);
        
        // التحقق من صحة القيم
        if (isNaN(hours) || isNaN(minutes)) return timeString;
        
        // تحديد صباحًا/مساءً
        const period = hours >= 12 ? 'م' : 'ص';
        
        // تحويل إلى صيغة 12 ساعة
        const hours12 = hours % 12 || 12;
        
        // تنسيق الوقت
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
        // إرجاع القيمة الأصلية في حالة حدوث خطأ
        return timeString;
    }
}

function resetForm() {
    // Hide modal
    document.getElementById('success-modal').style.display = 'none';
    
    // Reset form fields
    document.getElementById('multi-person-form').reset();
    
    // Clear all person containers except the first one
    const personContainers = document.querySelectorAll('.person-container');
    personContainers.forEach((container, index) => {
        if (index > 0) { // Keep the first person container
            container.remove();
        }
    });
    
    // Reset the first person's photo
    const firstPersonPhoto = document.getElementById('selected-photo-1');
    const firstPersonIcon = document.getElementById('default-photo-icon-1');
    if (firstPersonPhoto && firstPersonIcon) {
        firstPersonPhoto.style.display = 'none';
        firstPersonIcon.style.display = 'block';
    }
    
    // Reset global variables
    personCount = 1;
    personPhotos = {};
    
    // Enable add button
    const addButton = document.getElementById('add-person-button');
    addButton.disabled = false;
    addButton.style.opacity = '1';
    
    // تنشيط تبويب "سجل جديد"
    const newRecordTab = document.querySelector('.tab-btn[data-tab="new-record"]');
    if (newRecordTab) {
        newRecordTab.click();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // تحديث عرض السجلات عند إنشاء سجل جديد
    const recordsListTab = document.querySelector('.tab-btn[data-tab="records-list"]');
    if (recordsListTab && recordsListTab.classList.contains('active')) {
        renderRecordsList();
    }
}

// Records Management Functions
function saveRecord(personsData, caseData, cardImage, date) {
    // Create a record object
    const record = {
        id: Date.now().toString(), // Unique ID based on timestamp
        date: date ? date.toISOString() : new Date().toISOString(),
        timestamp: new Date().toLocaleString('ar-IQ'),
        personsData: personsData,
        caseData: caseData,
        cardImage: cardImage // Store the original card image
    };
    
    // Add to records array
    savedRecords.unshift(record); // Add to beginning of array (newest first)
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    
    // تحديث قائمة السجلات عند حفظ سجل جديد
    renderRecordsList();
}

function loadSavedRecords() {
    // Load records from localStorage
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    
    // إذا لم تكن هناك سجلات محفوظة بالمفتاح الجديد، نحاول البحث عن سجلات بالمفتاح القديم
    if (!storedRecords) {
        const oldStoredRecords = localStorage.getItem('tomaryAresheRecords');
        if (oldStoredRecords) {
            // نقل السجلات من المفتاح القديم إلى المفتاح الجديد
            savedRecords = JSON.parse(oldStoredRecords);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
            console.log('تم نقل السجلات من المفتاح القديم إلى المفتاح الجديد');
        }
    } else {
        savedRecords = JSON.parse(storedRecords);
    }
        
        // ترتيب السجلات حسب التاريخ (الأحدث أولاً)
        savedRecords.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // ترتيب تنازلي (الأحدث أولاً)
        });
        
        // We don't regenerate card images here to avoid DOM issues
        // Images will be regenerated when viewed instead
    }


// عرض السجلات في تبويب قائمة السجلات
function displayRecords() {
    const recordsContainer = document.getElementById('records-container');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    if (!recordsContainer) return;
    
    // تفريغ الحاوية
    recordsContainer.innerHTML = '';
    
    if (savedRecords.length === 0) {
        // إظهار رسالة عدم وجود سجلات
        if (noRecordsMessage) {
            noRecordsMessage.style.display = 'block';
        }
        return;
    }
    
    // إخفاء رسالة عدم وجود سجلات
    if (noRecordsMessage) {
        noRecordsMessage.style.display = 'none';
    }
    
    // إنشاء بطاقة لكل سجل
    savedRecords.forEach((record, index) => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        recordCard.dataset.recordIndex = index;
        
        // استخدام صورة الشخص الأول إذا كانت متوفرة
        const firstPerson = record.personsData[0] || {};
        const photoSrc = firstPerson.photo || '';
        
        recordCard.innerHTML = `
            <div class="card-photo">
                ${photoSrc ? `<img src="${photoSrc}" alt="صورة الشخص">` : '<i class="fas fa-user"></i>'}
            </div>
            <div class="card-info">
                <div class="card-name">${firstPerson.name || 'بدون اسم'}</div>
                <div class="card-type">${record.caseData.issueType || 'غير محدد'}</div>
                <div class="card-date">${new Date(record.date).toLocaleDateString('ar-IQ') || ''}</div>
            </div>
        `;
        
        // إضافة حدث النقر لعرض تفاصيل السجل
        recordCard.addEventListener('click', () => {
            viewRecord(record.id);
        });
        
        recordsContainer.appendChild(recordCard);
    });
}

// تصفية السجلات بناءً على مصطلح البحث
function filterRecords(searchTerm) {
    const recordsList = document.getElementById('records-list');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    if (!recordsList) return;
    
    // تفريغ الحاوية
    recordsList.innerHTML = '';
    
    // تصفية السجلات
    const filteredRecords = savedRecords.filter(record => {
        // البحث في أسماء الأشخاص
        const nameMatch = record.personsData.some(person => 
            person.name && person.name.toLowerCase().includes(searchTerm)
        );
        
        // البحث في نوع القضية
        const issueTypeMatch = record.caseData.issueType && 
            record.caseData.issueType.toLowerCase().includes(searchTerm);
        
        // البحث في الموقع
        const locationMatch = record.caseData.location && 
            record.caseData.location.toLowerCase().includes(searchTerm);
        
        // البحث في اسم السائق
        const driverMatch = record.caseData.driverName && 
            record.caseData.driverName.toLowerCase().includes(searchTerm);
            
        // البحث في النقطة
        const pointMatch = record.caseData.point && 
            record.caseData.point.toLowerCase().includes(searchTerm);
        
        return nameMatch || issueTypeMatch || locationMatch || driverMatch || pointMatch;
    });
    
    if (filteredRecords.length === 0) {
        // إظهار رسالة عدم وجود سجلات
        if (noRecordsMessage) {
            noRecordsMessage.style.display = 'flex';
            noRecordsMessage.innerHTML = '<p>لا توجد نتائج مطابقة لبحثك</p>';
        }
        return;
    }
    
    // إخفاء رسالة عدم وجود سجلات
    if (noRecordsMessage) {
        noRecordsMessage.style.display = 'none';
    }
    
    // إنشاء بطاقة لكل سجل مصفى
    filteredRecords.forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        recordCard.dataset.recordId = record.id;
        
        // Format date
        const recordDate = new Date(record.date);
        const formattedDate = recordDate.toLocaleDateString('ar-IQ') + ' ' + 
                             recordDate.toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
        
        // Create card content with fallbacks for old record formats
        let timeDisplay = '';
        
        // Handle both old and new time format
        if (record.caseData.timeFrom && record.caseData.timeTo) {
            // New format with timeFrom and timeTo
            timeDisplay = `${formatTime12Hour(record.caseData.timeFrom) || '-'} - ${formatTime12Hour(record.caseData.timeTo) || '-'} (${record.caseData.period || '-'})`;
        } else if (record.caseData.time) {
            // Old format with time and dayNight
            timeDisplay = `${formatTime12Hour(record.caseData.time) || '-'} (${record.caseData.dayNight || '-'})`;
        } else {
            timeDisplay = '-';
        }
        
        // استخدام صورة الشخص الأول إذا كانت متوفرة
        const firstPerson = record.personsData[0] || {};
        const photoSrc = firstPerson.photo || '';
        
        recordCard.innerHTML = `
            <div class="card-photo">
                ${photoSrc ? `<img src="${photoSrc}" alt="صورة الشخص">` : '<i class="fas fa-user"></i>'}
            </div>
            <div class="card-info">
                <div class="card-name">${firstPerson.name || 'بدون اسم'}</div>
                <div class="card-type">${record.caseData.issueType || 'غير محدد'}</div>
                <div class="card-date">${formattedDate}</div>
                <div class="info-row">
                    <p><strong>الأشخاص:</strong> ${record.personsData.length}</p>
                    <p><strong>المكان:</strong> ${record.caseData.location || '-'}</p>
                </div>
                <div class="info-row">
                    <p><strong>الوقت:</strong> ${timeDisplay}</p>
                </div>
            </div>
            <div class="record-actions">
                <button class="action-button view-button" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-button delete-button" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewButton = recordCard.querySelector('.view-button');
        const deleteButton = recordCard.querySelector('.delete-button');
        
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            viewRecord(record.id);
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecord(record.id);
        });
        
        // Add click event to the whole card
        recordCard.addEventListener('click', () => {
            viewRecord(record.id);
        });
        
        recordsList.appendChild(recordCard);
    });
    
    // تحديث عنوان القسم بعدد النتائج
    const recordsCountHeader = document.querySelector('#records-list-tab h3');
    if (recordsCountHeader) {
        recordsCountHeader.textContent = `نتائج البحث (${filteredRecords.length})`;
    }
}

function showRecordsModal() {
    // تنشيط تبويب قائمة السجلات
    const recordsListTab = document.querySelector('.tab-btn[data-tab="records-list"]');
    if (recordsListTab) {
        recordsListTab.click();
    }
}

function hideRecordsModal() {
    // Hide the records modal
    document.getElementById('records-modal').style.display = 'none';
}

function renderRecordsList() {
    const recordsList = document.getElementById('records-list');
    const noRecordsMessage = document.getElementById('no-records-message');
    
    // Clear the current list
    recordsList.innerHTML = '';
    
    // Show/hide no records message
    if (savedRecords.length === 0) {
        noRecordsMessage.style.display = 'flex';
        return;
    } else {
        noRecordsMessage.style.display = 'none';
    }
    
    // Add each record to the list
    savedRecords.forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        recordCard.dataset.recordId = record.id;
        
        // Format date
        const recordDate = new Date(record.date);
        const formattedDate = recordDate.toLocaleDateString('ar-IQ') + ' ' + 
                             recordDate.toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
        
        // Create card content with fallbacks for old record formats
        let timeDisplay = '';
        
        // Handle both old and new time format
        if (record.caseData.timeFrom && record.caseData.timeTo) {
            // New format with timeFrom and timeTo
            timeDisplay = `${formatTime12Hour(record.caseData.timeFrom) || '-'} - ${formatTime12Hour(record.caseData.timeTo) || '-'} (${record.caseData.period || '-'})`;
        } else if (record.caseData.time) {
            // Old format with time and dayNight
            timeDisplay = `${formatTime12Hour(record.caseData.time) || '-'} (${record.caseData.dayNight || '-'})`;
        } else {
            timeDisplay = '-';
        }
        
        // Get the first person's photo if available
        const firstPerson = record.personsData[0] || {};
        const photoSrc = firstPerson.photo || '';
        
        recordCard.innerHTML = `
            <div class="card-photo">
                ${photoSrc ? `<img src="${photoSrc}" alt="صورة الشخص">` : '<i class="fas fa-user"></i>'}
            </div>
            <div class="card-info">
                <div class="card-name">${firstPerson.name || 'بدون اسم'}</div>
                <div class="card-type">${record.caseData.issueType || 'غير محدد'}</div>
                <div class="card-date">${formattedDate}</div>
                <p><strong>الأشخاص:</strong> ${record.personsData.length}</p>
                <p><strong>المكان:</strong> ${record.caseData.location || '-'}</p>
                <p><strong>الوقت:</strong> ${timeDisplay}</p>
            </div>
            <div class="record-actions">
                <button class="action-button view-button" title="عرض">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-button delete-button" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewButton = recordCard.querySelector('.view-button');
        const deleteButton = recordCard.querySelector('.delete-button');
        
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            viewRecord(record.id);
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteRecord(record.id);
        });
        
        // Add click event to the whole card
        recordCard.addEventListener('click', () => {
            viewRecord(record.id);
        });
        
        recordsList.appendChild(recordCard);
    });
    
    // تحديث عنوان القسم بعدد السجلات
    const recordsCountHeader = document.querySelector('#records-list-tab h3');
    if (recordsCountHeader) {
        recordsCountHeader.textContent = `السجلات المحفوظة (${savedRecords.length})`;
    }
}

function viewRecord(recordId) {
    // البحث عن السجل بواسطة المعرف
    const record = savedRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // تخزين معرف السجل الحالي للاستخدام في الوظائف الأخرى
    currentViewingRecordId = recordId;
    
    const modal = document.getElementById('view-record-modal') || document.createElement('div');
    if (!document.getElementById('view-record-modal')) {
        modal.className = 'modal';
        modal.id = 'view-record-modal';
        document.body.appendChild(modal);
    }
    
    // Create content for the modal - عرض فقط بطاقة السجل والأزرار المطلوبة
    modal.innerHTML = `
        <div class="modal-content view-record-modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-file-alt"></i> بطاقة السجل</h3>
                <button id="close-view-record-modal" class="close-button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="view-record-container" style="display: flex; justify-content: center; align-items: center; padding: 10px;">
                <img src="${record.cardImage}" alt="بطاقة السجل" class="record-image">
            </div>
            <div class="modal-footer">
                <button id="save-record-card" class="action-button">
                    <i class="fas fa-save"></i> خەزنكرنا كارتێ
                </button>
                <button id="share-record-whatsapp" class="action-button">
                    <i class="fab fa-whatsapp"></i> مشاركة عبر واتساب
                </button>
                <button id="add-new-record" class="action-button">
                    <i class="fas fa-plus"></i> إضافة سجل جديد
                </button>
                <button id="close-view-record-button" class="action-button secondary">
                    <i class="fas fa-times"></i> إغلاق
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Add event listeners
    document.getElementById('close-view-record-modal').addEventListener('click', closeRecordDetails);
    document.getElementById('close-view-record-button').addEventListener('click', closeRecordDetails);
    document.getElementById('save-record-card').addEventListener('click', saveCurrentRecordCard);
    document.getElementById('share-record-whatsapp').addEventListener('click', shareRecordViaWhatsapp);
    document.getElementById('add-new-record').addEventListener('click', addNewRecordFromDetails);
}

function deleteRecord(recordId) {
    // Confirm deletion
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
        // Remove the record from the array
        savedRecords = savedRecords.filter(record => record.id !== recordId);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
        
        // Re-render the list
        renderRecordsList();
    }
}

// Function to convert 24-hour time format to 12-hour format
function formatTime12Hour(time24) {
    if (!time24 || time24 === '-') return '-';
    
    try {
        // Parse the time string (format: HH:MM)
        const [hours24, minutes] = time24.split(':');
        if (!hours24 || !minutes) return '-';
        
        // Convert hours to 12-hour format
        let hours12 = parseInt(hours24, 10) % 12;
        if (hours12 === 0) hours12 = 12; // 0 should be displayed as 12 in 12-hour format
        
        // Determine AM/PM
        const period = parseInt(hours24, 10) < 12 ? 'ص' : 'م';
        
        // Ensure minutes are always displayed with two digits
        const formattedMinutes = minutes.padStart(2, '0');
        
        // Return formatted time
        return `${hours12}:${formattedMinutes} ${period}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return '-';
    }
}

// وظيفة لإغلاق نافذة تفاصيل السجل
function closeRecordDetails() {
    const modal = document.getElementById('view-record-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// وظيفة لحفظ بطاقة السجل الحالي
function saveCurrentRecordCard() {
    if (!currentViewingRecordId) return;
    
    const record = savedRecords.find(r => r.id === currentViewingRecordId);
    if (!record) return;
    
    // إنشاء رابط تنزيل للصورة
    const link = document.createElement('a');
    link.download = `توماری-ئاریشە-${new Date(record.date).toISOString().replace(/[:.]/g, '-')}.png`;
    link.href = record.cardImage;
    link.click();
}

// وظيفة لمشاركة السجل الحالي عبر واتساب
function shareRecordViaWhatsapp() {
    if (!currentViewingRecordId) return;
    
    const record = savedRecords.find(r => r.id === currentViewingRecordId);
    if (!record) return;
    
    // إنشاء نص مناسب للمشاركة
    const firstPerson = record.personsData[0] || {};
    const personName = firstPerson.name || 'غير محدد';
    const issueType = record.caseData.issueType || 'غير محدد';
    const formattedDate = new Date(record.date).toLocaleDateString('ar-IQ');
    
    const shareText = `توماری ئاریشە - ${personName} - ${issueType} - ${formattedDate}`;
    
    // فتح واتساب مع النص المناسب
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
}

// وظيفة لإضافة سجل جديد من نافذة التفاصيل
function addNewRecordFromDetails() {
    // إغلاق نافذة التفاصيل
    closeRecordDetails();
    
    // إعادة تعيين النموذج وإظهار تبويب سجل جديد
    resetForm();
    
    // تنشيط تبويب "سجل جديد"
    const newRecordTab = document.querySelector('.tab-btn[data-tab="new-record"]');
    if (newRecordTab) {
        newRecordTab.click();
    }
}

// Polyfill for roundRect if not supported
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}