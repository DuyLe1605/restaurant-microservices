package com.restaurant.table.config;

import com.restaurant.table.entity.Reservation;
import com.restaurant.table.entity.RestaurantTable;
import com.restaurant.table.enums.ReservationStatus;
import com.restaurant.table.enums.TableStatus;
import com.restaurant.table.repository.ReservationRepository;
import com.restaurant.table.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    @Override
    public void run(String... args) {
        if (tableRepository.count() == 0) {
            log.info("Seeding initial tables and reservations for table-service...");

            RestaurantTable t1 = RestaurantTable.builder().number("B-01").capacity(2).status(TableStatus.FREE).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t2 = RestaurantTable.builder().number("B-02").capacity(4).status(TableStatus.OCCUPIED).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t3 = RestaurantTable.builder().number("B-03").capacity(4).status(TableStatus.OCCUPIED).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t4 = RestaurantTable.builder().number("B-04").capacity(6).status(TableStatus.RESERVED).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t5 = RestaurantTable.builder().number("B-05").capacity(4).status(TableStatus.FREE).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t6 = RestaurantTable.builder().number("B-06").capacity(2).status(TableStatus.FREE).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t7 = RestaurantTable.builder().number("VIP-01").capacity(8).status(TableStatus.FREE).orderToken(UUID.randomUUID().toString()).build();
            RestaurantTable t8 = RestaurantTable.builder().number("VIP-02").capacity(12).status(TableStatus.OCCUPIED).orderToken(UUID.randomUUID().toString()).build();

            tableRepository.saveAll(List.of(t1, t2, t3, t4, t5, t6, t7, t8));

            Reservation res1 = Reservation.builder()
                    .tableId(4L)
                    .customerName("Nguyễn Văn Hùng")
                    .customerPhone("0901234567")
                    .partySize(4)
                    .startTime(LocalDateTime.now().plusHours(1))
                    .endTime(LocalDateTime.now().plusHours(3))
                    .status(ReservationStatus.CONFIRMED)
                    .note("Kỷ niệm ngày cưới, chuẩn bị thêm nến và hoa tươi")
                    .createdBy(1L)
                    .build();

            Reservation res2 = Reservation.builder()
                    .tableId(7L)
                    .customerName("Trần Thị Thuỷ")
                    .customerPhone("0987654321")
                    .partySize(8)
                    .startTime(LocalDateTime.now().plusDays(1).withHour(18).withMinute(30))
                    .endTime(LocalDateTime.now().plusDays(1).withHour(21).withMinute(0))
                    .status(ReservationStatus.PENDING)
                    .note("Tiệc sinh nhật gia đình, mang bánh kem riêng")
                    .createdBy(1L)
                    .build();

            reservationRepository.saveAll(List.of(res1, res2));
            log.info("Seeded 8 restaurant tables and 2 reservations successfully!");
        }
    }
}
