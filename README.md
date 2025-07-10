# 🧠 Proprio Vision

**Proprio Vision** is a React app built with **Vite**, designed for fast development and optimized performance. It enables proprioceptive assessment and training using a webcam and MediaPipe. Below is a complete guide to running, understanding, and deploying the app.

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) (v16 or later recommended)
* [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

---

## 🤝 Contributing

Go to [https://github.com/gcornella/devpropriovision](https://github.com/gcornella/devpropriovision) and click **Fork** to create your own copy of the repo.

### Clone Your Fork Locally:
```bash
git clone https://github.com/YOUR_USERNAME/devpropriovision
cd devpropriovision
````

### Create a Feature Branch Named After Your Assessment:

```bash
git checkout -b your-assessment-name
```

### Commit and Push Changes:

```bash
git add .
git commit -m "Add assessment: your-assessment-name"
git push -u origin your-assessment-name
```

### Submit a Pull Request:

Go to your fork on GitHub and click **“Compare & pull request”** to propose your changes.

---

## 📂 Project Structure

```
propriovision
├── public/              # Static assets (images, icons)
├── src/
│   ├── assets/          # Static media and logos
│   ├── components/      # UI components (e.g., Footer, Header)
│   ├── contexts/        # React Contexts (user, camera)
│   ├── models/          # Hand tracking models
│   ├── pages/           # Main pages (Home, Settings, YourProject)
│   ├── utils/           # Utility functions (e.g., saveResultsData)
│   └── App.tsx, main.tsx, index.css
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite config
└── vercel.json          # Vercel deploy settings
```

---

## ⚙️ Contexts

* **UserContext.tsx**: Manages user state, settings, and guest ID.
* **CameraContext.tsx**: Handles webcam setup and device selection.

---

## 🧩 Components

* **Header.tsx**: Top navigation and project name
* **Footer.tsx**: Bottom links and acknowledgements
* **ImpairmentScale.tsx**: Visual feedback scale for task performance

---

## 🧭 Pages

* **Home.tsx**: Landing page. Try "Your Project" to launch the main assessment/game.
* **Settings.tsx**: Select hand, spasticity type, sex, age, and webcam. Also calibrate hand size.
* **RecordHandSize.tsx**: Guides user to measure hand size in 2D via MediaPipe landmarks.
* **Statistics.tsx**: View past session metrics stored in local storage.
* **YourProject.tsx**: Customize this for your own proprioceptive experiment/game.

---

## 🛠 YourProject.tsx

Core functions:

* `predictWebcam()` — Captures webcam input and runs MediaPipe hand detection.
* `drawLandmarks_simple()` — Renders hand landmarks on a canvas.
* `calculateDistance()` — Computes distances between hand points.
* `saveResultsData()` — Saves scores to local storage.

---

## 🧑‍💻 How to Customize or Build Your Own

1. Open `YourProject.tsx` and look for `TODO` comments.
2. Define which landmarks to use, how to calculate accuracy, and feedback logic.
3. Results are automatically saved per session.

Adapt logic to create new assessments by modifying distance logic, target zones, or animations.

---

## ☁️ Deployment to Vercel

Deploy your app to Vercel in 5 steps:

1. Push your code to a public GitHub repository.
2. Go to [vercel.com/import](https://vercel.com/import).
3. Connect your GitHub account and select your repo.
4. Vercel auto-detects Vite; just confirm settings.
5. Visit `https://yourproject.vercel.app` to see it live.

---

## 🔧 Tech Stack

* ⚛️ React (TypeScript)
* ⚡ Vite for build and dev
* 🎯 MediaPipe Hands
* 💅 Tailwind CSS (optional)
* 🔥 Firebase (optional)

---

### 📥 Just Download & Run

Clone the repository:

```bash
git clone https://github.com/gcornella/devpropriovision
cd devpropriovision
```

Install dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open your browser at:

```
http://localhost:5173
```

---

## 📜 Citation

If using this project in research or development, cite as:

```bibtex
@software{propriovision2025,
  title = {ProprioVision: Assessing and Training Proprioception with a Single Webcam},
  author = {Guillem Cornella-Barba},
  year = {2025},
  url = {https://github.com/gcornella/devpropriovision}
}
```

---

## 🛟 Support / Contact

For questions, bug reports, or collaborations: **[gcornella15@gmail.com](mailto:gcornella15@gmail.com)**
