/**
 * Password Validation Utility
 *
 * Validates password strength based on security best practices:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly UPPERCASE_REGEX = /[A-Z]/;
  private static readonly LOWERCASE_REGEX = /[a-z]/;
  private static readonly NUMBER_REGEX = /[0-9]/;
  private static readonly SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

  /**
   * Validate password strength
   */
  static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password minimal ${this.MIN_LENGTH} karakter`);
    }

    // Check uppercase
    if (!this.UPPERCASE_REGEX.test(password)) {
      errors.push("Password harus mengandung minimal 1 huruf besar (A-Z)");
    }

    // Check lowercase
    if (!this.LOWERCASE_REGEX.test(password)) {
      errors.push("Password harus mengandung minimal 1 huruf kecil (a-z)");
    }

    // Check number
    if (!this.NUMBER_REGEX.test(password)) {
      errors.push("Password harus mengandung minimal 1 angka (0-9)");
    }

    // Check special character
    if (!this.SPECIAL_CHAR_REGEX.test(password)) {
      errors.push("Password harus mengandung minimal 1 karakter spesial (!@#$%^&*...)");
    }

    // Determine strength
    const strength = this.calculateStrength(password, errors.length);

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Calculate password strength
   */
  private static calculateStrength(
    password: string,
    errorCount: number
  ): "weak" | "medium" | "strong" {
    if (errorCount > 2) return "weak";
    if (errorCount > 0) return "medium";

    // Strong password: no errors + length >= 12
    if (password.length >= 12) return "strong";

    return "medium";
  }

  /**
   * Check if password contains common patterns
   */
  static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      /^123456/,
      /^password/i,
      /^qwerty/i,
      /^abc123/i,
      /^111111/,
      /^admin/i,
      /^letmein/i,
      /^welcome/i,
    ];

    return commonPatterns.some((pattern) => pattern.test(password));
  }

  /**
   * Get user-friendly error message
   */
  static getErrorMessage(result: PasswordValidationResult): string {
    if (result.isValid) return "";

    return result.errors.join(". ");
  }
}
