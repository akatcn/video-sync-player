import ThemeProvider from "@components/providers/ThemeProvider";
import VideoPlayer from "@components/VideoPlayer";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <VideoPlayer />
    </ThemeProvider>
  );
}

export default App;
