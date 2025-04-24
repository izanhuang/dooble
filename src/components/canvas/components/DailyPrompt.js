import React, { useEffect, useState } from "react";
import {
  generateDailyPrompt,
  getStoredPrompt,
  savePromptToLocalStorage,
} from "../handlers/promptHandlers";
import "./DailyPrompt.css";

const DailyPrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompt = async () => {
      console.log("Fetching prompt...");
      // First check if we have a stored prompt from today
      const storedPrompt = getStoredPrompt();
      console.log("Stored prompt:", storedPrompt);

      if (storedPrompt) {
        setPrompt(storedPrompt);
        setIsLoading(false);
        return;
      }

      // If no stored prompt, generate a new one
      try {
        console.log("Generating new prompt...");
        const newPrompt = await generateDailyPrompt();
        console.log("New prompt:", newPrompt);
        setPrompt(newPrompt);
        savePromptToLocalStorage(newPrompt);
      } catch (error) {
        console.error("Error fetching prompt:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, []);

  if (isLoading) {
    return (
      <div className="daily-prompt-container">
        <div className="daily-prompt-loading">
          <div className="loading-spinner"></div>
          <span>Loading prompt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-prompt-container">
      <div className="daily-prompt">
        <div className="daily-prompt-header">
          <h2>Today's Drawing Challenge</h2>
          <span className="date">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="prompt-text">
          <p>{prompt}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyPrompt;
