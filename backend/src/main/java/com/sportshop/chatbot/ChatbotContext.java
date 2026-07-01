package com.sportshop.chatbot;

import java.util.UUID;

public record ChatbotContext(
        UUID roomId,
        UUID messageId,
        String latestMessage,
        String conversation,
        String productCatalog
) {
}
