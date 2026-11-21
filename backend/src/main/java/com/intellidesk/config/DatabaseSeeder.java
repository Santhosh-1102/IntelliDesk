package com.intellidesk.config;

import com.intellidesk.entity.Role;
import com.intellidesk.entity.TicketCategory;
import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.repository.RoleRepository;
import com.intellidesk.repository.TicketCategoryRepository;
import com.intellidesk.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

/**
 * Automatically initializes vector extensions, default system roles, 
 * ticket categories, and initial administrative accounts on fresh cloud deployments.
 */
@Component
@Order(1)
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final JdbcTemplate jdbcTemplate;
    private final RoleRepository roleRepository;
    private final TicketCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(
            JdbcTemplate jdbcTemplate,
            RoleRepository roleRepository,
            TicketCategoryRepository categoryRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.roleRepository = roleRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initPgVectorExtension();
        seedRoles();
        seedCategories();
        seedInitialUsers();
    }

    private void initPgVectorExtension() {
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector;");
            log.info("✅ [DatabaseSeeder] pgvector extension verified / initialized.");
        } catch (Exception e) {
            log.warn("⚠️ [DatabaseSeeder] Notice on pgvector extension init: {}. (May already exist or requires superuser)", e.getMessage());
        }
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            log.info("🌱 [DatabaseSeeder] Seeding default roles...");
            roleRepository.saveAll(List.of(
                    new Role(RoleName.ROLE_EMPLOYEE, "Standard employee with access to AI troubleshooting and personal tickets"),
                    new Role(RoleName.ROLE_SUPPORT_ENGINEER, "IT support staff capable of managing queues and resolving tickets"),
                    new Role(RoleName.ROLE_ADMIN, "System administrator with governance, knowledge ingestion, and analytics control")
            ));
            log.info("✅ [DatabaseSeeder] Roles seeded successfully.");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            log.info("🌱 [DatabaseSeeder] Seeding master ticket categories...");
            categoryRepository.saveAll(List.of(
                    new TicketCategory("Network & Connectivity", "NETWORK", "Issues with Wi-Fi, Ethernet, DNS, DHCP, or internal LAN access", TicketPriority.MEDIUM),
                    new TicketCategory("VPN & Remote Access", "VPN", "Virtual Private Network disconnections, authentication, or certificate errors", TicketPriority.HIGH),
                    new TicketCategory("Hardware & Peripherals", "HARDWARE", "Laptops, monitors, keyboards, docks, and physical device defects", TicketPriority.MEDIUM),
                    new TicketCategory("Software & Applications", "SOFTWARE", "Desktop software crashes, licensing, installation, and application errors", TicketPriority.MEDIUM),
                    new TicketCategory("Email & Messaging", "EMAIL", "Microsoft Outlook, Exchange sync, spam filtering, and calendar issues", TicketPriority.MEDIUM),
                    new TicketCategory("Printer & Scanner", "PRINTER", "Network printers, driver installations, queue freezes, and scan-to-email", TicketPriority.LOW),
                    new TicketCategory("Operating System", "OPERATING_SYSTEM", "Windows/macOS updates, Blue Screen (BSOD), performance degradation", TicketPriority.HIGH),
                    new TicketCategory("Account & Access Management", "ACCOUNT_ACCESS", "Password resets, Single Sign-On (SSO), MFA tokens, and permissions", TicketPriority.CRITICAL),
                    new TicketCategory("General / Other", "OTHER", "Technical requests and inquiries not fitting specific categories", TicketPriority.LOW)
            ));
            log.info("✅ [DatabaseSeeder] Master categories seeded successfully.");
        }
    }

    private void seedInitialUsers() {
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN).orElse(null);
        Role engineerRole = roleRepository.findByName(RoleName.ROLE_SUPPORT_ENGINEER).orElse(null);
        Role employeeRole = roleRepository.findByName(RoleName.ROLE_EMPLOYEE).orElse(null);

        if (adminRole == null) return;

        String defaultEncodedPassword = passwordEncoder.encode("Password@123");

        // 1. Initial Admin
        if (!userRepository.existsByEmail("admin@intellidesk.com")) {
            User admin = new User("admin@intellidesk.com", defaultEncodedPassword, "Admin", "User", "IT Operations");
            admin.setRoles(Set.of(adminRole));
            admin.setPhoneVerified(true);
            admin.setPhoneNumber("+919876543210");
            userRepository.save(admin);
            log.info("✅ [DatabaseSeeder] Initial Admin created: admin@intellidesk.com / Password@123");
        }

        // 2. Initial Engineer
        if (engineerRole != null && !userRepository.existsByEmail("engineer@intellidesk.com")) {
            User engineer = new User("engineer@intellidesk.com", defaultEncodedPassword, "Alex", "Rivera", "Tier-2 Support");
            engineer.setRoles(Set.of(engineerRole));
            engineer.setPhoneVerified(true);
            engineer.setPhoneNumber("+919876543211");
            userRepository.save(engineer);
            log.info("✅ [DatabaseSeeder] Initial Engineer created: engineer@intellidesk.com / Password@123");
        }

        // 3. Initial Employee
        if (employeeRole != null && !userRepository.existsByEmail("employee@intellidesk.com")) {
            User employee = new User("employee@intellidesk.com", defaultEncodedPassword, "Sarah", "Chen", "Engineering");
            employee.setRoles(Set.of(employeeRole));
            employee.setPhoneVerified(true);
            employee.setPhoneNumber("+919876543212");
            userRepository.save(employee);
            log.info("✅ [DatabaseSeeder] Initial Employee created: employee@intellidesk.com / Password@123");
        }
    }
}
