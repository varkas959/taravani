import nodemailer from "nodemailer";

export function createEmailTransporter() {
  // Check if using Brevo (formerly Sendinblue)
  if (process.env.BREVO_API_KEY) {
    const brevoUser = process.env.BREVO_SMTP_USER || process.env.BREVO_EMAIL;
    
    if (!brevoUser) {
      throw new Error("BREVO_SMTP_USER or BREVO_EMAIL must be set when using Brevo");
    }
    
    // Log configuration (without exposing full password)
    const smtpKey = process.env.BREVO_API_KEY || "";
    const smtpKeyLength = smtpKey.length;
    const smtpKeyPrefix = smtpKey.substring(0, 8) || "not set";
    const smtpKeySuffix = smtpKey.substring(smtpKeyLength - 4) || "";
    const smtpKeyTrimmed = smtpKey.trim();
    const hasExtraSpaces = smtpKey !== smtpKeyTrimmed;
    
    console.log("🔐 Brevo SMTP Configuration:");
    console.log("  - Host: smtp-relay.brevo.com");
    console.log("  - Port: 587");
    console.log("  - Username (BREVO_EMAIL):", brevoUser);
    console.log("  - Username length:", brevoUser.length);
    console.log("  - SMTP Key length:", smtpKeyLength);
    console.log("  - SMTP Key has extra spaces:", hasExtraSpaces);
    console.log("  - SMTP Key prefix:", smtpKeyPrefix + "...");
    console.log("  - SMTP Key suffix:", "..." + smtpKeySuffix);
    console.log("  - Using BREVO_SMTP_USER:", !!process.env.BREVO_SMTP_USER);
    console.log("  - Using BREVO_EMAIL:", !!process.env.BREVO_EMAIL);
    console.log("  - ⚠️  Note: Brevo SMTP keys are typically 40-60 chars. Your key is", smtpKeyLength, "chars.");
    
    // Use trimmed key to avoid space issues
    const finalSmtpKey = smtpKeyTrimmed;
    
    return nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: brevoUser.trim(), // Trim username to avoid space issues
        pass: finalSmtpKey, // Use trimmed SMTP key
      },
      // Add connection timeout
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
      // Add debug logging
      debug: true,
      logger: true,
    });
  }

  // Fallback to SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export function getFromEmail(): string {
  // Priority: SMTP_FROM > BREVO_FROM > SMTP_USER > BREVO_EMAIL
  return (
    process.env.SMTP_FROM ||
    process.env.BREVO_FROM ||
    process.env.SMTP_USER ||
    process.env.BREVO_EMAIL ||
    "noreply@taravani.com"
  );
}

export function isEmailConfigured(): boolean {
  // Check if Brevo is configured
  if (process.env.BREVO_API_KEY) {
    return true;
  }
  
  // Check if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return true;
  }
  
  return false;
}

