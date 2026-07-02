package com.sportshop.seed;

import com.sportshop.entity.Role;
import com.sportshop.entity.User;
import com.sportshop.enums.RoleName;
import com.sportshop.enums.UserStatus;
import com.sportshop.repository.RoleRepository;
import com.sportshop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@org.springframework.core.annotation.Order(1)
public class DataSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "admin@sportshop.vn";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = ensureRole(RoleName.ROLE_ADMIN);
        ensureRole(RoleName.ROLE_USER);
        ensureAdmin(adminRole);
    }

    private Role ensureRole(RoleName roleName) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            return roleRepository.save(role);
        });
    }

    private void ensureAdmin(Role adminRole) {
        userRepository.findByEmailAndDeletedFalse(DEFAULT_ADMIN_EMAIL)
                .map(user -> ensureAdminRole(user, adminRole))
                .orElseGet(() -> createDefaultAdmin(adminRole));
    }

    private User ensureAdminRole(User user, Role adminRole) {
        if (user.getRoles().stream().noneMatch(role -> role.getName() == RoleName.ROLE_ADMIN)) {
            user.getRoles().add(adminRole);
        }
        user.setEnabled(true);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    private User createDefaultAdmin(Role adminRole) {
        User user = new User();
        user.setFullName("Admin");
        user.setEmail(DEFAULT_ADMIN_EMAIL);
        user.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
        user.setPhone("0900000000");
        user.setStatus(UserStatus.ACTIVE);
        user.setEnabled(true);
        user.setRoles(new HashSet<>(Set.of(adminRole)));
        return userRepository.save(user);
    }
}
