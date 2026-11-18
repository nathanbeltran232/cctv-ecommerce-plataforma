const { readData, writeData } = require('./fileManager');

const processOrder = (req, res) => {
    const orders = readData('pedidos.json');
    const calendar = readData('calendario.json');
    const newOrder = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (idempotencyKey && orders.some(order => order.folio === idempotencyKey)) {
        return res.status(200).json({ message: 'Order already processed', order: orders.find(o => o.folio === idempotencyKey) });
    }

    if (newOrder.citaInstalacion) {
        const dateKey = newOrder.citaInstalacion.slice(0, 16).replace('T', '_');
        if (calendar.includes(dateKey)) {
            return res.status(409).json({ error: 'Date already booked' });
        }
        calendar.push(dateKey);
        writeData('calendario.json', calendar);
    }

    orders.unshift(newOrder);
    writeData('pedidos.json', orders);

    return res.status(201).json({ message: 'Order confirmed', order: newOrder });
};

const cancelOrder = (req, res) => {
    const orders = readData('pedidos.json');
    const calendar = readData('calendario.json');
    const folio = req.params.folio;

    const orderIndex = orders.findIndex(o => o.folio === folio);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    if (orders[orderIndex].citaInstalacion) {
        const appointmentDate = new Date(orders[orderIndex].citaInstalacion);
        const hoursLeft = (appointmentDate - new Date()) / 3600000;
        
        if (hoursLeft < 24) {
            return res.status(400).json({ error: 'Cannot cancel with less than 24 hours notice' });
        }

        const dateKey = orders[orderIndex].citaInstalacion.slice(0, 16).replace('T', '_');
        const updatedCalendar = calendar.filter(date => date !== dateKey);
        writeData('calendario.json', updatedCalendar);
    }

    orders[orderIndex].estatus = 'Cancelado por el cliente (reembolso en proceso)';
    writeData('pedidos.json', orders);

    return res.status(200).json({ message: 'Order cancelled successfully' });
};

const requestReturn = (req, res) => {
    const orders = readData('pedidos.json');
    const folio = req.params.folio;
    const reason = req.body.reason;

    const orderIndex = orders.findIndex(o => o.folio === folio);
    if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

    orders[orderIndex].estatus = `Devolución solicitada: "${reason}"`;
    writeData('pedidos.json', orders);

    return res.status(200).json({ message: 'Return requested successfully' });
};

const getBookedAppointments = (req, res) => {
    const calendar = readData('calendario.json');
    return res.status(200).json(calendar);
};
module.exports = { processOrder, cancelOrder, requestReturn, getBookedAppointments };

