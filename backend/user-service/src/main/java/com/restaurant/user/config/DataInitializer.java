package com.restaurant.user.config;

import com.restaurant.user.entity.User;
import com.restaurant.user.enums.Role;
import com.restaurant.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial user profiles for user-service...");

            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullname("Nguyễn Quản Trị (Tổng Giám Đốc)")
                    .role(Role.ADMIN)
                    .active(true)
                    .build();

            User manager = User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("manager123"))
                    .fullname("Lê Quản Lý (Giám Sát Vận Hành)")
                    .role(Role.MANAGER)
                    .active(true)
                    .build();

            User waiter = User.builder()
                    .username("waiter")
                    .password(passwordEncoder.encode("waiter123"))
                    .fullname("Trần Tuấn Anh (Tổ Trưởng Phục Vụ)")
                    .role(Role.USER)
                    .active(true)
                    .build();

            User chef = User.builder()
                    .username("chef")
                    .password(passwordEncoder.encode("chef123"))
                    .fullname("Phạm Minh Tuấn (Bếp Trưởng)")
                    .role(Role.USER)
                    .active(true)
                    .build();

            User cashier = User.builder()
                    .username("cashier")
                    .password(passwordEncoder.encode("cashier123"))
                    .fullname("Vũ Thu Ngân (Thu Ngân Trưởng)")
                    .role(Role.USER)
                    .active(true)
                    .build();

            userRepository.save(admin);
            userRepository.save(manager);
            userRepository.save(waiter);
            userRepository.save(chef);
            userRepository.save(cashier);

            log.info("Seeded 5 user profiles successfully!");
        }
    }
}
