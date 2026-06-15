# Hobby Timeclock

A lightweight web application for tracking time spent on hobby projects. Clock in and out of projects to track your time, and view detailed statistics about your activities.

## Features

- ⏱️ **Clock In/Out**: Start and stop timing for different projects with a single click
- 📊 **Time Statistics**: View total time tracked for this week, this month, and all time
- 🎨 **Customizable Projects**: Create, edit, and delete projects with custom colors
- 💾 **Local Storage**: All data is saved locally in your browser (no login required)
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Timer updates in real-time as you work

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start creating projects and tracking time!

### No Installation Required

This is a vanilla JavaScript application with no dependencies. Simply open the HTML file and it's ready to use.

## Project Structure

```
TaskManager/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styling
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # Local storage management
│   └── timeCalculations.js # Time calculation utilities
└── README.md              # This file
```

## How to Use

### Creating a Project

1. Click the **"+ New Project"** button
2. Enter a project name (e.g., "Painting", "Guitar Practice")
3. Choose a color to represent the project
4. Click **"Save Project"**

### Tracking Time

1. Click **"Clock In"** on any project to start tracking
2. The timer at the top will show your elapsed time
3. To switch projects, click "Clock In" on a different project (this automatically clocks out of the current one)
4. Click the **"Clock Out"** button to stop tracking without switching projects

### Editing Projects

1. Click the **"✏️ Edit"** button on a project card
2. Update the name and/or color
3. Click **"Save Project"**

### Deleting Projects

1. Click the **"🗑️ Delete"** button on a project card
2. Confirm the deletion (this removes all tracking data for that project)

### Viewing Statistics

The statistics section displays:
- **This Week**: Total time tracked since Monday
- **This Month**: Total time tracked in the current month
- **All Time**: Total time tracked across all projects since creation

## Data Storage

All data is stored in your browser's **localStorage**. This means:
- ✅ No account or login required
- ✅ Data persists even after closing the browser
- ✅ Data is completely private to your device
- ⚠️ Data will be lost if you clear your browser's cache/storage

### Storage Details

- **Projects Data**: Stored under `timeclock_projects` key
- **Sessions Data**: Stored under `timeclock_sessions` key

## Future Enhancements

This is a single-page application that will eventually be enhanced with:
- 🔐 User authentication and cloud sync
- 📈 Advanced analytics and charts
- 📤 Data export (CSV, JSON)
- 🔔 Break reminders
- 📊 Project goals and targets
- 🌙 Dark mode

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No external dependencies

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Tips & Tricks

### Keyboard Shortcuts (Future)
- Coming soon!

### Tips
- Use consistent project names for better organization
- Assign unique colors to each project for quick visual identification
- Statistics are calculated in real-time, including active sessions
- Time is tracked to the nearest second

## Troubleshooting

### "No project active" but I just clocked in
- Refresh the page - your session should still be there
- Check browser console for any error messages

### My data disappeared
- Check if you cleared your browser cache or storage
- Data is stored in localStorage per browser/device

### Timer shows wrong time
- The timer updates every second automatically
- If it seems wrong, try refreshing the page

## Development Notes

### Code Structure
- **IIFE (Immediately Invoked Function Expressions)**: Used to create private scopes for each module
- **Module Pattern**: Each module exposes only a public API
- **Event Delegation**: Used for dynamically created elements
- **LocalStorage API**: Used for persistent data storage

### Adding New Features
1. Update HTML structure if needed
2. Add logic to the appropriate JS module
3. Update the render function in `app.js` if UI changes
4. Test with sample data

## License

This project is open source and available for personal use.

## Support

For issues or suggestions, please create an issue in the repository or contact the developer.

---

**Made with ❤️ for hobby enthusiasts**
