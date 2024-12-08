# BTC/USDT Trade Visualizer

A real-time 3D visualization of Bitcoin trades using Three.js and Binance WebSocket API.

![Demo Preview](demo.gif)

## Features

- Real-time visualization of BTC/USDT trades from Binance
- 3D particle system with physics
- Green particles for buy orders, red for sell orders
- Particle size based on trade volume
- Smooth animations and transitions

## Tech Stack

- React
- Three.js (@react-three/fiber)
- Binance WebSocket API
- Vite

## Installation

1. Clone the repository:

git clone https://github.com/your-username/btc-trade-visualizer.git

2. Install dependencies:

cd btc-trade-visualizer
npm install

3. Run the development server:

npm run dev

4. Build for production:

npm run build

## How it Works

The application connects to Binance's WebSocket API to receive real-time trade data for the BTC/USDT trading pair. Each trade is represented as a 3D particle with physics:

- Particle color indicates trade type (green for buys, red for sells)
- Particle size is logarithmically scaled based on trade volume
- Particles fall with simulated gravity and random initial velocity
- Particles are automatically removed when they fall below the visible area

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
