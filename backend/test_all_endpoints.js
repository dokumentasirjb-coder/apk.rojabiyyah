import http from 'http';

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    return { status: res.status, ok: res.ok, data: json };
  } else {
    const buffer = await res.arrayBuffer();
    return { status: res.status, ok: res.ok, bufferLength: buffer.byteLength, contentType };
  }
}

async function runTests() {
  console.log('🧪 Memulai Pengujian Menyeluruh Semua Endpoint API...\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await fetch('http://localhost:5000/api/health').then((r) => r.json());
    assert('1. GET /api/health', health.status === 'healthy');

    // 2. Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { usernameOrEmail: 'admin', password: 'admin123' },
    });
    assert('2. POST /auth/login (Admin)', adminLogin.ok && adminLogin.data.data.accessToken);
    const adminToken = adminLogin.data?.data?.accessToken;

    // 3. Anggota Login
    const anggotaLogin = await request('/auth/login', {
      method: 'POST',
      body: { usernameOrEmail: 'ahmad', password: 'anggota123' },
    });
    assert('3. POST /auth/login (Anggota)', anggotaLogin.ok && anggotaLogin.data.data.accessToken);
    const anggotaToken = anggotaLogin.data?.data?.accessToken;

    // 4. Admin Dashboard
    const adminDash = await request('/dashboard/admin', { token: adminToken });
    assert('4. GET /dashboard/admin', adminDash.ok && adminDash.data.data.stats.totalMembers >= 2,
      `| Saldo: Rp ${adminDash.data.data.stats.balance?.toLocaleString('id-ID')}`
    );

    // 5. Member Dashboard
    const memberDash = await request('/dashboard/member', { token: anggotaToken });
    assert('5. GET /dashboard/member', memberDash.ok && memberDash.data.data.member.fullName === 'Ahmad Fauzi');

    // 6. Inventory List
    const invList = await request('/inventory', { token: adminToken });
    assert('6. GET /inventory', invList.ok && invList.data.data.length > 0, `| Total: ${invList.data.meta.total} item`);

    // 7. Inventory Export (Excel)
    const invExport = await request('/inventory/export', { token: adminToken });
    assert('7. GET /inventory/export', invExport.ok && invExport.bufferLength > 1000, `| Byte Size: ${invExport.bufferLength}`);

    // 8. Members List
    const members = await request('/members', { token: adminToken });
    assert('8. GET /members', members.ok && members.data.data.length >= 2, `| Total: ${members.data.meta.total}`);

    // 9. Institutions
    const institutions = await request('/institutions', { token: adminToken });
    assert('9. GET /institutions', institutions.ok && institutions.data.data.length >= 2);

    // 10. Regions
    const regions = await request('/regions', { token: adminToken });
    assert('10. GET /regions', regions.ok && regions.data.data.length >= 3);

    // 11. Task Points
    const taskPoints = await request('/task-points', { token: adminToken });
    assert('11. GET /task-points', taskPoints.ok && taskPoints.data.data.length >= 3);

    // 12. Field Reports
    const reports = await request('/field-reports', { token: adminToken });
    assert('12. GET /field-reports', reports.ok && reports.data.data.length >= 2);

    // 13. Transactions & Summary
    const trxSummary = await request('/transactions/summary', { token: adminToken });
    assert('13. GET /transactions/summary', trxSummary.ok && trxSummary.data.data.balance !== undefined,
      `| Kas: Rp ${trxSummary.data.data.balance?.toLocaleString('id-ID')}`
    );

    // 14. Transaction Export (Excel & PDF)
    const trxExport = await request('/transactions/export?format=excel', { token: adminToken });
    assert('14. GET /transactions/export (Excel)', trxExport.ok && trxExport.bufferLength > 1000);

    // 15. Settings Categories & Org
    const cats = await request('/settings/categories', { token: adminToken });
    assert('15. GET /settings/categories', cats.ok && cats.data.data.length > 0);

    const org = await request('/settings/organization', { token: adminToken });
    assert('16. GET /settings/organization', org.ok && org.data.data.orgName === 'Administrasi Rojabiyyaah');

    // 16. Notifications
    const notifs = await request('/notifications', { token: adminToken });
    assert('17. GET /notifications', notifs.ok && Array.isArray(notifs.data.data.notifications));

    // 17. Loan Request Flow (Anggota creates request, Super Admin approves)
    const firstInvItem = invList.data.data[0];
    const newLoanReq = await request('/loan-requests', {
      method: 'POST',
      token: anggotaToken,
      body: {
        items: [{ inventoryItemId: firstInvItem.id, quantity: 1, notes: 'Tes peminjaman otomatis' }],
        startDate: '2026-11-01',
        endDate: '2026-11-05',
        purpose: 'Pengujian alur otomatis sistem',
      },
    });
    assert('18. POST /loan-requests (Anggota)', newLoanReq.ok && newLoanReq.data.data.loanCode,
      `| Kode: ${newLoanReq.data?.data?.loanCode}`
    );

    const createdLoanId = newLoanReq.data?.data?.id;
    if (createdLoanId) {
      // Admin Approve
      const approveRes = await request(`/loans/${createdLoanId}/approve`, {
        method: 'PATCH',
        token: adminToken,
        body: { adminNotes: 'Disetujui secara otomatis dalam pengujian' },
      });
      assert('19. PATCH /loans/:id/approve (Admin)', approveRes.ok && approveRes.data.data.status === 'APPROVED');

      // Download PDF Receipt
      const receiptRes = await request(`/loans/${createdLoanId}/receipt`, { token: adminToken });
      assert('20. GET /loans/:id/receipt (PDF)', receiptRes.ok && receiptRes.bufferLength > 500,
        `| PDF Byte Size: ${receiptRes.bufferLength}`
      );
    }

    console.log(`\n====================================================`);
    console.log(`📊 Hasil Pengujian: ${passed} Berhasil, ${failed} Gagal`);
    console.log(`====================================================\n`);

  } catch (err) {
    console.error('Terjadi error saat pengujian:', err);
  }
}

runTests();

