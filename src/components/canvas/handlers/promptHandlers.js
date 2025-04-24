const drawingPrompts = [
  // Animals
  "Cat",
  "Dog",
  "Elephant",
  "Lion",
  "Penguin",
  "Giraffe",
  "Monkey",
  "Tiger",
  "Bear",
  "Horse",

  // Objects
  "House",
  "Car",
  "Tree",
  "Book",
  "Phone",
  "Chair",
  "Table",
  "Clock",
  "Lamp",
  "Bicycle",

  // Food
  "Pizza",
  "Hamburger",
  "Ice Cream",
  "Apple",
  "Banana",
  "Cake",
  "Cookie",
  "Pasta",
  "Sandwich",
  "Pancake",

  // Nature
  "Sun",
  "Moon",
  "Star",
  "Cloud",
  "Rain",
  "Snow",
  "Flower",
  "Mountain",
  "Beach",
  "Forest",

  // People & Actions
  "Doctor",
  "Teacher",
  "Dancing",
  "Running",
  "Sleeping",
  "Swimming",
  "Singing",
  "Reading",
  "Writing",
  "Jumping",

  // Sports
  "Football",
  "Basketball",
  "Tennis",
  "Golf",
  "Swimming",
  "Cycling",
  "Running",
  "Boxing",
  "Baseball",
  "Soccer",

  // Weather
  "Rainbow",
  "Lightning",
  "Tornado",
  "Sunny",
  "Cloudy",
  "Windy",
  "Storm",
  "Snowman",
  "Umbrella",
  "Thunder",

  // Holidays
  "Christmas Tree",
  "Santa",
  "Easter Egg",
  "Pumpkin",
  "Fireworks",
  "Gift",
  "Candy",
  "Party",
  "Balloon",
  "Candle",
];

export const generateDailyPrompt = async () => {
  // Get a random prompt from our collection
  const randomIndex = Math.floor(Math.random() * drawingPrompts.length);
  return drawingPrompts[randomIndex];
};

export const savePromptToLocalStorage = (prompt) => {
  const today = new Date().toDateString();
  localStorage.setItem(
    "dailyPrompt",
    JSON.stringify({
      prompt,
      date: today,
    })
  );
};

export const getStoredPrompt = () => {
  const stored = localStorage.getItem("dailyPrompt");
  if (!stored) return null;

  const { prompt, date } = JSON.parse(stored);
  const today = new Date().toDateString();

  // Return the prompt only if it's from today
  return date === today ? prompt : null;
};
