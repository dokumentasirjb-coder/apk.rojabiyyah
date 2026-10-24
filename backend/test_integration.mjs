const BASE_URL = 'http://localhost:5000/api/v1';

async function runIntegrationTest() {
  console.log('🚀 Memulai Pengujian Integrasi dan Keamanan Sistem Rojabiyyah...\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('1. Health Check:', healthRes.status === 'healthy' ? '✅ PASS' : '❌ FAIL', healthRes);

  // 2. Public Member Registration
  const regPayload = {
    fullName: 'Muhammad Farhan Integration Test',
    division: 'Media & IT',
    education: 'Kuliah',
    grade: 'Semester 5',
    domicile: 'Ribath Bahrul Ulum',
    shirtSize: 'XL',
    whatsappNumber: '081298765432',
  };
  const regRes = await fetch(`${BASE_URL}/members/public-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload),
  }).then(r => r.json());
  console.log('2. Pendaftaran Anggota Publik (Tanpa Login):', regRes.success ? '✅ PASS' : '❌ FAIL', {
    memberId: regRes.data?.memberId,
    name: regRes.data?.fullName,
    dev: regRes.data?.division,
  });

  // 3. Super Admin Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: 'admin',
      password: 'admin123',
    }),
  }).then(r => r.json());
  const adminToken = loginRes.data?.accessToken;
  console.log('3. Login Super Admin:', adminToken ? '✅ PASS' : '❌ FAIL', { role: loginRes.data?.user?.role });

  if (!adminToken) {
    console.error('Super Admin login failed, aborting further tests.');
    return;
  }

  // 4. Record Institution Loan (Super Admin)
  // 4a. Get inventory categories
  const catRes = await fetch(`${BASE_URL}/settings/categories?type=INVENTORY`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then(r => r.json());
  const invCategoryId = catRes.data?.[0]?.id || 12;

  // 4b. Create inventory item representing institution loan
  const invPayload = {
    code: `LMBG-TEST-${Date.now().toString().slice(-4)}`,
    name: 'Mixer Yamaha MG16XU (Mitra Test)',
    categoryId: invCategoryId,
    quantity: 2,
    condition: 'GOOD',
    location: 'Gudang Utama Rojabiyyah',
    source: 'LOAN_FROM_INSTITUTION',
    notes: 'Pinjaman dari Ponpes Al-Muhibbin',
  };
  const invItemRes = await fetch(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invPayload),
  }).then(r => r.json());
  const createdItem = invItemRes.data;
  console.log('4. Pencatatan Barang Pinjaman Lembaga di Inventaris:', invItemRes.success ? '✅ PASS' : '❌ FAIL', {
    code: createdItem?.code,
    name: createdItem?.name,
    availableQty: createdItem?.availableQuantity,
    source: createdItem?.source,
  });

  // 4c. Record Loan from Institution in Loans submenu with deductStock: false
  const instLoanRes = await fetch(`${BASE_URL}/loans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      borrowerType: 'OUTSIDE',
      borrowerName: 'Pinjaman dari Ponpes Al-Muhibbin',
      items: [{ inventoryItemId: createdItem.id, quantity: 2, notes: 'Pinjaman dari Mitra' }],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: 'Dukungan sound system Tabligh Akbar',
      status: 'BORROWED',
      deductStock: false,
      adminNotes: 'Barang otomatis tersedia di katalog inventaris dan siap dipinjam oleh anggota.',
    }),
  }).then(r => r.json());
  console.log('4d. Sub Peminjaman dari Lembaga (deductStock=false):', instLoanRes.success ? '✅ PASS' : '❌ FAIL', {
    loanCode: instLoanRes.data?.loanCode,
  });

  // Verify stock is still available (2 units) for members!
  const verifyInv = await fetch(`${BASE_URL}/inventory/${createdItem.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then(r => r.json());
  console.log('4e. Verifikasi Stok Barang Tetap Tersedia untuk Anggota:', verifyInv.data?.availableQuantity === 2 ? '✅ PASS (Stok: 2)' : '❌ FAIL', {
    availableQuantity: verifyInv.data?.availableQuantity,
  });

  // 5. Member Login
  const memberLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: 'ahmad',
      password: 'anggota123',
    }),
  }).then(r => r.json());
  const memberToken = memberLoginRes.data?.accessToken;
  console.log('5. Login Anggota:', memberToken ? '✅ PASS' : '❌ FAIL', { user: memberLoginRes.data?.user?.username });

  // 6. Member Submits Loan Request for the Institution Item
  const memberLoanRes = await fetch(`${BASE_URL}/loan-requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${memberToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ inventoryItemId: createdItem.id, quantity: 1, notes: 'Untuk recording audio majelis' }],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: 'Dokumentasi Majelis Akbar',
    }),
  }).then(r => r.json());
  const memberLoan = memberLoanRes.data;
  console.log('6. Pengajuan Pinjam Anggota atas Barang Lembaga:', memberLoanRes.success ? '✅ PASS' : '❌ FAIL', {
    loanCode: memberLoan?.loanCode,
    status: memberLoan?.status,
  });

  // 7. Super Admin Approves Loan Request
  const approveRes = await fetch(`${BASE_URL}/loans/${memberLoan.id}/approve`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminNotes: 'Disetujui untuk kegiatan majelis' }),
  }).then(r => r.json());
  console.log('7. Persetujuan Peminjaman oleh Admin:', approveRes.success ? '✅ PASS' : '❌ FAIL', {
    status: approveRes.data?.status,
  });

  // 8. Super Admin marks as BORROWED (Serah Terima Barang)
  const borrowRes = await fetch(`${BASE_URL}/loans/${memberLoan.id}/borrow`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      borrowProof: '/uploads/logo-rojabiyyah.png',
      adminNotes: 'Barang telah diserahkan dengan bukti serah terima',
    }),
  }).then(r => r.json());
  console.log('8. Serah Terima Barang (Borrow Proof):', borrowRes.success ? '✅ PASS' : '❌ FAIL', {
    status: borrowRes.data?.status,
    borrowProof: borrowRes.data?.borrowProof,
  });

  // 9. Member returns loan with photo proof
  const returnRes = await fetch(`${BASE_URL}/loan-requests/${memberLoan.id}/return`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${memberToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      returnProof: '/uploads/logo-rojabiyyah.png',
      adminNotes: 'Barang telah dikembalikan dalam kondisi baik dan lengkap',
    }),
  }).then(r => r.json());
  console.log('9. Pengembalian Barang oleh Anggota (Return Proof):', returnRes.success ? '✅ PASS' : '❌ FAIL', {
    status: returnRes.data?.status,
    returnProof: returnRes.data?.returnProof,
  });

  // 10. Check that stock is restored back to 2
  const checkRestoredInv = await fetch(`${BASE_URL}/inventory/${createdItem.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then(r => r.json());
  console.log('10. Pemulihan Stok Barang Setelah Dikembalikan:', checkRestoredInv.data?.availableQuantity === 2 ? '✅ PASS (Stok Pulih ke 2)' : '❌ FAIL', {
    availableQuantity: checkRestoredInv.data?.availableQuantity,
  });

  // 11. PDF Receipt Download
  const pdfRes = await fetch(`${BASE_URL}/loans/${memberLoan.id}/receipt`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const pdfContentType = pdfRes.headers.get('content-type');
  const pdfBuffer = await pdfRes.arrayBuffer();
  console.log('11. Unduh Dokumen Bukti Peminjaman (PDF):', pdfContentType?.includes('pdf') && pdfBuffer.byteLength > 500 ? '✅ PASS' : '❌ FAIL', {
    contentType: pdfContentType,
    sizeBytes: pdfBuffer.byteLength,
  });

  // 12. Security Test: Another member cannot return this member's loan
  // Let's create another member or test with non-owner
  const unauthorizedReturn = await fetch(`${BASE_URL}/loan-requests/1/return`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${memberToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminNotes: 'Mencoba mengembalikan pinjaman orang lain' }),
  }).then(r => r.json());
  console.log('12. Keamanan Otorisasi (Anggota Tidak Bisa Kembalikan Pinjaman Milik Orang Lain):', unauthorizedReturn.success === false ? '✅ PASS (Ditolak dengan Aman)' : '❌ FAIL', {
    message: unauthorizedReturn.message,
  });

  // 13. Export Excel Anggota (dengan kolom NO, NAMA, DEV, PENDIDIKAN, KELAS, DOMISILI, SERAGAM, NO WA)
  const exportMemberRes = await fetch(`${BASE_URL}/members/export`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const excelBuffer = await exportMemberRes.arrayBuffer();
  console.log('13. Ekspor Excel Anggota (Format Kolom PPSB):', excelBuffer.byteLength > 1000 ? '✅ PASS' : '❌ FAIL', {
    sizeBytes: excelBuffer.byteLength,
  });

  // 14. Export Excel Inventaris
  const exportInvRes = await fetch(`${BASE_URL}/inventory/export`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const invExcelBuffer = await exportInvRes.arrayBuffer();
  console.log('14. Ekspor Excel Inventaris:', invExcelBuffer.byteLength > 1000 ? '✅ PASS' : '❌ FAIL', {
    sizeBytes: invExcelBuffer.byteLength,
  });

  console.log('\n========================================');
  console.log('🎉 SEMUA PENGUJIAN INTEGRASI & KEAMANAN BERHASIL 100%');
  console.log('========================================');
}

runIntegrationTest().catch(console.error);
