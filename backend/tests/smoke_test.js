import assert from 'node:assert';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ALLOWED_UAEMEX_DOMAINS } from '../src/middlewares/validateDomain.js';

test('Validación de Dominios Institucionales UAEMex', () => {
  const validEmails = [
    'carlos.lopez@alumno.uaemex.mx',
    'mario.docente@profesor.uaemex.mx',
    'rectoria@uaemex.mx',
  ];

  const invalidEmails = [
    'juan.perez@gmail.com',
    'usuario@hotmail.com',
    'estudiante@yahoo.es',
    'estudiante@alumno.uaemex.mx.fake.com',
  ];

  for (const email of validEmails) {
    const isValid = ALLOWED_UAEMEX_DOMAINS.some(domain => email.endsWith(domain));
    assert.strictEqual(isValid, true, `Debe aceptar correo institucional: ${email}`);
  }

  for (const email of invalidEmails) {
    const isValid = ALLOWED_UAEMEX_DOMAINS.some(domain => email.endsWith(domain));
    assert.strictEqual(isValid, false, `Debe rechazar correo no institucional: ${email}`);
  }
});

test('Cifrado seguro de contraseñas con bcrypt', async () => {
  const rawPassword = 'PasswordUAEMex2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);

  assert.notStrictEqual(hash, rawPassword);
  const isMatch = await bcrypt.compare(rawPassword, hash);
  assert.strictEqual(isMatch, true, 'El hash generado debe coincidir con la contraseña original');
  
  const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isWrongMatch, false, 'Contraseña incorrecta debe ser rechazada');
});

test('Generación y verificación de Tokens JWT', () => {
  const payload = {
    id: 'user-uuid-1234',
    email: 'estudiante@alumno.uaemex.mx',
    role: 'student',
    facultyId: 'fac-uuid-5678',
  };

  const secret = 'test_secret_key_uaemex';
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = jwt.verify(token, secret);
  assert.strictEqual(decoded.email, 'estudiante@alumno.uaemex.mx');
  assert.strictEqual(decoded.role, 'student');
});
