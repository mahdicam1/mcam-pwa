// ===== DASHBOARD =====
function loadDashboard() {
  try {
    var data = JSON.parse(
      localStorage.getItem('mcam_dashboard') ||
      '{"visits":0,"inquiries":0,"ratings":[],"inquiryList":[]}'
    );
  } catch (e) {
    var data = { visits: 0, inquiries: 0, ratings: [], inquiryList: [] };
  }

  document.getElementById('stat-visits').textContent = data.visits || 0;
  document.getElementById('stat-inquiries').textContent = data.inquiries || 0;

  // Average rating
  var avg = 0;
  if (data.ratings && data.ratings.length > 0) {
    var sum = 0;
    data.ratings.forEach(function (r) { sum += r; });
    avg = (sum / data.ratings.length).toFixed(1);
  }
  document.getElementById('stat-rating').textContent = avg > 0 ? avg + ' ★' : '—';

  // Inquiries list
  var list = document.getElementById('inquiries-list');
  if (!data.inquiryList || data.inquiryList.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);text-align:center;padding:20px;">لا توجد استفسارات بعد</p>';
    return;
  }

  var html = '';
  data.inquiryList.forEach(function (inq) {
    html += '<div class="inquiry-item">';
    html += '<div class="inq-header"><span>' + inq.date + '</span><span>📷 ' + inq.cameras + ' كاميرات</span></div>';
    html += '<div class="inq-body">';
    html += '<strong>' + inq.type + '</strong>';
    if (inq.floors && inq.floors !== '—') html += ' — ' + inq.floors;
    if (inq.wilaya && inq.wilaya !== '—') html += ' — ' + inq.wilaya;
    html += '<br><small>' + (inq.spots || '') + '</small>';
    if (inq.images > 0) html += '<br><small>📸 ' + inq.images + ' صور</small>';
    html += '</div></div>';
  });
  list.innerHTML = html;
}

function clearDashboard() {
  if (!confirm('مسح كل البيانات؟')) return;
  var empty = {
    visits: 0,
    inquiries: 0,
    ratings: [],
    inquiryList: []
  };
  localStorage.setItem('mcam_dashboard', JSON.stringify(empty));
  loadDashboard();
  showToast('تم مسح البيانات');
}
