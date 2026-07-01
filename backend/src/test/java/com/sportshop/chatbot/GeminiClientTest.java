package com.sportshop.chatbot;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportshop.config.ChatbotProperties;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GeminiClientTest {

    private final ChatbotProperties properties = new ChatbotProperties();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final GeminiClient client = new GeminiClient(properties, objectMapper);

    @Test
    void buildsStatelessInteractionPayload() {
        ChatbotContext context = new ChatbotContext(
                UUID.randomUUID(),
                UUID.randomUUID(),
                "Có giày chạy bộ không?",
                "Khach hang: Có giày chạy bộ không?",
                "- Giày Run | Giá: 1.000.000 ₫"
        );

        Map<String, Object> payload = client.buildPayload(context);

        assertEquals("gemini-3.5-flash", payload.get("model"));
        assertEquals(false, payload.get("store"));
        assertFalse(payload.get("input").toString().isBlank());
    }

    @Test
    void extractsTextFromInteractionModelOutput() throws Exception {
        String response = """
                {
                  "steps": [
                    {"type": "thought", "signature": "hidden"},
                    {
                      "type": "model_output",
                      "content": [
                        {"type": "text", "text": "Chào bạn!"},
                        {"type": "text", "text": "Mình có thể tư vấn giày chạy bộ."}
                      ]
                    }
                  ]
                }
                """;

        assertEquals(
                "Chào bạn!\nMình có thể tư vấn giày chạy bộ.",
                client.extractText(objectMapper.readTree(response))
        );
    }
}
