// ===== WHATSAPP MESSAGE BUILDER =====
function sendToWhatsApp() {
  var answers = quizState.answers;
  var result = calculateCameras(answers);

  var spotsText = result.spots.join('، ');
  var notesText = result.notes.join(' — ');

  var msg = '';
  msg += '🔔 *زبون جديد من الموقع — M-Cam*\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '📍 *نوع المكان:* ' + answers.type;
  if (answers.type === 'منزل' && answers.size) {
    msg += ' (' + answers.size + ' طوابق)';
  }
  msg += '\n';
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '*خيارات إضافية:*\n';
  if (answers.spots && answers.spots.length) {
    msg += '📍 الأماكن: ' + answers.spots.join('، ') + '\n';
  }
  msg += (answers.recording ? '✅ تسجيل: ' + answers.recording + '\n' : '');
  msg += (answers.power ? '⚡ كهرباء: ' + answers.power + '\n' : '');
  msg += (answers.internet ? '🌐 إنترنت: ' + answers.internet + '\n' : '');
  msg += '━━━━━━━━━━━━━━━\n';
  msg += '📷 *الكاميرات المقترحة:* ' + result.count + ' كاميرات\n';
  msg += '📍 *الأماكن:* ' + spotsText + '\n';
  msg += '📦 *النوع:* ' + result.cameraType + '\n';
  msg += '💾 *التخزين:* ' + result.storage + '\n';
  msg += '━━━━━━━━━━━━━━━\n';

  // Image info
  if (selectedImages.length > 0) {
    msg += '📸 *تم اختيار ' + selectedImages.length + ' صور* — سأرسلها بعد المكالمة أو في المرفقات\n';
    msg += '━━━━━━━━━━━━━━━\n';
  }

  var encoded = encodeURIComponent(msg);
  var url = 'https://wa.me/213799662196?text=' + encoded;
  // Try popup first, fallback to direct navigation
  var w = window.open(url, '_blank');
  if (!w || w.closed || typeof w.closed === 'undefined') {
    window.location.href = url;
  }

  // Record inquiry in dashboard
  try {
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[]}');
    data.inquiries = (data.inquiries || 0) + 1;
    data.inquiryList = data.inquiryList || [];
    data.inquiryList.unshift({
      id: Date.now(),
      date: new Date().toLocaleString('ar-DZ'),
      type: answers.type,
      floors: answers.size || '—',
      cameras: result.count,
      spots: spotsText,
      images: selectedImages.length
    });
    // Keep last 50
    if (data.inquiryList.length > 50) data.inquiryList.length = 50;
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
  } catch (e) {}

  // Navigate to sent page
  setTimeout(function () {
    navigateTo('sent');
  }, 500);
}
