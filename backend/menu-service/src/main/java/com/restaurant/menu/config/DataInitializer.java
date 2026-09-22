package com.restaurant.menu.config;

import com.restaurant.menu.entity.MenuItem;
import com.restaurant.menu.entity.Recipe;
import com.restaurant.menu.repository.MenuItemRepository;
import com.restaurant.menu.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final RecipeRepository recipeRepository;

    @Override
    public void run(String... args) {
        if (menuItemRepository.count() == 0) {
            log.info("Seeding initial menu items and recipes for menu-service...");

            MenuItem item1 = MenuItem.builder()
                    .code("WAGYU-A5")
                    .name("Bò Wagyu A5 Nướng Sốt Nấm Truffle")
                    .price(new BigDecimal("850000"))
                    .category("Món chính")
                    .description("Thịt bò Wagyu nhập khẩu Nhật Bản nướng than hoa, dùng kèm sốt nấm Truffle đen Pháp.")
                    .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item2 = MenuItem.builder()
                    .code("KING-CRAB")
                    .name("Cua Hoàng Đế Hấp Rượu Vang Trắng")
                    .price(new BigDecimal("1850000"))
                    .category("Hải sản cao cấp")
                    .description("Cua King Crab tươi sống hấp với vang trắng Bordeaux, bơ tỏi và thảo mộc.")
                    .imageUrl("https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item3 = MenuItem.builder()
                    .code("SALMON-LEMON")
                    .name("Cá Hồi Na Uy Áp Chảo Sốt Bơ Chanh")
                    .price(new BigDecimal("360000"))
                    .category("Món chính")
                    .description("Phi lê cá hồi Na Uy áp chảo da giòn, sốt bơ chanh vàng kiểu Pháp và măng tây.")
                    .imageUrl("https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item4 = MenuItem.builder()
                    .code("SOUP-ROYAL")
                    .name("Súp Bào Ngư Vi Cá Hoàng Gia")
                    .price(new BigDecimal("490000"))
                    .category("Khai vị")
                    .description("Bào ngư hảo hạng hầm với vi cá và nấm đông cô trong nước dùng thượng canh 12 giờ.")
                    .imageUrl("https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item5 = MenuItem.builder()
                    .code("LOBSTER-SALAD")
                    .name("Salad Tôm Hùm Sốt Chanh Leo")
                    .price(new BigDecimal("280000"))
                    .category("Khai vị")
                    .description("Tôm hùm baby luộc cùng xà lách Romaine, cà chua bi hữu cơ và sốt chanh leo chua thanh.")
                    .imageUrl("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item6 = MenuItem.builder()
                    .code("WINE-MARGAUX")
                    .name("Rượu Vang Chateau Margaux 2018")
                    .price(new BigDecimal("3200000"))
                    .category("Đồ uống & Rượu")
                    .description("Rượu vang đỏ Grand Cru Classe Bordeaux hảo hạng, hương hoa violet và gỗ sồi lâu năm.")
                    .imageUrl("https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            MenuItem item7 = MenuItem.builder()
                    .code("MOUSSE-GOLD")
                    .name("Bánh Mousse Chocolate Bỉ Phủ Vàng")
                    .price(new BigDecimal("150000"))
                    .category("Tráng miệng")
                    .description("Chocolate Bỉ nguyên chất 70% mềm mịn, phủ bột vàng 24K thực phẩm sang trọng.")
                    .imageUrl("https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop")
                    .active(true)
                    .build();

            menuItemRepository.saveAll(List.of(item1, item2, item3, item4, item5, item6, item7));

            // Seed Recipes for dishes
            Recipe r1 = Recipe.builder().menuId(1L).ingredientId(1L).qty(new BigDecimal("0.250")).build(); // 250g Bo Wagyu
            Recipe r2 = Recipe.builder().menuId(1L).ingredientId(4L).qty(new BigDecimal("0.020")).build(); // 20g Nam Truffle
            Recipe r3 = Recipe.builder().menuId(2L).ingredientId(2L).qty(new BigDecimal("1.200")).build(); // 1.2kg Cua King Crab
            Recipe r4 = Recipe.builder().menuId(3L).ingredientId(3L).qty(new BigDecimal("0.200")).build(); // 200g Ca hoi
            Recipe r5 = Recipe.builder().menuId(3L).ingredientId(5L).qty(new BigDecimal("0.050")).build(); // 50g Bo Phap
            Recipe r6 = Recipe.builder().menuId(4L).ingredientId(6L).qty(new BigDecimal("0.100")).build(); // 100g Bao Ngu
            Recipe r7 = Recipe.builder().menuId(7L).ingredientId(7L).qty(new BigDecimal("0.080")).build(); // 80g Chocolate

            recipeRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7));
            log.info("Seeded 7 menu items and 7 recipe mappings successfully!");
        }
    }
}
