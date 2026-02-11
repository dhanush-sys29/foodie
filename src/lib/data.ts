export const restaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.5,
    imageUrl: '/placeholder-images/restaurant-1.jpeg',
    imageHint: 'modern restaurant interior',
  },
  {
    id: '2',
    name: 'Burger Barn',
    cuisine: 'American',
    rating: 4.2,
    imageUrl: '/placeholder-images/restaurant-2.jpeg',
    imageHint: 'diner restaurant',
  },
  {
    id: '3',
    name: 'Sushi Station',
    cuisine: 'Japanese',
    rating: 4.8,
    imageUrl: '/placeholder-images/restaurant-3.jpeg',
    imageHint: 'sushi bar',
  },
  {
    id: '4',
    name: 'Taco Town',
    cuisine: 'Mexican',
    rating: 4.6,
    imageUrl: '/placeholder-images/restaurant-4.jpeg',
    imageHint: 'mexican restaurant',
  },
];

export const menuItems = {
  '1': [ // Pizza Palace
    { id: 'm1-1', name: 'Margherita Pizza', description: 'Classic cheese and tomato', price: 12.99, imageUrl: '/placeholder-images/food-pizza.jpeg', imageHint: 'margherita pizza', available: true },
    { id: 'm1-2', name: 'Pepperoni Pizza', description: 'Loaded with pepperoni', price: 14.99, imageUrl: '/placeholder-images/food-pepperoni-pizza.jpeg', imageHint: 'pepperoni pizza', available: true },
    { id: 'm1-3', name: 'Garlic Bread', description: 'With mozzarella cheese', price: 6.99, imageUrl: '/placeholder-images/food-garlic-bread.jpeg', imageHint: 'garlic bread', available: false },
  ],
  '2': [ // Burger Barn
    { id: 'm2-1', name: 'Classic Cheeseburger', description: 'Beef patty, cheese, lettuce, tomato', price: 10.99, imageUrl: '/placeholder-images/food-burger.jpeg', imageHint: 'cheeseburger', available: true },
    { id: 'm2-2', name: 'Fries', description: 'Crispy golden fries', price: 4.99, imageUrl: '/placeholder-images/food-fries.jpeg', imageHint: 'french fries', available: true },
  ],
  '3': [ // Sushi Station
    { id: 'm3-1', name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, imageUrl: '/placeholder-images/food-sushi.jpeg', imageHint: 'sushi roll', available: true },
  ],
  '4': [ // Taco Town
    { id: 'm4-1', name: 'Beef Tacos', description: 'Three crispy beef tacos', price: 9.99, imageUrl: '/placeholder-images/food-tacos.jpeg', imageHint: 'tacos', available: true },
  ],
};

export const orders = [
  { id: 'ORD-001', customer: 'John Doe', restaurant: 'Pizza Palace', status: 'Delivered', total: 29.98, date: '2023-10-26' },
  { id: 'ORD-002', customer: 'Jane Smith', restaurant: 'Burger Barn', status: 'Delivered', total: 15.98, date: '2023-10-26' },
  { id: 'ORD-003', customer: 'Peter Jones', restaurant: 'Pizza Palace', status: 'In Progress', total: 19.98, date: '2023-10-27' },
];

export const deliveryJobs = [
    {
        id: 'JOB-001',
        orderId: 'ORD-003',
        restaurantName: 'Pizza Palace',
        restaurantAddress: '123 Pizza St, Foodville',
        customerName: 'Peter Jones',
        customerAddress: '456 Home Ave, Foodville',
        status: 'Pending Pickup',
        restaurantCoords: { lat: 34.0522, lng: -118.2437 },
        customerCoords: { lat: 34.0622, lng: -118.2537 },
    },
    {
        id: 'JOB-002',
        orderId: 'ORD-004',
        restaurantName: 'Taco Town',
        restaurantAddress: '789 Taco Rd, Foodville',
        customerName: 'Mary Brown',
        customerAddress: '101 Residence Blvd, Foodville',
        status: 'Pending Pickup',
        restaurantCoords: { lat: 34.0422, lng: -118.2337 },
        customerCoords: { lat: 34.0555, lng: -118.2637 },
    }
];

export const findRestaurantById = (id: string) => restaurants.find(r => r.id === id);
export const getMenuItemsByRestaurantId = (id: string) => menuItems[id as keyof typeof menuItems] || [];
