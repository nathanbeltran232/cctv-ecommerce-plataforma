
const calculateQuote = (req, res) => {
    const items = req.body.items || [];
    const services = req.body.services || [];

    let itemsSubtotal = 0;
    let servicesSubtotal = 0;

    items.forEach(item => {
        itemsSubtotal += item.price * item.quantity;
    });

    services.forEach(service => {
        servicesSubtotal += service.price * service.quantity;
    });

    const subtotal = itemsSubtotal + servicesSubtotal;
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    const quoteResult = {
        itemsSubtotal,
        servicesSubtotal,
        subtotal,
        tax,
        total
    };

    return res.status(200).json(quoteResult);
};

module.exports = {
    calculateQuote
};