# Quick Post ScreenShot

Chrome extension for capturing screenshots from HTML5 videos and posting them to X.

It can also download captures locally, step through video frame-by-frame before shooting, record short clips, and collect hashtags from the current page.

## Features

- Capture a screenshot from the current page's video player
- Open the X post composer automatically and attach the captured image or recorded clip
- Optional popup window mode for the X composer
- Optional local download of screenshots and recordings
- Seek mode for frame-by-frame or second-by-second positioning before capture
- Experimental video recording with audio
- Hashtag picker that detects hashtags on the current page and remembers selections per URL
- Customizable keyboard shortcuts

## Default Shortcuts

- `Q`: Take a screenshot
- `Ctrl + Q`: Seek, then take a screenshot
- `Ctrl + Shift + Q`: Start/stop video recording
- `H`: Open hashtag selection

## Settings

The extension includes these options:

- `Post after taking a screenshot`
- `Open in a popup window`
- `Use hashtags`
- `High-quality screenshot`
- `High-quality recording (HIGH LOAD)`
- `Download a screenshot`
- `Seek before taking a screenshot from icon`

## Usage

### Capture a Screenshot

- Start playing a video on any supported webpage.
- Press `Q`, or click the extension icon.
- If seek mode is enabled, use the on-screen controls:
  - `←` / `→`: step backward or forward by 1 frame
  - `↑` / `↓`: rewind or fast-forward by 1 second
  - `Enter`: capture
  - `Escape`: cancel

### Record a Clip

- Press `Ctrl + Shift + Q` to start recording.
- Press the same shortcut again or `Enter` to stop and keep the clip.
- Press `Escape` or move focus away from the dialog to cancel.

### Select Hashtags

- Press `H` to open the hashtag picker.
- The extension scans visible text on the page for hashtags.
- Selected hashtags are remembered per page URL during the session.

## License

This project is licensed under dual licenses:
*   [Apache License 2.0](LICENSE-APACHE)
*   [MIT License](LICENSE-MIT)
