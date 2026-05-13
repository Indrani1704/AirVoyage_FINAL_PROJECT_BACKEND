exports.calculatePrice = (basePrice, seatsLeft) => {
  if (seatsLeft < 10) return basePrice * 1.5;
  if (seatsLeft < 30) return basePrice * 1.2;
  return basePrice;
};