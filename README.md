# Vue Lyrics Poster

A Vue.js application that integrates with the lrclib.net API to fetch song lyrics and create beautiful spiral lyrics posters.

## Features

- **Song Search**: Type a song title and get real-time suggestions from the lrclib.net API
- **Dropdown Suggestions**: Interactive dropdown with song, artist, and album information
- **Lyrics Display**: Beautiful spiral layout with lyrics arranged around a central circle
- **Responsive Design**: Adapts to different screen sizes and lyrics lengths
- **Print Options**: Support for A1, A2, A3, A4, and A5 paper sizes
- **Error Handling**: Comprehensive error handling for API calls and edge cases

## Design Specifications

### Search Page
- Clean, modern interface with gradient background
- Real-time search with debounced API calls
- Dropdown suggestions showing track name, artist, and album
- Loading states and error handling

### Lyrics Page
- Song title displayed in 42px font size
- Horizontal line (4px thick, 60% width) with artist name (22px) to the right
- Central circle (2px thick) with lyrics spiraling outward
- Adaptive font sizing (minimum 8px) based on lyrics length
- Print-optimized layouts for different paper sizes

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Usage

1. **Search for Songs**: 
   - Type a song title in the search input
   - Select a song from the dropdown suggestions

2. **View Lyrics**:
   - The app will fetch lyrics and display them in a spiral format
   - The layout automatically adapts to the lyrics length

3. **Print Posters**:
   - Choose from A1, A2, A3, A4, or A5 paper sizes
   - The print layout maintains the spiral design

## API Integration

This application uses the [lrclib.net](https://lrclib.net) API to:
- Search for songs by title
- Fetch detailed lyrics data
- Handle various response formats

## Technical Details

### Components
- `SearchPage.vue`: Handles song search and suggestions
- `LyricsPage.vue`: Displays lyrics in spiral format with print options

### Key Features
- **Debounced Search**: Prevents excessive API calls while typing
- **Spiral Algorithm**: Calculates word positions using mathematical spiral equations
- **Responsive Font Sizing**: Automatically adjusts based on content and container size
- **Print Optimization**: Special CSS for different paper sizes

### Error Handling
- Network request failures
- Missing lyrics data
- Invalid song selections
- Print functionality errors

## Browser Compatibility

- Modern browsers with ES6+ support
- Print functionality requires browser print API support

## License

MIT License