// ===== DASHBOARD =====
function loadDashboard() {
  try {
    var data = JSON.parse(
      localStorage.getItem('mcam_dashboard') ||
      '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[],"imageOrders":[],"works":[]}'
    );
  } catch (e) {
    var data = { visits: 0, inquiries: 0, ratings: [], inquiryList: [], imageOrders: [], works: [] };
  }

  document.getElementById('stat-visits').textContent = data.visits || 0;
  document.getElementById('stat-inquiries').textContent = data.inquiries || 0;

  var avg = 0;
  if (data.ratings && data.ratings.length > 0) {
    var sum = 0;
    data.ratings.forEach(function (r) { sum += r; });
    avg = (sum / data.ratings.length).toFixed(1);
  }
  document.getElementById('stat-rating').textContent = avg > 0 ? avg + ' ★' : '—';

  renderInquiries(data);
  renderImageOrders(data);
  renderWorksSection(data);
}

function renderInquiries(data) {
  var list = document.getElementById('inquiries-list');
  if (!data.inquiryList || data.inquiryList.length === 0) {
    list.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">لا توجد استفسارات بعد</p>';
    return;
  }
  var html = '';
  data.inquiryList.forEach(function (inq) {
    html += '<div class="inquiry-item">';
    html += '<div class="inq-header"><span>' + inq.date + '</span><span>📷 ' + (inq.cameras || '') + '</span></div>';
    html += '<div class="inq-body">';
    html += '<strong>' + inq.type + '</strong>';
    if (inq.floors && inq.floors !== '—') html += ' — ' + inq.floors;
    if (inq.wilaya && inq.wilaya !== '—') html += ' — ' + inq.wilaya;
    html += '<br><small>' + (inq.spots || '') + '</small>';
    if (inq.phone && inq.phone !== '—') html += '<br><small>📞 ' + inq.phone + '</small>';
    if (inq.images > 0) html += '<br><small>📸 ' + inq.images + ' صور</small>';
    html += '</div></div>';
  });
  list.innerHTML = html;
}

function renderImageOrders(data) {
  var container = document.getElementById('image-orders-section');
  if (!container) return;
  if (!data.imageOrders || data.imageOrders.length === 0) {
    container.innerHTML = '<h3 style="margin-top:24px;">صور الطلبات</h3><p style="color:var(--text-secondary);text-align:center;padding:12px;">لا توجد صور محفوظة</p>';
    return;
  }
  var html = '<h3 style="margin-top:24px;">صور الطلبات</h3>';
  data.imageOrders.forEach(function (order) {
    html += '<div class="inquiry-item" style="margin-bottom:12px;">';
    html += '<div class="inq-header"><span>' + order.date + '</span><span>' + (order.wilaya || '') + ' — ' + (order.type || '') + '</span></div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">';
    order.images.forEach(function (imgSrc) {
      html += '<img src="' + imgSrc + '" style="width:70px;height:70px;object-fit:cover;border-radius:8px;cursor:pointer;" onclick="window.open(\'' + imgSrc + '\',\'_blank\')">';
    });
    html += '</div>';
    html += '<button class="btn-secondary small" style="margin-top:8px;padding:6px 12px;font-size:0.75rem;" onclick="deleteImageOrder(' + order.id + ')">حذف</button>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function deleteImageOrder(id) {
  if (!confirm('حذف هذا الطلب مع صوره؟')) return;
  try {
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{}');
    data.imageOrders = (data.imageOrders || []).filter(function (o) { return o.id !== id; });
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
    loadDashboard();
    showToast('تم الحذف');
  } catch (e) {}
}

function renderWorksSection(data) {
  var container = document.getElementById('works-section');
  if (!container) return;
  var html = '<h3 style="margin-top:24px;">إدارة أعمالنا</h3>';
  html += '<button class="btn-primary small" onclick="addWorkImage()" style="margin-bottom:12px;">➕ إضافة صورة عمل جديدة</button>';
  html += '<input type="file" id="work-upload" accept="image/*" style="display:none" onchange="saveWorkImage(event)">';
  if (data.works && data.works.length > 0) {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    data.works.forEach(function (w, idx) {
      html += '<div style="position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;background:var(--bg-card);border:1px solid var(--border);">';
      html += '<img src="' + w + '" style="width:100%;height:100%;object-fit:cover;">';
      html += '<button onclick="deleteWorkImage(' + idx + ')" style="position:absolute;top:4px;right:4px;background:rgba(255,0,0,0.7);color:white;border:none;border-radius:50%;width:24px;height:24px;font-size:14px;cursor:pointer;">×</button>';
      html += '</div>';
    });
    html += '</div>';
  } else {
    html += '<p style="color:var(--text-secondary);text-align:center;padding:12px;">لا توجد صور أعمال بعد</p>';
  }
  container.innerHTML = html;
  // Update works page
  updateWorksPage(data);
}

function addWorkImage() {
  document.getElementById('work-upload').click();
}

function saveWorkImage(event) {
  var file = event.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{}');
      data.works = data.works || [];
      data.works.push(e.target.result);
      localStorage.setItem('mcam_dashboard', JSON.stringify(data));
      loadDashboard();
      showToast('✅ تم إضافة الصورة');
    } catch (err) {
      showToast('فشل حفظ الصورة');
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function deleteWorkImage(idx) {
  if (!confirm('حذف هذه الصورة؟')) return;
  try {
    var data = JSON.parse(localStorage.getItem('mcam_dashboard') || '{}');
    data.works = data.works || [];
    data.works.splice(idx, 1);
    localStorage.setItem('mcam_dashboard', JSON.stringify(data));
    loadDashboard();
    showToast('تم الحذف');
  } catch (e) {}
}

function updateWorksPage(data) {
  var grid = document.getElementById('works-grid');
  if (!grid) return;
  var works = (data && data.works) || [];
  if (works.length === 0) {
    // Show empty dark boxes
    var h = '';
    for (var i = 0; i < 6; i++) {
      h += '<div class="work-item" style="background:var(--bg-card);cursor:default;"><span style="color:var(--text-secondary);font-size:1.2rem;opacity:0.3;">+</span></div>';
    }
    grid.innerHTML = h;
  } else {
    var h = '';
    works.forEach(function (src) {
      h += '<div class="work-item" onclick="window.open(\'' + src + '\',\'_blank\')"><img src="' + src + '" alt="عمل"></div>';
    });
    // Fill remaining with empty
    while (h.split('<div class="work-item"').length - 1 < 6) {
      h += '<div class="work-item" style="background:var(--bg-card);cursor:default;"><span style="color:var(--text-secondary);font-size:1.2rem;opacity:0.3;">+</span></div>';
    }
    grid.innerHTML = h;
  }
}

function clearDashboard() {
  if (!confirm('مسح كل البيانات؟')) return;
  var empty = {
    visits: 0,
    inquiries: 0,
    ratings: [],
    inquiryList: [],
    imageOrders: [],
    works: []
  };
  localStorage.setItem('mcam_dashboard', JSON.stringify(empty));
  loadDashboard();
  showToast('تم مسح البيانات');
}
