package com.fincoach.repository;

import com.fincoach.entity.EmailOtp;
import com.fincoach.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findByUser(User user);

    Optional<EmailOtp> findByOtpAndUser(String otp, User user);

    void deleteByUser(User user);
}
