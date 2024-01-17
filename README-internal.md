# states for buttons
## Stopped:
Start recording
## Recording:
Pause
ITrans
Abort
## Paused
Resume
Stop
Abort
## Idea
Start / Pause / Resume
Send
Stop


# Reddit
The voice recognition on your phone is a joke compared with OpenAI Whisper. You can use OpenAI Whisper in the ChatGPT Android and iOS apps for free. It will get even better when v3 hits the API. https://play.google.com/store/search?q=chatgpt&c=apps https://apps.apple.com/de/app/chatgpt/id6448311069
Because copy and pasting is a hassle and there is no pause button in the apps, I made myself a simple (free open source, no ads) page to edit text and use the OpenAI Whisper API. BUT there you need an OpenAI account, and it will cost you very little money: Whisper is dirt cheap: $0.036 / hour (rounded to the nearest second).
https://silidev.github.io/whisper-page

# done CRs, oldest first
- Split it into the files style.css, whisper-page.html, js file
- NEVER read the API key from the input field, but instead from the cookie.
- after the API key was saved, delete it from the input field
- make buttons have different colors make them have just about 1/4 of the current gap
- let me download the files
- structured across three files: style.css, whisper-page.html, and script.js. The setup will include:
- Saving an API key from a cookie, not an input field.
- Clearing the API key from the input field after it's saved.
- Styling buttons with different colors and reducing the gap between them
- I want COMPLETE files, not just a basic structure.

# new CRs
The following are my change requirements, which I want you to implement. Do NOT implement them yet, but instead specify the passages which are not yet in great detail in great detail:
- after the key was saved, hide the key input field and the save button and show a "Delete API key" button as the last button.
- while a recordings is taken indicate that by a spinner.
