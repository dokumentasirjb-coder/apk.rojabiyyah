import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateExcel } from '../utils/export.js';

export class MemberService {
  static async getAll({ search, regionId, status, division, domicile, shirtSize, page = 1, limit = 10 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (regionId) where.regionId = parseInt(regionId);
    if (division) where.division = division;
    if (domicile) where.domicile = { contains: domicile };
    if (shirtSize) where.shirtSize = shirtSize;

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { memberId: { contains: search } },
        { phone: { contains: search } },
        { division: { contains: search } },
        { education: { contains: search } },
        { domicile: { contains: search } },
        { user: { username: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, members] = await Promise.all([
      prisma.member.count({ where }),
      prisma.member.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
          region: true,
          _count: {
            select: {
              loans: true,
              taskPoints: true,
              fieldReports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getById(id) {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true, email: true, role: true, createdAt: true },
        },
        region: true,
        loans: {
          include: {
            loanItems: {
              include: { inventoryItem: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        taskPoints: {
          include: { region: true },
        },
        fieldReports: {
          include: { taskPoint: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!member) {
      throw new AppError('Anggota tidak ditemukan', 404);
    }

    return member;
  }

  static async create(payload, avatarPath = null) {
    const {
      username,
      email,
      password,
      role = 'ANGGOTA',
      memberId: customMemberId,
      fullName,
      division,
      education,
      grade,
      domicile,
      shirtSize,
      phone,
      address,
      regionId,
      status = 'ACTIVE',
      notes,
    } = payload;

    // 1. Generate unique Member ID if omitted
    let memberId = customMemberId;
    if (!memberId) {
      let candidateNum = (await prisma.member.count()) + 1;
      memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
      while (await prisma.member.findUnique({ where: { memberId } })) {
        candidateNum++;
        memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
      }
    } else {
      const existingMember = await prisma.member.findUnique({ where: { memberId } });
      if (existingMember) {
        throw new AppError(`ID Anggota '${memberId}' sudah digunakan`, 409);
      }
    }

    // 2. Validate regionId safely
    let validRegionId = null;
    if (regionId) {
      const reg = await prisma.region.findUnique({ where: { id: parseInt(regionId) } });
      if (reg) validRegionId = reg.id;
    }

    // 3. User account is optional!
    let userId = null;
    if (username && password) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, ...(email ? [{ email }] : [])],
        },
      });
      if (existingUser) {
        throw new AppError('Username atau Email sudah terdaftar', 409);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          email: email || `${username.toLowerCase()}@rojabiyyaah.local`,
          password: hashedPassword,
          role,
        },
      });
      userId = user.id;
    }

    // 4. Create Member
    return await prisma.member.create({
      data: {
        userId,
        memberId,
        fullName,
        division: division || null,
        education: education || null,
        grade: grade || null,
        domicile: domicile || null,
        shirtSize: shirtSize || null,
        phone: phone || null,
        address: address || null,
        regionId: validRegionId,
        status,
        notes: notes || null,
        avatar: avatarPath,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, role: true },
        },
        region: true,
      },
    });
  }

  static async publicRegister(payload) {
    const {
      fullName,
      division,
      education,
      grade,
      domicile,
      shirtSize,
      phone,
      address,
      regionId,
      createAccount = false,
      username,
      email,
      password,
      ipAddress,
      userAgent,
    } = payload;

    // 1. Generate unique Member ID
    let candidateNum = (await prisma.member.count()) + 1;
    let memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
    while (await prisma.member.findUnique({ where: { memberId } })) {
      candidateNum++;
      memberId = `RJB-${String(candidateNum).padStart(3, '0')}`;
    }

    // 2. Validate Region
    let validRegionId = null;
    if (regionId) {
      const reg = await prisma.region.findUnique({ where: { id: parseInt(regionId) } });
      if (reg) validRegionId = reg.id;
    }

    // 3. Optional user account creation
    let userId = null;
    if (createAccount && username && password) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, ...(email ? [{ email: email.toLowerCase() }] : [])],
        },
      });
      if (existingUser) {
        throw new AppError('Username atau Email sudah terdaftar. Silakan pilih username lain.', 409);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          email: email ? email.toLowerCase() : `${username.toLowerCase()}@rojabiyyaah.local`,
          password: hashedPassword,
          role: 'ANGGOTA',
        },
      });
      userId = user.id;
    }

    // 4. Create Member
    const member = await prisma.member.create({
      data: {
        userId,
        memberId,
        fullName,
        division: division || null,
        education: education || null,
        grade: grade || null,
        domicile: domicile || null,
        shirtSize: shirtSize || null,
        phone: phone || null,
        address: address || null,
        regionId: validRegionId,
        status: 'ACTIVE',
      },
      include: {
        region: true,
        user: {
          select: { id: true, username: true, email: true, role: true },
        },
      },
    });

    // 5. Notify Super Admins
    try {
      const admins = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Pendaftaran Anggota Baru (PSB)',
            message: `${fullName} mendaftar sebagai anggota baru (Dev: ${division || '-'}).`,
            type: 'INFO',
            link: '/admin/members',
          },
        });
      }
      if (userId) {
        await prisma.activityLog.create({
          data: {
            userId,
            action: 'PUBLIC_REGISTER',
            module: 'MEMBER',
            details: `Pendaftaran mandiri oleh ${fullName} (${memberId}) dengan akun pengguna`,
            ipAddress,
            userAgent,
          },
        });
      }
    } catch {
      // non-blocking
    }

    return member;
  }

  static async update(id, payload, avatarPath = null, currentUserId = null, currentUserRole = 'ANGGOTA') {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!member) {
      throw new AppError('Anggota tidak ditemukan', 404);
    }

    // Authorization check: If not super admin, can only edit their own profile
    if (currentUserRole !== 'SUPER_ADMIN' && member.userId !== currentUserId) {
      throw new AppError('Anda hanya diizinkan untuk mengubah profil Anda sendiri', 403);
    }

    const {
      fullName,
      division,
      education,
      grade,
      domicile,
      shirtSize,
      phone,
      address,
      regionId,
      status,
      notes,
      email,
      role,
    } = payload;

    return await prisma.$transaction(async (tx) => {
      // Update User if needed (only admin can change role)
      if (member.userId && (email || (role && currentUserRole === 'SUPER_ADMIN'))) {
        const updateUserData = {};
        if (email) updateUserData.email = email;
        if (role && currentUserRole === 'SUPER_ADMIN') updateUserData.role = role;
        await tx.user.update({
          where: { id: member.userId },
          data: updateUserData,
        });
      }

      const updateMemberData = {};
      if (fullName !== undefined) updateMemberData.fullName = fullName;
      if (division !== undefined) updateMemberData.division = division;
      if (education !== undefined) updateMemberData.education = education;
      if (grade !== undefined) updateMemberData.grade = grade;
      if (domicile !== undefined) updateMemberData.domicile = domicile;
      if (shirtSize !== undefined) updateMemberData.shirtSize = shirtSize;
      if (phone !== undefined) updateMemberData.phone = phone;
      if (address !== undefined) updateMemberData.address = address;
      if (notes !== undefined) updateMemberData.notes = notes;
      if (avatarPath) updateMemberData.avatar = avatarPath;

      // Only super admin can change status and region
      if (currentUserRole === 'SUPER_ADMIN') {
        if (status !== undefined) updateMemberData.status = status;
        if (regionId !== undefined) updateMemberData.regionId = regionId ? parseInt(regionId) : null;
      }

      return await tx.member.update({
        where: { id: parseInt(id) },
        data: updateMemberData,
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
          region: true,
        },
      });
    });
  }

  static async delete(id) {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
    });

    if (!member) {
      throw new AppError('Anggota tidak ditemukan', 404);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.member.delete({
        where: { id: parseInt(id) },
      });

      if (member.userId) {
        await tx.user.delete({
          where: { id: member.userId },
        });
      }
    });
  }

  static async resetPassword(id, newPassword) {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!member || !member.userId) {
      throw new AppError('Anggota atau akun pengguna tidak ditemukan', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: member.userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return true;
  }

  static async exportData({ search, regionId, status, division, domicile }) {
    const where = {};
    if (status) where.status = status;
    if (regionId) where.regionId = parseInt(regionId);
    if (division) where.division = division;
    if (domicile) where.domicile = { contains: domicile };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { memberId: { contains: search } },
        { phone: { contains: search } },
        { division: { contains: search } },
        { education: { contains: search } },
        { domicile: { contains: search } },
      ];
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: { id: 'asc' },
    });

    const columns = [
      { header: 'NO', key: 'no', width: 6, align: 'center' },
      { header: 'NAMA', key: 'name', width: 30 },
      { header: 'DEV', key: 'division', width: 25 },
      { header: 'PENDIDIKAN', key: 'education', width: 20 },
      { header: 'KELAS', key: 'grade', width: 14, align: 'center' },
      { header: 'DOMISILI', key: 'domicile', width: 22 },
      { header: 'SERAGAM', key: 'shirtSize', width: 12, align: 'center' },
      { header: 'NO WA', key: 'phone', width: 18 },
    ];

    const rows = members.map((m, idx) => ({
      no: idx + 1,
      name: m.fullName,
      division: m.division || '-',
      education: m.education || '-',
      grade: m.grade || '-',
      domicile: m.domicile || '-',
      shirtSize: m.shirtSize || '-',
      phone: m.phone || '-',
    }));

    return await generateExcel({
      title: 'Data Anggota Administrasi Rojabiyyaah',
      sheetName: 'Anggota',
      columns,
      rows,
    });
  }

  static async generateTemplate() {
    const columns = [
      { header: 'NO', key: 'no', width: 6, align: 'center' },
      { header: 'NAMA', key: 'name', width: 30 },
      { header: 'DEV', key: 'division', width: 25 },
      { header: 'PENDIDIKAN', key: 'education', width: 20 },
      { header: 'KELAS', key: 'grade', width: 14, align: 'center' },
      { header: 'DOMISILI', key: 'domicile', width: 22 },
      { header: 'SERAGAM', key: 'shirtSize', width: 12, align: 'center' },
      { header: 'NO WA', key: 'phone', width: 18 },
    ];

    const rows = [
      {
        no: 1,
        name: 'M. Nasrul Wathon',
        division: 'Koordinator',
        education: 'Abiturent',
        grade: '',
        domicile: 'Gresik',
        shirtSize: 'XXL',
        phone: '081234567890',
      },
      {
        no: 2,
        name: 'M. Abdul Muiz',
        division: 'Wakil Koordinator',
        education: 'UNWAHA',
        grade: '',
        domicile: 'Al-Muhibbin',
        shirtSize: 'XL',
        phone: '081234567891',
      },
    ];

    return await generateExcel({
      title: 'Template Import Data Anggota Rojabiyyaah',
      sheetName: 'Data Anggota',
      columns,
      rows,
    });
  }

  static async importExcel(filePath, currentUserId, ipAddress, userAgent) {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new AppError('File Excel tidak ditemukan', 400);
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const ext = path.extname(filePath).toLowerCase();
      let worksheet = null;

      if (ext === '.csv') {
        // Read file header to detect delimiter (comma or semicolon)
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const firstLine = fileContent.split(/\r?\n/)[0] || '';
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const commaCount = (firstLine.match(/,/g) || []).length;
        const delimiter = semicolonCount > commaCount ? ';' : ',';

        worksheet = await workbook.csv.readFile(filePath, {
          parserOptions: { delimiter },
        });
      } else {
        try {
          await workbook.xlsx.readFile(filePath);
          worksheet = workbook.worksheets[0];
        } catch (xlsxErr) {
          // If zip central directory error occurred (e.g. CSV file renamed or uploaded)
          if (
            xlsxErr.message?.includes('central directory') ||
            xlsxErr.message?.includes('zip') ||
            xlsxErr.message?.includes('end of central directory')
          ) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const firstLine = fileContent.split(/\r?\n/)[0] || '';
            const semicolonCount = (firstLine.match(/;/g) || []).length;
            const commaCount = (firstLine.match(/,/g) || []).length;
            const delimiter = semicolonCount > commaCount ? ';' : ',';

            worksheet = await workbook.csv.readFile(filePath, {
              parserOptions: { delimiter },
            });
          } else {
            throw xlsxErr;
          }
        }
      }

      if (!worksheet) {
        throw new AppError('File Excel/CSV kosong atau tidak memiliki data yang dapat dibaca', 400);
      }

      // 1. Detect header row & map columns
      let headerRowNumber = null;
      let colMap = {};

      worksheet.eachRow((row, rowNumber) => {
        if (headerRowNumber) return; // already detected

        const rowValues = [];
        row.eachCell((cell, colNumber) => {
          let cellText = '';
          if (cell.value !== null && cell.value !== undefined) {
            if (typeof cell.value === 'object' && cell.value.text) cellText = String(cell.value.text);
            else if (typeof cell.value === 'object' && cell.value.result) cellText = String(cell.value.result);
            else cellText = String(cell.value);
          }
          const val = cellText.trim().toUpperCase();
          if (val) rowValues.push({ val, colNumber });
        });

        const hasName = rowValues.some((c) => c.val.includes('NAMA') || c.val.includes('NAME'));
        if (hasName) {
          headerRowNumber = rowNumber;
          rowValues.forEach(({ val, colNumber }) => {
            if (val.includes('NAMA') || val.includes('NAME')) colMap.fullName = colNumber;
            else if (val === 'DEV' || val.includes('DIVISI') || val.includes('DIVISION') || val.includes('BAGIAN')) colMap.division = colNumber;
            else if (val.includes('PENDIDIKAN') || val.includes('EDUCATION') || val.includes('SEKOLAH') || val.includes('INSTANSI')) colMap.education = colNumber;
            else if (val.includes('KELAS') || val.includes('TINGKAT') || val.includes('GRADE') || val.includes('ANGKATAN')) colMap.grade = colNumber;
            else if (val.includes('DOMISILI') || val.includes('ASRAMA') || val.includes('PONDOK') || val.includes('ALAMAT')) colMap.domicile = colNumber;
            else if (val.includes('SERAGAM') || val.includes('KAOS') || val.includes('BAJU') || val.includes('SIZE')) colMap.shirtSize = colNumber;
            else if (val.includes('WA') || val.includes('HP') || val.includes('PHONE') || val.includes('TELP') || val.includes('KONTAK')) colMap.phone = colNumber;
          });
        }
      });

      if (!headerRowNumber || !colMap.fullName) {
        throw new AppError(
          'Format kolom Excel tidak cocok. Pastikan terdapat kolom bertuliskan "NAMA", "DEV", "PENDIDIKAN", "DOMISILI", "SERAGAM", "NO WA".',
          400
        );
      }

      // 2. Parse data rows
      const extractedRows = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowNumber) return; // skip headers

        const getVal = (colNum) => {
          if (!colNum) return null;
          const cell = row.getCell(colNum);
          if (!cell || cell.value === null || cell.value === undefined) return null;
          let text = '';
          if (typeof cell.value === 'object' && cell.value.text) text = String(cell.value.text);
          else if (typeof cell.value === 'object' && cell.value.result) text = String(cell.value.result);
          else text = String(cell.value);
          const trimmed = text.trim();
          return trimmed === '' || trimmed === '-' ? null : trimmed;
        };

        const fullName = getVal(colMap.fullName);
        if (!fullName || fullName.length < 2) return; // skip empty rows

        let phone = getVal(colMap.phone);
        if (phone) {
          phone = phone.replace(/[^0-9+]/g, '');
          if (phone.startsWith('62')) phone = '0' + phone.substring(2);
          else if (phone.startsWith('+62')) phone = '0' + phone.substring(3);
        }

        extractedRows.push({
          fullName,
          division: getVal(colMap.division),
          education: getVal(colMap.education),
          grade: getVal(colMap.grade),
          domicile: getVal(colMap.domicile),
          shirtSize: getVal(colMap.shirtSize),
          phone,
        });
      });

      if (extractedRows.length === 0) {
        throw new AppError('Tidak ada baris data anggota yang valid ditemukan di dalam file Excel', 400);
      }

      // 3. Batch insert members with sequential RJB-XXX IDs
      let count = await prisma.member.count();
      const createdMembers = [];

      for (const item of extractedRows) {
        count++;
        let memberId = `RJB-${String(count).padStart(3, '0')}`;
        while (await prisma.member.findUnique({ where: { memberId } })) {
          count++;
          memberId = `RJB-${String(count).padStart(3, '0')}`;
        }

        const created = await prisma.member.create({
          data: {
            memberId,
            fullName: item.fullName,
            division: item.division || null,
            education: item.education || null,
            grade: item.grade || null,
            domicile: item.domicile || null,
            shirtSize: item.shirtSize || null,
            phone: item.phone || null,
            status: 'ACTIVE',
          },
        });

        createdMembers.push(created);
      }

      // 4. Record Activity Log
      await prisma.activityLog.create({
        data: {
          userId: currentUserId,
          action: 'IMPORT_EXCEL',
          module: 'MEMBER',
          details: `Berhasil mengimpor ${createdMembers.length} data anggota dari file Excel`,
          ipAddress,
          userAgent,
        },
      });

      return {
        totalImported: createdMembers.length,
        members: createdMembers,
      };
    } finally {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // ignore
      }
    }
  }
}

