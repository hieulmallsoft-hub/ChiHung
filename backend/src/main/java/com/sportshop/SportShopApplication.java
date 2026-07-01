package com.sportshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class SportShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(SportShopApplication.class, args);
    }
}
