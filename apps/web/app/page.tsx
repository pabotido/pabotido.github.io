const stats = [
  { label: 'Nhân sự đang hoạt động', value: '248', note: '+12 tháng này', tone: 'blue' },
  { label: 'Yêu cầu chờ duyệt', value: '18', note: '5 cần xử lý hôm nay', tone: 'orange' },
  { label: 'Phòng ban', value: '24', note: 'Đang vận hành ổn định', tone: 'green' },
  { label: 'Tài liệu nội bộ', value: '1,284', note: '+86 tài liệu mới', tone: 'purple' },
];

const activities = [
  { initials: 'MN', name: 'Minh Nguyễn', action: 'đã tạo yêu cầu nghỉ phép', time: '10 phút trước', color: 'blue' },
  { initials: 'TH', name: 'Thu Hà', action: 'đã cập nhật tài liệu onboarding', time: '32 phút trước', color: 'orange' },
  { initials: 'AK', name: 'Anh Khoa', action: 'đã gia nhập phòng Kinh doanh', time: '1 giờ trước', color: 'green' },
];

export default function HomePage() {
  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">P</div>
          <div><strong>Portal</strong><span>Enterprise workspace</span></div>
        </div>
        <div className="workspace-switcher"><span className="workspace-dot" /> Công ty TNHH Portal <span className="chevron">⌄</span></div>
        <nav className="nav" aria-label="Điều hướng chính">
          <p className="nav-label">TỔNG QUAN</p>
          <a className="nav-item active" href="#dashboard"><span>▦</span> Tổng quan</a>
          <a className="nav-item" href="#calendar"><span>□</span> Lịch làm việc</a>
          <a className="nav-item" href="#notifications"><span>♢</span> Thông báo <b>4</b></a>
          <p className="nav-label">VẬN HÀNH</p>
          <a className="nav-item" href="#users"><span>♙</span> Nhân sự</a>
          <a className="nav-item" href="#departments"><span>▤</span> Phòng ban</a>
          <a className="nav-item" href="#documents"><span>▱</span> Tài liệu</a>
          <a className="nav-item" href="#approvals"><span>✓</span> Phê duyệt <b className="orange">18</b></a>
          <p className="nav-label">HỆ THỐNG</p>
          <a className="nav-item" href="#settings"><span>⚙</span> Cài đặt</a>
          <a className="nav-item" href="#help"><span>?</span> Trung tâm trợ giúp</a>
        </nav>
        <div className="sidebar-footer"><div className="avatar small">AN</div><div><strong>Admin Nguyễn</strong><span>Quản trị viên</span></div><span className="more">•••</span></div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar"><div className="breadcrumb">Tổng quan <span>/</span> Dashboard</div><div className="top-actions"><button className="icon-button" aria-label="Tìm kiếm">⌕</button><button className="icon-button notification" aria-label="Thông báo">♢<i /></button><div className="avatar">AN</div></div></header>
        <div className="content-wrap">
          <section className="welcome-row"><div><p className="eyebrow">THỨ BA, 04 THÁNG 11, 2026</p><h1>Chào buổi sáng, Admin <span>✦</span></h1><p className="subheading">Đây là những gì đang diễn ra trong tổ chức của bạn hôm nay.</p></div><button className="primary-button">＋ Tạo yêu cầu mới</button></section>
          <section className="stats-grid">{stats.map((stat) => <article className={`stat-card ${stat.tone}`} key={stat.label}><div className="stat-icon">{stat.tone === 'blue' ? '♙' : stat.tone === 'orange' ? '◷' : stat.tone === 'green' ? '⌂' : '▱'}</div><div><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.note}</small></div><span className="trend">↗</span></article>)}</section>
          <section className="dashboard-grid"><article className="panel activity-panel"><div className="panel-heading"><div><h2>Hoạt động gần đây</h2><p>Cập nhật mới nhất trong tổ chức</p></div><a href="#activities">Xem tất cả <span>→</span></a></div><div className="activity-list">{activities.map((item) => <div className="activity" key={item.name}><div className={`avatar ${item.color}`}>{item.initials}</div><div><p><strong>{item.name}</strong> {item.action}</p><small>{item.time}</small></div></div>)}</div><div className="empty-activity"><span>✓</span><p><strong>Mọi thứ đã được cập nhật!</strong><br />Bạn đã xem hết hoạt động mới.</p></div></article><article className="panel calendar-panel" id="calendar"><div className="panel-heading"><div><h2>Lịch hôm nay</h2><p>Thứ Ba, 04 Tháng 11</p></div><button className="more-button">•••</button></div><div className="schedule"><div className="schedule-time">09:00</div><div className="event blue-event"><strong>Họp kế hoạch quý IV</strong><span>Phòng họp A · 09:00 – 10:00</span></div><div className="schedule-time">11:30</div><div className="event purple-event"><strong>Review sản phẩm</strong><span>Online · 11:30 – 12:30</span></div><div className="schedule-time">14:00</div><div className="event orange-event"><strong>Đào tạo nhân sự mới</strong><span>Phòng đào tạo · 14:00 – 15:30</span></div></div><a className="calendar-link" href="#calendar">Mở lịch làm việc <span>→</span></a></article></section>
          <section className="quick-section"><div className="panel-heading"><div><h2>Truy cập nhanh</h2><p>Các tác vụ thường dùng</p></div></div><div className="quick-grid"><a href="#users" className="quick-card"><span className="quick-icon blue-bg">♙</span><span><strong>Quản lý nhân sự</strong><small>Xem và quản lý nhân viên</small></span><b>→</b></a><a href="#documents" className="quick-card"><span className="quick-icon purple-bg">▱</span><span><strong>Kho tài liệu</strong><small>Truy cập tài liệu nội bộ</small></span><b>→</b></a><a href="#approvals" className="quick-card"><span className="quick-icon orange-bg">✓</span><span><strong>Phê duyệt của tôi</strong><small>18 yêu cầu đang chờ</small></span><b>→</b></a></div></section>
        </div>
      </main>
    </div>
  );
}
