# Royal Minds Academy

A responsive classroom web app with a student assignment checklist and a teacher dashboard for assignment management and class progress.

## Run locally

1. Install Node.js 20.19 or newer, or 22.12 or newer.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Run the tests with `npm test`, or create a production build with `npm run build`.

## MVP features

- Switch between clearly labeled **Student demo** and **Teacher demo** views. This role selector is for trying the app and is not authentication or access control.
- Students can choose a sample learner, see assignments and due dates, and mark work complete or move it back to their to-do list.
- Teachers can review sample-class completion progress and create, edit, and delete assignments.
- A Halloween community-event spotlight features concept images from Brown Tree Art House. The app does not publish an event date or location; follow up with the Art House for confirmed details.
- Changes are saved in this browser using local storage. They are not shared across browsers or devices.
- Use **Restore demo data** in the teacher view to return to the starter class and assignments.

The app starts with sample learners and assignments so both views are ready to explore immediately. Do not enter real student information; the MVP has no accounts, server-side storage, privacy controls, or cross-device synchronization.

The Brown Tree Art House images in `src/assets/` are concept tiles from its [image library](https://github.com/BrotherLove79/BROWN-TREE-ART-HOUSE). That repository describes them as low-resolution visual references, not final event photography or a confirmed Halloween flyer.

## Preview

The public preview is deployed from `main` with GitHub Pages after tests pass:
https://BrotherLove79.github.io/RMA1/
