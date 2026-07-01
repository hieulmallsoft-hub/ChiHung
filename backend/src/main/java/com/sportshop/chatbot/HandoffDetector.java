package com.sportshop.chatbot;

import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Component
public class HandoffDetector {

    private static final List<String> HANDOFF_PHRASES = List.of(
            "gap nhan vien",
            "gap admin",
            "noi chuyen voi nhan vien",
            "noi chuyen voi nguoi",
            "tu van vien",
            "nguoi that",
            "chuyen nhan vien",
            "chuyen admin",
            "goi admin",
            "human support"
    );

    public boolean requestsHuman(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }

        String normalized = Normalizer.normalize(message, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);

        return HANDOFF_PHRASES.stream().anyMatch(normalized::contains);
    }
}
