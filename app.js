let appData = JSON.parse(localStorage.getItem('toyoori_dynamic_app')) || {
    currentUser: null,
    usersList: [
        { name: "مهدي الشمري", email: "mahdialshmary7@gmail.com", pass: "22md61997" }
    ],
    birds: [],
    cages: [],
    pairs: [],
    lightMode: false
};

window.onload = function() {
    // إذا لم يكن هناك مستخدم مسجل الدخول، يتم إنشاء حساب زائر افتراضي
    if (!appData.currentUser) {
        appData.currentUser = { name: "مربي جديد", email: "user@toyoori.com" };
    }
    applyTheme();
    updateUserSession();
};

function updateUserSession() {
    let user = appData.currentUser;
    document.getElementById('header-name').innerText = user.name;
    document.getElementById('sidebar-username').innerText = user.name;
    document.getElementById('settings-name').innerText = user.name;
    document.getElementById('settings-email').innerText = user.email;
    
    let initial = user.name ? user.name.charAt(0) : 'م';
    document.getElementById('header-initial').innerText = initial;
    document.getElementById('settings-avatar').innerText = initial;

    // إظهار لوحة تحكم المالك فقط إذا كان المستخدم هو مهدي الشمري / 22md6
    let adminBtn = document.getElementById('admin-panel-option');
    if (user.email === 'mahdialshmary7@gmail.com' || user.email === '22md6' || user.name.includes('مهدي')) {
        if (adminBtn) adminBtn.classList.remove('hidden');
    } else {
        if (adminBtn) adminBtn.classList.add('hidden');
    }

    updateCounts();
}

function updateCounts() {
    document.getElementById('count-birds').innerText = appData.birds.length;
    document.getElementById('count-cages').innerText = appData.cages.length;
    document.getElementById('count-pairs').innerText = appData.pairs.length;
}

function toggleDarkMode(el) {
    appData.lightMode = !el.checked;
    saveToStorage();
    applyTheme();
}

function applyTheme() {
    if (appData.lightMode) {
        document.body.classList.add('light-mode');
        let t = document.getElementById('dark-mode-toggle');
        if (t) t.checked = false;
    } else {
        document.body.classList.remove('light-mode');
        let t = document.getElementById('dark-mode-toggle');
        if (t) t.checked = true;
    }
}

function saveToStorage() {
    localStorage.setItem('toyoori_dynamic_app', JSON.stringify(appData));
}

function switchScreen(name) {
    ['home', 'settings', 'birds', 'community', 'market'].forEach(s => {
        let el = document.getElementById('screen-' + s);
        if (el) el.classList.add('hidden');
    });
    let target = document.getElementById('screen-' + name);
    if (target) target.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function openAdminPanel() {
    let listEl = document.getElementById('admin-users-list');
    listEl.innerHTML = appData.usersList.map(u => `
        <div class="p-2 border-b border-gray-700 flex justify-between items-center text-xs">
            <span>👤 <b>${u.name}</b></span>
            <span class="text-[10px] text-gray-400">${u.email}</span>
        </div>
    `).join('');
    document.getElementById('admin-modal').classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        let newName = prompt("أدخل اسم المستخدم الجديد لتسجيل الدخول:", "مربي طيور");
        if (newName) {
            let newEmail = prompt("أدخل البريد الإلكتروني:", "user@example.com");
            let newUser = { name: newName, email: newEmail || "user@example.com" };
            appData.usersList.push(newUser);
            appData.currentUser = newUser;
            appData.birds = [];
            appData.cages = [];
            appData.pairs = [];
            saveToStorage();
            updateUserSession();
            alert("تم تسجيل الدخول بحساب جديد وتصفير الطيور بنجاح!");
        }
    }
}
