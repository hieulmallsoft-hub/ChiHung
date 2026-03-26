package com.sportshop.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtil {

    private MoneyUtil() {
    }

    public static BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    public static BigDecimal scale(BigDecimal value) {
        return nvl(value).setScale(2, RoundingMode.HALF_UP);
    }
}
