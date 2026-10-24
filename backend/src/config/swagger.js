import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Administrasi Rojabiyyaah API Documentation',
    version: '1.0.0',
    description: `
Dokumentasi RESTful API untuk Sistem Administrasi Rojabiyyaah.
Mencakup modul Inventaris, Peminjaman Barang, Data Anggota, Kontrol Wilayah, Rekap Keuangan, dan Pengaturan Sistem.
    `,
    contact: {
      name: 'Tim IT Rojabiyyaah',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan Access Token JWT (Format: Bearer <token>)',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/routes/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

