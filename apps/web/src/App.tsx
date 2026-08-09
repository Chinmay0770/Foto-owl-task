import { useMemo } from "react";

import { MediaClient } from "@headless-media/media-core";
import { MediaSearch } from "@headless-media/media-ui-react";

import "./App.css";

function App() {
  const client = useMemo(() => {
    const apiKey =
      import.meta.env.VITE_PEXELS_API_KEY;

    if (!apiKey) {
      throw new Error(
        "VITE_PEXELS_API_KEY is not configured."
      );
    }

    return new MediaClient({
      apiKey,
    });
  }, []);

  return (
    <main className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            Headless Media SDK
          </p>

          <h1>
            Search and discover media
          </h1>

          <p className="description">
            A reusable media SDK powered by
            Pexels, with shared core functionality
            and React UI components.
          </p>
        </div>
      </header>

      <section className="search-section">
        <MediaSearch
          client={client}
          initialQuery="nature"
          type="photo"
          perPage={20}
        />
      </section>
    </main>
  );
}

export default App;