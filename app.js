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
    
    // Set canvas dimensions - optimized for better photo display
    canvas.width = 1500;
    canvas.height = 900; // Optimized height for better photo display with horizontal arrangement
    
    // Define photo dimensions for consistency
    const photoX = canvas.width - 500; // Position on the right side
    const photoY = 180;
    const photoWidth = 450;
    const photoHeight = 500;
    
    // Set background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#f8f9fa');
    bgGradient.addColorStop(1, '#f1f2f3');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add elegant double border
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 8;
    roundRect(ctx, 5, 5, canvas.width - 10, canvas.height - 10, 5, false, true);
    
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 2;
    roundRect(ctx, 15, 15, canvas.width - 30, canvas.height - 30, 3, false, true);
    
    // Draw header
    drawHeader();
    
    // Draw photo section
    drawPhoto();
    
    // Draw suspect info
    drawSuspectInfo();
    
    // Save the final image
    currentSuspectData.cardImage = canvas.toDataURL('image/png');
    
    // Function to draw the photo with frame and decorations
    
    // Function to draw the photo with frame and decorations
    function drawPhoto() {
        // Draw photo background with enhanced gradient
        const photoBgGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoWidth, photoY + photoHeight);
        photoBgGradient.addColorStop(0, '#f5f9ff');
        photoBgGradient.addColorStop(1, '#e1f0ff');
        ctx.fillStyle = photoBgGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 12, true, false);
        
        // Add elegant photo frame with gradient
        const frameGradient = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoHeight);
        frameGradient.addColorStop(0, '#3498db');
        frameGradient.addColorStop(1, '#2980b9');
        ctx.strokeStyle = frameGradient;
        ctx.lineWidth = 3;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 12, false, true);
        
        // Add decorative elements around photo (corners)
        const cornerSize = 8;
        const cornerPositions = [
            {x: photoX - 3, y: photoY - 3}, // Top left
            {x: photoX + photoWidth + 3, y: photoY - 3}, // Top right
            {x: photoX + photoWidth + 3, y: photoY + photoHeight + 3}, // Bottom right
            {x: photoX - 3, y: photoY + photoHeight + 3} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            // Add glow effect
            ctx.shadowColor = 'rgba(243, 156, 18, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cornerSize, 0, Math.PI * 2, true);
            ctx.fill();
            
            // Reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
        });
        
        // Add decorative inner border with pattern
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, photoX + 8, photoY + 8, photoWidth - 16, photoHeight - 16, 8, false, true);
        
        // Add subtle pattern inside photo area
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < photoWidth - 16; i += 20) {
            ctx.fillRect(photoX + 8 + i, photoY + 8, 10, photoHeight - 16);
        }
        
        // Add photo or placeholder
        if (data.photo) {
            drawImageWithProperRatio();
        } else {
            drawPlaceholder();
        }
    }
    
    // Helper function to draw image with proper aspect ratio
    function drawImageWithProperRatio() {
        const img = new Image();
        img.src = data.photo;
        
        // Draw rectangular photo with better aspect ratio handling
        ctx.save();
        ctx.beginPath();
        roundRect(ctx, photoX + 10, photoY + 10, photoWidth - 20, photoHeight - 20, 6, false, false);
        ctx.clip();
        
        // Wait for image to load
        img.onload = function() {
            // Calculate dimensions to maintain aspect ratio
            const imgRatio = img.width / img.height;
            let drawWidth = photoWidth - 20;
            let drawHeight = drawWidth / imgRatio;
            
            // If the height is too large, scale based on height instead
            if (drawHeight > photoHeight - 20) {
                drawHeight = photoHeight - 20;
                drawWidth = drawHeight * imgRatio;
            }
            
            // Center the image within the photo area
            const offsetX = photoX + 10 + (photoWidth - 20 - drawWidth) / 2;
            const offsetY = photoY + 10 + (photoHeight - 20 - drawHeight) / 2;
            
            // Draw the image
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            ctx.restore();
            
            // Continue with drawing text after image loads
            drawSuspectInfo();
            
            // Save the final image
            currentSuspectData.cardImage = canvas.toDataURL('image/png');
        };
    }
    
    // Helper function to draw placeholder when no photo is available
    function drawPlaceholder() {
        // Draw user icon placeholder
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
    
    // Function to draw header
    function drawHeader() {
        // Define header dimensions - slightly reduced height
        const headerHeight = 140;
        
        // Draw header background with enhanced gradient
        const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        headerGradient.addColorStop(0, '#3498db');
        headerGradient.addColorStop(0.5, '#2980b9');
        headerGradient.addColorStop(1, '#1c6ea4'); // Darker at right for depth
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvas.width, headerHeight);
        
        // Add subtle pattern to header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.fillRect(i, 0, 10, headerHeight);
        }
        
        // Add subtle dots pattern for more elegant look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let x = 10; x < canvas.width; x += 30) {
            for (let y = 10; y < headerHeight; y += 30) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add title with enhanced shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.font = 'bold 44px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('كارتا زانیاریێن تومەتباری', canvas.width / 2, 55);
        
        // Add subtitle with same shadow
        ctx.font = 'bold 26px Arial';
        ctx.fillText('سیستەمێ زانیاریێن كەسی', canvas.width / 2, 95);
        
        // Reset shadow for decorative elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add enhanced decorative line with glow effect
        const lineWidth = 250;
        const lineHeight = 3;
        const lineY = 115;
        
        // First draw the glow
        ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
        ctx.fillRect(canvas.width / 2 - lineWidth / 2 - 2, lineY - 2, lineWidth + 4, lineHeight + 4);
        
        // Then draw the main line with gradient
        const lineGradient = ctx.createLinearGradient(canvas.width / 2 - lineWidth / 2, lineY, canvas.width / 2 + lineWidth / 2, lineY);
        lineGradient.addColorStop(0, '#f39c12');
        lineGradient.addColorStop(0.5, '#f5b041');
        lineGradient.addColorStop(1, '#f39c12');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(canvas.width / 2 - lineWidth / 2, lineY, lineWidth, lineHeight);
        
        // Add decorative dots at ends of line
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - lineWidth / 2, lineY + lineHeight / 2, 4, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + lineWidth / 2, lineY + lineHeight / 2, 4, 0, Math.PI * 2, true);
        ctx.fill();
    }
    }
    
    // Function to draw header
    function drawHeader() {
        // Define header dimensions - slightly reduced height
        const headerHeight = 140;
        
        // Draw header background with enhanced gradient
        const headerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        headerGradient.addColorStop(0, '#3498db');
        headerGradient.addColorStop(0.5, '#2980b9');
        headerGradient.addColorStop(1, '#1c6ea4'); // Darker at right for depth
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, canvas.width, headerHeight);
        
        // Add subtle pattern to header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.fillRect(i, 0, 10, headerHeight);
        }
        
        // Add subtle dots pattern for more elegant look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let x = 10; x < canvas.width; x += 30) {
            for (let y = 10; y < headerHeight; y += 30) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Add title with enhanced shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.font = 'bold 44px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('كارتا زانیاریێن تومەتباری', canvas.width / 2, 55);
        
        // Add subtitle with same shadow
        ctx.font = 'bold 26px Arial';
        ctx.fillText('سیستەمێ زانیاریێن كەسی', canvas.width / 2, 95);
        
        // Reset shadow for decorative elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add enhanced decorative line with glow effect
        const lineWidth = 250;
        const lineHeight = 3;
        const lineY = 115;
        
        // First draw the glow
        ctx.fillStyle = 'rgba(243, 156, 18, 0.3)';
        ctx.fillRect(canvas.width / 2 - lineWidth / 2 - 2, lineY - 2, lineWidth + 4, lineHeight + 4);
        
        // Then draw the main line with gradient
        const lineGradient = ctx.createLinearGradient(canvas.width / 2 - lineWidth / 2, lineY, canvas.width / 2 + lineWidth / 2, lineY);
        lineGradient.addColorStop(0, '#f39c12');
        lineGradient.addColorStop(0.5, '#f5b041');
        lineGradient.addColorStop(1, '#f39c12');
        ctx.fillStyle = lineGradient;
        ctx.fillRect(canvas.width / 2 - lineWidth / 2, lineY, lineWidth, lineHeight);
        
        // Add decorative dots at ends of line
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(canvas.width / 2 - lineWidth / 2, lineY + lineHeight / 2, 4, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width / 2 + lineWidth / 2, lineY + lineHeight / 2, 4, 0, Math.PI * 2, true);
        ctx.fill();
    }
    
    // Create a variable to hold the photo image
    let photoImg = null;
    if (data.photo) {
        photoImg = new Image();
        photoImg.src = data.photo;
    }
    
    // Create gradient background - slightly lighter for better contrast
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#f8fafd'); // Lighter background
    gradient.addColorStop(1, '#e9edf5'); // Lighter background
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
    
    // Define common photo dimensions for consistency
    const photoX = canvas.width - 500; // Position on the right side
    const photoY = 180;
    const photoWidth = 450;
    const photoHeight = 500; // تقليل طول الصورة لتناسب المعلومات
    
    // Draw photo section first
    function drawPhoto() {
        // Draw photo background with gradient
        const photoBgGradient = ctx.createLinearGradient(photoX, photoY, photoX + photoWidth, photoY);
        photoBgGradient.addColorStop(0, '#f5f9ff');
        photoBgGradient.addColorStop(1, '#e8f4ff');
        ctx.fillStyle = photoBgGradient;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 12, true, false);
        
        // Add elegant photo frame
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2.5;
        roundRect(ctx, photoX, photoY, photoWidth, photoHeight, 12, false, true);
        
        // Add decorative elements around photo (corners)
        const cornerSize = 7;
        const cornerPositions = [
            {x: photoX - 3, y: photoY - 3}, // Top left
            {x: photoX + photoWidth + 3, y: photoY - 3}, // Top right
            {x: photoX + photoWidth + 3, y: photoY + photoHeight + 3}, // Bottom right
            {x: photoX - 3, y: photoY + photoHeight + 3} // Bottom left
        ];
        
        cornerPositions.forEach(pos => {
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, cornerSize, 0, Math.PI * 2, true);
            ctx.fill();
        });
        
        // Add decorative inner border
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.lineWidth = 1;
        roundRect(ctx, photoX + 8, photoY + 8, photoWidth - 16, photoHeight - 16, 8, false, true);
        
        // Add photo or placeholder
        if (data.photo) {
            const img = new Image();
            img.src = data.photo;
            
            // Draw rectangular photo with better aspect ratio handling
            ctx.save();
            ctx.beginPath();
            roundRect(ctx, photoX + 10, photoY + 10, photoWidth - 20, photoHeight - 20, 6, false, false);
            ctx.clip();
            
            // Wait for image to load
            img.onload = function() {
                // Calculate dimensions to maintain aspect ratio
                const imgRatio = img.width / img.height;
                let drawWidth = photoWidth - 20;
                let drawHeight = drawWidth / imgRatio;
                
                // If the height is too large, scale based on height instead
                if (drawHeight > photoHeight - 20) {
                    drawHeight = photoHeight - 20;
                    drawWidth = drawHeight * imgRatio;
                }
                
                // Center the image within the photo area
                const offsetX = photoX + 10 + (photoWidth - 20 - drawWidth) / 2;
                const offsetY = photoY + 10 + (photoHeight - 20 - drawHeight) / 2;
                
                // Draw the image
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                ctx.restore();
                
                // Continue with drawing text after image loads
                drawSuspectInfo();
                
                // Save the final image
                currentSuspectData.cardImage = canvas.toDataURL('image/png');
            };
        } else {
            // Draw user icon placeholder
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
    }
    
    // Call drawPhoto to start the rendering process
    drawPhoto();
    
    function drawSuspectInfo() {
        // Define info section dimensions - adjusted to match new photo dimensions
        const infoX = 30;
        const infoY = 180;
        const infoWidth = photoX - 50; // Adjust width based on photo position
        const infoHeight = photoHeight; // Match photo height
        
        // Draw info section background with subtle gradient
        const infoBgGradient = ctx.createLinearGradient(infoX, infoY, infoX, infoY + infoHeight);
        infoBgGradient.addColorStop(0, 'rgba(52, 152, 219, 0.03)');
        infoBgGradient.addColorStop(1, 'rgba(52, 152, 219, 0.07)');
        ctx.fillStyle = infoBgGradient;
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, true, false);
        
        // Add elegant border to info section
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
        ctx.lineWidth = 1; // Thin border
        roundRect(ctx, infoX, infoY, infoWidth, infoHeight, 10, false, true);
        
        // Add section title background with gradient
        const titleGradient = ctx.createLinearGradient(infoX, infoY, infoX + infoWidth, infoY);
        titleGradient.addColorStop(0, '#3498db');
        titleGradient.addColorStop(1, '#2980b9');
        ctx.fillStyle = titleGradient;
        roundRect(ctx, infoX, infoY, infoWidth, 35, {tl: 10, tr: 10, bl: 0, br: 0}, true, false);
        
        // Add section title with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'bold 22px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('زانیاریێن كەسی', infoX + infoWidth / 2, infoY + 24);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Add decorative elements
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(infoX + infoWidth / 2, infoY + 45, 3, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Text settings
        ctx.font = 'bold 16px Arial'; // Smaller font size for better fit
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'right';
        
        // Draw text info - organize in a grid for better layout
        const startY = infoY + 70; // Starting position
        const lineHeight = 35; // Increased line height for better readability
        const colWidth = infoWidth / 2 - 10; // Two columns with padding
        
        // Define grid positions for main information
        const grid = [
            // Row 1
            {label: 'ناڤێ تومەتباری:', value: data.fullname, x: 50, y: startY},
            {label: 'جورێ ئاریشێ:', value: data.issueType, x: infoWidth / 2 + 10, y: startY},
            // Row 2
            {label: 'ژدایـــكبون:', value: data.birthdate, x: 50, y: startY + lineHeight},
            {label: 'بارێ خێزانی:', value: data.familyStatus, x: infoWidth / 2 + 10, y: startY + lineHeight},
            // Row 3
            {label: 'ئاكنجی بوون:', value: data.address, x: 50, y: startY + lineHeight * 2},
            {label: 'كارێ وی:', value: data.job, x: infoWidth / 2 + 10, y: startY + lineHeight * 2},
        ];
        
        // Draw main information grid
        grid.forEach(item => {
            drawInfoBox(item.label, item.value, item.y, item.x);
        });
        
        // Start position for the next section
        let nextSectionY = startY + lineHeight * 3 + 15;
        
        // Draw separator line
        ctx.fillStyle = '#3498db';
        ctx.fillRect(infoX + 20, nextSectionY - 5, infoWidth - 40, 2);
        nextSectionY += 20;
        
        // Draw additional information section title
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.textAlign = 'center';
        ctx.fillText('معلومات إضافية', infoX + infoWidth / 2, nextSectionY);
        nextSectionY += 30;
        
        // Define additional fields in a grid
        const additionalFields = [
            // Row 1
            {label: 'دەمژمێر:', value: data.time + ' - ' + data.dayNight, x: 50, y: nextSectionY, color: '#3498db'},
            {label: 'جهێ ئاریشێ:', value: data.problemLocation, x: infoWidth / 2 + 10, y: nextSectionY, color: '#3498db'},
            // Row 2
            {label: 'خالا:', value: data.point, x: 50, y: nextSectionY + lineHeight, color: '#3498db'},
            {label: 'ناڤێ شوفێری:', value: data.driverName, x: infoWidth / 2 + 10, y: nextSectionY + lineHeight, color: '#3498db'},
        ];
        
        // Draw additional fields
        additionalFields.forEach(item => {
            drawInfoBox(item.label, item.value, item.y, item.x, item.color);
        });
        
        // Start position for the next section
        nextSectionY = nextSectionY + lineHeight * 2 + 15;
        
        // Draw separator line
        ctx.fillStyle = '#3498db';
        ctx.fillRect(infoX + 20, nextSectionY - 5, infoWidth - 40, 2);
        nextSectionY += 20;
        
        // Draw conditional fields in a grid layout
        const conditionalFields = [
            // Row 1
            {label: 'زیندانكرن:', value: data.imprisonment || '-', x: 50, y: nextSectionY, color: '#e74c3c'},
            {label: 'ژمارا موبایلی:', value: data.phone || '-', x: infoWidth / 2 + 10, y: nextSectionY, color: '#e74c3c'},
            // Row 2
            {label: 'رەوانەكرن بـــو:', value: data.sentTo || '-', x: 50, y: nextSectionY + lineHeight, color: '#e74c3c'},
        ];
        
        // Draw conditional fields
        conditionalFields.forEach(item => {
            drawInfoBox(item.label, item.value, item.y, item.x, item.color);
        });
        
        // Draw footer with timestamp
        drawFooter();
    }
    
    // Function to draw footer
    function drawFooter() {
        // Add footer with timestamp - gradient background
        const footerY = canvas.height - 80;
        const footerGradient = ctx.createLinearGradient(0, footerY, canvas.width, footerY);
        footerGradient.addColorStop(0, 'rgba(52, 152, 219, 0.9)');
        footerGradient.addColorStop(1, 'rgba(41, 128, 185, 0.9)');
        ctx.fillStyle = footerGradient;
        roundRect(ctx, 20, footerY, canvas.width - 40, 60, {tl: 0, tr: 0, bl: 15, br: 15}, true, false);
        
        // Add subtle pattern to footer for more elegant look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < canvas.width - 40; i += 20) {
            ctx.fillRect(20 + i, footerY, 10, 60);
        }
        
        // Add decorative line above footer
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(50, footerY - 5, canvas.width - 100, 2);
        
        // Add timestamp with enhanced shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = 'italic bold 22px Arial'; // Bold italic for more elegant look
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('دەمێ توماركرنێ: ' + data.timestamp, canvas.width / 2, footerY + 35);
        
        // Add decorative element in footer
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, footerY + 50, 3, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    function drawInfoBox(label, value, y, boxX = 80, labelColor = '#3498db') {
        // Define info box dimensions based on the info section and color type
        const isRedInfo = labelColor === '#e74c3c';
        const isBlueInfo = labelColor === '#3498db';
        
        // Adjust dimensions based on field type
        const boxHeight = 28; // Increased height for better readability
        const boxWidth = (canvas.width / 2) - 120; // Wider boxes for more text space
        const fontSize = 14; // Larger font for better readability
        const labelWidth = 100; // Wider label for better fit
        
        // Draw label box with gradient background for more elegant look
        const labelGradient = ctx.createLinearGradient(boxX, y - boxHeight/2, boxX + labelWidth, y - boxHeight/2);
        labelGradient.addColorStop(0, labelColor);
        labelGradient.addColorStop(1, shadeColor(labelColor, -15)); // Slightly darker shade for depth
        ctx.fillStyle = labelGradient;
        roundRect(ctx, boxX, y - boxHeight/2, labelWidth, boxHeight, {tl: 5, bl: 5, tr: 0, br: 0}, true, false);
        
        // Draw value box with subtle gradient background
        const valueBgGradient = ctx.createLinearGradient(boxX + labelWidth, y - boxHeight/2, boxX + boxWidth, y - boxHeight/2);
        valueBgGradient.addColorStop(0, '#ffffff');
        valueBgGradient.addColorStop(1, '#f8f8f8'); // Subtle gradient
        ctx.fillStyle = valueBgGradient;
        roundRect(ctx, boxX + labelWidth, y - boxHeight/2, boxWidth - labelWidth, boxHeight, {tl: 0, bl: 0, tr: 5, br: 5}, true, false);
        
        // Add border around the entire box
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, boxX, y - boxHeight/2, boxWidth, boxHeight, {tl: 5, bl: 5, tr: 5, br: 5}, false, true);
        
        // Add decorative separator with glow effect
        ctx.fillStyle = '#f39c12'; // Orange separator for all types
        ctx.fillRect(boxX + labelWidth - 1, y - boxHeight/2 + 3, 2, boxHeight - 6); // Slightly thicker separator
        
        // Draw label with shadow for better readability
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(label, boxX + labelWidth/2, y + 2); // Adjusted vertical position
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw value with improved truncation
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = isRedInfo ? '#e74c3c' : (isBlueInfo ? '#2980b9' : '#34495e'); // Color based on field type
        ctx.textAlign = 'right';
        
        // Handle empty or undefined values
        const displayValue = value || '-';
        
        // Measure text width to check if it needs truncation
        const maxValueWidth = boxWidth - labelWidth - 15; // More padding for better spacing
        const valueWidth = ctx.measureText(displayValue).width;
        
        if (valueWidth > maxValueWidth) {
            // Improved truncation algorithm
            let truncatedValue = displayValue;
            while (ctx.measureText(truncatedValue + '...').width > maxValueWidth && truncatedValue.length > 0) {
                truncatedValue = truncatedValue.slice(0, -1);
            }
            ctx.fillText(truncatedValue + '...', boxX + boxWidth - 10, y + 2); // Adjusted position
        } else {
            ctx.fillText(displayValue, boxX + boxWidth - 10, y + 2); // Adjusted position
        }
        
        // Reset text alignment for other text
        ctx.textAlign = 'right';
    }
    
    // Helper function to shade a color (darken/lighten)
    function shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;  
        G = (G < 255) ? G : 255;  
        B = (B < 255) ? B : 255;  

        const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
        const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
        const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;
    }
    
    // Keep old function for compatibility
    function drawTextLine(label, value, y) {
        drawInfoBox(label, value, y);
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