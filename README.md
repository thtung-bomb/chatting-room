# Dudaji Chat App

A modern, real-time chat application built with React Router, Firebase, and Redux Toolkit.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering with React Router
- ⚡️ Hot Module Replacement (HMR)
- � Real-time chat messaging with Firebase
- 😀 Emoji picker integration
- � User authentication with Firebase Auth
- 🗑️ Group deletion functionality
- 👥 Group members viewer
- 🎨 Modern UI with TailwindCSS and Radix UI
- 📦 State management with Redux Toolkit
- 🔍 Room search functionality
- 📎 File upload support
- ✅ ESLint for code quality
- 🔒 TypeScript by default

## New Features Added

### 🎭 Emoji Picker

- Click the smile icon in the message input to open emoji picker
- Select emojis to add to your messages
- Auto-close when clicking outside

### �️ Group Management

- Delete/leave groups with confirmation dialog
- Right-click or use dropdown menu on group items
- Confirmation prompt prevents accidental deletion

### 👥 Members Viewer

- View all members in a chat group
- See online/offline status
- Access via group dropdown menu

### 🔧 ESLint Integration

- Configured with React, TypeScript, and React Router rules
- Run `npm run lint` to check code quality
- Run `npm run lint:fix` to auto-fix issues

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Code Quality

Check code quality with ESLint:

```bash
npm run lint
```

Auto-fix ESLint issues:

```bash
npm run lint:fix
```

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
