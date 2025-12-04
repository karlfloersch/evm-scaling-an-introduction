# EVM Scaling: An Interactive Introduction

An interactive, scroll-based presentation website that teaches EVM scalability through simulations and visualizations. Inspired by [The Secret Lives of Data](https://thesecretlivesofdata.com/raft/).

## Overview

This project provides a shared mental model for understanding EVM scaling:

- **Resources**: Finite computational limits (CPU, state I/O, bandwidth)
- **Transactions**: Different types consume different resources
- **Demand Curves**: Price elasticity and volatility of demand
- **Fee Markets**: How EIP-1559 finds equilibrium
- **Scaling Solutions**: What each approach actually does
- **Projects**: Real implementations compared

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to view the presentation.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── slides/            # Individual slide components
│   ├── simulations/       # Interactive simulation components
│   ├── visualizations/    # D3/Visx chart components
│   ├── ui/                # Shared UI components
│   └── presentation/      # Presentation mode components
├── lib/
│   └── simulation/        # Core simulation engine
├── data/                  # Static data definitions
│   ├── resources/         # Resource definitions
│   ├── transactions/      # Transaction type definitions
│   ├── scaling-solutions/ # Scaling solution definitions
│   └── projects/          # Project definitions
├── hooks/                 # Custom React hooks
└── stores/                # Zustand state stores
```

## Contributing

We welcome contributions! The data is designed to be easily editable by both humans and AI agents.

### Adding New Data

See the documentation in `docs/`:

- [Adding Resources](docs/ADDING_RESOURCES.md)
- [Adding Transaction Types](docs/ADDING_TRANSACTIONS.md)
- [Adding Scaling Solutions](docs/ADDING_SCALING_SOLUTIONS.md)
- [Adding Projects](docs/ADDING_PROJECTS.md)

### Found an error?

Click the "You're wrong!" button at the bottom of the page to open a GitHub issue with context about what you're viewing.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Visualizations**: D3.js + Visx
- **Animations**: Framer Motion
- **State**: Zustand
- **Deployment**: Vercel

## License

MIT

## Acknowledgments

- Inspired by [The Secret Lives of Data](https://thesecretlivesofdata.com/raft/)
- Built for the Ethereum community
