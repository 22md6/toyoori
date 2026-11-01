let appData = JSON.parse(localStorage.getItem('toyoori_final_v4')) || {
    currentUser: null,
    usersList: [{name: "مهدي الشمري", email: "22md6", pass: "22md61997", phone: "07700000000", exp: "5", fb: "", gender: "ذكر"}],
    birds: [],
    cages: [],
    pairs: [],
    theme: 'burgundy',
    lightMode: false,
    setupCompleted: false,
    onboardingDone: false
};

let currentSlide = 0;
const totalSlides = 4;
let isLoginMode = true;

window.onload = function() {
    setAppTheme(appData.theme || 'burgundy');
    let darkModeToggle = document.getElementById('dark-mode-toggle');
    if(darkModeToggle) darkModeToggle.checked = !appData.lightMode;
    if(appData.lightMode) document.body.classList.add('light-mode');

    if(appData.currentUser) {
        hideAllIntroScreens();
        initUserSession(appData.currentUser);
    } else if(appData.onboardingDone) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('onboarding-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
    } else if(appData.setupCompleted) {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('onboarding-screen').classList.remove('hidden');
        showSlide(0);
    } else {
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('onboarding-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.add('hidden');
    }
    updateMutationsList();
}

function completeSetup() {
    appData.setupCompleted = true;
    saveToStorage();
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('onboarding-screen').classList.remove('hidden');
    showSlide(0);
}

function showSlide(index) {
    currentSlide = index;
    for(let i = 0; i < totalSlides; i++) {
        let slide = document.getElementById('slide-' + i);
        if(slide) slide.classList.toggle('hidden', i !== index);
    }
}

function nextSlide() {
    if(currentSlide < totalSlides - 1) { showSlide(currentSlide + 1); }
    else { finishOnboarding(); }
}

function skipOnboarding() { finishOnboarding(); }

function finishOnboarding() {
    appData.onboardingDone = true;
    saveToStorage();
    document.getElementById('onboarding-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
}

function hideAllIntroScreens() {
    ['setup-screen', 'onboarding-screen', 'auth-screen'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
}

function setAppTheme(themeName) {
    appData.theme = themeName;
    saveToStorage();
    document.body.className = document.body.className.replace(/theme-\S+/g, '');
    document.body.classList.add('theme-' + themeName);
    if(appData.lightMode) document.body.classList.add('light-mode');
}

function toggleDarkMode(el) {
    // If checked -> Dark Mode, If unchecked -> Light Mode (White background)
    appData.lightMode = !el.checked;
    saveToStorage();
    if(appData.lightMode) {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب جديد';
    document.getElementById('auth-subtitle').innerText = isLoginMode ? 'سجل دخولك لمتابعة طيورك' : 'أدخل بياناتك لتسجيل حساب جديد';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'تسجيل الدخول' : 'تسجيل';
    document.getElementById('auth-switch').innerText = isLoginMode ? 'ليس لديك حساب؟ سجل حساب جديد' : 'لديك حساب بالفعل؟ سجل دخولك';
    document.getElementById('register-fields').classList.toggle('hidden', isLoginMode);
}

function handleAuthSubmit() {
    let email = document.getElementById('auth-email').value.trim();
    let pass = document.getElementById('auth-pass').value.trim();
    if(!email || !pass) { alert('يرجى ملء الحقول المطلوبة بدقة'); return; }

    if(!isLoginMode) {
        let name = document.getElementById('reg-name').value.trim() || 'مربي طيور';
        let exists = appData.usersList.find(u => u.email === email);
        if(exists) { alert('البريد مسجل مسبقاً!'); return; }
        let newUser = { name, email, pass, phone: "", exp: "0", fb: "", gender: "ذكر" };
        appData.usersList.push(newUser);
        appData.currentUser = newUser;
        saveToStorage();
        initUserSession(newUser);
    } else {
        let found = appData.usersList.find(u => u.email === email || u.name === email);
        if(!found || found.pass !== pass) {
            alert('بيانات الدخول غير صحيحة! يرجى التحقق من البريد وكلمة المرور.');
            return;
        }
        appData.currentUser = found;
        saveToStorage();
        initUserSession(found);
    }
}

function initUserSession(user) {
    hideAllIntroScreens();
    document.getElementById('sidebar-username').innerText = user.name;
    document.getElementById('sidebar-initial').innerText = user.name.charAt(0);
    document.getElementById('settings-profile-name').innerText = user.name;
    document.getElementById('settings-profile-email').innerText = user.email;
    document.getElementById('settings-avatar').innerText = user.name.charAt(0);

    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email;
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-exp').value = user.exp || 0;
    document.getElementById('edit-fb').value = user.fb || '';
    document.getElementById('edit-gender').value = user.gender || 'ذكر';
    
    if(user.email === '22md6' || user.pass === '22md61997') {
        document.getElementById('admin-menu-item').classList.remove('hidden');
    } else {
        document.getElementById('admin-menu-item').classList.add('hidden');
    }
    updateUI();
}

function saveProfileChanges() {
    if(!appData.currentUser) return;
    appData.currentUser.name = document.getElementById('edit-name').value;
    appData.currentUser.email = document.getElementById('edit-email').value;
    appData.currentUser.phone = document.getElementById('edit-phone').value;
    appData.currentUser.exp = document.getElementById('edit-exp').value;
    appData.currentUser.fb = document.getElementById('edit-fb').value;
    appData.currentUser.gender = document.getElementById('edit-gender').value;

    let idx = appData.usersList.findIndex(u => u.email === appData.currentUser.email);
    if(idx !== -1) appData.usersList[idx] = appData.currentUser;

    saveToStorage();
    initUserSession(appData.currentUser);
    closeModal('profile-edit-modal');
    alert('تم حفظ التعديلات الشخصية بنجاح!');
}

function openAdminPanel() {
    let listEl = document.getElementById('admin-users-list');
    listEl.innerHTML = appData.usersList.map(u => `<div class="p-2 border-b border-rose-900/40 text-[11px]">👤 <b>${u.name}</b> (${u.email}) - خبرة: ${u.exp || 0} سنوات</div>`).join('');
    openModal('admin-modal');
}

function logout() {
    appData.currentUser = null;
    appData.setupCompleted = false;
    appData.onboardingDone = false;
    saveToStorage();
    location.reload();
}

function saveToStorage() {
    localStorage.setItem('toyoori_final_v4', JSON.stringify(appData));
}

function toggleSidebar() { document.getElementById('sidebar-menu').classList.toggle('hidden'); }
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openAddModalSelection() {
    let choice = prompt("ماذا تريد أن تضيف؟\n1. طائر\n2. قفص\n3. زوج تزاوج", "1");
    if(choice === "1") { updateCageDropdowns(); openModal('modal-add-bird'); }
    else if(choice === "2") { openModal('modal-add-cage'); }
    else if(choice === "3") { updatePairDropdowns(); openModal('modal-add-pair'); }
}

function updateCageDropdowns() {
    let sel = document.getElementById('bird-cage-select');
    sel.innerHTML = `<option value="بدون قفص">بدون قفص</option>` + appData.cages.map(c => `<option value="${c}">${c}</option>`).join('');
}

function updatePairDropdowns() {
    let maleSel = document.getElementById('pair-male');
    let femaleSel = document.getElementById('pair-female');
    let cageSel = document.getElementById('pair-cage');
    let birdOptions = appData.birds.length === 0 ? `<option value="لا توجد طيور">لا توجد طيور مضافة</option>` : appData.birds.map(b => `<option value="${b}">${b}</option>`).join('');
    maleSel.innerHTML = birdOptions;
    femaleSel.innerHTML = birdOptions;
    cageSel.innerHTML = `<option value="بدون قفص">بدون قفص</option>` + appData.cages.map(c => `<option value="${c}">${c}</option>`).join('');
}

function submitNewBird() {
    let ring = document.getElementById('bird-ring').value.trim() || 'طائر جديد';
    appData.birds.push(ring);
    saveToStorage();
    updateUI();
    closeModal('modal-add-bird');
    alert('تم إضافة الطائر بنجاح!');
}

function submitNewCage() {
    let desc = document.getElementById('cage-desc').value.trim() || 'قفص جديد';
    appData.cages.push(desc);
    saveToStorage();
    updateUI();
    closeModal('modal-add-cage');
    alert('تم إضافة القفص بنجاح!');
}

function submitNewPair() {
    let m = document.getElementById('pair-male').value;
    let f = document.getElementById('pair-female').value;
    appData.pairs.push(`ذكر (${m}) 🕊️ أنثى (${f})`);
    saveToStorage();
    updateUI();
    closeModal('modal-add-pair');
    alert('تم إضافة زوج التزاوج بنجاح!');
}

function switchScreen(name) {
    ['home', 'health', 'birds', 'community', 'market', 'settings'].forEach(s => {
        let el = document.getElementById('screen-' + s);
        if(el) el.classList.add('hidden');
    });
    let target = document.getElementById('screen-' + name);
    if(target) target.classList.remove('hidden');

    ['home', 'birds', 'community', 'market'].forEach(n => {
        let b = document.getElementById('nav-' + n);
        if(b) { b.classList.remove('text-rose-500', 'font-bold'); b.classList.add('text-rose-400/60'); }
    });
    let active = document.getElementById('nav-' + name);
    if(active) { active.classList.remove('text-rose-400/60'); active.classList.add('text-rose-500', 'font-bold'); }
    window.scrollTo(0, 0);
}

function openHealthSection(section) { alert('تم الانتقال الفعلي إلى قسم الصحة: ' + section); }

function switchBirdTab(tabId) {
    ['tab-birds', 'tab-cages', 'tab-breeding'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    let targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.remove('hidden');

    ['btntab-birds', 'btntab-cages', 'btntab-breeding'].forEach(id => {
        let b = document.getElementById(id);
        if(b) { b.classList.remove('bg-rose-700', 'text-white'); b.classList.add('text-rose-300'); }
    });
    let activeB = document.getElementById('btn' + tabId);
    if(activeB) { activeB.classList.remove('text-rose-300'); activeB.classList.add('bg-rose-700', 'text-white'); }
}

function updateUI() {
    let statBirds = document.getElementById('stat-birds');
    if(statBirds) statBirds.innerText = appData.birds.length;
    let countBirds = document.getElementById('count-birds');
    if(countBirds) countBirds.innerText = appData.birds.length;
    let countCages = document.getElementById('count-cages');
    if(countCages) countCages.innerText = appData.cages.length;
    let countPairs = document.getElementById('count-pairs');
    if(countPairs) countPairs.innerText = appData.pairs.length;

    let birdsCountText = document.getElementById('birds-count-text');
    if(birdsCountText) birdsCountText.innerText = appData.birds.length + ' الطيور';
    let cagesCountText = document.getElementById('cages-count-text');
    if(cagesCountText) cagesCountText.innerText = appData.cages.length + ' الأقفاص';
    let pairsCountText = document.getElementById('pairs-count-text');
    if(pairsCountText) pairsCountText.innerText = 'الأزواج النشطة: ' + appData.pairs.length;
}

function calculateHatching() {
    let days = parseInt(document.getElementById('hatch-species').value);
    let dateVal = document.getElementById('hatch-date').value;
    if(!dateVal) { alert('يرجى اختيار تاريخ وضع البيضة'); return; }

    let layDate = new Date(dateVal);
    let hatchDate = new Date(layDate);
    hatchDate.setDate(layDate.getDate() + days);

    let ringDate = new Date(hatchDate);
    ringDate.setDate(hatchDate.getDate() + 7);

    let weanDate = new Date(hatchDate);
    weanDate.setDate(hatchDate.getDate() + 30);

    document.getElementById('res-hatch').innerText = hatchDate.toISOString().split('T')[0];
    document.getElementById('res-ring').innerText = ringDate.toISOString().split('T')[0];
    document.getElementById('res-wean').innerText = weanDate.toISOString().split('T')[0];
    document.getElementById('hatch-results').classList.remove('hidden');
}

const mutationsDB = {
    budgie: ["عادي (Normal)", "لوتينو (Lutino)", "ألبينو (Albino)", "سندويش / بايد (Pied)"],
    canary: ["أصفر فاهل (Yellow Fahl)", "أحمر موزايك (Red Mosaic)", "أبيض سادة (White)"],
    cockatiel: ["رمادي عادي (Normal Grey)", "لوتينو (Lutino)", "بيرل (Pearl)"]
};

function updateMutationsList() {
    let typeEl = document.getElementById('gen-bird-type');
    if(!typeEl) return;
    let type = typeEl.value;
    let muts = mutationsDB[type] || [];
    document.getElementById('father-mutation').innerHTML = muts.map(m => `<option value="${m}">${m}</option>`).join('');
    document.getElementById('mother-mutation').innerHTML = muts.map(m => `<option value="${m}">${m}</option>`).join('');
}

function calculateGenetics() {
    let f = document.getElementById('father-mutation').value;
    let m = document.getElementById('mother-mutation').value;
    document.getElementById('gen-output-text').innerText = `نتيجة التزاوج بين الأب (${f}) والأم (${m}): فروخ حاملة للصفات المشتركة والطفرات الوراثية حسب قوانين مندل.`;
    document.getElementById('genetics-result').classList.remove('hidden');
}

function clearAllData() {
    if(confirm('هل أنت متأكد من مسح كافة البيانات؟')) {
        localStorage.removeItem('toyoori_final_v4');
        location.reload();
    }
}

function exportData() {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    let dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "toyoori_backup.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}
