package com.restaurant.menu.repository;

import com.restaurant.menu.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    Optional<MenuItem> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:search IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:category IS NULL OR m.category = :category) AND " +
           "(:active IS NULL OR m.active = :active)")
    Page<MenuItem> searchMenuItems(@Param("search") String search,
                                  @Param("category") String category,
                                  @Param("active") Boolean active,
                                  Pageable pageable);
}
