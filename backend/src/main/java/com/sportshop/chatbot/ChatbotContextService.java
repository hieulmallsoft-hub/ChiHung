package com.sportshop.chatbot;

import com.sportshop.config.ChatbotProperties;
import com.sportshop.entity.ChatRoom;
import com.sportshop.entity.Message;
import com.sportshop.entity.Product;
import com.sportshop.enums.MessageType;
import com.sportshop.enums.ProductStatus;
import com.sportshop.exception.ResourceNotFoundException;
import com.sportshop.repository.ChatRoomRepository;
import com.sportshop.repository.MessageRepository;
import com.sportshop.repository.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatbotContextService {

    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final ProductRepository productRepository;
    private final ChatbotProperties properties;

    public ChatbotContextService(ChatRoomRepository chatRoomRepository,
                                 MessageRepository messageRepository,
                                 ProductRepository productRepository,
                                 ChatbotProperties properties) {
        this.chatRoomRepository = chatRoomRepository;
        this.messageRepository = messageRepository;
        this.productRepository = productRepository;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public Optional<ChatbotContext> load(UUID roomId, UUID messageId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng chat"));

        if (Boolean.FALSE.equals(room.getBotEnabled())) {
            return Optional.empty();
        }

        Message triggeringMessage = messageRepository.findById(messageId)
                .filter(message -> message.getRoom().getId().equals(roomId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn"));

        if (!triggeringMessage.getSender().getId().equals(room.getUser().getId())) {
            return Optional.empty();
        }

        int historyLimit = Math.max(1, Math.min(properties.getHistoryLimit(), 30));
        List<Message> recentMessages = new ArrayList<>(
                messageRepository.findByRoomOrderByCreatedAtDesc(
                        room,
                        PageRequest.of(0, historyLimit)
                ).getContent()
        );
        Collections.reverse(recentMessages);

        int productLimit = Math.max(1, Math.min(properties.getProductLimit(), 50));
        List<Product> products = productRepository.findByDeletedFalseAndStatus(
                ProductStatus.ACTIVE,
                PageRequest.of(0, productLimit, Sort.by(Sort.Direction.DESC, "soldCount"))
        ).getContent();

        return Optional.of(new ChatbotContext(
                roomId,
                messageId,
                triggeringMessage.getContent(),
                buildConversation(room, recentMessages),
                buildProductCatalog(products)
        ));
    }

    private String buildConversation(ChatRoom room, List<Message> messages) {
        StringBuilder context = new StringBuilder();
        for (Message message : messages) {
            if (message.isDeleted() || message.getContent() == null || message.getContent().isBlank()) {
                continue;
            }

            String speaker;
            if (message.getSender().getId().equals(room.getUser().getId())) {
                speaker = "Khach hang";
            } else if (message.getMessageType() == MessageType.BOT) {
                speaker = "Tro ly Gemini";
            } else {
                speaker = "Nhan vien";
            }

            context.append(speaker)
                    .append(": ")
                    .append(message.getContent().trim())
                    .append('\n');
        }
        return context.toString().trim();
    }

    private String buildProductCatalog(List<Product> products) {
        if (products.isEmpty()) {
            return "Hiện tại không có sản phẩm đang bán trong dữ liệu.";
        }

        NumberFormat currency = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        StringBuilder catalog = new StringBuilder();
        for (Product product : products) {
            BigDecimal displayPrice = product.getSalePrice() != null
                    && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0
                    ? product.getSalePrice()
                    : product.getPrice();

            catalog.append("- ")
                    .append(product.getName())
                    .append(" | SKU: ").append(product.getSku())
                    .append(" | Danh mục: ").append(product.getCategory().getName())
                    .append(" | Thương hiệu: ").append(product.getBrand().getName())
                    .append(" | Giá: ").append(currency.format(displayPrice))
                    .append(" | Tồn kho: ").append(product.getStockQuantity())
                    .append(" | Link: /products/").append(product.getId());

            if (product.getShortDescription() != null && !product.getShortDescription().isBlank()) {
                catalog.append(" | Mô tả: ").append(product.getShortDescription().trim());
            }
            catalog.append('\n');
        }
        return catalog.toString().trim();
    }
}
