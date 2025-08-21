// Redirect script to ensure the app opens on the login page first

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're not already on the login page
    if (!window.location.href.includes('login.html')) {
        // Check if this is the root page (not index.html or tomary-areshe.html)
        if (window.location.href.endsWith('/') && 
            !window.location.href.includes('index.html') && 
            !window.location.href.includes('tomary-areshe.html')) {
            // Redirect to login page only if we're at the root URL
            window.location.href = 'login.html';
        }
    }
});