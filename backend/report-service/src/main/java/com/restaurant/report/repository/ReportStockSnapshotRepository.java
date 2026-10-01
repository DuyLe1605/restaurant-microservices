package com.restaurant.report.repository;

import com.restaurant.report.entity.ReportStockSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportStockSnapshotRepository extends JpaRepository<ReportStockSnapshot, Long> {

    @Query("SELECT s FROM ReportStockSnapshot s WHERE s.id IN " +
           "(SELECT MAX(s2.id) FROM ReportStockSnapshot s2 GROUP BY s2.ingredientId)")
    List<ReportStockSnapshot> findLatestSnapshotsPerIngredient();
}
