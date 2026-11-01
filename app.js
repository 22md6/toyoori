let appData = JSON.parse(localStorage.getItem('toyoori_final_v3')) || {
    currentUser: null,
    usersList: [{name: "مهدي الشمري", email: "22md6", pass: "22md61997", phone: "07700000000", exp: "5", fb: "", gender: "ذكر"}],
    birds: [],
    cages: [],
    pairs: [],
    theme: 'olive',
    darkMode: false
};

let isLoginMode = true;

window.onload = function() {
    setAppTheme(appData.theme || 'olive');
    if(appData.darkMode) document.body.classList.add('dark');
    if(appData.currentUser) {
        initUserSession(appData.currentUser);
    }
    updateMutationsList();
    let hatchDateEl = document.getElementById('hatch-date');
    if(hatchDateEl) hatchDateEl.valueAsDate = new Date();
}

function setAppTheme(themeName) {
    appData.theme = themeName;
    saveToStorage();
    document.body.classList.remove('theme-olive', 'theme-burgundy', 'theme-navy', 'theme-light');
    document.body.classList.add('theme-' + themeName);
}

function toggleDarkMode(el) {
    appData.darkMode = el.checked;
    saveToStorage();
    if(el.checked) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'تسجيل الدخول لحسابك' : 'إنشاء حساب جديد';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'دخول' : 'تسجيل';
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

    document.getElementById('auth-screen').classList.add('hidden');
    
    // Check Admin 22md6 secretly
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
    listEl.innerHTML = appData.usersList.map(u => `<div class="p-2 border-b border-emerald-900/40 text-[11px]">👤 <b>${u.name}</b> (${u.email}) - خبرة: ${u.exp || 0} سنوات</div>`).join('');
    openModal('admin-modal');
}

function logout() {
    appData.currentUser = null;
    saveToStorage();
    document.getElementById('auth-screen').classList.remove('hidden');
    toggleSidebar();
}

function saveToStorage() {
    localStorage.setItem('toyoori_final_v3', JSON.stringify(appData));
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
        if(b) { b.classList.remove('text-emerald-400', 'font-bold'); b.classList.add('text-emerald-400/60'); }
    });
    let active = document.getElementById('nav-' + name);
    if(active) { active.classList.remove('text-emerald-400/60'); active.classList.add('text-emerald-400', 'font-bold'); }
    window.scrollTo(0, 0);
}

function openHealthSection(section) {
    alert('تم الانتقال الفعلي إلى قسم الصحة: ' + section);
}

function switchBirdTab(tabId) {
    ['tab-birds', 'tab-cages', 'tab-breeding'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    let targetTab = document.getElementById(tabId);
    if(targetTab) targetTab.classList.remove('hidden');

    ['btntab-birds', 'btntab-cages', 'btntab-breeding'].forEach(id => {
        let b = document.getElementById(id);
        if(b) { b.classList.remove('bg-emerald-700', 'text-white'); b.classList.add('text-emerald-400'); }
    });
    let activeB = document.getElementById('btn' + tabId);
    if(activeB) { activeB.classList.remove('text-emerald-400'); activeB.classList.add('bg-emerald-700', 'text-white'); }
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

    let bList = document.getElementById('user-birds-list');
    if(bList) {
        bList.innerHTML = appData.birds.length === 0 ? '<p class="text-xs text-emerald-400/60 text-center py-6">لا توجد طيور مضافة حالياً.</p>' :
            appData.birds.map(b => `<div class="bg-[#1a2318] p-3 rounded-2xl border border-emerald-900/40 flex justify-between items-center"><span class="text-sm font-bold text-white">${b}</span><span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">نشط</span></div>`).join('');
    }

    let cList = document.getElementById('user-cages-list');
    if(cList) {
        cList.innerHTML = appData.cages.length === 0 ? '<p class="text-xs text-emerald-400/60 text-center py-6">لا توجد أقفاص مضافة حالياً.</p>' :
            appData.cages.map(c => `<div class="bg-[#1a2318] p-3 rounded-2xl border border-emerald-900/40 flex justify-between items-center"><span class="text-sm font-bold text-white">${c}</span><span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">إنتاج</span></div>`).join('');
    }

    let pList = document.getElementById('user-breeding-list');
    if(pList) {
        pList.innerHTML = appData.pairs.length === 0 ? '<p class="text-xs text-emerald-400/60 text-center py-6">لا توجد أزواج تزاوج مضافة.</p>' :
            appData.pairs.map(p => `<div class="bg-[#1a2318] p-3 rounded-2xl border border-emerald-900/40 flex justify-between items-center"><span class="text-sm font-bold text-white">${p}</span><span class="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">زوج منتج</span></div>`).join('');
    }
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
        localStorage.removeItem('toyoori_final_v3');
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
