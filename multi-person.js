document.addEventListener('DOMContentLoaded', initApp);

// Global variables
let personCount = 1;
const MAX_PERSONS = 5;
let personPhotos = {};
let caseImages = {}; // Store case images
let savedRecords = [];
const STORAGE_KEY = 'tomaryAresheRecords';

function initApp() {
    // Initialize event listeners
    document.getElementById('add-person-button').addEventListener('click', addNewPerson);
    document.getElementById('multi-person-form').addEventListener('submit', saveMultiPersonData);
    document.getElementById('share-whatsapp').addEventListener('click', shareViaWhatsapp);
    document.getElementById('new-entry').addEventListener('click', resetForm);
    document.getElementById('show-records-button').addEventListener('click', showRecordsModal);
    document.getElementById('close-records-modal').addEventListener('click', hideRecordsModal);
    
    // Initialize photo buttons for the first person
    initializePhotoButton(1);
    
    // Initialize case image buttons
    initializeCaseImageButtons();
    
    // Load saved records from localStorage
    loadSavedRecords();
}

function initializeCaseImageButtons() {
    // Initialize each case image button
    for (let i = 1; i <= 3; i++) {
        const imageButton = document.getElementById(`case-image-button-${i}`);
        const imageInput = document.getElementById(`case-image-input-${i}`);
        
        if (imageButton && imageInput) {
            imageButton.addEventListener('click', () => {
                imageInput.click();
            });
            
            imageInput.addEventListener('change', (event) => {
                if (event.target.files && event.target.files[0]) {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        // Store the image data
                        caseImages[i] = e.target.result;
                        
                        // Display the image preview
                        displayCaseImagePreview(i, e.target.result);
                    };
                    
                    reader.readAsDataURL(event.target.files[0]);
                }
            });
        }
    }
}

function displayCaseImagePreview(imageId, imageData) {
    const previewContainer = document.getElementById('case-images-preview');
    
    // Check if this image already has a preview
    const existingPreview = document.getElementById(`case-image-preview-${imageId}`);
    if (existingPreview) {
        // Update existing preview
        existingPreview.querySelector('img').src = imageData;
        return;
    }
    
    // Create new preview container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'case-image-container';
    imageContainer.id = `case-image-preview-${imageId}`;
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageData;
    img.alt = `صورة ${imageId}`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    
    // Create remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'case-image-remove';
    removeButton.innerHTML = '<i class="fas fa-times"></i>';
    removeButton.addEventListener('click', () => removeCaseImage(imageId));
    
    // Append elements
    imageContainer.appendChild(img);
    imageContainer.appendChild(removeButton);
    previewContainer.appendChild(imageContainer);
}

function removeCaseImage(imageId) {
    // Remove from storage
    delete caseImages[imageId];
    
    // Remove preview
    const preview = document.getElementById(`case-image-preview-${imageId}`);
    if (preview) {
        preview.remove();
    }
    
    // Reset file input
    const input = document.getElementById(`case-image-input-${imageId}`);
    if (input) {
        input.value = '';
    }
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
        timeFrom: document.getElementById('time-from').value,
        timeTo: document.getElementById('time-to').value,
        period: document.getElementById('period').value,
        location: document.getElementById('problem-location').value,
        driverName: document.getElementById('driver-name').value,
        point: document.getElementById('point').value,
        sentTo: document.getElementById('sent-to').value,
        caseImages: Object.keys(caseImages).length > 0 ? {...caseImages} : null
    };
    
    // Add case images to each person's data for display in the card
    if (caseData.caseImages) {
        personsData.forEach(person => {
            person.caseImages = caseData.caseImages;
        });
    }
    
    // Generate and save the multi-person card
    const cardImage = generateMultiPersonCard(personsData, caseData);
    
    // Save record to localStorage
    saveRecord(personsData, caseData, cardImage);
    
    // Show success modal
    document.getElementById('success-modal').style.display = 'flex';
}

function generateMultiPersonCard(personsData, caseData) {
    const canvas = document.createElement('canvas');
    canvas.id = 'multiPersonCanvas';
    const ctx = canvas.getContext('2d');
    
    // Check if we need extra height for additional images frame
    const hasThirdImage = caseData.caseImages && caseData.caseImages['3'];
    
    // Set canvas dimensions based on number of persons
    const personHeight = 320; // Base height per person
    const additionalFrameHeight = 0; // Set to 0 since we removed the frame under person info
    const headerHeight = 220; // Height for case information
    const specialFrameHeight = (caseData.caseImages && caseData.caseImages['1'] && caseData.caseImages['2'] && caseData.caseImages['3']) ? 260 : 0; // Height for special frame at bottom (including margins)
    const canvasWidth = 1000;
    const canvasHeight = headerHeight + (personsData.length * personHeight) + specialFrameHeight + 50; // Added footer space
    
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
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);
    
    // Draw header with case information
    drawCaseHeader(ctx, caseData, canvasWidth, headerHeight);
    
    // Draw each person's information with improved spacing
    personsData.forEach((person, index) => {
        // Calculate the total height for this person's section
        const totalPersonHeight = personHeight; // No additional frame height needed anymore
        const yOffset = headerHeight + (index * totalPersonHeight);
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
    
    // Add a special frame for all three case images at the bottom of the card
    let specialFrameY = headerHeight + (personsData.length * personHeight) + 10;
    
    // Check if we have all three case images
    if (caseData.caseImages && caseData.caseImages['1'] && caseData.caseImages['2'] && caseData.caseImages['3']) {
        // Draw a special frame for all three images
        const frameWidth = canvasWidth - 60; // Slightly smaller than canvas width
        const frameHeight = 220; // Height for the frame
        const frameX = 30; // Centered horizontally
        
        // Draw frame background with gradient
        const gradient = ctx.createLinearGradient(frameX, specialFrameY, frameX, specialFrameY + frameHeight);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle for frame
        ctx.beginPath();
        ctx.roundRect(frameX, specialFrameY, frameWidth, frameHeight, 15);
        ctx.fill();
        
        // Draw frame border with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 5;
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw decorative header bar
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.roundRect(frameX, specialFrameY - 5, frameWidth, 10, 5);
        ctx.fill();
        
        // Draw title for the special frame
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('الصور الإضافية', canvasWidth / 2, specialFrameY - 15);
        
        // Calculate image dimensions and positions
        const imageWidth = (frameWidth - 60) / 3; // 3 images with some spacing
        const imageHeight = frameHeight - 40;
        const imageY = specialFrameY + 20;
        
        // Draw each image
        for (let i = 1; i <= 3; i++) {
            if (caseData.caseImages[i]) {
                const img = new Image();
                img.src = caseData.caseImages[i];
                
                const imageX = frameX + 20 + (i - 1) * (imageWidth + 20);
                
                // Draw image background and border
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.roundRect(imageX - 5, imageY - 5, imageWidth + 10, imageHeight + 10, 10);
                ctx.fill();
                
                ctx.strokeStyle = '#dee2e6';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw image with proper sizing and maintain aspect ratio
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(imageX, imageY, imageWidth, imageHeight, 8);
                ctx.clip();
                
                // Calculate dimensions to maintain aspect ratio
                const imgWidth = img.width || imageWidth;
                const imgHeight = img.height || imageHeight;
                let drawWidth = imageWidth;
                let drawHeight = imageHeight;
                let offsetX = 0;
                let offsetY = 0;
                
                if (imgWidth / imgHeight > imageWidth / imageHeight) {
                    // Image is wider than container
                    drawHeight = imageHeight;
                    drawWidth = (imgWidth / imgHeight) * imageHeight;
                    offsetX = (imageWidth - drawWidth) / 2;
                } else {
                    // Image is taller than container
                    drawWidth = imageWidth;
                    drawHeight = (imgHeight / imgWidth) * imageWidth;
                    offsetY = (imageHeight - drawHeight) / 2;
                }
                
                ctx.drawImage(img, imageX + offsetX, imageY + offsetY, drawWidth, drawHeight);
                ctx.restore();
                
                // Draw image number
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(imageX + imageWidth - 10, imageY + 10, 15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(i, imageX + imageWidth - 10, imageY + 15);
            }
        }
        
        // Update the footer position
        specialFrameY += frameHeight + 20;
    }
    
    // Add footer
    const footerY = specialFrameY;
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(0, footerY, canvasWidth, 40);
    
    // Add footer text
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    const timestamp = new Date().toLocaleString('ar-IQ');
    ctx.fillText(`تم إنشاء هذه البطاقة في: ${timestamp}`, canvasWidth / 2, footerY + 25);
    
    // Convert canvas to image and save
    const cardImage = canvas.toDataURL('image/png');
    saveImageToDevice(cardImage);
    
    // Return the card image for saving in records
    return cardImage;
}

function drawCaseHeader(ctx, caseData, width, height) {
    // Draw header background with enhanced gradient
    const headerGradient = ctx.createLinearGradient(0, 0, 0, height);
    headerGradient.addColorStop(0, '#2980b9');
    headerGradient.addColorStop(0.5, '#3498db');
    headerGradient.addColorStop(1, '#2980b9');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern to header
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < width; i += 20) {
        for (let j = 0; j < height; j += 20) {
            ctx.fillRect(i, j, 10, 10);
        }
    }
    
    // Add elegant decorative border
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Add inner border for more elegance
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);
    
    // Add title with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = 'bold 38px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('توماری ئاریشە', width / 2, 50);
    ctx.shadowColor = 'transparent';
    
    // Add gold accent line under title
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 100, 60);
    ctx.lineTo(width / 2 + 100, 60);
    ctx.stroke();
    
    // Add case information with improved styling
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    
    // First row (right side) with improved spacing and alignment
    ctx.fillText(`جورێ ئاریشێ: ${caseData.issueType || '-'}`, width - 40, 95);
    
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
    
    ctx.fillText(`دەمژمێر: ${timeDisplay}`, width - 40, 125);
    ctx.fillText(`جهێ ئاریشێ: ${caseData.location || '-'}`, width - 40, 155);
    
    // Second row (left side) with improved spacing and alignment
    ctx.textAlign = 'left';
    ctx.fillText(`ناڤێ شوفێری: ${caseData.driverName || '-'}`, 40, 95);
    ctx.fillText(`خالا: ${caseData.point || '-'}`, 40, 125);
    ctx.fillText(`رەوانەكرن بـــو: ${caseData.sentTo || '-'}`, 40, 155);
    
    // Add current date with improved styling
    const currentDate = new Date().toLocaleDateString('ar-IQ');
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px Arial';
    
    // Add date background
    const dateWidth = 200;
    const dateHeight = 30;
    const dateX = (width / 2) - (dateWidth / 2);
    const dateY = 170;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect(dateX, dateY, dateWidth, dateHeight, 15);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`تاریخ: ${currentDate}`, width / 2, dateY + 20);
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
    
    // No additional images frame under person info - removed as requested
    
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
    caseImages = {};
    
    // Reset case images preview
    const caseImagesPreview = document.getElementById('case-images-preview');
    if (caseImagesPreview) {
        caseImagesPreview.innerHTML = '';
    }
    
    // Enable add button
    const addButton = document.getElementById('add-person-button');
    addButton.disabled = false;
    addButton.style.opacity = '1';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Records Management Functions
function saveRecord(personsData, caseData, cardImage) {
    // Create a record object
    const record = {
        id: Date.now().toString(), // Unique ID based on timestamp
        date: new Date().toISOString(),
        personsData: personsData,
        caseData: caseData,
        cardImage: cardImage // Store the original card image
    };
    
    // Add to records array
    savedRecords.unshift(record); // Add to beginning of array (newest first)
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
}

function loadSavedRecords() {
    // Load records from localStorage
    const storedRecords = localStorage.getItem(STORAGE_KEY);
    if (storedRecords) {
        savedRecords = JSON.parse(storedRecords);
        // We don't regenerate card images here to avoid DOM issues
        // Images will be regenerated when viewed instead
    }
}

function showRecordsModal() {
    // Show the records modal
    const modal = document.getElementById('records-modal');
    modal.style.display = 'flex';
    
    // Render the records list
    renderRecordsList();
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
        
        recordCard.innerHTML = `
            <h4>${record.caseData.issueType || 'بدون عنوان'}</h4>
            <p><strong>الأشخاص:</strong> ${record.personsData.length}</p>
            <p><strong>المكان:</strong> ${record.caseData.location || '-'}</p>
            <p><strong>الوقت:</strong> ${timeDisplay}</p>
            <div class="record-date">${formattedDate}</div>
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
}

function viewRecord(recordId) {
    // Find the record
    const record = savedRecords.find(r => r.id === recordId);
    if (!record) return;
    
    // Create a modal to display the record
    const viewModal = document.createElement('div');
    viewModal.className = 'modal';
    viewModal.id = 'view-record-modal';
    viewModal.style.display = 'flex';
    
    // Use the stored card image
    // We don't regenerate to avoid DOM-related errors
    viewModal.innerHTML = `
        <div class="modal-content view-record-modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-file-alt"></i> عرض السجل</h3>
                <button id="close-view-record-modal" class="close-button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="view-record-container">
                <img src="${record.cardImage}" alt="بطاقة السجل" class="record-image" style="max-width: 600px; max-height: 70vh; object-fit: contain;">
                <!-- تم إزالة قسم الصور الإضافية من الجانب الأيسر -->
            </div>
            <div class="modal-footer">
                <button id="download-record-image" class="action-button">
                    <i class="fas fa-download"></i> تنزيل الصورة
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(viewModal);
    
    // Add event listeners
    document.getElementById('close-view-record-modal').addEventListener('click', () => {
        viewModal.remove();
    });
    
    document.getElementById('download-record-image').addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `توماری-ئاریشە-${new Date(record.date).toISOString().replace(/[:.]/g, '-')}.png`;
        link.href = record.cardImage;
        link.click();
    });
    
    // تم إزالة معالجة الصور الإضافية لأننا لم نعد نعرضها
}

// تم إزالة وظيفة renderAdditionalCaseImages لأننا لم نعد بحاجة إليها
function renderAdditionalCaseImages(record) {
    // تم تعطيل هذه الوظيفة وإرجاع سلسلة فارغة دائمًا
    return '';
}

// تم إزالة وظيفة openImageInFullscreen لأننا لم نعد بحاجة إليها بعد إزالة عرض الصور الإضافية
    
    // Add event listener to close button
// نهاية إزالة وظيفة openImageInFullscreen

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