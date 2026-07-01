package com.sportshop.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.chatbot")
public class ChatbotProperties {

    private boolean enabled = true;
    private String botEmail = "gemini-bot@sportshop.vn";
    private String botName = "Tro ly Gemini";
    private int historyLimit = 12;
    private int productLimit = 20;
    private Gemini gemini = new Gemini();

    public boolean isConfigured() {
        return enabled && gemini.apiKey != null && !gemini.apiKey.isBlank();
    }

    @Getter
    @Setter
    public static class Gemini {
        private String apiKey;
        private String endpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
        private String model = "gemini-3.5-flash";
        private int timeoutSeconds = 25;
    }
}
