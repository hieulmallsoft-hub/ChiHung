package com.sportshop.seed;

import com.sportshop.entity.OrderStatusHistory;
import com.sportshop.repository.OrderRepository;
import com.sportshop.repository.OrderStatusHistoryRepository;
import com.sportshop.repository.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.core.annotation.Order;

@Component
@Order(2)
public class LegacyDataBackfill implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public LegacyDataBackfill(ProductRepository productRepository,
                              OrderRepository orderRepository,
                              OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var productsWithoutSearchText = productRepository.findBySearchTextIsNull();
        if (!productsWithoutSearchText.isEmpty()) {
            productRepository.saveAll(productsWithoutSearchText);
        }

        orderRepository.findAll().stream()
                .filter(order -> !orderStatusHistoryRepository.existsByOrder(order))
                .forEach(order -> {
                    OrderStatusHistory history = new OrderStatusHistory();
                    history.setOrder(order);
                    history.setStatus(order.getStatus());
                    history.setChangedBy("SYSTEM");
                    history.setNote("Khởi tạo trạng thái hiện tại cho đơn hàng cũ");
                    orderStatusHistoryRepository.save(history);
                });
    }
}
