package com.intellidesk.repository;

import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRoles_Name(RoleName roleName);

    List<User> findByActiveTrue();
}
