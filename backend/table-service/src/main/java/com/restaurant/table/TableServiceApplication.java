package com.restaurant.table;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class TableServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TableServiceApplication.class, args);
    }
}
