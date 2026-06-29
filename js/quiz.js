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
  answers: {
    wilaya: null,
    addressText: '',
    addressLat: null,
    addressLng: null,
    type: null,
    size: null,
    spots: [],
    recording: null,
    power: null,
    internet: null
  }
};

// ===== QUIZ QUESTIONS =====
var questions = [
  { id: 'wilaya', question: 'في أي ولاية أنت؟', type: 'wilaya' },
  { id: 'address', question: 'أدخل عنوانك لتحديد الموقع', type: 'address' },
  { id: 'type', question: 'ما نوع مكانك؟', type: 'single' },
  { id: 'size', question: '', type: 'dynamic' },
  { id: 'spots', question: 'أين تريد الكاميرات؟ (اختر كل ما ينطبق)', type: 'multi' },
  { id: 'recording', question: 'نوع التسجيل المطلوب؟', type: 'single' },
  { id: 'power', question: 'ما وضع الكهرباء في مكانك؟', type: 'single' },
  { id: 'internet', question: 'هل يوجد إنترنت في المكان؟', type: 'single' }
];

// ===== RENDER CURRENT QUESTION =====
function renderQuiz() {
  var content = document.getElementById('quiz-content');
  var progress = document.getElementById('quiz-progress');
  var stepLabel = document.getElementById('quiz-step-label');
  if (!content) return;

  var total = questions.length;
  var step = quizState.currentStep;
  var pct = (step / total) * 100;
  if (progress) progress.style.width = pct + '%';
  if (stepLabel) stepLabel.textContent = (step + 1) + '/' + total;

  if (step >= total) {
    showRatingModal();
    return;
  }

  var q = questions[step];
  var html = '<div class="quiz-question">' + q.question + '</div>';
  html += '<div class="quiz-options" id="quiz-options">';

  if (q.id === 'wilaya') {
    html += renderWilayaOptions();
  } else if (q.id === 'address') {
    html += renderAddressOptions();
  } else if (q.id === 'type') {
    html += renderTypeOptions();
  } else if (q.id === 'size') {
    html += renderSizeOptions();
  } else if (q.id === 'spots') {
    html += renderSpotsOptions();
  } else if (q.id === 'recording') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'recording\',\'24/7\')">🔄 24/7 — تسجيل مستمر</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'recording\',\'حركة\')">📹 عند الحركة فقط</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'recording\',\'مشاهدة\')">👁️ مشاهدة مباشرة فقط</button>';
  } else if (q.id === 'power') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'عادية\')">⚡ كهرباء عادية</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'شمسية\')">☀️ طاقة شمسية</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'power\',\'غير متأكد\')">❓ غير متأكد</button>';
  } else if (q.id === 'internet') {
    html += '<button class="option-btn" onclick="selectQuizOption(\'internet\',\'نعم\')">✅ نعم</button>';
    html += '<button class="option-btn" onclick="selectQuizOption(\'internet\',\'لا\')">❌ لا</button>';
  }

  html += '</div>';
  content.innerHTML = html;
}

function renderWilayaOptions() {
  var h = '';
  h += '<div class="wilaya-search-box">';
  h += '<span class="wilaya-search-icon">🔍</span>';
  h += '<input class="wilaya-input" id="wilaya-input" type="text" placeholder="ابحث عن ولايتك..." autocomplete="off" oninput="filterWilayas(this.value)">';
  h += '</div>';
  h += '<div class="wilaya-list" id="wilaya-list">';
  wilayas.forEach(function (w) {
    h += '<div class="wilaya-item" onclick="selectWilaya(\'' + w + '\')">' + w + '</div>';
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
  var input = document.getElementById('wilaya-input');
  if (input) input.value = name;
  setTimeout(quizNext, 200);
}

function renderAddressOptions() {
  var h = '';
  h += '<input class="address-input" id="address-input" type="text" placeholder="أدخل العنوان (مثلاً: 15 نهج العربي، المدينة)" value="' + (quizState.answers.addressText || '') + '">';
  h += '<div class="address-divider">أو</div>';
  h += '<button class="map-btn" onclick="openMapModal()">📍 حدد موقعي على الخريطة</button>';
  var lat = quizState.answers.addressLat;
  if (lat) {
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
      showToast('تم تحديد الموقع');
    },
    function () {
      showToast('تعذر الحصول على الموقع. أدخل العنوان يدوياً.');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function renderTypeOptions() {
  var types = [
    { icon: '🏠', label: 'منزل' },
    { icon: '🏪', label: 'محل تجاري' },
    { icon: '🏢', label: 'مكتب / شركة' },
    { icon: '🌿', label: 'مزرعة / مستودع' }
  ];
  var h = '';
  types.forEach(function (t) {
    var selected = quizState.answers.type === t.label ? ' selected' : '';
    h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'type\',\'' + t.label + '\')">';
    h += '<span class="option-btn-icon">' + t.icon + '</span>';
    h += t.label + '</button>';
  });
  return h;
}

function renderSizeOptions() {
  var type = quizState.answers.type;
  var opts = [];
  if (type === 'منزل') {
    opts = [
      { icon: '🏠', label: '1' },
      { icon: '🏠🏠', label: '2' },
      { icon: '🏠🏠🏠', label: '3' },
      { icon: '🏢', label: '4' }
    ];
    var h = '<div class="quiz-question-sub">كم عدد الطوابق؟</div>';
    opts.forEach(function (o) {
      var selected = quizState.answers.size === o.label ? ' selected' : '';
      h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'size\',\'' + o.label + '\')">';
      h += '<span class="option-btn-icon">' + o.icon + '</span>';
      h += o.label + ' طابق' + (o.label === '1' ? '' : 'ات') + '</button>';
    });
    return h;
  } else if (type === 'محل تجاري') {
    var h = '<div class="quiz-question-sub">ما مساحة المحل التقريبية؟</div>';
    var items = [
      { icon: '📏', label: 'أقل من 50م²', val: 'صغير' },
      { icon: '📐', label: '50 - 150م²', val: 'متوسط' },
      { icon: '🏗️', label: 'أكثر من 150م²', val: 'كبير' }
    ];
    items.forEach(function (o) {
      var selected = quizState.answers.size === o.val ? ' selected' : '';
      h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'size\',\'' + o.val + '\')">';
      h += '<span class="option-btn-icon">' + o.icon + '</span>';
      h += o.label + '</button>';
    });
    return h;
  } else if (type === 'مكتب / شركة') {
    var h = '<div class="quiz-question-sub">حجم المكتب؟</div>';
    var items = [
      { icon: '📋', label: 'صغير (1-2 غرف)', val: 'صغير' },
      { icon: '📊', label: 'متوسط (3-5 غرف)', val: 'متوسط' },
      { icon: '🏛️', label: 'كبير (5+ غرف)', val: 'كبير' }
    ];
    items.forEach(function (o) {
      var selected = quizState.answers.size === o.val ? ' selected' : '';
      h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'size\',\'' + o.val + '\')">';
      h += '<span class="option-btn-icon">' + o.icon + '</span>';
      h += o.label + '</button>';
    });
    return h;
  } else if (type === 'مزرعة / مستودع') {
    var h = '<div class="quiz-question-sub">حجم المزرعة؟</div>';
    var items = [
      { icon: '🌱', label: 'صغيرة', val: 'صغيرة' },
      { icon: '🌳', label: 'متوسطة', val: 'متوسطة' },
      { icon: '🌲', label: 'كبيرة', val: 'كبيرة' }
    ];
    items.forEach(function (o) {
      var selected = quizState.answers.size === o.val ? ' selected' : '';
      h += '<button class="option-btn' + selected + '" onclick="selectQuizOption(\'size\',\'' + o.val + '\')">';
      h += '<span class="option-btn-icon">' + o.icon + '</span>';
      h += o.label + '</button>';
    });
    return h;
  }
  return '';
}

function renderSpotsOptions() {
  var spots = ['مدخل رئيسي', 'حديقة', 'مرآب', 'باب خلفي', 'سطح', 'داخلي'];
  var selected = quizState.answers.spots || [];
  var h = '';
  spots.forEach(function (s) {
    var isSel = selected.indexOf(s) !== -1;
    h += '<div class="spot-check' + (isSel ? ' selected' : '') + '" onclick="toggleSpot(\'' + s + '\')">';
    h += '<div class="spot-check-box">' + (isSel ? '✓' : '') + '</div>';
    h += s + '</div>';
  });
  h += '<button class="btn-primary quiz-next-btn" onclick="quizNext()">التالي ←</button>';
  return h;
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
    if (questions[quizState.currentStep].type !== 'multi') {
      quizNext();
    }
  }, 250);
}

function toggleSpot(spot) {
  var spots = quizState.answers.spots || [];
  var idx = spots.indexOf(spot);
  if (idx === -1) {
    spots.push(spot);
  } else {
    spots.splice(idx, 1);
  }
  quizState.answers.spots = spots;
  renderQuiz();
}

function quizNext() {
  var q = questions[quizState.currentStep];
  var val = quizState.answers[q.id];
  if (q.id === 'wilaya' && !val) {
    showToast('اختر ولايتك للمتابعة');
    return;
  }
  if (q.id === 'address' && !quizState.answers.addressText && !quizState.answers.addressLat) {
    showToast('أدخل عنوانك أو حدد موقعك');
    return;
  }
  if (q.type === 'single' && !val) {
    showToast('اختر إجابة للمتابعة');
    return;
  }
  if (q.id === 'spots' && (!quizState.answers.spots || quizState.answers.spots.length === 0)) {
    showToast('اختر مكاناً واحداً على الأقل');
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

function quizGoBack() {
  if (quizState.currentStep <= 0) {
    navigateTo('home');
    return;
  }
  quizState.currentStep--;
  saveQuizState();
  renderQuiz();
}

function saveQuizState() {
  try {
    localStorage.setItem('mcam_quiz', JSON.stringify(quizState));
  } catch (e) {}
}

function resetQuiz() {
  quizState = {
    currentStep: 0,
    answers: {
      wilaya: null,
      addressText: '',
      addressLat: null,
      addressLng: null,
      type: null,
      size: null,
      spots: [],
      recording: null,
      power: null,
      internet: null
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
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[]}');
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
  var result = calculateCameras(quizState.answers);

  var summary = document.getElementById('result-summary');
  var typeLabel = quizState.answers.type;
  var sizeLabel = '';
  if (quizState.answers.type === 'منزل') {
    sizeLabel = quizState.answers.size + ' طابق' + (quizState.answers.size > 1 ? 'ات' : '');
  } else if (quizState.answers.size) {
    sizeLabel = quizState.answers.size;
  }

  var locText = quizState.answers.wilaya || '';
  if (quizState.answers.addressText) locText += ' — ' + quizState.answers.addressText;

  summary.innerHTML =
    '<h3>📍 ' + typeLabel + (sizeLabel ? ' — ' + sizeLabel : '') + '</h3>' +
    (locText ? '<p><strong>🏠 الموقع:</strong> ' + locText + '</p>' : '') +
    '<p><strong>📷 الكاميرات المقترحة:</strong> ' + result.count + ' كاميرات</p>';

  var details = document.getElementById('result-details');
  var spotsHtml = '';
  result.spots.forEach(function (s) {
    spotsHtml += '<div class="result-detail-item"><span class="result-detail-value">✔ ' + s + '</span></div>';
  });

  details.innerHTML =
    '<h3>التوزيع المقترح:</h3>' +
    spotsHtml +
    '<hr style="border-color:var(--border);margin:12px 0;">' +
    '<div class="result-detail-item"><span class="result-detail-label">نوع الكاميرا</span><span class="result-detail-value">' + result.cameraType + '</span></div>' +
    '<div class="result-detail-item"><span class="result-detail-label">التخزين</span><span class="result-detail-value">' + result.storage + '</span></div>' +
    '<div class="result-detail-item"><span class="result-detail-label">الطاقة</span><span class="result-detail-value">' + result.upsNote + '</span></div>' +
    (result.notes.length ? '<div class="result-detail-item"><span class="result-detail-label">ملاحظات</span><span class="result-detail-value">' + result.notes.join(' — ') + '</span></div>' : '') +
    '<p style="margin-top:12px;font-size:0.85rem;color:var(--text-secondary);">⚠️ هذا اقتراح أولي — القرار النهائي بعد معاينة الصور</p>';

  clearQuizAfterResult();
  navigateTo('result');
  setTimeout(showInstallPrompt, 1000);
}

// ===== INIT QUIZ ON NAV =====
document.addEventListener('DOMContentLoaded', function () {
  var origNav = window.navigateTo;
  var newNav = function (page) {
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
      } catch (e) {
        resetQuiz();
      }
      renderQuiz();
    }
    origNav(page);
  };
  window.navigateTo = newNav;
});

function clearQuizAfterResult() {
  try { localStorage.removeItem('mcam_quiz'); } catch (e) {}
}
