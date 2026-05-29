# 🔐 Security Guidelines - Instafy

**Last Updated:** 29 Mei 2026

---

## 🚨 CRITICAL: Credentials Management

### ❌ NEVER DO THIS:

- ❌ Commit `.env`, `.env.production`, atau `.env.local` ke Git
- ❌ Hardcode passwords, API keys, atau secrets di source code
- ❌ Share credentials via email, Slack, atau chat
- ❌ Use weak secrets seperti "rahasia", "password123", dll

### ✅ ALWAYS DO THIS:

- ✅ Use `.env.example` sebagai template (tanpa nilai sebenarnya)
- ✅ Generate strong secrets dengan `openssl rand -base64 32`
- ✅ Store production secrets di AWS Secrets Manager atau environment variables
- ✅ Rotate secrets secara berkala (setiap 3-6 bulan)
- ✅ Use different secrets untuk development, staging, dan production

---

## 🔑 How to Generate Secure Secrets

### 1. JWT Secret & API Keys

```bash
# Generate 32-byte random string
openssl rand -base64 32

# Output example:
# 8xK9mP2nQ5vR7wT4yU6zA3bC1dE0fG8hJ9kL2mN5oP7q
```

### 2. Web Push VAPID Keys

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys

# Output:
# Public Key: BG9PGqXZ...
# Private Key: WqfeICFd...
```

### 3. Database Password

```bash
# Generate strong password (20 chars, alphanumeric + symbols)
openssl rand -base64 20 | tr -d "=+/" | cut -c1-20
```

---

## 🛡️ Security Checklist

### Before Deployment:

- [ ] All `.env` files are in `.gitignore`
- [ ] Pre-commit hook is installed and working
- [ ] All secrets are rotated from default/example values
- [ ] Rate limiting is enabled
- [ ] Input sanitization is implemented
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Security headers are set (CSP, X-Frame-Options, etc.)

### Regular Maintenance:

- [ ] Review security logs weekly
- [ ] Rotate secrets every 3-6 months
- [ ] Update dependencies monthly
- [ ] Run security audit quarterly
- [ ] Review access logs for suspicious activity

---

## 🚨 What to Do If Credentials Are Exposed

### Immediate Actions:

1. **Rotate ALL exposed credentials immediately**
   - Database password
   - JWT secret
   - API keys (Cloudinary, Pusher, etc.)
   - Web Push VAPID keys

2. **Remove from Git history** (if committed)

   ```bash
   # WARNING: This rewrites Git history!
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env.production" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (coordinate with team first!)
   git push origin --force --all
   ```

3. **Notify team and stakeholders**

4. **Monitor for suspicious activity**
   - Check database access logs
   - Check API usage logs
   - Check for unauthorized logins

5. **Document the incident**
   - What was exposed?
   - How long was it exposed?
   - What actions were taken?
   - How to prevent in the future?

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Web Security Academy](https://portswigger.net/web-security)

---

## 📞 Security Contact

If you discover a security vulnerability, please email:
**rflipram@gmail.com**

Please do NOT create a public GitHub issue for security vulnerabilities.

---

**Remember:** Security is everyone's responsibility! 🛡️
