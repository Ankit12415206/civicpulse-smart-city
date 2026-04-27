package com.civicpulse.civicpulse_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Email failed: {}", e.getMessage());
        }
    }

    @Async
    public void sendRegistrationEmail(String to, String username) {
        sendEmail(to,
            "Welcome to CivicPulse!",
            "Hello " + username + ",\n\n"
            + "Your account has been created successfully.\n"
            + "You can now submit grievances at CivicPulse.\n\n"
            + "Team CivicPulse"
        );
    }

    @Async
    public void sendStatusUpdateEmail(String to,
                                       String title,
                                       String status) {
        sendEmail(to,
            "Your Grievance Status Updated — CivicPulse",
            "Hello,\n\n"
            + "Your grievance '" + title + "' has been updated.\n"
            + "New status: " + status + "\n\n"
            + "Login to CivicPulse to view details.\n\n"
            + "Team CivicPulse"
        );
    }

    @Async
    public void sendAssignmentEmail(String to,
                                     String grievanceTitle) {
        sendEmail(to,
            "New Grievance Assigned — CivicPulse",
            "Hello Officer,\n\n"
            + "A new grievance has been assigned to you:\n"
            + "Title: " + grievanceTitle + "\n\n"
            + "Please login to CivicPulse to view and resolve it.\n\n"
            + "Team CivicPulse"
        );
    }
}