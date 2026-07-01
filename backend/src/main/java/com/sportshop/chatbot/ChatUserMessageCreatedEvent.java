package com.sportshop.chatbot;

import java.util.UUID;

public record ChatUserMessageCreatedEvent(UUID roomId, UUID messageId) {
}
