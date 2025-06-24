import GlobalFooter from "@components/GlobalFooter";
import GlobalNavigation from "@components/GlobalNavigation";
import ThemeProvider from "@components/providers/ThemeProvider";
import VideoControlPanel from "@components/VideoControlPanel";
import VideoPlayer from "@components/VideoPlayer";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="flex flex-col h-full">
        <GlobalNavigation />
        <div className="flex-1 px-6 pt-6 flex gap-x-6">
          <VideoPlayer />
          <VideoControlPanel />
        </div>
        <GlobalFooter />
      </main>
    </ThemeProvider>
  );
}

export default App;
