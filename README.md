FinCoach-AI: Personal Finance & Lifestyle Dashboard
MHacks is a modern, interactive web application designed to help users manage their personal finances, set and track goals, compare lifestyle expenses, and engage with a supportive community. Built with React, Vite, and TypeScript, MHacks offers a seamless experience for budgeting, saving, investing, and making smarter lifestyle choices.

Features
Dashboard:
Get a quick overview of your financial health, including balances, income, expenses, and personalized alerts.

Budget Planning:
Set monthly budgets, forecast expenses, and simulate financial scenarios to stay on track.

Goals Tracking:
Define savings, investment, and debt repayment goals. Visualize progress and receive actionable insights.

Lifestyle Comparison:
Compare product prices across platforms and analyze transport options with real-time currency conversion.

AI Chatbot:
Interact with an AI financial coach for budgeting tips, investment advice, and debt strategies.

Community Engagement:
Connect with other users, participate in challenges, and support community campaigns.

Settings:
Personalize your experience with theme, language, and profile options.

Tech Stack
Frontend: React, Vite, TypeScript
State Management: React Context API
Styling: Tailwind CSS
Charts & Visualization: Chart.js, Framer Motion
Icons: Lucide React
Getting Started
Prerequisites
Node.js (v16 or higher)
npm or yarn
Installation
Clone the repository:
git clone https://github.com/yourusername/MHacks-main.git
cd MHacks-main

Install dependencies:
npm install
# or
yarn install

Start the development server:
npm run dev
# or
yarn dev

Open your browser:
Visit http://localhost:5173 to view the app.


Project Structure

MHacks-main/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # Global state management
│   ├── data/            # Mock data and constants
│   ├── pages/           # Main application pages
│   ├── App.tsx          # App entry point
│   └── main.tsx         # Vite main entry
├── public/              # Static assets
├── package.json
└── README.md

Customization
Default Currency:
INR is set as the default currency. You can change this in the mock data and currency utilities.
Theme:
Supports light and dark modes.
Localization:
Easily extendable for multiple languages

Acknowledgements
React
Vite
TypeScript
Tailwind CSS
Chart.js
Framer Motion
Lucide Icons
