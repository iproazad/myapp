// ملف للمساعدة في تشخيص مشكلة التنقل بين الصفحات

document.addEventListener('DOMContentLoaded', function() {
    // طباعة معلومات التصحيح في وحدة التحكم
    console.log('Debug: Page loaded - ' + window.location.pathname);
    console.log('Debug: localStorage disableRedirect - ' + localStorage.getItem('disableRedirect'));
    console.log('Debug: localStorage lastVisitedPage - ' + localStorage.getItem('lastVisitedPage'));
    
    // إضافة مستمعات أحداث لأزرار التنقل للتصحيح
    const navButtons = document.querySelectorAll('.nav-button, .login-button');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            // الحصول على الرابط المستهدف
            const targetPage = this.getAttribute('href');
            console.log('Debug: Button clicked - Target: ' + targetPage);
            
            // تعيين علامات التخزين المحلي
            localStorage.setItem('lastVisitedPage', targetPage);
            localStorage.setItem('disableRedirect', 'true');
            console.log('Debug: Set disableRedirect to true');
            
            // إضافة معلمة التصحيح للرابط
            this.href = targetPage + '?debug=true&t=' + new Date().getTime();
        });
    });
    
    // التحقق من وجود معلمة التصحيح في عنوان URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
        console.log('Debug: Page loaded with debug parameter');
        // تأكد من تعطيل إعادة التوجيه
        localStorage.setItem('disableRedirect', 'true');
    }
});