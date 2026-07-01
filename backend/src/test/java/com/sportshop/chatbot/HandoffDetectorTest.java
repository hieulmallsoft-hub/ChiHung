package com.sportshop.chatbot;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HandoffDetectorTest {

    private final HandoffDetector detector = new HandoffDetector();

    @Test
    void detectsVietnameseHandoffRequestsWithOrWithoutAccents() {
        assertTrue(detector.requestsHuman("Cho mình gặp nhân viên với"));
        assertTrue(detector.requestsHuman("toi muon gap admin"));
    }

    @Test
    void keepsNormalShoppingQuestionsWithTheBot() {
        assertFalse(detector.requestsHuman("Shop có giày chạy bộ dưới 2 triệu không?"));
        assertFalse(detector.requestsHuman(""));
    }
}
