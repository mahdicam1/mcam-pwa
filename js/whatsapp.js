// ===== WHATSAPP MESSAGE BUILDER (answers only) =====
function sendToWhatsApp() {
  var a = quizState.answers;

  var msg = '';
  msg += '🔔 *زبون جديد من M-Cam*\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '📍 *الولاية:* ' + (a.wilaya || 'غير محدد') + '\n';
  if (a.addressText) msg += '🏠 *العنوان:* ' + a.addressText + '\n';
  if (a.addressLat && a.addressLng) msg += '📍 *الموقع:* https://www.google.com/maps?q=' + a.addressLat + ',' + a.addressLng + '\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '*نوع المكان:* ' + a.type + '\n';
  if (a.floorCount) msg += '*الطوابق:* ' + a.floorCount + '\n';
  if (a.floorLevel) msg += '*الطابق:* ' + a.floorLevel + '\n';
  if (a.isInBuilding !== null) msg += '*داخل عمارة:* ' + (a.isInBuilding ? 'نعم' : 'لا') + '\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '*عدد الكاميرات:* ' + formatCameraCount(a.cameraCount) + '\n';
  msg += '*التخزين:* ' + formatStorage(a.storage) + '\n';
  msg += '*التسجيل:* ' + (a.recording || '—') + '\n';
  msg += '*الكهرباء:* ' + (a.power || '—') + '\n';
  msg += '*الإنترنت:* ' + (a.internet || '—') + '\n';
  msg += '*موعد التركيب:* ' + formatInstallTiming(a.installTiming) + '\n';
  msg += '━━━━━━━━━━━━━━━\n';
  if (a.phoneNumber) msg += '📞 *رقم الزبون:* ' + a.phoneNumber + '\n';
  if (selectedImages.length > 0) msg += '📸 *صور المكان:* ' + selectedImages.length + ' صور (أرسلها بعد المكالمة)\n';
  msg += '━━━━━━━━━━━━━━━\n';

  var encoded = encodeURIComponent(msg);
  var url = 'https://wa.me/213799662196?text=' + encoded;
  var w = window.open(url, '_blank');
  if (!w || w.closed || typeof w.closed === 'undefined') {
    window.location.href = url;
  }

  // Save images to dashboard
  saveImagesToDashboard();

  // Record inquiry
  try {
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[],"imageOrders":[],"works":[]}');
    data.inquiries = (data.inquiries || 0) + 1;
    data.inquiryList = data.inquiryList || [];
    data.inquiryList.unshift({
      id: Date.now(),
      date: new Date().toLocaleString('ar-DZ'),
      type: a.type,
      wilaya: a.wilaya || '—',
      floors: a.floorCount || a.floorLevel || '—',
      cameras: formatCameraCount(a.cameraCount),
      storage: formatStorage(a.storage),
      phone: a.phoneNumber || '—',
      images: selectedImages.length
    });
    if (data.inquiryList.length > 50) data.inquiryList.length = 50;
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
  } catch (e) {}

  setTimeout(function () { navigateTo('sent'); }, 500);
}

function saveImagesToDashboard() {
  if (selectedImages.length === 0) return;
  try {
    var a = quizState.answers;
    var order = {
      id: Date.now(),
      date: new Date().toLocaleString('ar-DZ'),
      type: a.type,
      wilaya: a.wilaya || '—',
      images: []
    };
    var loaded = 0;
    selectedImages.forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        order.images.push(e.target.result);
        loaded++;
        if (loaded === selectedImages.length) {
          try {
            var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{}');
            data.imageOrders = data.imageOrders || [];
            data.imageOrders.unshift(order);
            if (data.imageOrders.length > 30) data.imageOrders.length = 30;
            localStorage.setItem('mcam_dashboard', JSON.stringify(data));
          } catch (e2) {}
        }
      };
      reader.readAsDataURL(file);
    });
  } catch (e) {}
}

// ===== FORMAT HELPERS =====
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
