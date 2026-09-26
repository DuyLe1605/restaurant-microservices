package com.restaurant.table.repository;

import com.restaurant.table.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByNumber(String number);
    Optional<RestaurantTable> findByOrderToken(String orderToken);
    boolean existsByNumber(String number);
}
