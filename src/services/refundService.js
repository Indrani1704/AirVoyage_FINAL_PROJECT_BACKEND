exports.calculateRefund = (booking, flightTime) => {
  const now = new Date();
  const diffHours = (flightTime - now) / (1000 * 60 * 60);

  if (diffHours > 48) return booking.totalPrice * 0.9;
  if (diffHours > 24) return booking.totalPrice * 0.5;
  return booking.totalPrice * 0.1;
};