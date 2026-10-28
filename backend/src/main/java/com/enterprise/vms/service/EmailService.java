package com.enterprise.vms.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Autowired(required = false)
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendOtpEmail(String recipientEmail, String otpCode) {
        String subject = "Enterprise VMS - Your Email Verification OTP: " + otpCode;
        String htmlContent = buildOtpEmailHtml(recipientEmail, otpCode);

        // Always log OTP in server logs for developer inspection & testing
        logger.info("=================================================================");
        logger.info("  EMAIL VERIFICATION OTP FOR: {}", recipientEmail);
        logger.info("  OTP CODE: >>> {} <<<", otpCode);
        logger.info("=================================================================");

        if (mailSender == null) {
            logger.warn("JavaMailSender is not initialized. OTP logged to console for testing.");
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(recipientEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            helper.setFrom("rajputkartikey10@gmail.com", "Enterprise Visitor Management");

            mailSender.send(message);
            logger.info("OTP email successfully dispatched to: {}", recipientEmail);
            return true;
        } catch (Exception e) {
            logger.warn("Could not dispatch email via SMTP (will continue with in-memory OTP verification): {}", e.getMessage());
            return true;
        }
    }

    private String buildOtpEmailHtml(String recipientEmail, String otpCode) {
        return "<!DOCTYPE html>" +
                "<html><head><style>" +
                "body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F7F7F2; margin: 0; padding: 20px; color: #2B3324; }" +
                ".container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8D8; overflow: hidden; box-shadow: 0 4px 15px rgba(58, 75, 49, 0.08); }" +
                ".header { background: #3A4B31; color: #F7F7F2; padding: 28px; text-align: center; }" +
                ".header h2 { margin: 0; font-size: 22px; letter-spacing: 0.5px; }" +
                ".content { padding: 32px 28px; }" +
                ".otp-box { background: #F3F4ED; border: 2px dashed #607255; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }" +
                ".otp-code { font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #3A4B31; margin: 0; }" +
                ".footer { background: #F7F7F2; padding: 16px; text-align: center; font-size: 12px; color: #73806B; border-top: 1px solid #E2E8D8; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h2>Enterprise Visitor Portal</h2></div>" +
                "<div class='content'>" +
                "<p>Hello,</p>" +
                "<p>Thank you for initiating your visitor check-in pass. Use the following One-Time Password (OTP) to verify your email address <strong>" + recipientEmail + "</strong>:</p>" +
                "<div class='otp-box'><div class='otp-code'>" + otpCode + "</div></div>" +
                "<p>This OTP is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>" +
                "<p>Once verified, you will proceed to details entry and instant DigiLocker Aadhaar e-KYC.</p>" +
                "</div>" +
                "<div class='footer'>Enterprise Visitor Management System &bull; Secure Reception Services</div>" +
                "</div></body></html>";
    }
}
