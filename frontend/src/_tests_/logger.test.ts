import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { devLog, devWarn, devError } from '../lib/logger';

describe('logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('devLog', () => {
    it('should redact sensitive keys in objects', () => {
      const sensitiveData = {
        username: 'testuser',
        password: 'secret123',
        totp: '123456',
        access_token: 'token123',
      };

      devLog(sensitiveData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          password: '***REDACTED***',
          totp: '***REDACTED***',
          access_token: '***REDACTED***',
        })
      );
    });

    it('should handle null and undefined values', () => {
      devLog(null, undefined);
      expect(consoleLogSpy).toHaveBeenCalledWith(null, undefined);
    });

    it('should handle primitive types', () => {
      devLog('test', 123, true);
      expect(consoleLogSpy).toHaveBeenCalledWith('test', 123, true);
    });

    it('should redact nested sensitive keys', () => {
      const nestedData = {
        user: {
          name: 'test',
          password: 'secret',
          totp_secret: 'secret_key',
        },
      };

      devLog(nestedData);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            name: 'test',
            password: '***REDACTED***',
            totp_secret: '***REDACTED***',
          }),
        })
      );
    });

    it('should redact all sensitive keys', () => {
      const allSensitiveKeys = {
        password: 'pass',
        totp: 'totp',
        totp_code: 'code',
        totp_secret: 'secret',
        qr_code_base64: 'qr',
        access_token: 'access',
        refresh_token: 'refresh',
        secret: 'secret',
        privateKey: 'private',
        private_key: 'key',
      };

      devLog(allSensitiveKeys);

      const call = consoleLogSpy.mock.calls[0][0];
      expect(call.password).toBe('***REDACTED***');
      expect(call.totp).toBe('***REDACTED***');
      expect(call.totp_code).toBe('***REDACTED***');
      expect(call.totp_secret).toBe('***REDACTED***');
      expect(call.qr_code_base64).toBe('***REDACTED***');
      expect(call.access_token).toBe('***REDACTED***');
      expect(call.refresh_token).toBe('***REDACTED***');
      expect(call.secret).toBe('***REDACTED***');
      expect(call.privateKey).toBe('***REDACTED***');
      expect(call.private_key).toBe('***REDACTED***');
    });
  });

  describe('devWarn', () => {
    it('should redact sensitive data in warnings', () => {
      const sensitiveData = {
        message: 'Warning',
        secret: 'topsecret',
      };

      devWarn(sensitiveData);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Warning',
          secret: '***REDACTED***',
        })
      );
    });

    it('should handle multiple arguments', () => {
      devWarn('Warning:', { password: 'secret' }, 'Another message');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Warning:',
        expect.objectContaining({ password: '***REDACTED***' }),
        'Another message'
      );
    });
  });

  describe('devError', () => {
    it('should redact sensitive data in errors', () => {
      const sensitiveError = {
        error: 'Authentication failed',
        access_token: 'token123',
        privateKey: 'key123',
      };

      devError(sensitiveError);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication failed',
          access_token: '***REDACTED***',
          privateKey: '***REDACTED***',
        })
      );
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      devError(error);

      // Error objects get converted through JSON.parse/stringify
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
