import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { loginSchema, changePasswordSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoint Otentikasi dan Manajemen Sesi
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login pengguna (Super Admin / Anggota)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Berhasil masuk
 *       401:
 *         description: Kredensial tidak valid
 */
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Pendaftaran akun anggota baru mandiri
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               regionId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Berhasil mendaftar
 *       409:
 *         description: Username atau email telah digunakan
 */
router.post('/register', authLimiter, validate(registerSchema), AuthController.register);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Memperbarui Access Token lewat Refresh Token cookie/body
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token berhasil diperbarui
 *       401:
 *         description: Refresh token tidak valid atau kedaluwarsa
 */
router.post('/refresh', AuthController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout dan cabut sesi
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil logout
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Dapatkan profil pengguna saat ini
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data profil pengguna
 */
router.get('/me', authenticate, AuthController.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Ganti kata sandi pengguna
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kata sandi berhasil diganti
 */
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;

