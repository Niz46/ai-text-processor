# AI Language Translator Web App

A web-based tool that provides translation and summarization capabilities with a clean, responsive interface. This project enables users to translate text between multiple languages, automatically detect the input language, generate summaries for longer texts, and review previous chats—all while offering a sleek dark mode experience.

## Features

- **Auto Language Detection:** Automatically detects the language of the input text using either a built-in API or a simple regex fallback.
- **Translation:** Translates text from the source language to the target language via a built-in API or, if unavailable, through Google Translate.
- **Summarization:** Provides a quick summarization of longer texts (over 150 characters) using either a built-in summarizer API or a basic slicing method.
- **Chat History:** Saves previous translations to local storage, which can be viewed in the chat sidebar and reloaded with a click.
- **Dark Mode Toggle:** Allows users to switch between light and dark themes with persistent settings.
- **Responsive Design:** Optimized layout for both desktop and mobile devices.
- **Swap Functionality:** Easily swap the source and target languages along with their corresponding text.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Niz46/ai-text-processor.git
   ```

2. **Navigate to the Project Directory:**

   ```bash
   cd LanguageTranslator
   ```

3. **Open the Application:**

   Open `index.html` in your favorite browser. For a local server experience, you can use:

   ```bash
   npx serve .
   ```

## File Structure

``` ai-text-processor/
├── index.html         # Main HTML file for the web application.
├── style.css          # CSS file for styling and responsive design.
├── scripts.js         # JavaScript file handling translation, summarization, chat storage, and UI interactions.
└── images/            # Directory containing images (icons, bot image, etc.)
```

## Usage

1. **Input Text:**  
   Enter the text you wish to translate or summarize in the input area.

2. **Select Languages:**  
   - Use the "From" dropdown to set the source language (or choose "Auto Detect" to have the language automatically determined).
   - Use the "To" dropdown to select the target language for translation.

3. **Translate:**  
   Click the **Translate** button to process your text. The translated text will appear in the output area, and the chat history will be updated.

4. **Summarize:**  
   If the input text exceeds 150 characters, click the **Summarize** button to generate a brief summary.

5. **Chat Sidebar:**  
   - Access previous translations in the sidebar.
   - Click any chat entry to reload its content.
   - Use the **Clear Chats** button to remove all saved entries.

6. **Dark Mode:**  
   Toggle the dark mode switch at the bottom right of the screen to switch between light and dark themes. The preference is saved across sessions.

7. **Swap Languages:**  
   Click the swap button to quickly exchange the selected source and target languages along with their corresponding text.

## Technologies Used

- **HTML5:** For semantic page structure.
- **CSS3:** For styling and responsive design.
- **JavaScript:** To implement translation, summarization, language detection, and local storage functionalities.
- **Ionicons:** For a modern icon set that enhances the user interface.

## Future Enhancements

- **Advanced API Integrations:** Incorporate more robust translation and summarization APIs.
- **Improved Error Handling:** Enhance error messages and notifications for a better user experience.
- **Extended Language Support:** Add additional languages and dialects.
- **User Customizations:** Enable more user settings, such as custom themes and text formatting options.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).  
For more details, please see the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.html) or refer to the LICENSE file included in the repository.

## Acknowledgements

- **Ionicons:** For the beautiful and scalable icons used throughout the interface.
- **Inspiration:** This project draws inspiration from modern translation and chat applications, aiming to combine utility with an engaging user experience.
