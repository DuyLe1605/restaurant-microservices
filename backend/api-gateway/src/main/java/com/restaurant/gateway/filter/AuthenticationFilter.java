package com.restaurant.gateway.filter;

import com.restaurant.gateway.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoints that don't require authentication
    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/internal",
            "/api/public-order",
            "/api/tables/by-token"
    );

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // Skip auth for OPTIONS preflight and open endpoints
            if (org.springframework.http.HttpMethod.OPTIONS.equals(request.getMethod()) || isOpenEndpoint(path)) {
                return chain.filter(exchange);
            }

            // Check Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validateToken(token)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // Extract claims
            var claims = jwtUtil.extractAllClaims(token);

            // Check if user is inactive / locked
            Object activeClaim = claims.get("active");
            if (activeClaim != null && "false".equalsIgnoreCase(String.valueOf(activeClaim))) {
                return onError(exchange, HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động.");
            }

            // Extract verified role
            String role = String.valueOf(claims.get("role"));
            org.springframework.http.HttpMethod method = request.getMethod();

            // ==================== RBAC GATEKEEPER RULES ====================
            // 1. User Administration: ADMIN only (except self endpoints: /me and /change-password)
            if (path.startsWith("/api/users")) {
                boolean isSelfEndpoint = path.equals("/api/users/me") || path.endsWith("/change-password");
                if (!isSelfEndpoint && !"ADMIN".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Quản trị nhân sự chỉ dành cho Quản trị viên (ADMIN).");
                }
            }

            // 2. Financial & Revenue Analytics: ADMIN and MANAGER only
            if (path.startsWith("/api/dashboard") || path.startsWith("/api/reports/revenue")) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Báo cáo tài chính & doanh thu chỉ dành cho Quản lý (MANAGER) hoặc Quản trị viên (ADMIN).");
                }
            }

            // 3. Operational Expenses: ADMIN and MANAGER only
            if (path.startsWith("/api/expenses")) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Quản lý sổ chi phí vận hành chỉ dành cho Quản lý (MANAGER) hoặc Quản trị viên (ADMIN).");
                }
            }

            // 4. Menu & Recipe Management (Creation/Edit/Delete): ADMIN and MANAGER only
            if ((path.startsWith("/api/menu") || path.startsWith("/api/recipes")) && (org.springframework.http.HttpMethod.POST.equals(method) || org.springframework.http.HttpMethod.PUT.equals(method) || org.springframework.http.HttpMethod.DELETE.equals(method))) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Chỉnh sửa thực đơn & định lượng công thức chỉ dành cho ADMIN và MANAGER.");
                }
            }

            // 5. Inventory Management (Creation/Receipts/Issues/Adjustments): ADMIN and MANAGER only
            if ((path.startsWith("/api/ingredients") || path.startsWith("/api/inventory")) && (org.springframework.http.HttpMethod.POST.equals(method) || org.springframework.http.HttpMethod.PUT.equals(method) || org.springframework.http.HttpMethod.DELETE.equals(method))) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Quản lý kho, nhập/xuất nguyên liệu chỉ dành cho ADMIN và MANAGER.");
                }
            }

            // 6. Floor Plan (Table Creation/Deletion): ADMIN and MANAGER only
            if (path.startsWith("/api/tables") && (org.springframework.http.HttpMethod.POST.equals(method) || org.springframework.http.HttpMethod.DELETE.equals(method))) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Thêm hoặc xóa cấu hình bàn ăn chỉ dành cho ADMIN và MANAGER.");
                }
            }

            // 7. Order Cancellation: ADMIN and MANAGER only
            if (path.startsWith("/api/orders") && org.springframework.http.HttpMethod.DELETE.equals(method)) {
                if (!"ADMIN".equalsIgnoreCase(role) && !"MANAGER".equalsIgnoreCase(role)) {
                    return onError(exchange, HttpStatus.FORBIDDEN, "Quyền truy cập bị từ chối: Hủy đơn hàng yêu cầu phê duyệt từ ADMIN hoặc MANAGER.");
                }
            }

            // Strip any client-spoofed headers first, then inject verified claims from JWT
            ServerHttpRequest modifiedRequest = request.mutate()
                    .headers(httpHeaders -> {
                        httpHeaders.remove("X-User-Id");
                        httpHeaders.remove("X-User-Username");
                        httpHeaders.remove("X-User-Role");
                        httpHeaders.remove("X-User-Fullname");
                    })
                    .header("X-User-Id", String.valueOf(claims.get("id")))
                    .header("X-User-Username", String.valueOf(claims.get("username")))
                    .header("X-User-Role", role)
                    .header("X-User-Fullname", String.valueOf(claims.get("fullname")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }

    private boolean isOpenEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private reactor.core.publisher.Mono<Void> onError(org.springframework.web.server.ServerWebExchange exchange, HttpStatus status, String message) {
        org.springframework.http.server.reactive.ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        String body = String.format("{\"success\":false,\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
                status.value(), status.getReasonPhrase(), message, exchange.getRequest().getURI().getPath());
        org.springframework.core.io.buffer.DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return response.writeWith(reactor.core.publisher.Mono.just(buffer));
    }

    public static class Config {
        // Configuration properties if needed
    }
}