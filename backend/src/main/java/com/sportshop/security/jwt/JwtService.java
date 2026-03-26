package com.sportshop.security.jwt;

import com.sportshop.security.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private final JwtProperties jwtProperties;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream().map(a -> a.getAuthority()).toList());
        Date expiration = toDate(LocalDateTime.now().plusMinutes(jwtProperties.getAccessTokenExpirationMinutes()));
        return buildToken(claims, userDetails.getUsername(), expiration, getAccessKey());
    }

    public String generateRefreshToken(String username) {
        Date expiration = toDate(LocalDateTime.now().plusDays(jwtProperties.getRefreshTokenExpirationDays()));
        return buildToken(new HashMap<>(), username, expiration, getRefreshKey());
    }

    public String extractUsernameFromAccessToken(String token) {
        return extractClaim(token, Claims::getSubject, getAccessKey());
    }

    public String extractUsernameFromRefreshToken(String token) {
        return extractClaim(token, Claims::getSubject, getRefreshKey());
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        String username = extractUsernameFromAccessToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token, getAccessKey());
    }

    public boolean isRefreshTokenValid(String token, String username) {
        String subject = extractUsernameFromRefreshToken(token);
        return subject.equals(username) && !isTokenExpired(token, getRefreshKey());
    }

    private String buildToken(Map<String, Object> claims, String subject, Date expiration, Key key) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date())
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver, Key key) {
        Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    private boolean isTokenExpired(String token, Key key) {
        Date expiration = extractClaim(token, Claims::getExpiration, key);
        return expiration.before(new Date());
    }

    private Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    private Key getAccessKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getAccessTokenSecret().getBytes(StandardCharsets.UTF_8));
    }

    private Key getRefreshKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getRefreshTokenSecret().getBytes(StandardCharsets.UTF_8));
    }
}
