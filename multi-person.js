document.addEventListener('DOMContentLoaded', initApp);

// Global variables
let personCount = 1;
const MAX_PERSONS = 5;
let personPhotos = {};

function initApp() {
    // Initialize event listeners
    document.getElementById('add-person-button').addEventListener('click', addNewPerson);
    document.getElementById('multi-person-form').addEventListener('submit', saveMultiPersonData);
    document.getElementById('share-whatsapp').addEventListener('click', shareViaWhatsapp);
    document.getElementById('new-entry').addEventListener('click', resetForm);
    
    // Initialize photo buttons for the first person
    initializePhotoButton(1);
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

function addNewPerson() {
    if (personCount >= MAX_PERSONS) {
        alert('لا يمكن إضافة أكثر من 5 أشخاص!');
        return;
    }
    
    personCount++;
    
    const personsContainer = document.getElementById('persons-container');
    const newPersonDiv = document.createElement('div');
    newPersonDiv.className = 'person-container';
    newPersonDiv.dataset.personId = personCount;
    
    newPersonDiv.innerHTML = `
        <div class="person-number">${personCount}</div>
        <button type="button" class="remove-person-button" data-person-id="${personCount}">
            <i class="fas fa-trash"></i> حذف
        </button>
        <div class="person-photo-section">
            <div class="person-photo-preview">
                <i class="fas fa-user-circle" id="default-photo-icon-${personCount}"></i>
                <img id="selected-photo-${personCount}" style="display: none;" alt="وێنێ كەسی">
                <div class="person-photo-number">${personCount}</div>
            </div>
            <button type="button" class="primary-button photo-button" data-person-id="${personCount}">
                <i class="fas fa-camera"></i> وێنەگرتن یان باركرن
            </button>
            <input type="file" class="photo-input" id="photo-input-${personCount}" accept="image/*" style="display: none;">
        </div>
        
        <div class="person-type-select">
            <select class="person-type" id="person-type-${personCount}" required>
                <option value="" disabled selected>اختر نوع الشخص</option>
                <option value="مشتەكی">مشتەكی</option>
                <option value="تاوانبار">تاوانبار</option>
            </select>
        </div>
        
        <div class="person-info-row">
            <div class="form-group">
                <label for="fullname-${personCount}">ناڤێ تومەتباری</label>
                <input type="text" id="fullname-${personCount}" name="fullname-${personCount}" required>
            </div>
            
            <div class="form-group">
                <label for="birthdate-${personCount}">ژدایـــكبون</label>
                <input type="number" id="birthdate-${personCount}" name="birthdate-${personCount}" placeholder="سنة الميلاد" min="1900" max="2024" required>
            </div>
        </div>
        
        <div class="person-info-row">
            <div class="form-group">
                <label for="address-${personCount}">ئاكنجی بوون</label>
                <input type="text" id="address-${personCount}" name="address-${personCount}" required>
            </div>
            
            <div class="form-group">
                <label for="phone-${personCount}">ژمارا موبایلی</label>
                <input type="tel" id="phone-${personCount}" name="phone-${personCount}">
            </div>
        </div>
    `;
    
    personsContainer.appendChild(newPersonDiv);
    
    // Initialize photo button for the new person
    initializePhotoButton(personCount);
    
    // Add event listener for remove button
    const removeButton = newPersonDiv.querySelector('.remove-person-button');
    removeButton.addEventListener('click', function() {
        removePerson(this.getAttribute('data-person-id'));
    });
    
    // Scroll to the new person container
    newPersonDiv.scrollIntoView({ behavior: 'smooth' });
}

function removePerson(personId) {
    const personContainer = document.querySelector(`.person-container[data-person-id="${personId}"]`);
    if (personContainer) {
        personContainer.remove();
        
        // Remove the photo data
        if (personPhotos[personId]) {
            delete personPhotos[personId];
        }
        
        // No need to decrement personCount as we want to keep the IDs unique
        // Just update the UI to reflect the correct count of visible person containers
        updatePersonNumbers();
        
        // Enable the add button if it was disabled
        const addButton = document.getElementById('add-person-button');
        if (addButton.disabled) {
            addButton.disabled = false;
            addButton.style.opacity = '1';
        }
    }
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
    
    // Update the add button state
    const addButton = document.getElementById('add-person-button');
    if (visibleCount >= MAX_PERSONS) {
        addButton.disabled = true;
        addButton.style.opacity = '0.5';
    } else {
        addButton.disabled = false;
        addButton.style.opacity = '1';
    }
}

function saveMultiPersonData(event) {
    event.preventDefault();
    
    // Collect data for all visible persons
    const personContainers = document.querySelectorAll('.person-container');
    const personsData = [];
    
    personContainers.forEach(container => {
        const personId = container.dataset.personId;
        const personType = document.getElementById(`person-type-${personId}`).value;
        const fullName = document.getElementById(`fullname-${personId}`).value;
        const birthdate = document.getElementById(`birthdate-${personId}`).value;
        const address = document.getElementById(`address-${personId}`).value;
        const phone = document.getElementById(`phone-${personId}`).value;
        const photo = personPhotos[personId] || null;
        
        personsData.push({
            id: personId,
            type: personType,
            name: fullName,
            birthdate: birthdate,
            address: address,
            phone: phone,
            photo: photo
        });
    });
    
    // Collect case information
    const caseData = {
        issueType: document.getElementById('issue-type').value,
        time: document.getElementById('time').value,
        dayNight: document.querySelector('input[name="day-night"]:checked').value,
        location: document.getElementById('problem-location').value,
        driverName: document.getElementById('driver-name').value,
        point: document.getElementById('point').value,
        sentTo: document.getElementById('sent-to').value
    };
    
    // Generate and save the multi-person card
    generateMultiPersonCard(personsData, caseData);
    
    // Show success modal
    document.getElementById('success-modal').style.display = 'flex';
}

function generateMultiPersonCard(personsData, caseData) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions based on number of persons
    const personHeight = 300; // Height per person
    const headerHeight = 200; // Height for case information
    const canvasWidth = 1000;
    const canvasHeight = headerHeight + (personsData.length * personHeight);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Fill background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw header with case information
    drawCaseHeader(ctx, caseData, canvasWidth, headerHeight);
    
    // Draw each person's information
    personsData.forEach((person, index) => {
        const yOffset = headerHeight + (index * personHeight);
        drawPersonInfo(ctx, person, yOffset, canvasWidth, personHeight);
    });
    
    // Convert canvas to image and save
    const cardImage = canvas.toDataURL('image/png');
    saveImageToDevice(cardImage);
}

function drawCaseHeader(ctx, caseData, width, height) {
    // Draw header background with gradient
    const headerGradient = ctx.createLinearGradient(0, 0, 0, height);
    headerGradient.addColorStop(0, '#3498db');
    headerGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative border
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Add title
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('توماری ئاریشە', width / 2, 50);
    
    // Add case information
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    
    // First row
    ctx.fillText(`جورێ ئاریشێ: ${caseData.issueType}`, width - 50, 90);
    ctx.fillText(`دەمژمێر: ${caseData.time} ${caseData.dayNight}`, width - 50, 120);
    ctx.fillText(`جهێ ئاریشێ: ${caseData.location}`, width - 50, 150);
    
    // Second row (left side)
    ctx.textAlign = 'left';
    ctx.fillText(`ناڤێ شوفێری: ${caseData.driverName}`, 50, 90);
    ctx.fillText(`خالا: ${caseData.point}`, 50, 120);
    ctx.fillText(`رەوانەكرن بـــو: ${caseData.sentTo}`, 50, 150);
    
    // Add current date
    const currentDate = new Date().toLocaleDateString('ar-IQ');
    ctx.textAlign = 'center';
    ctx.font = '18px Arial';
    ctx.fillText(`تاریخ: ${currentDate}`, width / 2, 180);
}

function drawPersonInfo(ctx, person, yOffset, width, height) {
    // Draw person container background with alternating colors
    const isEven = parseInt(person.id) % 2 === 0;
    ctx.fillStyle = isEven ? '#ecf0f1' : '#ffffff';
    ctx.fillRect(0, yOffset, width, height);
    
    // Add border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, yOffset + 10, width - 20, height - 20);
    
    // Draw person number badge
    const badgeSize = 40;
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(width - 30, yOffset + 30, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(person.id, width - 30, yOffset + 38);
    
    // Draw photo or placeholder
    const photoSize = 220;
    const photoX = 80;
    const photoY = yOffset + 40;
    
    // Draw photo background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);
    
    // Draw photo border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 4;
    ctx.strokeRect(photoX, photoY, photoSize, photoSize);
    
    // Draw actual photo or placeholder icon
    if (person.photo) {
        // Create image and set source
        const img = new Image();
        img.src = person.photo;
        
        // Draw image immediately (synchronously)
        ctx.save();
        ctx.beginPath();
        ctx.rect(photoX + 2, photoY + 2, photoSize - 4, photoSize - 4);
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        ctx.restore();
        
        // Draw photo number badge
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.rect(photoX + photoSize - 30, photoY + photoSize - 30, 30, 30);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(person.id, photoX + photoSize - 15, photoY + photoSize - 10);
    } else {
        // Draw placeholder icon
        ctx.fillStyle = '#bdc3c7';
        ctx.font = '100px FontAwesome';
        ctx.textAlign = 'center';
        ctx.fillText('\uf007', photoX + (photoSize / 2), photoY + (photoSize / 2) + 35);
        
        // Draw photo number badge
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.rect(photoX + photoSize - 30, photoY + photoSize - 30, 30, 30);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(person.id, photoX + photoSize - 15, photoY + photoSize - 10);
    }
    
    // Draw person type badge
    const typeBadgeWidth = 120;
    const typeBadgeHeight = 30;
    const typeBadgeX = photoX + (photoSize / 2) - (typeBadgeWidth / 2);
    const typeBadgeY = photoY + photoSize + 10;
    
    ctx.fillStyle = person.type === 'مشتەكی' ? '#27ae60' : '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(typeBadgeX, typeBadgeY, typeBadgeWidth, typeBadgeHeight, 15);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(person.type, typeBadgeX + (typeBadgeWidth / 2), typeBadgeY + 20);
    
    // Draw person information
    const infoX = 300;
    const infoY = yOffset + 60;
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    
    ctx.fillText(`ناڤێ تومەتباری: ${person.name}`, width - 50, infoY + 40);
    ctx.fillText(`ژدایـــكبون: ${person.birthdate}`, width - 50, infoY + 80);
    ctx.fillText(`ئاكنجی بوون: ${person.address}`, width - 50, infoY + 120);
    ctx.fillText(`ژمارا موبایلی: ${person.phone || 'غير متوفر'}`, width - 50, infoY + 160);
}

function saveImageToDevice(dataUrl) {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `توماری-ئاریشە-${timestamp}.png`;
    link.href = dataUrl;
    link.click();
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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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