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

## 🧑‍💻 Customize or Build Your Own

1. Open `YourProject.tsx` and look for `TODO` comments.
2. Define which landmarks to use, how to calculate accuracy, and feedback logic.
3. Results are automatically saved per session.

Adapt logic to create new assessments by modifying distance logic, target zones, or animations.

---

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
devProprioVision
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

This is the main logic file for your proprioceptive assessment or game. It brings together user input, webcam capture, MediaPipe hand tracking, scoring, and feedback display.

### Core Functions
- **`predictWebcam()`** — Main loop capturing webcam input and applying the hand tracking model. Defines the assessment logic and feedback.
- **`drawLandmarks_simple(ctx, landmarks, color)`** — Draws hand landmarks onto the canvas with a specified color.
- **`calculateDistance(p1, p2)`** — Returns the pixel distance between two 2D points (e.g., fingertip coordinates).
- **`saveResultsData(tag, sessionId, results)`** — Saves session results to local storage or database.
- **`resizeCanvas()`** — Ensures the overlay canvas size matches the webcam stream dimensions.
- **`createHandLandmarker()`** — Loads the MediaPipe hand tracking model using a WebAssembly-based resolver.
- **`startWebcam(cameraId)`** — Initializes and starts the webcam stream from a selected camera device.

### Key Concepts
- **Session & Task State**: Tracks how many tasks are completed and manages repetition, session ID, and result storage using `useRef` and `useState`.
- **Canvas Rendering**: Flips canvas horizontally to match mirrored webcam and overlays landmarks.
- **User Settings**: Fetched from context (e.g. impaired hand, hand size, selected webcam).
- **Live Feedback**: Based on your scoring metric, the UI reacts with color-coded feedback, animations, and visual scales.
- **Intro & Results Screens**: `showIntroPopup` displays instructions; `showResultsBox` presents metrics and allows session restart.

### How to Customize
1. Inside `predictWebcam()`, choose which hand landmarks to analyze (e.g., index fingertips).
2. Use or replace `calculateDistance()` with your own scoring function.
3. Adjust task conditions, thresholds, and result visualization.
4. Edit visual feedback using components like `ImpairmentScale.tsx`.

This file is modular and designed for rapid prototyping of new proprioceptive tasks.


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

### 📥 Just Download & Run for faster testing

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

For questions, bug reports, or collaborations: **[gcornella15@gmail.com](mailto:gcornella15@gmail.com)** or **[cornellg@uci.edu](mailto:cornellg@uci.edu)**
