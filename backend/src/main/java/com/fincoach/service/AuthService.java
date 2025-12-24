package com.fincoach.service;

import com.fincoach.dto.Dtos.*;
import com.fincoach.entity.EmailOtp;
import com.fincoach.entity.User;
import com.fincoach.repository.EmailOtpRepository;
import com.fincoach.repository.UserRepository;
import com.fincoach.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.commons.lang3.RandomStringUtils;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    EmailOtpRepository emailOtpRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    EmailService emailService;

    @Transactional
    public void registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // Generate and save OTP
        String otp = RandomStringUtils.randomNumeric(6);
        EmailOtp emailOtp = EmailOtp.builder()
                .user(user)
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(5))
                .build();

        emailOtpRepository.save(emailOtp);

        // Send Email via EmailService
        String emailBody = "Dear " + user.getName() + ",\n\n" +
                "Thank you for registering with FinCoach!\n\n" +
                "Your verification OTP is: " + otp + "\n\n" +
                "This OTP will expire in 5 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\nFinCoach Team";

        try {
            emailService.sendEmail(user.getEmail(), "FinCoach Email Verification OTP", emailBody);
            System.out.println("✅ OTP sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send email, but user registered. OTP: " + otp);
            System.err.println("User can retrieve OTP from database or use manual verification");
            // Don't throw exception - allow registration to complete
            // User can still verify using OTP from database
        }
    }

    @Transactional
    public void verifyEmailOtp(OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (user.getVerified()) {
            return; // Already verified
        }

        EmailOtp emailOtp = emailOtpRepository.findByOtpAndUser(request.getOtp(), user)
                .orElseThrow(() -> new RuntimeException("Error: Invalid OTP"));

        if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Error: OTP Expired");
        }

        user.setVerified(true);
        userRepository.save(user);
        emailOtpRepository.delete(emailOtp);
    }

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!user.getVerified()) {
            throw new RuntimeException("Error: User not verified. Please verify your email.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userDetails);

        return new JwtResponse(jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getVerified());
    }
}
