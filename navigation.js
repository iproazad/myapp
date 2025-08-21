// ملف للتعامل مع التنقل بين الصفحات

document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation.js: Script loaded on ' + window.location.pathname);
    
    // التحقق من وجود أزرار التنقل
    const navButtons = document.querySelectorAll('.nav-button');
    
    // إضافة مستمع حدث لكل زر تنقل
    navButtons.forEach(button => {
        // إزالة أي مستمعات أحداث سابقة
        const clonedButton = button.cloneNode(true);
        button.parentNode.replaceChild(clonedButton, button);
        
        // إضافة مستمع حدث جديد
        clonedButton.addEventListener('click', function(event) {
            // منع السلوك الافتراضي للرابط
            event.preventDefault();
            
            // الحصول على الرابط المستهدف
            const targetPage = this.getAttribute('href');
            console.log('Navigation.js: Nav button clicked - Target: ' + targetPage);
            
            // الانتقال إلى الصفحة المستهدفة
            window.location.href = targetPage;
        });
    });
    
    // التحقق من وجود أزرار في صفحة تسجيل الدخول
    const loginButtons = document.querySelectorAll('.login-button');
    
    // إضافة مستمع حدث لكل زر في صفحة تسجيل الدخول
    loginButtons.forEach(button => {
        // إزالة أي مستمعات أحداث سابقة
        const clonedButton = button.cloneNode(true);
        button.parentNode.replaceChild(clonedButton, button);
        
        // إضافة مستمع حدث جديد
        clonedButton.addEventListener('click', function(event) {
            // منع السلوك الافتراضي للرابط
            event.preventDefault();
            
            // الحصول على الرابط المستهدف
            const targetPage = this.getAttribute('href');
            console.log('Navigation.js: Login button clicked - Target: ' + targetPage);
            
            // الانتقال إلى الصفحة المستهدفة
            window.location.href = targetPage;
        });
    });
});