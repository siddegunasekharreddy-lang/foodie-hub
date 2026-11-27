const menu = [
  {
    id: "classic-cheeseburger", name: "Classic Cheeseburger", category: "Burgers",
    description: "Juicy grilled patty, cheddar, lettuce and our house sauce.", price: 189, rating: 4.8, prepTime: "15–20 min", isVeg: false, isPopular: true,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=85&fit=crop"
  },
  {
    id: "double-smash-burger", name: "Double Smash Burger", category: "Burgers",
    description: "Two seared patties, caramelised onion and melted cheese.", price: 249, rating: 4.9, prepTime: "18–22 min", isVeg: false, isPopular: true,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900&q=85&fit=crop"
  },
  {
    id: "paneer-tikka-burger", name: "Paneer Tikka Burger", category: "Burgers",
    description: "Spiced paneer, crunchy slaw and mint-yoghurt dressing.", price: 169, rating: 4.6, prepTime: "15–18 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=900&q=85&fit=crop"
  },
  {
    id: "margherita-pizza", name: "Margherita Pizza", category: "Pizza", description: "Stone-baked base, mozzarella, basil and tomato sauce.",
    price: 229, rating: 4.7, prepTime: "20–25 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900&q=85&fit=crop"
  },
  {
    id: "farmhouse-pizza", name: "Farmhouse Pizza", category: "Pizza", description: "Bell peppers, onion, olives, mushrooms and extra cheese.",
    price: 279, rating: 4.8, prepTime: "22–28 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=85&fit=crop"
  },
  {
    id: "pepperoni-pizza", name: "Pepperoni Pizza", category: "Pizza", description: "A crisp golden crust topped with pepperoni and mozzarella.",
    price: 299, rating: 4.8, prepTime: "22–28 min", isVeg: false, isPopular: false,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&q=85&fit=crop"
  },
  {
    id: "chicken-biryani", name: "Chicken Dum Biryani", category: "Indian Meals", description: "Aromatic basmati rice, tender chicken and dum-cooked spices.",
    price: 239, rating: 4.9, prepTime: "20–25 min", isVeg: false, isPopular: true,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=900&q=85&fit=crop"
  },
  {
    id: "veg-biryani", name: "Veg Dum Biryani", category: "Indian Meals", description: "Fragrant basmati rice with fresh vegetables and whole spices.",
    price: 179, rating: 4.6, prepTime: "18–22 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=900&q=85&fit=crop"
  },
  {
    id: "paneer-butter-masala", name: "Paneer Butter Masala", category: "Indian Meals", description: "Soft paneer cubes in a rich tomato-cashew gravy.",
    price: 219, rating: 4.8, prepTime: "18–22 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=900&q=85&fit=crop"
  },
  {
    id: "chicken-butter-masala", name: "Chicken Butter Masala", category: "Indian Meals", description: "Creamy tomato gravy with smoky, tandoori-style chicken.",
    price: 259, rating: 4.7, prepTime: "20–25 min", isVeg: false, isPopular: false,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=900&q=85&fit=crop"
  },
  {
    id: "alfredo-pasta", name: "Creamy Alfredo Pasta", category: "Pasta", description: "Penne pasta tossed in a silky parmesan cream sauce.",
    price: 219, rating: 4.7, prepTime: "15–20 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=900&q=85&fit=crop"
  },
  {
    id: "arrabbiata-pasta", name: "Arrabbiata Pasta", category: "Pasta", description: "Penne in a lively tomato, garlic and chilli sauce.",
    price: 199, rating: 4.5, prepTime: "15–20 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900&q=85&fit=crop"
  },
  {
    id: "chicken-noodles", name: "Chicken Hakka Noodles", category: "Asian", description: "Wok-tossed noodles with chicken, vegetables and soy.",
    price: 189, rating: 4.6, prepTime: "15–20 min", isVeg: false, isPopular: true,
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&q=85&fit=crop"
  },
  {
    id: "veg-momos", name: "Steamed Veg Momos", category: "Snacks", description: "Six soft dumplings served with spicy tomato chutney.",
    price: 129, rating: 4.6, prepTime: "12–15 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=900&q=85&fit=crop"
  },
  {
    id: "crispy-french-fries", name: "Crispy French Fries", category: "Snacks", description: "Golden, lightly salted fries with a dip of your choice.",
    price: 99, rating: 4.5, prepTime: "10–12 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900&q=85&fit=crop"
  },
  {
    id: "chicken-wings", name: "Peri Peri Chicken Wings", category: "Snacks", description: "Six spicy, oven-roasted wings with a cooling dip.",
    price: 199, rating: 4.7, prepTime: "16–20 min", isVeg: false, isPopular: false,
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=900&q=85&fit=crop"
  },
  {
    id: "chocolate-brownie", name: "Chocolate Brownie", category: "Desserts", description: "Warm, fudgy chocolate brownie with a rich centre.",
    price: 119, rating: 4.8, prepTime: "8–10 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=85&fit=crop"
  },
  {
    id: "strawberry-cheesecake", name: "Strawberry Cheesecake", category: "Desserts", description: "Smooth cream-cheese filling on a buttery biscuit base.",
    price: 159, rating: 4.8, prepTime: "8–10 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900&q=85&fit=crop"
  },
  {
    id: "cold-coffee", name: "Classic Cold Coffee", category: "Drinks", description: "Chilled coffee blended with milk and a hint of sweetness.",
    price: 109, rating: 4.6, prepTime: "5–8 min", isVeg: true, isPopular: true,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900&q=85&fit=crop"
  },
  {
    id: "fresh-lime-soda", name: "Fresh Lime Soda", category: "Drinks", description: "Fresh lime, sparkling soda and a pinch of black salt.",
    price: 79, rating: 4.5, prepTime: "5–8 min", isVeg: true, isPopular: false,
    image: "https://images.unsplash.com/photo-1513558161293-cafd765edfd4?w=900&q=85&fit=crop"
  }
];

module.exports = menu;
