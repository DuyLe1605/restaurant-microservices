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
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
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
                    .header("X-User-Role", String.valueOf(claims.get("role")))
                    .header("X-User-Fullname", String.valueOf(claims.get("fullname")))
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }

    private boolean isOpenEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    public static class Config {
        // Configuration properties if needed
    }
}