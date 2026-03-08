# Personal Links Landing Page

Single-page, mobile-first links landing page for Instagram bio and easy sharing. Built with plain HTML, CSS, and JavaScript for fast GitHub Pages hosting.

## Files
- `index.html` - page structure and modal container
- `styles.css` - bold-modern visual design and responsive layout
- `script.js` - editable content config + dynamic rendering + modal behavior

## Quick Start
1. Clone or open this repository.
2. Edit `script.js` values in `profileConfig`, `socialLinks`, and `contactLinks`.
3. Commit and push to `main`.

## Customize Content
Open `script.js` and update:

- `profileConfig`
  - `name`
  - `tagline`
  - `avatarSrc`

- `socialLinks` entries
  - `label`
  - `url`
  - `icon`
  - optional `highlight: true`

- `contactLinks` entries
  - `type`: `call | whatsapp | email | instagram`
  - `label`
  - `url`

### Placeholder links currently included
- `tel:+10000000000`
- `https://wa.me/10000000000`
- `mailto:you@example.com`
- `https://instagram.com/yourhandle`

## Avatar and Assets
- Put your avatar at `assets/avatar.jpg`.
- If no avatar exists, the image hides automatically.

## GitHub Pages Deployment (Project Repo + Root)
1. Push all files to your GitHub repository.
2. Go to GitHub `Settings` -> `Pages`.
3. Under `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Save and wait for deployment.
5. Copy your live URL and place it in your Instagram bio link.

## Accessibility Notes
- Keyboard-accessible controls and visible focus styles.
- Contact modal supports close button, backdrop click, and `Escape` key.
- Modal focus is trapped while open, then returns to the trigger button.
