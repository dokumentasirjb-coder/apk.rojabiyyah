import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('✅ Berhasil terhubung ke database MySQL (Laragon)');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server Administrasi Rojabiyyaah berjalan pada: http://localhost:${PORT}`);
      console.log(`📚 Dokumentasi Swagger API: http://localhost:${PORT}/api/docs`);
    });

    const shutdown = async (signal) => {
      console.log(`\nMenutup server (${signal})...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Koneksi database ditutup. Sampai jumpa!');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

