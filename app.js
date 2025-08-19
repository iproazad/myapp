// Main Application Logic for Misconduct Logger - Enhanced for Offline Use

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Wait for the service worker to be ready
                if (registration.active) {
                    // Service worker is already active, send message to precache main page
                    registration.active.postMessage({
                        type: 'PRECACHE_MAIN_PAGE'
                    });
                }
                
                // Listen for service worker state changes
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            // New service worker activated, send message to precache main page
                            newWorker.postMessage({
                                type: 'PRECACHE_MAIN_PAGE'
                            });
                        }
                    });
                });
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
    
    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PRECACHE_COMPLETE') {
            console.log('Main page precached successfully');
        }
    });
}

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
const networkStatusIndicator = document.createElement('div'); // سنضيف مؤشر حالة الاتصال

// Current suspect data
let currentSuspectData = {
    photo: null,
    timestamp: null
};

// Queue for storing data when offline
let offlineDataQueue = [];

// Initialize the application
function initApp() {
    // Setup network status indicator
    setupNetworkStatusIndicator();
    
    // Load any pending offline data
    loadOfflineData();
    
    // Ensure app resources are cached for offline use
    ensureOfflineAvailability();
    
    // Check if this is the first time the app is loaded
    checkAppStartupStatus();
    
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

// Setup network status indicator
function setupNetworkStatusIndicator() {
    // Create and style the network status indicator
    networkStatusIndicator.className = 'network-status';
    networkStatusIndicator.style.position = 'fixed';
    networkStatusIndicator.style.bottom = '10px';
    networkStatusIndicator.style.right = '10px';
    networkStatusIndicator.style.padding = '5px 10px';
    networkStatusIndicator.style.borderRadius = '5px';
    networkStatusIndicator.style.fontSize = '14px';
    networkStatusIndicator.style.fontWeight = 'bold';
    networkStatusIndicator.style.zIndex = '1000';
    document.body.appendChild(networkStatusIndicator);
    
    // Update network status initially and on change
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
}

// Update network status indicator
function updateNetworkStatus() {
    if (navigator.onLine) {
        networkStatusIndicator.textContent = 'متصل بالإنترنت';
        networkStatusIndicator.style.backgroundColor = '#4CAF50';
        networkStatusIndicator.style.color = 'white';
        
        // Try to sync any pending offline data
        syncOfflineData();
    } else {
        networkStatusIndicator.textContent = 'غير متصل بالإنترنت - وضع حفظ محلي';
        networkStatusIndicator.style.backgroundColor = '#FF9800';
        networkStatusIndicator.style.color = 'white';
    }
}

// Check app startup status and show appropriate message
function checkAppStartupStatus() {
    const appLoadedBefore = localStorage.getItem('appLoadedBefore');
    
    // If this is the first time loading the app or we're offline
    if (!navigator.onLine) {
        if (!appLoadedBefore) {
            // First time loading and offline - show a helpful message
            showNotification('تم تحميل التطبيق للمرة الأولى. للاستخدام الكامل دون اتصال، يرجى فتح التطبيق مرة واحدة على الأقل مع وجود اتصال بالإنترنت.', 10000);
        } else {
            // Not first time, but offline - show offline mode message
            showNotification('التطبيق يعمل حاليًا في وضع عدم الاتصال. جميع البيانات ستُحفظ محليًا.', 5000);
        }
    } else if (!appLoadedBefore) {
        // First time loading with internet - show welcome message
        showNotification('مرحبًا بك في تطبيق توماركرنا تومەتباری! التطبيق جاهز للعمل بدون إنترنت.', 5000);
    }
}

// Load any pending offline data from localStorage
function loadOfflineData() {
    try {
        const savedQueue = localStorage.getItem('offlineDataQueue');
        if (savedQueue) {
            offlineDataQueue = JSON.parse(savedQueue);
            console.log(`Loaded ${offlineDataQueue.length} pending offline entries`);
        }
    } catch (error) {
        console.error('Error loading offline data:', error);
    }
}

// Ensure application resources are available offline
function ensureOfflineAvailability() {
    // If Cache API is available, use it to cache critical resources
    if ('caches' in window) {
        // Open our cache
        caches.open('misconduct-logger-v3').then(cache => {
            // Cache critical resources
            const resourcesToCache = [
                './',
                './index.html',
                './style.css',
                './app.js',
                './manifest.json',
                './icon.svg',
                './icon-192.png',
                './icon-512.png'
            ];
            
            // Fetch and cache each resource
            resourcesToCache.forEach(url => {
                fetch(url, { cache: 'no-cache' })
                    .then(response => {
                        if (response.ok) {
                            cache.put(url, response);
                            console.log(`Cached resource: ${url}`);
                        }
                    })
                    .catch(error => {
                        console.log(`Failed to cache ${url}:`, error);
                    });
            });
        });
    }
    
    // Store a flag in localStorage to indicate the app has been loaded at least once
    localStorage.setItem('appLoadedBefore', 'true');
    
    // Also store the current timestamp of when the app was last loaded
    localStorage.setItem('lastAppLoadTime', Date.now().toString());
}

// Show notification to user
function showNotification(message, duration = 3000) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('app-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'app-notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = '#333';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1001';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.textAlign = 'center';
        notification.style.maxWidth = '90%';
        notification.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // Hide after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
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
        timestamp: new Date().toLocaleString('en-US'),
        savedOffline: !navigator.onLine,
        id: 'suspect_' + new Date().getTime() // إضافة معرف فريد لكل سجل
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
    
    // If offline, add to sync queue
    if (!navigator.onLine) {
        offlineDataQueue.push(currentSuspectData);
        localStorage.setItem('offlineDataQueue', JSON.stringify(offlineDataQueue));
        console.log('Data saved offline and added to sync queue');
    }

    // Generate card image
    generateSuspectCard(currentSuspectData);

    // Show success modal with appropriate message
    const modalMessage = document.getElementById('success-message');
    if (modalMessage) {
        if (navigator.onLine) {
            modalMessage.textContent = 'تم حفظ البيانات بنجاح!';
        } else {
            modalMessage.textContent = 'تم حفظ البيانات محلياً (وضع عدم الاتصال). سيتم مزامنتها عند توفر الإنترنت.';
        }
    }
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
        const photoHeight = 550; // تقليل طول الصورة العمودية لتناسب المعلومات المعاد ترتيبها
        
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
        const photoHeight = 550; // تقليل طول الصورة العمودية لتناسب المعلومات المعاد ترتيبها
        
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
        const infoHeight = 700; // Reverted to original height as we're using horizontal layout
        
        // Draw info section background with semi-transparent blue
        ctx.fillStyle = 'rgba(52, 152, 219, 0.05)';
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, true, false);
        
        // Add border to info section
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, false, true);
        
        // Add section title background
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
        titleGradient.addColorStop(0, '#3498db');
        titleGradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 60, {tl: 10, tr: 10, bl: 0, br: 0}, true, false);
        
        // Add section title
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 40);
        
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
        const startY = infoY + 120;
        
        // Reduced line height for more compact layout
        const oldLineHeight = 45; // Smaller line height for original fields
        const newLineHeight = 35; // Even smaller line height for new fields
        
        // Create a two-column layout for the main information
        const col1X = 80;
        const col2X = infoWidth / 2 + 30;
        
        // First column - main information
        drawInfoBox('ناڤێ تومەتباری:', data.fullname, startY, col1X);
        drawInfoBox('ژدایـــكبون:', data.birthdate, startY + oldLineHeight, col1X);
        drawInfoBox('ئاكنجی بوون:', data.address, startY + oldLineHeight * 2, col1X);
        
        // Second column - main information
        drawInfoBox('جورێ ئاریشێ:', data.issueType, startY, col2X);
        drawInfoBox('بارێ خێزانی:', data.familyStatus, startY + oldLineHeight, col2X);
        drawInfoBox('كارێ وی:', data.job, startY + oldLineHeight * 2, col2X);
        
        // Start position for the next section
        let nextSectionY = startY + oldLineHeight * 3 + 10;
        
        // Draw separator line
        ctx.fillStyle = '#888888';
        ctx.fillRect(80, nextSectionY, infoWidth - 60, 2);
        nextSectionY += 20;
        
        // Draw conditional fields in a single row if possible
        let conditionalFieldsY = nextSectionY;
        let currentX = col1X;
        let currentCol = 1;
        
        // Function to advance to next position
        const advancePosition = () => {
            if (currentCol === 1) {
                currentX = col2X;
                currentCol = 2;
            } else {
                currentX = col1X;
                currentCol = 1;
                conditionalFieldsY += oldLineHeight;
            }
        };
        
        // Draw conditional fields in a grid layout
        if (data.imprisonment) {
            drawInfoBox('زیندانكرن:', data.imprisonment, conditionalFieldsY, currentX);
            advancePosition();
        }
        
        if (data.phone) {
            drawInfoBox('ژمارا موبایلی:', data.phone, conditionalFieldsY, currentX);
            advancePosition();
        }
        
        // رەوانەكرن بـــو field has been moved to the new fields section
        
        // Ensure we're at the start of a new row
        if (currentCol === 2) {
            conditionalFieldsY += oldLineHeight;
            currentCol = 1;
            currentX = col1X;
        }
        
        // Draw separator line for additional information
        nextSectionY = conditionalFieldsY + 10;
        ctx.fillStyle = '#888888';
        ctx.fillRect(80, nextSectionY, infoWidth - 60, 2);
        nextSectionY += 20;
        
        // Draw new fields section title
        ctx.font = 'bold 24px Arial'; // Smaller font for title
        ctx.fillStyle = '#777777';
        ctx.textAlign = 'center';
        ctx.fillText('معلومات إضافية', infoX + infoWidth / 2, nextSectionY);
        nextSectionY += 30;
        
        // Draw new fields in a compact grid layout
        // First row
        drawInfoBox('دەمژمێر:', data.time + ' - ' + data.dayNight, nextSectionY, col1X, '#777777');
        drawInfoBox('جهێ ئاریشێ:', data.problemLocation, nextSectionY, col2X, '#777777');
        
        // Second row
        drawInfoBox('ناڤێ شوفێری:', data.driverName, nextSectionY + newLineHeight, col1X, '#777777');
        drawInfoBox('خالا:', data.point, nextSectionY + newLineHeight, col2X, '#777777');
        
        // Third row - رەوانەكرن بـــو field moved under driver name
        drawInfoBox('رەوانەكرن بـــو:', data.sentTo, nextSectionY + newLineHeight * 2, col1X, '#777777');
        
        // Add footer with timestamp - gradient background
        const footerY = nextSectionY + newLineHeight * 2 + 10; // Position footer based on content
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)');
        footerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.9)');
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, footerY, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        // Add decorative line above footer
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(50, footerY - 5, canvas.width - 100, 2);
        
        // Add timestamp with shadow effect (adjusted for new footer position)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'italic 22px Arial'; // Slightly smaller font
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
        const boxHeight = isNewInfo ? 30 : 35; // Smaller height for all info boxes
        const boxWidth = (canvas.width / 2) - 80; // Adjusted for the two-column layout
        const fontSize = isNewInfo ? 18 : 20; // Smaller font for all info
        const labelWidth = isNewInfo ? 140 : 160; // Smaller label width for all info
        
        // Draw label box with semi-transparent background (blue or gray)
        const labelBgColor = isNewInfo ? 'rgba(119, 119, 119, 0.2)' : 'rgba(52, 152, 219, 0.2)';
        ctx.fillStyle = labelBgColor;
        roundRect(ctx, boxX, y - boxHeight/2, labelWidth, boxHeight, {tl: 8, bl: 8, tr: 0, br: 0}, true, false);
        
        // Draw value box with white or light gray background
        ctx.fillStyle = isNewInfo ? '#f5f5f5' : '#ffffff';
        roundRect(ctx, boxX + labelWidth, y - boxHeight/2, boxWidth - labelWidth, boxHeight, {tl: 0, bl: 0, tr: 8, br: 8}, true, false);
        
        // Add decorative separator
        ctx.fillStyle = isNewInfo ? '#777777' : '#3498db';
        ctx.fillRect(boxX + labelWidth - 3, y - boxHeight/2, 3, boxHeight);
        
        // Draw label
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#555555' : '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + labelWidth/2, y);
        
        // Draw value - truncate if too long
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = isNewInfo ? '#666666' : '#34495e';
        ctx.textAlign = 'right';
        
        // Measure text width to check if it needs truncation
        const maxValueWidth = boxWidth - labelWidth - 25; // Leave some padding
        const valueWidth = ctx.measureText(value).width;
        
        if (valueWidth > maxValueWidth) {
            // Truncate text if too long
            let truncatedValue = value;
            while (ctx.measureText(truncatedValue + '...').width > maxValueWidth && truncatedValue.length > 0) {
                truncatedValue = truncatedValue.slice(0, -1);
            }
            ctx.fillText(truncatedValue + '...', boxX + boxWidth - 15, y);
        } else {
            ctx.fillText(value, boxX + boxWidth - 15, y);
        }
        
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
        // First, try to store the image in the browser's cache for offline access
        if ('caches' in window) {
            const suspectName = currentSuspectData.fullname || 'suspect';
            const fileName = 'بطاقة_' + suspectName + '_' + new Date().getTime() + '.png';
            const imageUrl = `/cached-images/${fileName}`;
            
            // Store the image in the cache
            caches.open('misconduct-logger-images').then(cache => {
                // Convert base64 to blob
                fetch(currentSuspectData.cardImage).then(response => {
                    cache.put(imageUrl, response);
                    console.log('Image cached successfully for offline use');
                });
            }).catch(err => {
                console.warn('Could not cache image:', err);
            });
        }
        
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
            
            // Show different message based on connection status
            if (navigator.onLine) {
                showNotification('تم حفظ البطاقة تلقائياً في مجلد التنزيلات بصيغة PNG');
            } else {
                showNotification('تم حفظ البطاقة محلياً (وضع عدم الاتصال)');
            }
        }, 100);
        
        // Also save image data to localStorage for offline access
        try {
            // Store reference to the image in localStorage
            const savedImages = JSON.parse(localStorage.getItem('savedImages') || '[]');
            savedImages.push({
                id: currentSuspectData.id,
                fileName: fileName,
                timestamp: new Date().toLocaleString('en-US')
            });
            localStorage.setItem('savedImages', JSON.stringify(savedImages));
        } catch (storageError) {
            console.warn('Could not save image reference to localStorage:', storageError);
        }
        
    } catch (error) {
        console.error('Error saving image:', error);
        showNotification('هەلەك چێبوو دەمێ خەزنكرنا وێنەی. تكایە دووبارە هەول بدە.');
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

// Sync offline data when connection is restored
function syncOfflineData() {
    if (offlineDataQueue.length === 0) {
        return; // No data to sync
    }
    
    console.log(`Attempting to sync ${offlineDataQueue.length} offline entries`);
    
    // Here you would normally send data to your server
    // Since this is a local app, we'll just mark them as synced
    
    // Update the status of entries in the main storage
    const savedEntries = JSON.parse(localStorage.getItem('suspectEntries') || '[]');
    
    offlineDataQueue.forEach(offlineEntry => {
        const entryIndex = savedEntries.findIndex(entry => entry.id === offlineEntry.id);
        if (entryIndex !== -1) {
            savedEntries[entryIndex].savedOffline = false;
            savedEntries[entryIndex].syncedAt = new Date().toLocaleString('en-US');
        }
    });
    
    // Save updated entries
    localStorage.setItem('suspectEntries', JSON.stringify(savedEntries));
    
    // Clear the offline queue
    offlineDataQueue = [];
    localStorage.setItem('offlineDataQueue', JSON.stringify(offlineDataQueue));
    
    console.log('All offline data synced successfully');
    
    // Show a notification to the user
    showNotification('تمت مزامنة البيانات المحفوظة محلياً بنجاح');
}

// Show a temporary notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'sync-notification';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1001';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);