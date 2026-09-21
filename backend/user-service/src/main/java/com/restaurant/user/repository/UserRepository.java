package com.restaurant.user.repository;

import com.restaurant.user.entity.User;
import com.restaurant.user.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.fullname) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:active IS NULL OR u.active = :active)")
    Page<User> searchUsers(@Param("search") String search,
                           @Param("role") Role role,
                           @Param("active") Boolean active,
                           Pageable pageable);

    long countByActiveTrue();
}
