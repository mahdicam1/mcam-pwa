// ===== ALGERIAN WILAYAS =====
var wilayas = [
  'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار',
  'البليدة','البويرة','تامنغست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر',
  'الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة',
  'قسنطينة','المدية','مستغانم','المسيلة','معسكر','وهران','البيض','إليزي',
  'برج بوعريريج','بومرداس','الطارف','تيندوف','تيسمسيلت','الوادي','خنشلة',
  'سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية',
  'غليزان','المغير','المنيعة','أولاد جلال','بني عباس','عمران','إن قزام',
  'تقرت','جانت','البرواقية','تميمون'
];

// ===== QUIZ STATE =====
var quizState = {
  currentStep: 0,
  typeSubStep: 0,
    totalSteps: 11,
  answers: {
    wilaya: null,
    addressText: '',
    addressLat: null,
    addressLng: null,
    type: null,
    floorCount: null,
    floorLevel: null,
    isInBuilding: null,
    cameraCount: null,
    storage: null,
    spots: [],
    power: null,
    internet: null,
    installTiming: null,
    phoneNumber: ''
  }
};

// ===== QUESTIONS CONFIG =====
var questions = [
  { id: 'wilaya', question: 'في أي ولاية أنت؟', type: 'wilaya' },
  { id: 'address', question: 'أدخل عنوانك لتحديد الموقع', type: 'address' },
  { id: 'type', question: 'ما نوع مكانك؟', type: 'type' },
  { id: 'cameraCount', question: 'كم عدد الكاميرات التي تريدها تقريباً؟', type: 'single' },
  { id: 'storage', question: 'ما نوع التخزين الذي تريده؟', type: 'single' },
  { id: 'power', question: 'ما وضع الكهرباء في مكانك؟', type: 'single' },
  { id: 'internet', question: 'هل يوجد إنترنت في المكان؟', type: 'single' },
  { id: 'installTiming', question: 'متى تريد التركيب؟', type: 'single' },
  { id: 'phoneNumber', question: 'ما رقم هاتفك للتواصل معك؟', type: 'phone' }
];

var TYPE_INDEX = 2;

// ===== RENDER =====
function renderQuiz() {
  var content = document.getElementById('quiz-content');
  var progress = document.getElementById('quiz-progress');
  var stepLabel = document.getElementById('quiz-step-label');
  if (!content) return;

  var visualStep = getVisualStep();
  var total = quizState.totalSteps;
  var pct = (visualStep / total) * 100;
  if (progress) progress.style.width = pct + '%';
  if (stepLabel) stepLabel.textContent = (visualStep + 1) + '/' + total;

  if (quizState.currentStep >= questions.length) {
    showRatingModal();
    return;
  }

  var q = questions[quizState.currentStep];

  // Handle type sub-steps
  if (q.id === 'type' && quizState.typeSubStep > 0) {
    renderTypeSubStep();
    return;
  }

  var html = '<div class="quiz-question">' + q.question + '</div>';
  html += '<div class="quiz-options" id="quiz-options">';

  if (q.id === 'wilaya') {
    html += renderWilayaOptions();
  } else if (q.id === 'address') {
    html += renderAddressOptions();
  } else if (q.id === 'type') {
    html += renderTypeOptions();
  } else if (q.id === 'cameraCount') {
    html += renderCameraCountOptions();
  } else if (q.id === 'storage') {
    html += renderStorageOptions();
  } else if (q.id === 'power') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'عادية\')">⚡ كهرباء عادية</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'شمسية\')">☀️ طاقة شمسية</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'غير متأكد\')">❓ غير متأكد</button>';
  } else if (q.id === 'internet') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'internet\',\'نعم\')">✅ نعم</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'internet\',\'لا\')">❌ لا</button>';
  } else if (q.id === 'installTiming') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'installTiming\',\'أقرب وقت\')">⚡ في أقرب وقت</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'installTiming\',\'أسبوع\')">📅 خلال أسبوع</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'installTiming\',\'شهر\')">🗓️ خلال شهر</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'installTiming\',\'استفسار\')">💬 فقط أستفسر الآن</button>';
  } else if (q.id === 'phoneNumber') {
    html += renderPhoneInput();
  }

  html += '</div>';
  content.innerHTML = html;
}

// ===== VISUAL STEP =====
function getVisualStep() {
  if (quizState.currentStep < TYPE_INDEX) return quizState.currentStep;
  if (quizState.currentStep === TYPE_INDEX) return quizState.currentStep + quizState.typeSubStep;
  return quizState.currentStep + getTypeExtraSteps();
}

function getTypeExtraSteps() {
  var t = quizState.answers.type;
  if (t === 'منزل' || t === 'شقة في عمارة') return 1;
  if (t === 'مكتب / شركة' || t === 'محل تجاري') return quizState.answers.isInBuilding ? 2 : 1;
  return 0;
}

// ===== WILAYA =====
function renderWilayaOptions() {
  var h = '';
  h += '<div class="wilaya-search-box">';
  h += '<span class="wilaya-search-icon">🔍</span>';
  h += '<input class="wilaya-input" id="wilaya-input" type="text" placeholder="ابحث عن ولايتك..." autocomplete="off" oninput="filterWilayas(this.value)">';
  h += '</div>';
  h += '<div class="wilaya-list" id="wilaya-list">';
  wilayas.forEach(function (w) {
    var sel = quizState.answers.wilaya === w ? ' style="background:var(--accent-primary);color:var(--bg-primary);"' : '';
    h += '<div class="wilaya-item"' + sel + ' onclick="selectWilaya(\'' + w + '\')">' + w + '</div>';
  });
  h += '</div>';
  return h;
}

function filterWilayas(query) {
  var list = document.getElementById('wilaya-list');
  if (!list) return;
  var items = list.querySelectorAll('.wilaya-item');
  items.forEach(function (item) {
    if (item.textContent.indexOf(query) !== -1) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function selectWilaya(name) {
  quizState.answers.wilaya = name;
  var items = document.querySelectorAll('.wilaya-item');
  items.forEach(function (i) { i.style.background = ''; i.style.color = ''; });
  var input = document.getElementById('wilaya-input');
  if (input) input.value = name;
  setTimeout(quizNext, 200);
}

// ===== ADDRESS =====
function renderAddressOptions() {
  var h = '';
  h += '<input class="address-input" id="address-input" type="text" placeholder="أدخل العنوان (مثلاً: 15 نهج العربي، المدينة)" value="' + (quizState.answers.addressText || '') + '">';
  h += '<div class="address-divider">أو</div>';
  h += '<button class="map-btn" onclick="openMapModal()">📍 حدد موقعي على الخريطة</button>';
  if (quizState.answers.addressLat) {
    h += '<div class="address-confirmed">✅ تم تحديد الموقع</div>';
  }
  h += '<button class="btn-primary quiz-next-btn" onclick="confirmAddress()">تأكيد العنوان ←</button>';
  return h;
}

function confirmAddress() {
  var addr = document.getElementById('address-input');
  if (addr && addr.value.trim()) {
    quizState.answers.addressText = addr.value.trim();
  }
  if (!quizState.answers.addressText && !quizState.answers.addressLat) {
    showToast('أدخل عنوانك أو حدد موقعك');
    return;
  }
  quizNext();
}

// ===== MAP MODAL =====
function openMapModal() {
  document.getElementById('map-modal').classList.remove('hidden');
  var iframe = document.getElementById('map-iframe');
  iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=2.0,34.0,10.0,37.0&layer=mapnik&marker=36.5,3.0';
}

function closeMapModal() {
  document.getElementById('map-modal').classList.add('hidden');
  var iframe = document.getElementById('map-iframe');
  iframe.src = '';
}

function confirmMapLocation() {
  if (!quizState.answers.addressLat || !quizState.answers.addressLng) {
    showToast('حدد موقعك أولاً بالضغط على "تحديد موقعي الحالي"');
    return;
  }
  closeMapModal();
  showToast('✅ تم تحديد الموقع');
  renderQuiz();
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('الموقع غير متاح على هذا الجهاز');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      quizState.answers.addressLat = pos.coords.latitude.toFixed(6);
      quizState.answers.addressLng = pos.coords.longitude.toFixed(6);
      document.getElementById('map-coords').textContent = '✅ تم تحديد الموقع: ' + quizState.answers.addressLat + ', ' + quizState.answers.addressLng;
      var iframe = document.getElementById('map-iframe');
      iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' + (pos.coords.longitude - 0.01) + ',' + (pos.coords.latitude - 0.01) + ',' + (pos.coords.longitude + 0.01) + ',' + (pos.coords.latitude + 0.01) + '&layer=mapnik&marker=' + pos.coords.latitude + ',' + pos.coords.longitude;
      showToast('✅ تم تحديد الموقع');
    },
    function () {
      showToast('تعذر الحصول على الموقع. أدخل العنوان يدوياً.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ===== TYPE (7 options + smart sub-questions) =====
function renderTypeOptions() {
  var types = [
    { icon: '🏠', label: 'منزل' },
    { icon: '🏢', label: 'شقة في عمارة' },
    { icon: '🏬', label: 'محل تجاري' },
    { icon: '🏢', label: 'مكتب / شركة' },
    { icon: '🏭', label: 'مستودع / مخزن' },
    { icon: '🌾', label: 'مزرعة' },
    { icon: '🏫', label: 'مؤسسة (مدرسة، مسجد، عيادة)' }
  ];
  var h = '';
  types.forEach(function (t) {
    var selected = quizState.answers.type === t.label ? ' selected' : '';
    h += '<button class="option-btn' + selected + '" onclick="selectType(\'' + t.label + '\')">';
    h += '<span class="option-btn-icon">' + t.icon + '</span>';
    h += t.label + '</button>';
  });
  return h;
}

function selectType(value) {
  quizState.answers.type = value;
  quizState.answers.floorCount = null;
  quizState.answers.floorLevel = null;
  quizState.answers.isInBuilding = null;

  // Determine if sub-questions needed
  if (value === 'منزل' || value === 'شقة في عمارة' || value === 'محل تجاري' || value === 'مكتب / شركة') {
    quizState.typeSubStep = 1;
    renderTypeSubStep();
  } else {
    advanceFromType();
  }
}

function renderTypeSubStep() {
  var type = quizState.answers.type;
  var content = document.getElementById('quiz-content');
  if (!content) return;

  var html = '';

  if (type === 'منزل') {
    html += '<div class="quiz-question">كم عدد الطوابق في المنزل؟</div>';
    html += '<div class="quiz-options">';
    html += '<button class="option-btn" onclick="selectFloorCount(\'1\')">🏠 طابق واحد</button>';
    html += '<button class="option-btn" onclick="selectFloorCount(\'2\')">🏠🏠 طابقان</button>';
    html += '<button class="option-btn" onclick="selectFloorCount(\'3\')">🏠🏠🏠 3 طوابق</button>';
    html += '<button class="option-btn" onclick="selectFloorCount(\'4+\')">🏢 4 طوابق فأكثر</button>';
    html += '</div>';
  } else if (type === 'شقة في عمارة') {
    html += '<div class="quiz-question">في أي طابق تقع الشقة؟</div>';
    html += '<div class="quiz-options">';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الأرضي\')">📍 الأرضي</button>';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الأول\')">📍 الأول</button>';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الثاني\')">📍 الثاني</button>';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الثالث\')">📍 الثالث</button>';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الرابع\')">📍 الرابع</button>';
    html += '<button class="option-btn" onclick="selectFloorLevel(\'الخامس أو أكثر\')">📍 الخامس أو أكثر</button>';
    html += '</div>';
  } else if (type === 'مكتب / شركة') {
    html += '<div class="quiz-question">هل يقع المكتب داخل عمارة؟</div>';
    html += '<div class="quiz-options">';
    html += '<button class="option-btn" onclick="selectIsInBuilding(true)">✅ نعم</button>';
    html += '<button class="option-btn" onclick="selectIsInBuilding(false)">❌ لا</button>';
    html += '</div>';
  } else if (type === 'محل تجاري') {
    html += '<div class="quiz-question">هل المحل داخل مركز تجاري أو عمارة؟</div>';
    html += '<div class="quiz-options">';
    html += '<button class="option-btn" onclick="selectIsInBuilding(true)">✅ نعم</button>';
    html += '<button class="option-btn" onclick="selectIsInBuilding(false)">❌ لا</button>';
    html += '</div>';
  }

  content.innerHTML = html;
  updateProgress();
}

function selectFloorCount(val) {
  quizState.answers.floorCount = val;
  advanceFromType();
}

function selectFloorLevel(val) {
  quizState.answers.floorLevel = val;
  if (quizState.typeSubStep === 2) {
    quizState.typeSubStep = 0;
    quizState.currentStep++;
    renderQuiz();
  } else {
    advanceFromType();
  }
}

function selectIsInBuilding(val) {
  quizState.answers.isInBuilding = val;
  if (val && (quizState.answers.type === 'مكتب / شركة' || quizState.answers.type === 'محل تجاري')) {
    quizState.typeSubStep = 2;
    renderTypeSubStep();
  } else {
    advanceFromType();
  }
}

function advanceFromType() {
  quizState.typeSubStep = 0;
  updateTotalSteps();
  quizState.currentStep++;
  saveQuizState();
  renderQuiz();
}

function updateTotalSteps() {
  var t = quizState.answers.type;
  var extra = 0;
  if (t === 'منزل' || t === 'شقة في عمارة') extra = 1;
  else if (t === 'مكتب / شركة' || t === 'محل تجاري') extra = quizState.answers.isInBuilding ? 2 : 1;
  quizState.totalSteps = questions.length + extra;
}

// ===== CAMERA COUNT =====
function renderCameraCountOptions() {
  var h = '';
  var opts = [
    { icon: '🏠', label: '2 إلى 4 كاميرات', val: '2-4' },
    { icon: '🏘️', label: '4 إلى 8 كاميرات', val: '4-8' },
    { icon: '🏢', label: '8 إلى 16 كاميرة', val: '8-16' }
  ];
  opts.forEach(function (o) {
    var selected = quizState.answers.cameraCount === o.val ? ' selected' : '';
    h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'cameraCount\',\'' + o.val + '\')">';
    h += '<span class="option-btn-icon">' + o.icon + '</span>';
    h += o.label + '</button>';
  });
  return h;
}

// ===== STORAGE =====
function renderStorageOptions() {
  var h = '';
  var opts = [
    { icon: '💾', label: 'هارد ديسك داخلي HDD 1TB — تسجيل حوالي 15 يوم', val: 'HDD 1TB' },
    { icon: '💾', label: 'هارد ديسك داخلي HDD 2TB — تسجيل حوالي 30 يوم', val: 'HDD 2TB' },
    { icon: '💾', label: 'هارد ديسك داخلي HDD 4TB — تسجيل حوالي 60 يوم', val: 'HDD 4TB' }
  ];
  opts.forEach(function (o) {
    var selected = quizState.answers.storage === o.val ? ' selected' : '';
    h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'storage\',\'' + o.val + '\')">';
    h += '<span class="option-btn-icon">' + o.icon + '</span>';
    h += o.label + '</button>';
  });
  return h;
}

// ===== PHONE NUMBER =====
function renderPhoneInput() {
  var h = '';
  h += '<input class="address-input" id="phone-input" type="tel" dir="ltr" inputmode="numeric" placeholder="مثال: 0770123456" value="' + (quizState.answers.phoneNumber || '') + '" style="text-align:left;direction:ltr;font-size:1.2rem;">';
  h += '<button class="btn-primary quiz-next-btn" onclick="confirmPhoneNumber()">تأكيد الرقم ←</button>';
  return h;
}

function confirmPhoneNumber() {
  var el = document.getElementById('phone-input');
  var val = el ? el.value.replace(/\s/g, '') : '';
  if (!val || val.length < 8) {
    showToast('أدخل رقم هاتف صحيح');
    return;
  }
  quizState.answers.phoneNumber = val;
  quizNext();
}

// ===== QUIZ ACTIONS =====
function selectQuizOption(key, value) {
  quizState.answers[key] = value;
  var opts = document.getElementById('quiz-options');
  if (opts) {
    var btns = opts.querySelectorAll('.option-btn');
    btns.forEach(function (b) { b.classList.remove('selected'); });
  }
  setTimeout(function () {
    var q = questions[quizState.currentStep];
    if (q && q.type !== 'multi') {
      quizNext();
    }
  }, 250);
}

function quizNext() {
  var q = questions[quizState.currentStep];
  if (!q) { showResult(); return; }

  var val = quizState.answers[q.id];
  if (q.id === 'wilaya' && !val) {
    showToast('اختر ولايتك للمتابعة');
    return;
  }
  if (q.id === 'address' && !quizState.answers.addressText && !quizState.answers.addressLat) {
    showToast('أدخل عنوانك أو حدد موقعك');
    return;
  }
  if (q.type === 'single' && !val && q.id !== 'phoneNumber') {
    showToast('اختر إجابة للمتابعة');
    return;
  }
  quizState.currentStep++;
  saveQuizState();

  if (quizState.currentStep >= questions.length) {
    saveQuizState();
    showRatingModal();
  } else {
    renderQuiz();
  }
}

function updateProgress() {
  var progress = document.getElementById('quiz-progress');
  var stepLabel = document.getElementById('quiz-step-label');
  var visualStep = getVisualStep();
  var total = quizState.totalSteps;
  if (progress) progress.style.width = ((visualStep) / total * 100) + '%';
  if (stepLabel) stepLabel.textContent = (visualStep + 1) + '/' + total;
}

function quizGoBack() {
  if (quizState.currentStep === TYPE_INDEX && quizState.typeSubStep > 0) {
    quizState.typeSubStep = 0;
    quizState.answers.type = null;
    quizState.answers.floorCount = null;
    quizState.answers.floorLevel = null;
    quizState.answers.isInBuilding = null;
    renderQuiz();
    return;
  }
  if (quizState.currentStep <= 0) {
    navigateTo('home');
    return;
  }
  quizState.currentStep--;
  saveQuizState();
  renderQuiz();
}

function saveQuizState() {
  try { localStorage.setItem('mcam_quiz', JSON.stringify(quizState)); } catch (e) {}
}

function resetQuiz() {
  quizState = {
    currentStep: 0,
    typeSubStep: 0,
  totalSteps: 11,
    answers: {
      wilaya: null,
      addressText: '',
      addressLat: null,
      addressLng: null,
      type: null,
      floorCount: null,
      floorLevel: null,
      isInBuilding: null,
      cameraCount: null,
      storage: null,
      spots: [],
      power: null,
      internet: null,
      installTiming: null,
      phoneNumber: ''
    }
  };
  try { localStorage.removeItem('mcam_quiz'); } catch (e) {}
}

// ===== STAR RATING =====
var selectedRating = 0;

function showRatingModal() {
  selectedRating = 0;
  var modal = document.getElementById('rating-modal');
  modal.classList.remove('hidden');
  document.querySelectorAll('.star').forEach(function (s) {
    s.classList.remove('active');
    s.textContent = '☆';
  });
}

function submitRating() {
  if (selectedRating === 0) {
    showToast('اختر تقييماً');
    return;
  }
  try {
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[],"imageOrders":[],"works":[]}');
    data.ratings.push(selectedRating);
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
  } catch (e) {}
  document.getElementById('rating-modal').classList.add('hidden');
  showResult();
}

function skipRating() {
  document.getElementById('rating-modal').classList.add('hidden');
  showResult();
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('star')) {
    var val = parseInt(e.target.getAttribute('data-value'));
    selectedRating = val;
    document.querySelectorAll('.star').forEach(function (s) {
      var sv = parseInt(s.getAttribute('data-value'));
      if (sv <= val) {
        s.classList.add('active');
        s.textContent = '★';
      } else {
        s.classList.remove('active');
        s.textContent = '☆';
      }
    });
  }
});

// ===== SHOW RESULT =====
function showResult() {
  var summary = document.getElementById('result-summary');
  var a = quizState.answers;

  var locParts = [];
  if (a.wilaya) locParts.push(a.wilaya);
  if (a.addressText) locParts.push(a.addressText);

  var typeLine = a.type || '';
  if (a.floorCount) typeLine += ' — ' + a.floorCount + ' طوابق';
  else if (a.floorLevel) typeLine += ' — الطابق ' + a.floorLevel;

  summary.innerHTML =
    '<h3>📍 ' + typeLine + '</h3>' +
    (locParts.length ? '<p><strong>🏠 الموقع:</strong> ' + locParts.join(' — ') + '</p>' : '') +
    '<p><strong>📷 الكاميرات:</strong> ' + formatCameraCount(a.cameraCount) + '</p>' +
    '<p><strong>💾 التخزين:</strong> ' + formatStorage(a.storage) + '</p>' +
    (a.phoneNumber ? '<p><strong>📞 رقم الهاتف:</strong> ' + a.phoneNumber + '</p>' : '');

  var details = document.getElementById('result-details');
  details.innerHTML =
    '<div class="result-detail-item"><span class="result-detail-label">الكهرباء</span><span class="result-detail-value">' + (a.power || '—') + '</span></div>' +
    '<div class="result-detail-item"><span class="result-detail-label">الإنترنت</span><span class="result-detail-value">' + (a.internet || '—') + '</span></div>' +
    '<div class="result-detail-item"><span class="result-detail-label">موعد التركيب</span><span class="result-detail-value">' + formatInstallTiming(a.installTiming) + '</span></div>';

  clearQuizAfterResult();
  navigateTo('result');
  setTimeout(showInstallPrompt, 1000);
}

function formatCameraCount(val) {
  var map = { '2-4': '2 إلى 4 كاميرات', '4-8': '4 إلى 8 كاميرات', '8-16': '8 إلى 16 كاميرة' };
  return map[val] || val || '—';
}

function formatStorage(val) {
  var map = { 'HDD 1TB': 'هارد 1 تيرا', 'HDD 2TB': 'هارد 2 تيرا', 'HDD 4TB': 'هارد 4 تيرا' };
  return map[val] || val || '—';
}

function formatInstallTiming(val) {
  var map = { 'أقرب وقت': '⚡ في أقرب وقت', 'أسبوع': '📅 خلال أسبوع', 'شهر': '🗓️ خلال شهر', 'استفسار': '💬 مجرد استفسار' };
  return map[val] || val || '—';
}

// ===== INIT QUIZ =====
document.addEventListener('DOMContentLoaded', function () {
  var origNav = window.navigateTo;
  window.navigateTo = function (page) {
    if (page === 'quiz') {
      try {
        var saved = localStorage.getItem('mcam_quiz');
        if (saved) {
          var parsed = JSON.parse(saved);
          if (parsed.answers && parsed.answers.type && parsed.currentStep < questions.length) {
            quizState = parsed;
          } else {
            resetQuiz();
          }
        } else {
          resetQuiz();
        }
      } catch (e) { resetQuiz(); }
      renderQuiz();
    }
    origNav(page);
  };
});

function clearQuizAfterResult() {
  try { localStorage.removeItem('mcam_quiz'); } catch (e) {}
}
