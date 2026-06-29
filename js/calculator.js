// ===== CAMERA CALCULATOR =====
function calculateCameras(answers) {
  var count = 0;
  var spots = [];
  var cameraType = '';
  var storage = '';
  var notes = [];

  // Base by type
  if (answers.type === 'منزل') {
    var floors = parseInt(answers.size) || 1;
    count = floors * 2;
    spots.push('المدخل الرئيسي');
    if (floors > 1) {
      spots.push('ممر الطابق ' + floors);
      if (floors >= 3) {
        spots.push('ممر الطابق 2');
      }
    } else {
      spots.push('الممر الداخلي');
    }
    notes.push('منزل ب' + floors + ' طابق' + (floors > 1 ? 'ات' : ''));
  } else if (answers.type === 'محل تجاري') {
    count = 3;
    spots.push('المدخل', 'داخل المحل', 'الصندوق');
    if (answers.size === 'كبير') { count += 1; spots.push('المستودع'); }
    notes.push('محل تجاري');
  } else if (answers.type === 'مكتب / شركة') {
    count = 4;
    spots.push('المدخل', 'الاستقبال', 'المكتب الرئيسي', 'الممر');
    if (answers.size === 'كبير') { count += 2; spots.push('مكاتب إضافية'); }
    notes.push('مكتب/شركة');
  } else if (answers.type === 'مزرعة / مستودع') {
    count = 4;
    spots.push('البوابة الرئيسية', 'محيط المزرعة', 'المستودع', 'المدخل');
    if (answers.size === 'كبيرة') { count += 2; spots.push('مناطق إضافية'); }
    notes.push('مزرعة/مستودع');
  }

  // Spots from user selection
  if (answers.spots) {
    answers.spots.forEach(function (s) {
      if (s === 'حديقة' && spots.indexOf('الحديقة') === -1) {
        count++; spots.push('الحديقة');
      }
      if (s === 'مرآب' && spots.indexOf('المرآب') === -1) {
        count++; spots.push('المرآب');
      }
      if (s === 'باب خلفي' && spots.indexOf('الباب الخلفي') === -1) {
        count++; spots.push('الباب الخلفي');
      }
      if (s === 'سطح' && spots.indexOf('السطح') === -1) {
        count++; spots.push('السطح');
      }
    });
  }

  // Camera type
  if (answers.power === 'شمسية') {
    cameraType = 'لاسلكية بطاقة شمسية + رؤية ليلية';
    notes.push('طاقة شمسية');
  } else {
    cameraType = 'خارجية ملونة ليلاً (Full Color Night Vision)';
  }

  // Internet
  if (answers.internet === 'لا') {
    notes.push('بدون إنترنت — تسجيل محلي فقط');
  } else {
    notes.push('مشاهدة عن بعد عبر الإنترنت');
  }

  // Storage
  if (answers.recording === '24/7') {
    storage = 'DVR + هارد 2TB (تسجيل 30 يوم)';
  } else if (answers.recording === 'حركة') {
    storage = 'DVR + هارد 1TB (تسجيل 60+ يوم)';
  } else {
    storage = 'مشاهدة مباشرة فقط — بدون هارد';
  }

  // UPS recommendation
  var upsNote = '';
  if (answers.power !== 'شمسية') {
    upsNote = 'UPS (بطارية احتياطية) — موصى به';
  } else {
    upsNote = 'نظام طاقة شمسية';
  }

  return {
    count: count,
    spots: spots,
    cameraType: cameraType,
    storage: storage,
    notes: notes,
    upsNote: upsNote
  };
}
