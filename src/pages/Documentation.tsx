import React from "react";
import "./Documentation.css";

const DocumentationPage: React.FC = () => {
  return (
    <div className="doc-container">
      <h1 className="doc-title">🧠 Documentation</h1>

      <section className="doc-section">
        <h2>📥 How to Download & Run</h2>
        <p>This project uses <strong>Vite</strong> for fast development and modern tooling. To get started:</p>
        <pre><code>git clone https://github.com/gcornella/devpropriovision</code></pre>
        <pre><code>cd devpropriovision</code></pre>
        <pre><code>npm install</code></pre>
        <pre><code>npm run dev</code></pre>
        <p>Then visit <code>http://localhost:0000</code> in your browser to view the app and change 0000 by your address.</p>
      </section>

      

      <section className="doc-section">
        <h2>📂 Project Structure</h2>
        <p>The project is organized into the following main directories:</p>
        <ul>
          <li><strong>src/</strong>: Contains all source code files.</li>
          <li><strong>public/</strong>: Static assets like images and icons.</li>
          <li><strong>package.json</strong>: Lists dependencies and scripts for building and running the app.</li>
        </ul>
      </section>
  
      <section className="doc-section">
        <h2>🛠 Contexts</h2>
        <ul>
          <li><strong>UserContext.tsx</strong>: Manages user state, user settings, including guest ID and hand size calibration.</li>
          <li><strong>CameraContext.tsx</strong>: Provides camera access and video stream management for hand tracking.</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>🛠 Components</h2>
        <ul>
          <li><strong>Header.tsx</strong>: Displays the app header with navigation and user options.</li>
          <li><strong>Footer.tsx</strong>: Contains links to project resources and social media.</li>
          <li><strong>ImpairmentScale.tsx</strong>: Visual component to show proprioceptive task accuracy using a color-coded scale.</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>🛠 Pages</h2>
        <ul>
          <li><strong>Home.tsx</strong>: Displays project main page. Choose "Try it" under "Your Project" container to run your assessment or game.</li>
          <li><strong>Settings.tsx</strong>: Allows users to configure their preferences such as impaired hand, spasticity level, hand size, and webcam.</li>
          <li><strong>RecordHandSize.tsx</strong>: Guides users through recording their hand size for accurate tracking and normalization of distances, as the tracking is in 2D.</li>
          <li><strong>Statistics.tsx</strong>: Displays session statistics and allows filtering by time window (day, week, month).</li>
          <li><strong>YourProject.tsx</strong>: Main component that runs the proprioceptive assessment or game using webcam hand tracking. Potentially, the only file you have to modify.</li>
        </ul>
      </section>

      <section className="doc-section">
        <h2>🛠 YourProject.tsx</h2>
        <ul>
          <li><strong>predictWebcam()</strong>: Runs continuously to capture video frames and extract hand landmarks using MediaPipe.</li>
          <li><strong>drawLandmarks_simple()</strong>: Renders visual hand joints on a canvas.</li>
          <li><strong>calculateDistance()</strong>: Computes distance between specific hand points to generate a proprioceptive error score.</li>
          <li><strong>saveResultsData()</strong>: Saves session scores to local storage.</li>
        </ul>
      </section>
        


      <section className="doc-section">
        <h2>👤 How to Use or Adapt the App</h2>
        <p>
          On first load, a new user is assigned a guest ID and must choose their preferred settings and calibrate hand size. Once set up:
        </p>
        <ol>
          <li>Open <strong> YourProject.tsx </strong> and start editing where you see a "TODO" comment. Mostly inside <em>predictWebcam()</em></li>
          <li>Choose which proprioceptive assessment or game you want to design, and start coding. Choose your accuracy metric or outcome.</li>
          <li>After each task, feedback should be shown and the results should be saved in the browser's local storage.</li>
        </ol>
        <p>
          To create your own proprioceptive assessments or games, adapt the logic inside <em>YourProject.tsx</em> by changing the landmarks used, adjusting feedback conditions, or adding your own animations.
        </p>
      </section>

      <section className="doc-section">
        <h2>🚀 How to Deploy to Vercel</h2>
        <p>To deploy your app to the web with <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a>:</p>
        <ol>
          <li>Create a GitHub repository for your project and push your local code to it.</li>
          <li>Go to <a href="https://vercel.com/import" target="_blank" rel="noopener noreferrer">https://vercel.com/import</a>.</li>
          <li>Connect your GitHub account and select your project repo.</li>
          <li>Vercel will auto-detect it's a Vite project. Confirm and deploy.</li>
          <li>Your project will be live at <code>https://yourproject.vercel.app</code> (or similar).</li>
        </ol>
      </section>

      <section className="doc-section">
        <h2>📜 Attribution</h2>
        <p>Please credit this work if you use or adapt it:</p>
        <pre>
          <code>
        {`@software{propriovision2025,
          title = {ProprioVision: Assessing and Training Proprioception with a Single Webcam},
          author = {Guillem Cornella-Barba},
          year = {2025},
          url = {https://github.com/gcornella/devpropriovision}
        }`}
          </code>
        </pre>

      </section>
    </div>
  );
};

export default DocumentationPage;
