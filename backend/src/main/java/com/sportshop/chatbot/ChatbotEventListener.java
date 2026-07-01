package com.sportshop.chatbot;

import com.sportshop.config.ChatbotProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class ChatbotEventListener {

    private static final Logger log = LoggerFactory.getLogger(ChatbotEventListener.class);
    private static final String HANDOFF_MESSAGE =
            "Mình đã chuyển cuộc trò chuyện này cho nhân viên hỗ trợ. Bạn cứ để lại thêm thông tin, admin sẽ tiếp tục phản hồi tại đây.";
    private static final String UNAVAILABLE_MESSAGE =
            "Trợ lý Gemini đang tạm thời không phản hồi được. Mình đã chuyển cuộc trò chuyện cho nhân viên hỗ trợ.";

    private final ChatbotProperties properties;
    private final ChatbotContextService contextService;
    private final GeminiClient geminiClient;
    private final HandoffDetector handoffDetector;
    private final ChatbotReplyService replyService;
    private final ConcurrentMap<UUID, Object> roomLocks = new ConcurrentHashMap<>();

    public ChatbotEventListener(ChatbotProperties properties,
                                ChatbotContextService contextService,
                                GeminiClient geminiClient,
                                HandoffDetector handoffDetector,
                                ChatbotReplyService replyService) {
        this.properties = properties;
        this.contextService = contextService;
        this.geminiClient = geminiClient;
        this.handoffDetector = handoffDetector;
        this.replyService = replyService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserMessage(ChatUserMessageCreatedEvent event) {
        if (!properties.isConfigured()) {
            return;
        }

        Object roomLock = roomLocks.computeIfAbsent(event.roomId(), ignored -> new Object());
        synchronized (roomLock) {
            processUserMessage(event);
        }
    }

    private void processUserMessage(ChatUserMessageCreatedEvent event) {
        contextService.load(event.roomId(), event.messageId()).ifPresent(context -> {
            if (handoffDetector.requestsHuman(context.latestMessage())) {
                replyService.saveReply(
                        context.roomId(),
                        context.messageId(),
                        HANDOFF_MESSAGE,
                        BotReplyMode.HANDOFF_TO_ADMIN
                );
                return;
            }

            try {
                String reply = geminiClient.generateReply(context);
                replyService.saveReply(
                        context.roomId(),
                        context.messageId(),
                        reply,
                        BotReplyMode.RESOLVED_BY_BOT
                );
            } catch (RuntimeException ex) {
                log.warn("Gemini chatbot failed for room {}: {}", context.roomId(), ex.getMessage());
                replyService.saveReply(
                        context.roomId(),
                        context.messageId(),
                        UNAVAILABLE_MESSAGE,
                        BotReplyMode.HANDOFF_TO_ADMIN
                );
            }
        });
    }
}
