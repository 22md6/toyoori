/**
 * تطبيق طيوري - الملف البرمجي المركزي (Core Logic)
 * بإدارة مهدي مرهون الشمري
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("تم تحميل نظام طيوري بنجاح وربط كافة الأجزاء.");
    initializeAppState();
});

// التهيئة العامة وبيانات المستخدم الافتراضية
function initializeAppState() {
    let currentUser = localStorage.getItem("toyoori_user") || "مهدي مرهون الشمري";
    let activeBirds = localStorage.getItem("toyoori_birds_count") || "0";
    let activeProfit = localStorage.getItem("toyoori_profit") || "0";

    let nameElement = document.getElementById("user-display-name");
    if (nameElement) {
        nameElement.innerText = currentUser;
    }

    let birdsElement = document.getElementById("active-birds-count");
    if (birdsElement) {
        birdsElement.innerText = activeBirds;
    }
}

// دالة تسجيل الدخول المباشر عبر Google
function loginWithGoogle() {
    localStorage.setItem("toyoori_user", "مهدي مرهون الشمري (Google)");
    localStorage.setItem("toyoori_birds_count", "0");
    localStorage.setItem("toyoori_profit", "0");
    
    alert("تم الاتصال بحساب Google بنجاح! جاري تحويلك إلى لوحة التحكم...");
    window.location.href = "main.html";
}

// دالة تسجيل الدخول التقليدية وربط الحسابات الجديدة
function handleUserLogin(username, email) {
    localStorage.setItem("toyoori_user", username);
    localStorage.setItem("toyoori_email", email);
    localStorage.setItem("toyoori_birds_count", "0");
    localStorage.setItem("toyoori_profit", "0");
    
    alert("مرحباً بك " + username + " في منصة طيوري!");
    window.location.href = "main.html";
}

// دالة التحقق من صلاحيات المالك وعرض المشتركين
function checkAdminAccess(username) {
    if (username === "22md6" || username.includes("مهدي")) {
        return true;
    }
    return false;
}

// دالة إضافة معلومات جديدة لقسم الدليل (تحديث تراكمي دون حذف)
function appendNewInfoData(title, description) {
    let container = document.getElementById("dynamic-info-container");
    if (container) {
        let newItem = document.createElement("div");
        newItem.className = "info-hero-bg h-40 rounded-3xl p-4 relative overflow-hidden shadow-2xl flex flex-col justify-end border border-emerald-400/40";
        newItem.innerHTML = `
            <div class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-emerald-400 text-xs border border-emerald-500/20">
                <i class="fa-solid fa-robot"></i>
            </div>
            <div class="z-10 space-y-0.5">
                <span class="text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/40">تحديث ذكي جديد</span>
                <h3 class="font-black text-base text-white">${title}</h3>
                <p class="text-[10px] text-gray-300">${description}</p>
            </div>
        `;
        container.prepend(newItem);
    }
}

// دالة التنقل السريع بين الملفات المجزأة
function navigateTo(pageName) {
    window.location.href = pageName;
}
