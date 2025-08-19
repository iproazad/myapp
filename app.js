// DOM Elements
const recordForm = document.getElementById('record-form');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const cameraBtn = document.getElementById('camera-btn');
const galleryBtn = document.getElementById('gallery-btn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const recordsContainer = document.getElementById('records-container');
const cardModal = document.getElementById('card-modal');
const cardPreview = document.getElementById('card-preview');
const closeModal = document.querySelector('.close-modal');
const shareBtn = document.getElementById('share-btn');
const downloadBtn = document.getElementById('download-btn');

// Global variables
let currentPhoto = null;
let records = [];
let currentRecord = null;

// Initialize the app
function initApp() {
    // Load saved records from localStorage
    loadRecords();
    
    // Set current date and time in the form
    setCurrentDateTime();
    
    // Add event listeners
    addEventListeners();
}

// Set current date and time in the form
function setCurrentDateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Format time for input fields
    const timeFrom = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const timeTo = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Set time values
    document.getElementById('time-from').value = timeFrom;
    document.getElementById('time-to').value = timeTo;
    
    // Set day/night radio based on current time
    if (hours >= 6 && hours < 18) {
        document.querySelector('input[name="day-time"][value="روژ"]').checked = true;
    } else {
        document.querySelector('input[name="day-time"][value="شەڤ"]').checked = true;
    }
}

// Add all event listeners
function addEventListeners() {
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
            
            // If switching to records list, refresh the list
            if (tabId === 'records-list') {
                displayRecords();
            }
        });
    });
    
    // Photo input handlers
    cameraBtn.addEventListener('click', () => {
        photoInput.setAttribute('capture', 'environment');
        photoInput.click();
    });
    
    galleryBtn.addEventListener('click', () => {
        photoInput.removeAttribute('capture');
        photoInput.click();
    });
    
    photoInput.addEventListener('change', handlePhotoSelect);
    
    // Form submission
    recordForm.addEventListener('submit', saveRecord);
    
    // Modal close button
    closeModal.addEventListener('click', () => {
        cardModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            cardModal.style.display = 'none';
        }
    });
    
    // Share button
    shareBtn.addEventListener('click', shareCard);
    
    // Download button
    downloadBtn.addEventListener('click', downloadCard);
}

// Handle photo selection
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        currentPhoto = event.target.result;
        photoPreview.innerHTML = `<img src="${currentPhoto}" alt="صورة المشتبه به">`;
    };
    reader.readAsDataURL(file);
}

// Save record
function saveRecord(e) {
    e.preventDefault();
    
    // Check if photo is selected
    if (!currentPhoto) {
        alert('الرجاء اختيار صورة');
        return;
    }
    
    // Get form data
    const formData = new FormData(recordForm);
    const record = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        photo: currentPhoto,
        name: formData.get('name'),
        birthdate: formData.get('birthdate'),
        residence: formData.get('residence'),
        problemType: formData.get('problem-type'),
        maritalStatus: formData.get('marital-status'),
        job: formData.get('job'),
        imprisoned: formData.get('imprisoned'),
        phone: formData.get('phone'),
        timeFrom: formData.get('time-from'),
        timeTo: formData.get('time-to'),
        dayTime: formData.get('day-time'),
        location: formData.get('location'),
        driverName: formData.get('driver-name'),
        sendTo: formData.get('send-to'),
        point: formData.get('point')
    };
    
    // Add to records array
    records.push(record);
    
    // Save to localStorage
    saveRecords();
    
    // Show success message
    alert('تم حفظ السجل بنجاح');
    
    // Reset form
    resetForm();
    
    // Generate and show card
    generateCard(record);
}

// Reset form after submission
function resetForm() {
    recordForm.reset();
    photoPreview.innerHTML = '<i class="fas fa-user-circle placeholder-icon"></i>';
    currentPhoto = null;
    setCurrentDateTime();
}

// Save records to localStorage
function saveRecords() {
    localStorage.setItem('violationRecords', JSON.stringify(records));
}

// Load records from localStorage
function loadRecords() {
    const savedRecords = localStorage.getItem('violationRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
}

// Display records in the list
function displayRecords() {
    if (records.length === 0) {
        recordsContainer.innerHTML = '<div class="empty-records">لا توجد سجلات حتى الآن</div>';
        return;
    }
    
    recordsContainer.innerHTML = '';
    
    // Sort records by date (newest first)
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedRecords.forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        
        // Format date
        const recordDate = new Date(record.date);
        const formattedDate = recordDate.toLocaleDateString('ar-IQ');
        
        recordCard.innerHTML = `
            <img src="${record.photo}" alt="صورة المشتبه به">
            <h3>${record.name}</h3>
            <p>${record.problemType}</p>
            <p>${formattedDate}</p>
        `;
        
        // Add click event to show card
        recordCard.addEventListener('click', () => {
            generateCard(record);
        });
        
        recordsContainer.appendChild(recordCard);
    });
}

// Generate information card
function generateCard(record) {
    currentRecord = record;
    
    // Format date
    const recordDate = new Date(record.date);
    const formattedDate = recordDate.toLocaleDateString('ar-IQ');
    const formattedTime = recordDate.toLocaleTimeString('ar-IQ');
    
    // Create card HTML
    const cardHTML = `
        <div class="info-card">
            <div class="card-header">
                <h3>بطاقة المشتبه به</h3>
                <p>تاريخ التسجيل: ${formattedDate} - ${formattedTime}</p>
            </div>
            
            <div class="card-body">
                <div class="card-photo">
                    <img src="${record.photo}" alt="صورة المشتبه به">
                </div>
                
                <div class="card-info">
                    <div class="info-group">
                        <h4>🧍‍♂️ زانیاری کەسی</h4>
                        <p><strong>ناڤێ تومەتباری:</strong> ${record.name}</p>
                        <p><strong>ژدایـــكبون:</strong> ${record.birthdate}</p>
                        <p><strong>ئاكنجی بوون:</strong> ${record.residence}</p>
                        <p><strong>جورێ ئاریشێ:</strong> ${record.problemType}</p>
                        <p><strong>بارێ خێزانی:</strong> ${record.maritalStatus}</p>
                        <p><strong>كارێ وی:</strong> ${record.job || 'غير محدد'}</p>
                        <p><strong>زیندانكرن:</strong> ${record.imprisoned}</p>
                        <p><strong>ژمارا موبایلی:</strong> ${record.phone || 'غير محدد'}</p>
                    </div>
                    
                    <div class="info-group">
                        <h4>⏰ دەمژمێر</h4>
                        <p><strong>الوقت:</strong> ${record.timeFrom} - ${record.timeTo}</p>
                        <p><strong>الفترة:</strong> ${record.dayTime}</p>
                    </div>
                    
                    <div class="info-group">
                        <h4>📍 معلومات إضافية</h4>
                        <p><strong>جهێ ئاریشێ:</strong> ${record.location}</p>
                        <p><strong>ناڤێ شوفێری:</strong> ${record.driverName || 'غير محدد'}</p>
                        <p><strong>رەوانەكرن بـــو:</strong> ${record.sendTo}</p>
                        <p><strong>خالا:</strong> ${record.point}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Set card HTML and show modal
    cardPreview.innerHTML = cardHTML;
    cardModal.style.display = 'block';
    
    // Add CSS for the card
    const cardStyle = document.createElement('style');
    cardStyle.textContent = `
        .info-card {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            direction: rtl;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .card-header {
            background-color: #3498db;
            color: white;
            padding: 10px 15px;
            text-align: center;
        }
        
        .card-header h3 {
            margin: 0;
            font-size: 18px;
        }
        
        .card-header p {
            margin: 5px 0 0;
            font-size: 12px;
            opacity: 0.9;
        }
        
        .card-body {
            display: flex;
            flex-direction: column;
            padding: 15px;
        }
        
        .card-photo {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .card-photo img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #3498db;
        }
        
        .card-info {
            flex: 1;
        }
        
        .info-group {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .info-group:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .info-group h4 {
            color: #3498db;
            margin: 0 0 8px;
            font-size: 16px;
        }
        
        .info-group p {
            margin: 5px 0;
            font-size: 14px;
            line-height: 1.4;
        }
    `;
    
    document.head.appendChild(cardStyle);
}

// Share card
async function shareCard() {
    if (!currentRecord) return;
    
    try {
        // Convert card to image
        const cardElement = cardPreview.querySelector('.info-card');
        const canvas = await html2canvas(cardElement);
        const imageData = canvas.toDataURL('image/png');
        
        // Check if Web Share API is available
        if (navigator.share) {
            // Create a blob from the image data
            const blob = await (await fetch(imageData)).blob();
            const file = new File([blob], 'violation-card.png', { type: 'image/png' });
            
            await navigator.share({
                title: 'بطاقة المشتبه به',
                text: `بطاقة معلومات: ${currentRecord.name}`,
                files: [file]
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const link = document.createElement('a');
            link.href = imageData;
            link.download = 'violation-card.png';
            link.click();
            
            alert('تم حفظ البطاقة. يمكنك مشاركتها يدوياً.');
        }
    } catch (error) {
        console.error('Error sharing card:', error);
        alert('حدث خطأ أثناء مشاركة البطاقة. يرجى المحاولة مرة أخرى.');
    }
}

// Download card as image
async function downloadCard() {
    if (!currentRecord) return;
    
    try {
        // Convert card to image
        const cardElement = cardPreview.querySelector('.info-card');
        const canvas = await html2canvas(cardElement);
        const imageData = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `violation-card-${currentRecord.id}.png`;
        link.click();
    } catch (error) {
        console.error('Error downloading card:', error);
        alert('حدث خطأ أثناء تحميل البطاقة. يرجى المحاولة مرة أخرى.');
    }
}

// Load html2canvas library for card generation
function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (window.html2canvas) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadHtml2Canvas();
        initApp();
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('حدث خطأ أثناء تحميل التطبيق. يرجى تحديث الصفحة.');
    }
});