package com.restaurant.inventory.config;

import com.restaurant.inventory.entity.*;
import com.restaurant.inventory.enums.InventoryLogType;
import com.restaurant.inventory.enums.IssueStatus;
import com.restaurant.inventory.enums.IssueType;
import com.restaurant.inventory.enums.ReceiptStatus;
import com.restaurant.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final IngredientRepository ingredientRepository;
    private final IngredientCategoryRepository categoryRepository;
    private final InventoryLogRepository logRepository;
    private final InventoryReceiptRepository receiptRepository;
    private final InventoryReceiptDetailRepository receiptDetailRepository;
    private final InventoryIssueRepository issueRepository;
    private final InventoryIssueDetailRepository issueDetailRepository;

    @Override
    public void run(String... args) {
        if (ingredientRepository.count() == 0) {
            log.info("Seeding initial ingredients and stock logs for inventory-service...");

            // Categories
            IngredientCategory c1 = IngredientCategory.builder().name("Thịt & Hải sản").description("Các loại thịt bò, cua, tôm, cá tươi sống").build();
            IngredientCategory c2 = IngredientCategory.builder().name("Gia vị cao cấp").description("Nấm Truffle, bơ Pháp, nghệ tây, tiêu đen").build();
            IngredientCategory c3 = IngredientCategory.builder().name("Rau củ hữu cơ").description("Măng tây, rau thơm, xà lách các loại").build();
            IngredientCategory c4 = IngredientCategory.builder().name("Đồ làm bánh").description("Chocolate Bỉ, bột mì Pháp, kem whipping").build();
            categoryRepository.saveAll(List.of(c1, c2, c3, c4));

            // Ingredients
            Ingredient i1 = Ingredient.builder().code("ING-WAGYU").name("Bò Wagyu A5 Ribeye").category("Thịt & Hải sản").unit("kg").purchasePrice(new BigDecimal("2800000")).minStock(5).mainSupplier("Horeca Food VN").build();
            Ingredient i2 = Ingredient.builder().code("ING-CRAB").name("Cua King Crab Sống").category("Thịt & Hải sản").unit("kg").purchasePrice(new BigDecimal("1400000")).minStock(10).mainSupplier("Hải Sản Đại Dương").build();
            Ingredient i3 = Ingredient.builder().code("ING-SALMON").name("Cá Hồi Tươi Na Uy").category("Thịt & Hải sản").unit("kg").purchasePrice(new BigDecimal("380000")).minStock(8).mainSupplier("Salmar Norway Import").build();
            Ingredient i4 = Ingredient.builder().code("ING-TRUFFLE").name("Nấm Truffle Đen Pháp").category("Gia vị cao cấp").unit("hộp 100g").purchasePrice(new BigDecimal("950000")).minStock(4).mainSupplier("Classic Fine Foods").build();
            Ingredient i5 = Ingredient.builder().code("ING-BUTTER").name("Bơ Thảo Mộc Elle & Vire").category("Gia vị cao cấp").unit("kg").purchasePrice(new BigDecimal("220000")).minStock(5).mainSupplier("Classic Fine Foods").build();
            Ingredient i6 = Ingredient.builder().code("ING-ABALONE").name("Bào Ngư Xanh Úc").category("Thịt & Hải sản").unit("kg").purchasePrice(new BigDecimal("1650000")).minStock(3).mainSupplier("Hải Sản Đại Dương").build();
            Ingredient i7 = Ingredient.builder().code("ING-CHOCO").name("Chocolate Bỉ Nguyên Chất 70%").category("Đồ làm bánh").unit("kg").purchasePrice(new BigDecimal("320000")).minStock(3).mainSupplier("Puratos Grand-Place").build();

            ingredientRepository.saveAll(List.of(i1, i2, i3, i4, i5, i6, i7));

            // Initial Receipts
            InventoryReceipt rc = InventoryReceipt.builder()
                    .supplier("Horeca Food VN")
                    .receiptDate(LocalDate.now().minusDays(1))
                    .status(ReceiptStatus.COMPLETED)
                    .note("Nhập kho nguyên liệu đầu tuần phục vụ nhà hàng")
                    .createdBy(1L)
                    .build();
            receiptRepository.save(rc);

            InventoryReceiptDetail rcd1 = InventoryReceiptDetail.builder().receiptId(rc.getId()).ingredientId(1L).qty(new BigDecimal("10.000")).unitPrice(new BigDecimal("2800000")).build();
            InventoryReceiptDetail rcd2 = InventoryReceiptDetail.builder().receiptId(rc.getId()).ingredientId(2L).qty(new BigDecimal("15.000")).unitPrice(new BigDecimal("1400000")).build();
            InventoryReceiptDetail rcd3 = InventoryReceiptDetail.builder().receiptId(rc.getId()).ingredientId(3L).qty(new BigDecimal("20.000")).unitPrice(new BigDecimal("380000")).build();
            InventoryReceiptDetail rcd4 = InventoryReceiptDetail.builder().receiptId(rc.getId()).ingredientId(4L).qty(new BigDecimal("5.000")).unitPrice(new BigDecimal("950000")).build();
            receiptDetailRepository.saveAll(List.of(rcd1, rcd2, rcd3, rcd4));

            // Stock logs from receipt
            logRepository.save(InventoryLog.builder().ingredientId(1L).qtyChange(new BigDecimal("10.000")).type(InventoryLogType.RECEIPT).relatedId(rc.getId()).note("Nhập kho lô RC01").createdBy(1L).build());
            logRepository.save(InventoryLog.builder().ingredientId(2L).qtyChange(new BigDecimal("15.000")).type(InventoryLogType.RECEIPT).relatedId(rc.getId()).note("Nhập kho lô RC01").createdBy(1L).build());
            logRepository.save(InventoryLog.builder().ingredientId(3L).qtyChange(new BigDecimal("20.000")).type(InventoryLogType.RECEIPT).relatedId(rc.getId()).note("Nhập kho lô RC01").createdBy(1L).build());
            logRepository.save(InventoryLog.builder().ingredientId(4L).qtyChange(new BigDecimal("5.000")).type(InventoryLogType.RECEIPT).relatedId(rc.getId()).note("Nhập kho lô RC01").createdBy(1L).build());

            // Initial Issue
            InventoryIssue is = InventoryIssue.builder()
                    .issueType(IssueType.MANUAL)
                    .issueDate(LocalDate.now())
                    .status(IssueStatus.COMPLETED)
                    .note("Xuất nguyên liệu cho Bếp trưởng sơ chế")
                    .createdBy(1L)
                    .build();
            issueRepository.save(is);

            InventoryIssueDetail isd1 = InventoryIssueDetail.builder().issueId(is.getId()).ingredientId(1L).qty(new BigDecimal("1.500")).build();
            InventoryIssueDetail isd2 = InventoryIssueDetail.builder().issueId(is.getId()).ingredientId(2L).qty(new BigDecimal("8.800")).build();
            InventoryIssueDetail isd3 = InventoryIssueDetail.builder().issueId(is.getId()).ingredientId(4L).qty(new BigDecimal("3.000")).build();
            issueDetailRepository.saveAll(List.of(isd1, isd2, isd3));

            // Stock logs from issue
            logRepository.save(InventoryLog.builder().ingredientId(1L).qtyChange(new BigDecimal("-1.500")).type(InventoryLogType.ISSUE).relatedId(is.getId()).note("Xuất kho bếp").createdBy(1L).build());
            logRepository.save(InventoryLog.builder().ingredientId(2L).qtyChange(new BigDecimal("-8.800")).type(InventoryLogType.ISSUE).relatedId(is.getId()).note("Xuất kho bếp").createdBy(1L).build());
            logRepository.save(InventoryLog.builder().ingredientId(4L).qtyChange(new BigDecimal("-3.000")).type(InventoryLogType.ISSUE).relatedId(is.getId()).note("Xuất kho bếp").createdBy(1L).build());

            log.info("Seeded 4 categories, 7 ingredients, 1 receipt, 1 issue, and stock logs successfully!");
        }
    }
}
