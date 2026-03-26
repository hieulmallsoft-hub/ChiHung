package com.sportshop.dto.auth;

import lombok.Builder;
import lombok.Getter;

import java.util.Set;
import java.util.UUID;

@Getter
@Builder
public class UserSummary {
    private UUID id;
    private String email;
    private String fullName;
    private Set<String> roles;
}
