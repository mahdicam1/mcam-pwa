// ===== NAVIGATION =====
let currentPage = 'splash';

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }
  currentPage = page;

  // Bottom bar visibility
  const hideBar = ['splash', 'quiz', 'result', 'sent'];
  const bar = document.getElementById('bottom-bar');
  if (hideBar.includes(page)) {
    bar.classList.add('hidden');
  } else {
    bar.classList.remove('hidden');
  }

  // Nav active state
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navMap = { home: 0, faq: 1, works: 2, contact: 3 };
  const idx = navMap[page];
  if (idx !== undefined) {
    document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  }

  // Dashboard unlock check
  if (page === 'dashboard') {
    loadDashboard();
  }
}

// ===== SPLASH =====
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    navigateTo('home');
    recordVisit();
  }, 2200);

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
});

// ===== SHARE APP =====
function shareApp() {
  const shareData = {
    title: 'M-Cam — كاميرات احترافية',
    text: 'احسب عدد الكاميرات اللي تحتاجها في دقيقتين',
    url: window.location.origin + window.location.pathname
  };
  if (navigator.share) {
    navigator.share(shareData).catch(function () {});
  } else {
    // Fallback: copy to clipboard
    const textToCopy = shareData.text + '\n' + shareData.url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(function () {
        showToast('تم نسخ الرابط — أرسله لزبونك');
      }).catch(function () {
        fallbackCopy(textToCopy);
      });
    } else {
      fallbackCopy(textToCopy);
    }
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('تم نسخ الرابط — أرسله لزبونك');
}

// ===== INSTALL PROMPT =====
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  deferredPrompt = e;
});

function showInstallPrompt() {
  const prompt = document.getElementById('install-prompt');
  if (prompt && deferredPrompt) {
    prompt.classList.remove('hidden');
  }
}

function dismissInstall() {
  document.getElementById('install-prompt').classList.add('hidden');
}

document.getElementById('install-btn').addEventListener('click', function () {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function () {
      deferredPrompt = null;
      dismissInstall();
    });
  }
});

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(function () { t.classList.add('hidden'); }, 2800);
}

// ===== VISIT RECORDING =====
function recordVisit() {
  try {
    const data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[]}');
    data.visits = (data.visits || 0) + 1;
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
  } catch (e) {}
}

// ===== IMAGE HANDLING =====
let selectedImages = [];

function handleImageUpload(event) {
  const files = event.target.files;
  selectedImages = [];
  const previews = document.getElementById('image-previews');
  const count = document.getElementById('image-count');
  previews.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      selectedImages.push(file);
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = 'صورة ' + (i + 1);
      previews.appendChild(img);
    }
  }
  count.textContent = selectedImages.length + ' صور تم الاختيار';
}

// ===== SHARE IMAGES FOR REVIEW =====
function shareImagesForReview() {
  if (selectedImages.length > 0 && navigator.canShare && navigator.canShare({ files: selectedImages })) {
    navigator.share({
      files: selectedImages,
      title: 'صور المكان',
      text: 'صور لمكان تركيب الكاميرات'
    }).catch(function () {
      showToast('افتح واتساب وأرسل الصور من معرض هاتفك');
    });
  } else {
    showToast('افتح واتساب وأرسل الصور من معرض هاتفك');
  }
}

// ===== WORKS GALLERY =====
function viewWork(el) {
  var img = el.querySelector('img');
  if (img && img.src && !img.src.includes('works-placeholder')) {
    window.open(img.src, '_blank');
  }
}

// ===== DASHBOARD ACCESS =====
function promptDashboard() {
  const code = prompt('أدخل كود الدخول:');
  if (code === 'mcam2026') {
    navigateTo('dashboard');
  } else if (code) {
    showToast('كود خطأ');
  }
}
