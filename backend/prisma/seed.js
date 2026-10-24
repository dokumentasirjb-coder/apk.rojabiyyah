import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database Administrasi Rojabiyyaah...');

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.customFieldValue.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.reportMedia.deleteMany();
  await prisma.fieldReport.deleteMany();
  await prisma.taskPoint.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.loanStatusLog.deleteMany();
  await prisma.loanItem.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.member.deleteMany();
  await prisma.user.deleteMany();
  await prisma.region.deleteMany();
  await prisma.organizationSetting.deleteMany();

  console.log('🧹 Data lama berhasil dibersihkan');

  // 2. Organization Setting
  await prisma.organizationSetting.create({
    data: {
      orgName: 'Administrasi Rojabiyyaah',
      orgTagline: 'Sistem Informasi Manajemen & Logistik Terpadu',
      logoUrl: '/logo-rojabiyyah.png',
      address: 'Gedung Dakwah Rojabiyyaah, Jl. Gatot Subroto No. 88, Bandung',
      contactPhone: '022-87654321',
      contactEmail: 'sekretariat@rojabiyyaah.org',
      themeConfig: {
        primaryColor: '#6366f1',
        accentColor: '#06b6d4',
        defaultMode: 'dark',
      },
    },
  });

  // 3. Regions
  const regPusat = await prisma.region.create({
    data: {
      name: 'Wilayah Pusat (Bandung Kota)',
      code: 'REG-PST',
      description: 'Cakupan area operasional pusat kegiatan dan sekretariat utama',
    },
  });

  const regBarat = await prisma.region.create({
    data: {
      name: 'Wilayah Barat (Cimahi & KBB)',
      code: 'REG-BRT',
      description: 'Cakupan operasional koordinasi zona barat',
    },
  });

  const regTimur = await prisma.region.create({
    data: {
      name: 'Wilayah Timur (Ujungberung & Cibiru)',
      code: 'REG-TMR',
      description: 'Cakupan zona timur dan kampus mitra',
    },
  });

  // 4. Users & Members
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const anggotaPasswordHash = await bcrypt.hash('anggota123', 10);

  // Super Admin
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@rojabiyyaah.org',
      password: adminPasswordHash,
      role: 'SUPER_ADMIN',
    },
  });

  // Anggota 1
  const anggota1User = await prisma.user.create({
    data: {
      username: 'ahmad',
      email: 'ahmad@rojabiyyaah.org',
      password: anggotaPasswordHash,
      role: 'ANGGOTA',
    },
  });

  const memberAhmad = await prisma.member.create({
    data: {
      userId: anggota1User.id,
      memberId: 'RJB-001',
      fullName: 'Ahmad Fauzi',
      phone: '081234567890',
      address: 'Jl. Melati No. 12, Bandung',
      regionId: regPusat.id,
      status: 'ACTIVE',
      notes: 'Koordinator Perlengkapan & Dokumentasi',
    },
  });

  // Anggota 2
  const anggota2User = await prisma.user.create({
    data: {
      username: 'siti',
      email: 'siti@rojabiyyaah.org',
      password: anggotaPasswordHash,
      role: 'ANGGOTA',
    },
  });

  const memberSiti = await prisma.member.create({
    data: {
      userId: anggota2User.id,
      memberId: 'RJB-002',
      fullName: 'Siti Rahmah',
      phone: '081298765432',
      address: 'Jl. Mawar No. 45, Cimahi',
      regionId: regBarat.id,
      status: 'ACTIVE',
      notes: 'Penanggung Jawab Kontrol Wilayah Zona Barat',
    },
  });

  // 5. Institutions (Mitra Lembaga Pihak Luar)
  const instHikmah = await prisma.institution.create({
    data: {
      name: 'Yayasan Al-Hikmah Bandung',
      contactPerson: 'Ust. Ridwan Kamiludin',
      phone: '081322114455',
      address: 'Jl. Dago Asri No. 10, Bandung',
      notes: 'Mitra kerja sama perlengkapan proyektor & audio panggung',
    },
  });

  const instMedia = await prisma.institution.create({
    data: {
      name: 'Studio Media Kreatif Nusantara',
      contactPerson: 'Bpk. Budi Santoso',
      phone: '085712345678',
      address: 'Jl. Buah Batu No. 120, Bandung',
      notes: 'Penyedia perlengkapan siaran video profesional',
    },
  });

  // 6. Categories
  const catAudio = await prisma.category.create({
    data: {
      name: 'Audio & Sound System',
      type: 'INVENTORY',
      description: 'Mikrofon, mixer, speaker, dan perkabelan audio',
    },
  });

  const catVisual = await prisma.category.create({
    data: {
      name: 'Multimedia & Visual',
      type: 'INVENTORY',
      description: 'Kamera, proyektor, switcher video, dan lighting',
    },
  });

  const catKomunikasi = await prisma.category.create({
    data: {
      name: 'Alat Komunikasi & HT',
      type: 'INVENTORY',
      description: 'Handy Talky dan perangkat komunikasi panitia',
    },
  });

  // Transaction Categories
  const catInfaq = await prisma.category.create({
    data: {
      name: 'Donasi & Infaq Kegiatan',
      type: 'TRANSACTION_INCOME',
      description: 'Penerimaan dana infaq dari para muhsinin dan jamaah',
    },
  });

  const catIuran = await prisma.category.create({
    data: {
      name: 'Iuran Kas Anggota',
      type: 'TRANSACTION_INCOME',
      description: 'Penerimaan kas bulanan anggota organisasi',
    },
  });

  const catOperasional = await prisma.category.create({
    data: {
      name: 'Operasional Lapangan',
      type: 'TRANSACTION_EXPENSE',
      description: 'Transport, bensin, dan perlengkapan kegiatan harian',
    },
  });

  const catMaintenance = await prisma.category.create({
    data: {
      name: 'Servis & Pemeliharaan Alat',
      type: 'TRANSACTION_EXPENSE',
      description: 'Perbaikan barang inventaris yang mengalami gangguan',
    },
  });

  // Task Point Categories
  const catDokumentasi = await prisma.category.create({
    data: {
      name: 'Dokumentasi',
      type: 'TASK_POINT',
      description: 'Titik pemantauan foto dan pelaporan kegiatan',
    },
  });

  const catFoto = await prisma.category.create({
    data: {
      name: 'Foto',
      type: 'TASK_POINT',
      description: 'Pos liputan fotografi resmi',
    },
  });

  const catVideo = await prisma.category.create({
    data: {
      name: 'Video',
      type: 'TASK_POINT',
      description: 'Pos kamera rekaman dan live streaming video',
    },
  });

  const catProyektor = await prisma.category.create({
    data: {
      name: 'Proyektor',
      type: 'TASK_POINT',
      description: 'Pos penayangan layar videotron/proyektor',
    },
  });

  // 7. Inventory Items
  const itemKamera = await prisma.inventoryItem.create({
    data: {
      code: 'INV-001',
      name: 'Kamera Sony Alpha A7 III + Lensa 24-70mm',
      categoryId: catVisual.id,
      quantity: 2,
      availableQuantity: 1, // 1 sedang dipinjam Ahmad
      condition: 'GOOD',
      location: 'Gudang Inventaris - Lemari Elektronik A1',
      source: 'INTERNAL',
      notes: 'Lengkap dengan baterai cadangan & charger kit',
    },
  });

  const itemMic = await prisma.inventoryItem.create({
    data: {
      code: 'INV-002',
      name: 'Wireless Mic Sennheiser EW 100 G4 (2 Unit)',
      categoryId: catAudio.id,
      quantity: 4,
      availableQuantity: 4,
      condition: 'GOOD',
      location: 'Gudang Inventaris - Kotak Hardcase Audio B2',
      source: 'INTERNAL',
      notes: 'Baterai AA cadangan di tas samping',
    },
  });

  const itemProyektor = await prisma.inventoryItem.create({
    data: {
      code: 'INV-003',
      name: 'Proyektor Epson EB-2250U 5000 ANSI Lumens',
      categoryId: catVisual.id,
      quantity: 2,
      availableQuantity: 2,
      condition: 'GOOD',
      location: 'Gudang Inventaris - Rak Multimedia C1',
      source: 'LOAN_FROM_INSTITUTION',
      institutionId: instHikmah.id,
      notes: 'Pinjaman dari Yayasan Al-Hikmah untuk periode kegiatan tahunan',
    },
  });

  const itemHT = await prisma.inventoryItem.create({
    data: {
      code: 'INV-004',
      name: 'Handy Talky Baofeng UV-82 Dual Band',
      categoryId: catKomunikasi.id,
      quantity: 10,
      availableQuantity: 8,
      condition: 'GOOD',
      location: 'Gudang Inventaris - Kotak HT D1',
      source: 'INTERNAL',
      notes: 'Semua channel sudah di-set ke frekuensi resmi organisasi',
    },
  });

  // 8. Loans & Loan Items
  // Loan 1: Disetujui & Dipinjam oleh Ahmad Fauzi
  const loan1 = await prisma.loan.create({
    data: {
      loanCode: 'PJ-202610-001',
      borrowerType: 'MEMBER',
      memberId: memberAhmad.id,
      borrowerName: memberAhmad.fullName,
      startDate: new Date('2026-10-18T08:00:00Z'),
      endDate: new Date('2026-10-21T18:00:00Z'),
      purpose: 'Dokumentasi liputan kegiatan kajian akbar wilayah pusat',
      status: 'BORROWED',
      adminNotes: 'Sudah disetujui, harap menjaga kebersihan sensor kamera',
      approvedById: adminUser.id,
      loanItems: {
        create: [
          {
            inventoryItemId: itemKamera.id,
            quantity: 1,
            conditionBefore: 'GOOD',
            notes: 'Termasuk strap dan 2 baterai',
          },
        ],
      },
      statusLogs: {
        create: [
          {
            status: 'PENDING',
            changedById: adminUser.id,
            notes: 'Pengajuan peminjaman dibuat oleh Ahmad Fauzi',
          },
          {
            status: 'APPROVED',
            changedById: adminUser.id,
            notes: 'Disetujui oleh Super Admin',
          },
          {
            status: 'BORROWED',
            changedById: adminUser.id,
            notes: 'Barang telah diserahkan di gudang',
          },
        ],
      },
    },
  });

  // Loan 2: PENDING oleh Siti Rahmah
  const loan2 = await prisma.loan.create({
    data: {
      loanCode: 'PJ-202610-002',
      borrowerType: 'MEMBER',
      memberId: memberSiti.id,
      borrowerName: memberSiti.fullName,
      startDate: new Date('2026-10-22T08:00:00Z'),
      endDate: new Date('2026-10-23T20:00:00Z'),
      purpose: 'Operasional koordinasi tim lapangan kontrol wilayah barat',
      status: 'PENDING',
      adminNotes: null,
      loanItems: {
        create: [
          {
            inventoryItemId: itemHT.id,
            quantity: 2,
            conditionBefore: 'GOOD',
            notes: 'Untuk posko gerbang',
          },
        ],
      },
      statusLogs: {
        create: [
          {
            status: 'PENDING',
            notes: 'Pengajuan menunggu persetujuan Super Admin',
          },
        ],
      },
    },
  });

  // 9. Task Points (Titik Tugas)
  const tp1 = await prisma.taskPoint.create({
    data: {
      name: 'Titik Dokumentasi Panggung Utama',
      regionId: regPusat.id,
      categoryId: catDokumentasi.id,
      categoryName: 'Dokumentasi',
      address: 'Masjid Raya Al-Muhajirin, Jl. Asia Afrika No. 10',
      picMemberId: memberAhmad.id,
      schedule: 'Setiap Hari Kegiatan (07:30 - 17:00)',
      notes: 'Liputan utama jalannya tausiyah dan sesi tanya jawab',
    },
  });

  const tp2 = await prisma.taskPoint.create({
    data: {
      name: 'Posko Proyektor & Videotron Lapangan',
      regionId: regPusat.id,
      categoryId: catProyektor.id,
      categoryName: 'Proyektor',
      address: 'Plaza Luar Masjid Raya',
      picMemberId: memberSiti.id,
      schedule: 'Jumat - Ahad (08:00 - 21:00)',
      notes: 'Penayangan live streaming untuk jamaah di luar ruangan',
    },
  });

  const tp3 = await prisma.taskPoint.create({
    data: {
      name: 'Posko Registrasi & Liputan Gerbang Barat',
      regionId: regBarat.id,
      categoryId: catFoto.id,
      categoryName: 'Foto',
      address: 'Gerbang Utama Kompleks Cimahi',
      picMemberId: memberSiti.id,
      schedule: 'Setiap Sabtu (08:00 - 16:00)',
      notes: 'Foto kedatangan tamu undangan dan absensi',
    },
  });

  // 10. Field Reports (Laporan Lapangan)
  await prisma.fieldReport.create({
    data: {
      taskPointId: tp1.id,
      memberId: memberAhmad.id,
      status: 'GOOD',
      description: 'Semua peralatan panggung terpasang dengan baik. Sudut bidik kamera optimal dan pencahayaan cukup terang.',
      adminResponse: 'Terima kasih laporan detailnya, lanjutkan tugas.',
      isResolved: true,
      resolvedAt: new Date(),
      resolvedById: adminUser.id,
    },
  });

  await prisma.fieldReport.create({
    data: {
      taskPointId: tp2.id,
      memberId: memberSiti.id,
      status: 'ATTENTION_NEEDED',
      description: 'Kabel ekstensi proyektor agak kendor di dekat pintu gerbang samping, dikhawatirkan tersenggol jamaah.',
      adminResponse: 'Sudah diinstruksikan tim logistik cadangan untuk mengirim pelindung kabel (cable protector ramp).',
      isResolved: false,
    },
  });

  // 11. Transactions (Keuangan)
  await prisma.transaction.create({
    data: {
      code: 'TRX-202610-001',
      type: 'INCOME',
      categoryId: catInfaq.id,
      amount: 5000000,
      date: new Date('2026-10-01T10:00:00Z'),
      description: 'Infaq donatur utama untuk operasional kegiatan tabligh akbar',
      createdById: adminUser.id,
    },
  });

  await prisma.transaction.create({
    data: {
      code: 'TRX-202610-002',
      type: 'INCOME',
      categoryId: catIuran.id,
      amount: 1200000,
      date: new Date('2026-10-05T14:30:00Z'),
      description: 'Penerimaan iuran kas wajib anggota periode Oktober 2026',
      createdById: adminUser.id,
    },
  });

  await prisma.transaction.create({
    data: {
      code: 'TRX-202610-003',
      type: 'EXPENSE',
      categoryId: catMaintenance.id,
      amount: 450000,
      date: new Date('2026-10-10T11:15:00Z'),
      description: 'Servis pembersihan sensor dan pergantian baterai cadangan HT Baofeng',
      createdById: adminUser.id,
    },
  });

  await prisma.transaction.create({
    data: {
      code: 'TRX-202610-004',
      type: 'EXPENSE',
      categoryId: catOperasional.id,
      amount: 350000,
      date: new Date('2026-10-15T09:00:00Z'),
      description: 'Pembelian konsumsi dan air mineral tim lapangan kontrol wilayah',
      createdById: adminUser.id,
    },
  });

  // 12. Custom Fields
  await prisma.customField.create({
    data: {
      module: 'INVENTORY',
      fieldName: 'serial_number',
      fieldLabel: 'Nomor Seri Pabrik (S/N)',
      fieldType: 'TEXT',
      isRequired: false,
    },
  });

  await prisma.customField.create({
    data: {
      module: 'TASK_POINT',
      fieldName: 'streaming_url',
      fieldLabel: 'Tautan Live Monitoring',
      fieldType: 'TEXT',
      isRequired: false,
    },
  });

  // 13. Notifications
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: 'Pengajuan Peminjaman Baru',
      message: 'Siti Rahmah mengajukan peminjaman 2 unit Handy Talky Baofeng (PJ-202610-002)',
      type: 'WARNING',
      link: '/admin/loans',
    },
  });

  await prisma.notification.create({
    data: {
      userId: anggota1User.id,
      title: 'Peminjaman Disetujui',
      message: 'Pengajuan peminjaman Kamera Sony Alpha A7 III (PJ-202610-001) telah disetujui oleh Super Admin.',
      type: 'SUCCESS',
      link: '/member/loans',
    },
  });

  // 14. Activity Log
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      module: 'SYSTEM',
      details: 'Sistem diinisialisasi dan data awal (seeding) berhasil dimuat ke database MySQL',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Seeding berhasil selesai dengan sempurna!');
  console.log('----------------------------------------------------');
  console.log('Akun Super Admin:');
  console.log('  Username: admin');
  console.log('  Email   : admin@rojabiyyah.org');
  console.log('  Password: admin123');
  console.log('----------------------------------------------------');
  console.log('Akun Anggota 1:');
  console.log('  Username: ahmad');
  console.log('  Password: anggota123');
  console.log('Akun Anggota 2:');
  console.log('  Username: siti');
  console.log('  Password: anggota123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

