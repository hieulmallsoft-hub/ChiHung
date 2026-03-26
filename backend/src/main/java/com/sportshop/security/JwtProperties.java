package com.sportshop.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Getter
@Setter
public class JwtProperties {
    private String accessTokenSecret;
    private String refreshTokenSecret;
    private long accessTokenExpirationMinutes;
    private long refreshTokenExpirationDays;
}
