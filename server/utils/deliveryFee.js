
const calculateDeliveryFee = (subtotal) => {
    if (!Number.isFinite(subtotal) || subtotal <= 0) {
        return 0;
    }

    if (subtotal >= 599) return 0;
    if (subtotal >= 200) return 25;

    return 40;
};

export default calculateDeliveryFee;
