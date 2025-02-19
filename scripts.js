"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // --- Helper Functions ---

  async function detectLanguage(text) {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.ai &&
        chrome.ai.languageDetection
      ) {
        const response = await chrome.ai.languageDetection.detect(text);
        return response.language || "unknown";
      } else {
        return /[а-яА-Я]/.test(text) ? "ru" : "en";
      }
    } catch (error) {
      console.error("Language detection error:", error);
      throw new Error("Language detection failed");
    }
  }

  async function translateText(text, targetLang, sourceLang = "auto") {
    try {
      if (typeof chrome !== "undefined" && chrome.ai && chrome.ai.translator) {
        try {
          const response = await chrome.ai.translator.translate(text, {
            targetLanguage: targetLang,
            sourceLanguage: sourceLang,
          });
          return response.translation || "Translation not available";
        } catch (chromeError) {
          console.error(
            "Chrome translator error, falling back to Google Translate:",
            chromeError
          );
        }
      }
      // Fallback to Google Translate endpoint
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        text
      )}`;
      const res = await fetch(url);
      const json = await res.json();
      return json[0].map((item) => item[0]).join("");
    } catch (error) {
      console.error("Translation error:", error);
      throw new Error("Translation failed");
    }
  }

  // --- Improved Summarization Function ---
  const summarizeContent = async (text) => {
    // Try using the built-in summarizer first
    try {
      if (typeof chrome !== "undefined" && chrome.ai && chrome.ai.summarizer) {
        const response = await chrome.ai.summarizer.summarize(text);
        if (response.summary) return response.summary;
      }
    } catch (err) {
      console.error("Built-in summarizer error:", err);
    }
    
    // Fallback: a simple frequency-based summarization
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
    if (sentences.length <= 1) return text; // Not enough to summarize

    const stopWords = new Set(["the", "and", "a", "an", "of", "in", "to", "is", "it", "that", "this"]);
    const words = text.toLowerCase().match(/\w+/g) || [];
    const freqMap = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        freqMap[word] = (freqMap[word] || 0) + 1;
      }
    });

    const sentenceScores = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\w+/g) || [];
      const score = sentenceWords.reduce((sum, word) => sum + (freqMap[word] || 0), 0);
      return { sentence, score };
    });

    sentenceScores.sort((a, b) => b.score - a.score);
    const topSentences = sentenceScores.slice(0, 3)
      .sort((a, b) => text.indexOf(a.sentence) - text.indexOf(b.sentence))
      .map(item => item.sentence.trim());

    return topSentences.join(" ");
  };

  // Show a notification message on the screen.
  function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.backgroundColor = "#356aff";
    notification.style.color = "#fff";
    notification.style.padding = "15px 20px";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    notification.style.opacity = "0";
    notification.style.transition = "opacity 0.5s";
    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.style.opacity = "1";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }

  // --- Chat Storage Functions ---
  function saveChat(input, output) {
    const chats = JSON.parse(localStorage.getItem("chats")) || [];
    const chat = {
      input: input,
      output: output,
      timestamp: new Date().toISOString(),
    };
    chats.push(chat);
    localStorage.setItem("chats", JSON.stringify(chats));
  }

  // Create neatly formatted chat entries.
  function loadChats() {
    const chats = JSON.parse(localStorage.getItem("chats")) || [];
    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";
    chats.forEach((chat) => {
      const li = document.createElement("li");
      li.style.padding = "10px";
      li.style.marginBottom = "10px";
      li.style.borderBottom = "1px solid #ccc";
      li.style.cursor = "pointer";

      const title = document.createElement("h3");
      title.textContent =
        chat.input.length > 20 ? chat.input.substring(0, 20) + "..." : chat.input;
      title.style.margin = "0 0 5px 0";
      title.style.fontSize = "1.1em";

      const dateOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      const dateSpan = document.createElement("span");
      dateSpan.textContent = new Date(chat.timestamp).toLocaleDateString(
        undefined,
        dateOptions
      );
      dateSpan.style.fontSize = "0.9em";
      dateSpan.style.color = "#666";

      li.appendChild(title);
      li.appendChild(dateSpan);

      li.addEventListener("click", () => {
        inputTextElem.value = chat.input;
        outputTextElem.value = chat.output;
      });

      chatList.appendChild(li);
    });
  }

  // --- Core Elements ---
  const inputLanguageDropdown = document.getElementById("input-language");
  const outputLanguageDropdown = document.getElementById("output-language");
  const inputTextElem = document.getElementById("input-text");
  const outputTextElem = document.getElementById("output-text");
  const swapBtn = document.querySelector(".swap-position");

  // --- Language Options ---
  const languages = [
    { no: "0", name: "Auto", native: "Detect", code: "auto" },
    { no: "1", name: "English", native: "English", code: "en" },
    { no: "2", name: "French", native: "Français", code: "fr" },
    { no: "3", name: "Portuguese", native: "Português", code: "pt" },
    { no: "4", name: "Russian", native: "Русский", code: "ru" },
    { no: "5", name: "Spanish", native: "Español", code: "es" },
    { no: "6", name: "Turkish", native: "Türkçe", code: "tr" },
  ];

  // --- Translation Function ---
  async function translate() {
    const inputText = inputTextElem.value.trim();
    if (!inputText) {
      outputTextElem.value = "";
      return;
    }
    let sourceLang =
      inputLanguageDropdown.querySelector(".selected").dataset.value;
    const targetLang =
      outputLanguageDropdown.querySelector(".selected").dataset.value;

    // Auto-detect language if set to "auto"
    if (sourceLang === "auto") {
      try {
        sourceLang = await detectLanguage(inputText);
        const selectedSpan = inputLanguageDropdown.querySelector(".selected");
        selectedSpan.innerHTML = sourceLang.toUpperCase();
        selectedSpan.dataset.value = sourceLang;
      } catch (err) {
        console.error(err);
        outputTextElem.value = err.message;
        return;
      }
    }
    try {
      const translation = await translateText(inputText, targetLang, sourceLang);
      outputTextElem.value = translation;
      saveChat(inputText, translation);
      loadChats();
    } catch (err) {
      console.error(err);
      outputTextElem.value = err.message;
    }
  }

  document.getElementById("translate-btn").addEventListener("click", () => {
    translate();
  });

  // --- Improved Summarization Functionality ---
  document.getElementById("summarize-btn").addEventListener("click", async () => {
    const text = inputTextElem.value.trim();
    if (!text) {
      showNotification("Please enter your text.");
      return;
    }
    if (text.length < 150) {
      showNotification("Text must be more than 150 characters for summarization.");
      return;
    }
    outputTextElem.value = "Summarizing...";
    try {
      const summary = await summarizeContent(text);
      outputTextElem.value = summary;
    } catch (error) {
      console.error("Summarization error:", error);
      outputTextElem.value = "An error occurred during summarization.";
    }
  });

  // --- Dark Mode Persistence ---
  const darkModeToggle = document.getElementById("dark-mode-btn");

  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark");
    darkModeToggle.checked = true;
  }
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // --- Dropdown Functionality ---
  function populateDropdown(dropdown, options) {
    const ul = dropdown.querySelector("ul");
    ul.innerHTML = "";
    options.forEach((option) => {
      const li = document.createElement("li");
      li.innerHTML = `${option.name} (${option.native})`;
      li.dataset.value = option.code;
      li.classList.add("option");
      ul.appendChild(li);
    });
  }
  populateDropdown(inputLanguageDropdown, languages);
  populateDropdown(outputLanguageDropdown, languages);

  const dropdowns = document.querySelectorAll(".dropdown-container");
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });
    dropdown.querySelectorAll(".option").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.querySelectorAll(".option").forEach((opt) => {
          opt.classList.remove("active");
        });
        item.classList.add("active");
        const selected = dropdown.querySelector(".selected");
        selected.innerHTML = item.innerHTML;
        selected.dataset.value = item.dataset.value;
        dropdown.classList.remove("active");
      });
    });
  });
  document.addEventListener("click", (e) => {
    dropdowns.forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  });

  swapBtn.addEventListener("click", () => {
    const inputLangElem = inputLanguageDropdown.querySelector(".selected");
    const outputLangElem = outputLanguageDropdown.querySelector(".selected");
    const tempHTML = inputLangElem.innerHTML;
    inputLangElem.innerHTML = outputLangElem.innerHTML;
    outputLangElem.innerHTML = tempHTML;
    const tempValue = inputLangElem.dataset.value;
    inputLangElem.dataset.value = outputLangElem.dataset.value;
    outputLangElem.dataset.value = tempValue;
    const tempText = inputTextElem.value;
    inputTextElem.value = outputTextElem.value;
    outputTextElem.value = tempText;
  });

  // --- Automatic Language Detection on Input ---
  let autoDetectTimeout;
  inputTextElem.addEventListener("input", () => {
    const inputChars = document.getElementById("input-chars");
    if (inputChars) {
      inputChars.innerHTML = inputTextElem.value.length;
    }
    clearTimeout(autoDetectTimeout);
    autoDetectTimeout = setTimeout(async () => {
      const text = inputTextElem.value.trim();
      if (!text) return;
      try {
        const detectedLanguage = await detectLanguage(text);
        const selectedSpan = inputLanguageDropdown.querySelector(".selected");
        const langObj = languages.find((lang) => lang.code === detectedLanguage);
        selectedSpan.innerHTML = langObj ? langObj.name : detectedLanguage;
        selectedSpan.dataset.value = detectedLanguage;
      } catch (error) {
        console.error("Auto language detection failed:", error);
      }
    }, 1000);
  });

  // --- Scroll Listener for Sidebar Toggle Button ---
  window.addEventListener("scroll", () => {
    const btnToggle = document.querySelector(".btn-toggle-sidebar");
    if (window.scrollY > 0) {
      btnToggle.classList.add("scrolled");
    } else {
      btnToggle.classList.remove("scrolled");
    }
  });

  // --- Chat Sidebar Toggle ---
  const toggleChatSidebarBtn = document.getElementById("toggle-chat-sidebar");
  const chatSidebar = document.getElementById("chat-sidebar");
  toggleChatSidebarBtn.addEventListener("click", () => {
    chatSidebar.classList.toggle("active");
  });
  document.getElementById("clear-chats-btn").addEventListener("click", () => {
    localStorage.removeItem("chats");
    loadChats();
  });

  loadChats();
});
