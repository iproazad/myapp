// Redirect script to ensure the app opens on the login page first

document.addEventListener('DOMContentLoaded', function() {
    console.log('Redirect.js: Script loaded on ' + window.location.pathname);
    
    // لا نقوم بإعادة التوجيه إلا عند فتح التطبيق لأول مرة
    // نتحقق فقط من الصفحة الجذر
    
    // التحقق من الصفحة الحالية
    const currentPath = window.location.pathname;
    
    // إذا كنا في صفحة محددة، لا نقوم بإعادة التوجيه
    if (currentPath.includes('index.html') || 
        currentPath.includes('tomary-areshe.html') || 
        currentPath.includes('login.html')) {
        console.log('Redirect.js: On specific page, no redirect needed');
        return;
    }
    
    // إذا كنا في الصفحة الجذر، نقوم بإعادة التوجيه إلى صفحة تسجيل الدخول
    console.log('Redirect.js: On root page, redirecting to login.html');
    window.location.replace('login.html');
});