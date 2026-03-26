package com.sportshop.seed;

import com.sportshop.entity.*;
import com.sportshop.enums.*;
import com.sportshop.repository.*;
import com.sportshop.util.CodeGenerator;
import com.sportshop.util.SlugUtil;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      AddressRepository addressRepository,
                      CategoryRepository categoryRepository,
                      BrandRepository brandRepository,
                      ProductRepository productRepository,
                      ProductImageRepository productImageRepository,
                      CartRepository cartRepository,
                      OrderRepository orderRepository,
                      OrderItemRepository orderItemRepository,
                      PaymentRepository paymentRepository,
                      CouponRepository couponRepository,
                      ChatRoomRepository chatRoomRepository,
                      MessageRepository messageRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.cartRepository = cartRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.couponRepository = couponRepository;
        this.chatRoomRepository = chatRoomRepository;
        this.messageRepository = messageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean hasExistingUsers = userRepository.countByDeletedFalse() > 0;

        Role adminRole = ensureRole(RoleName.ROLE_ADMIN);
        Role userRole = ensureRole(RoleName.ROLE_USER);

        User admin = ensureAdmin(adminRole);

        if (hasExistingUsers) {
            return;
        }

        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            users.add(createUser(
                    "User Demo " + i,
                    "user" + i + "@sportshop.vn",
                    "user123",
                    "09100000" + String.format("%02d", i),
                    Set.of(userRole)
            ));
        }

        List<Category> categories = seedCategories();
        List<Brand> brands = seedBrands();
        List<Product> products = seedProducts(categories, brands);

        seedCoupons();

        for (User user : users) {
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);

            Address address = new Address();
            address.setUser(user);
            address.setReceiverName(user.getFullName());
            address.setReceiverPhone(user.getPhone());
            address.setLine1("123 Duong Nguyen Trai");
            address.setCity("Ho Chi Minh");
            address.setState("Quan 1");
            address.setCountry("Vietnam");
            address.setDefaultAddress(true);
            addressRepository.save(address);
        }

        createDemoOrder(users.get(0), products.get(0), products.get(1), OrderStatus.DELIVERED, PaymentStatus.PAID);
        createDemoOrder(users.get(1), products.get(3), products.get(4), OrderStatus.SHIPPING, PaymentStatus.PAID);
        createDemoOrder(users.get(2), products.get(6), products.get(7), OrderStatus.PENDING, PaymentStatus.PENDING);

        ChatRoom room = new ChatRoom();
        room.setUser(users.get(0));
        room.setAssignedAdmin(admin);
        room.setStatus(ChatRoomStatus.OPEN);
        room.setLastMessageAt(LocalDateTime.now());
        room = chatRoomRepository.save(room);

        Message msg = new Message();
        msg.setRoom(room);
        msg.setSender(users.get(0));
        msg.setContent("Xin chao admin, toi can tu van giay chay bo.");
        msg.setReadByUser(true);
        msg.setReadByAdmin(false);
        messageRepository.save(msg);
    }

    private Role ensureRole(RoleName roleName) {
        return roleRepository.findByName(roleName).orElseGet(() -> {
            Role role = new Role();
            role.setName(roleName);
            return roleRepository.save(role);
        });
    }

    private User ensureAdmin(Role adminRole) {
        return userRepository.findByEmailAndDeletedFalse("admin@sportshop.vn")
                .map(user -> {
                    if (user.getRoles().stream().noneMatch(role -> role.getName() == RoleName.ROLE_ADMIN)) {
                        user.getRoles().add(adminRole);
                        user.setEnabled(true);
                        return userRepository.save(user);
                    }
                    return user;
                })
                .orElseGet(() -> createUser("Admin System", "admin@sportshop.vn", "admin123", "0900000000", Set.of(adminRole)));
    }

    private User createUser(String fullName, String email, String rawPassword, String phone, Set<Role> roles) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setPhone(phone);
        user.setStatus(UserStatus.ACTIVE);
        user.setEnabled(true);
        user.setRoles(new HashSet<>(roles));
        return userRepository.save(user);
    }

    private List<Category> seedCategories() {
        String[][] data = {
                {"Pickleball", "San pham cho bo mon pickleball"},
                {"Cau Long", "Vot, giay, quan ao cau long"},
                {"Bong Da", "Do the thao bong da"},
                {"Gym", "Dung cu va trang phuc gym"},
                {"Chay Bo", "Giay va phu kien running"},
                {"Bong Ro", "Banh, giay, do tap bong ro"}
        };

        List<Category> categories = new ArrayList<>();
        for (String[] entry : data) {
            Category category = new Category();
            category.setName(entry[0]);
            category.setSlug(SlugUtil.toSlug(entry[0]));
            category.setDescription(entry[1]);
            categories.add(categoryRepository.save(category));
        }
        return categories;
    }

    private List<Brand> seedBrands() {
        String[] names = {"Nike", "Adidas", "Yonex", "Li-Ning", "Asics", "Mizuno", "Wilson", "Molten"};
        List<Brand> brands = new ArrayList<>();
        for (String name : names) {
            Brand brand = new Brand();
            brand.setName(name);
            brand.setSlug(SlugUtil.toSlug(name));
            brand.setDescription("Thuong hieu " + name + " cho do the thao");
            brands.add(brandRepository.save(brand));
        }
        return brands;
    }

    private List<Product> seedProducts(List<Category> categories, List<Brand> brands) {
        Map<String, List<String>> categoryImages = Map.of(
                "pickleball", List.of(
                        "https://images.unsplash.com/photo-1710772099352-f8fbb7b30977?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1693142518820-78d7a05f1546?auto=format&fit=crop&w=1200&q=80"
                ),
                "cau-long", List.of(
                        "https://images.unsplash.com/photo-1721760886982-3c643f05813d?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1722003180803-577efd6d2ecc?auto=format&fit=crop&w=1200&q=80"
                ),
                "bong-da", List.of(
                        "https://images.unsplash.com/photo-1647426045352-64657a80adaa?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1702467430182-f955bb8ced5b?auto=format&fit=crop&w=1200&q=80"
                ),
                "gym", List.of(
                        "https://images.unsplash.com/photo-1745329532589-4f33352c4b10?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1744551154623-4b5336e95c28?auto=format&fit=crop&w=1200&q=80"
                ),
                "chay-bo", List.of(
                        "https://images.unsplash.com/photo-1765914448153-a393fe90beb2?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1748280621226-91f9530fc329?auto=format&fit=crop&w=1200&q=80"
                ),
                "bong-ro", List.of(
                        "https://images.unsplash.com/photo-1692626343802-3ee09e648120?auto=format&fit=crop&w=1200&q=80",
                        "https://images.unsplash.com/photo-1577065039225-69d79b04cf38?auto=format&fit=crop&w=1200&q=80"
                )
        );
        List<String> defaultImages = categoryImages.get("gym");

        List<String[]> raw = List.of(
                new String[]{"Vot Pickleball Carbon Pro", "1290000", "1090000", "SPK-001", "0", "6"},
                new String[]{"Set Bong Pickleball 3 Qua", "220000", "190000", "SPK-002", "0", "6"},
                new String[]{"Giay Pickleball Grip Max", "1790000", "1590000", "SPK-003", "0", "0"},
                new String[]{"Vot Cau Long Yonex Astrox 77", "3290000", "2990000", "SCL-001", "1", "2"},
                new String[]{"Ao Cau Long Dry Fit", "390000", "320000", "SCL-002", "1", "1"},
                new String[]{"Giay Cau Long Chuyen Dung", "1490000", "1290000", "SCL-003", "1", "5"},
                new String[]{"Bong Da FIFA Size 5", "520000", "450000", "SBD-001", "2", "7"},
                new String[]{"Giay Da Bong San Co Nhan Tao", "1890000", "1650000", "SBD-002", "2", "0"},
                new String[]{"Ao Dau CLB Mau Do", "690000", "590000", "SBD-003", "2", "1"},
                new String[]{"Gang Tay Thu Mon Pro", "790000", "690000", "SBD-004", "2", "1"},
                new String[]{"Ao Ba Lo Gym Compression", "350000", "290000", "SGY-001", "3", "0"},
                new String[]{"Quan Gym Co Gian 4 Chieu", "420000", "350000", "SGY-002", "3", "1"},
                new String[]{"Day Khang Luc 5 Muc", "450000", "390000", "SGY-003", "3", "3"},
                new String[]{"Binh Nuoc Gym 1L", "150000", "120000", "SGY-004", "3", "4"},
                new String[]{"Giay Running Asics Gel", "2490000", "2190000", "SRN-001", "4", "4"},
                new String[]{"Dong Ho Chay Bo GPS Mock", "1990000", "1690000", "SRN-002", "4", "6"},
                new String[]{"Tat Chay Bo Chuyen Dung", "180000", "150000", "SRN-003", "4", "2"},
                new String[]{"Tui Deo Bung Running", "260000", "220000", "SRN-004", "4", "6"},
                new String[]{"Bong Ro Molten BG5000", "1850000", "1650000", "SBR-001", "5", "7"},
                new String[]{"Giay Bong Ro Co Cao", "2690000", "2390000", "SBR-002", "5", "0"},
                new String[]{"Bang Bao Ve Dau Goi", "290000", "250000", "SBR-003", "5", "3"},
                new String[]{"Ao Tanktop Bong Ro", "480000", "420000", "SBR-004", "5", "1"},
                new String[]{"Quan The Thao Da Nang", "430000", "350000", "SPT-001", "3", "0"},
                new String[]{"Balo The Thao Chong Nuoc", "850000", "760000", "SPT-002", "4", "1"},
                new String[]{"Khan Lanh The Thao", "120000", "95000", "SPT-003", "3", "6"},
                new String[]{"Vo Bao Ve Co Tay", "210000", "180000", "SPT-004", "0", "5"}
        );

        List<Product> products = new ArrayList<>();
        Random random = new Random();

        for (String[] p : raw) {
            Product product = new Product();
            Category category = categories.get(Integer.parseInt(p[4]));
            product.setName(p[0]);
            product.setPrice(new BigDecimal(p[1]));
            product.setSalePrice(new BigDecimal(p[2]));
            product.setSku(p[3]);
            product.setCategory(category);
            product.setBrand(brands.get(Integer.parseInt(p[5])));
            product.setShortDescription("San pham " + p[0] + " chat luong cao cho nguoi choi the thao.");
            product.setDescription("Mo ta chi tiet cho " + p[0] + ". Vat lieu ben bi, thiet ke hien dai, phu hop tap luyen va thi dau.");
            List<String> images = categoryImages.getOrDefault(category.getSlug(), defaultImages);
            String thumbnailUrl = images.get(0);
            product.setThumbnailUrl(thumbnailUrl);
            product.setStockQuantity(10 + random.nextInt(40));
            product.setSoldCount(random.nextInt(15));
            product.setStatus(ProductStatus.ACTIVE);

            product = productRepository.save(product);
            products.add(product);

            ProductImage img1 = new ProductImage();
            img1.setProduct(product);
            img1.setImageUrl(thumbnailUrl);
            img1.setPrimaryImage(true);
            img1.setSortOrder(0);

            ProductImage img2 = new ProductImage();
            img2.setProduct(product);
            img2.setImageUrl(images.size() > 1 ? images.get(1) : thumbnailUrl);
            img2.setSortOrder(1);

            productImageRepository.saveAll(List.of(img1, img2));
        }

        return products;
    }

    private void seedCoupons() {
        Coupon c1 = new Coupon();
        c1.setCode("SPORT10");
        c1.setDescription("Giam 10% don hang");
        c1.setDiscountType(DiscountType.PERCENT);
        c1.setDiscountValue(BigDecimal.valueOf(10));
        c1.setMinOrderValue(BigDecimal.valueOf(500000));
        c1.setMaxDiscount(BigDecimal.valueOf(200000));
        c1.setUsageLimit(200);
        c1.setUsageCount(0);
        c1.setActive(true);
        c1.setStartAt(LocalDateTime.now().minusDays(1));
        c1.setEndAt(LocalDateTime.now().plusMonths(6));

        Coupon c2 = new Coupon();
        c2.setCode("FREESHIP50");
        c2.setDescription("Giam 50000 VND");
        c2.setDiscountType(DiscountType.FIXED);
        c2.setDiscountValue(BigDecimal.valueOf(50000));
        c2.setMinOrderValue(BigDecimal.valueOf(700000));
        c2.setUsageLimit(100);
        c2.setUsageCount(0);
        c2.setActive(true);
        c2.setStartAt(LocalDateTime.now().minusDays(1));
        c2.setEndAt(LocalDateTime.now().plusMonths(6));

        couponRepository.saveAll(List.of(c1, c2));
    }

    private void createDemoOrder(User user,
                                 Product p1,
                                 Product p2,
                                 OrderStatus status,
                                 PaymentStatus paymentStatus) {
        Address address = addressRepository.findByUser(user).stream().findFirst().orElseThrow();

        Order order = new Order();
        order.setOrderCode(CodeGenerator.orderCode());
        order.setUser(user);
        order.setAddress(address);
        order.setReceiverName(address.getReceiverName());
        order.setReceiverPhone(address.getReceiverPhone());
        order.setShippingAddress(address.getLine1() + ", " + address.getCity());
        order.setStatus(status);
        order.setPaymentMethod(PaymentMethod.COD);
        order.setPaymentStatus(paymentStatus);

        BigDecimal subtotal = p1.getSalePrice().add(p2.getSalePrice());
        BigDecimal shipping = BigDecimal.valueOf(30000);
        BigDecimal discount = BigDecimal.ZERO;

        order.setSubtotal(subtotal);
        order.setShippingFee(shipping);
        order.setDiscountAmount(discount);
        order.setFinalTotal(subtotal.add(shipping));
        order = orderRepository.save(order);

        OrderItem i1 = new OrderItem();
        i1.setOrder(order);
        i1.setProduct(p1);
        i1.setProductName(p1.getName());
        i1.setSku(p1.getSku());
        i1.setUnitPrice(p1.getSalePrice());
        i1.setQuantity(1);
        i1.setLineTotal(p1.getSalePrice());

        OrderItem i2 = new OrderItem();
        i2.setOrder(order);
        i2.setProduct(p2);
        i2.setProductName(p2.getName());
        i2.setSku(p2.getSku());
        i2.setUnitPrice(p2.getSalePrice());
        i2.setQuantity(1);
        i2.setLineTotal(p2.getSalePrice());

        orderItemRepository.saveAll(List.of(i1, i2));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(PaymentMethod.COD);
        payment.setStatus(paymentStatus);
        if (paymentStatus == PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now().minusDays(2));
        }
        paymentRepository.save(payment);
    }
}
