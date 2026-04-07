import React, { useEffect, useState } from "react";
import "./App.css";
import MovieCard from "./components/MovieCard";

const API_KEY = process.env.REACT_APP_TMDB_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [showGenres, setShowGenres] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [ratings, setRatings] = useState({});
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    fetchTrending();
    fetchGenres();
  }, []);

  // 🔥 TRENDING
  const fetchTrending = async () => {
    setActiveTab("home");
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
    );
    const data = await res.json();
    setMovies(data.results || []);
  };

  // 🎭 GENRES
  const fetchGenres = async () => {
    const res = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
    );
    const data = await res.json();
    setGenres(data.genres || []);
  };

  // 🎬 CATEGORY
  const loadCategory = async (type) => {
    setActiveTab(type);

    let url = "";

    if (type === "movies") {
      url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`;
    } else if (type === "tv") {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}`;
    } else if (type === "anime") {
      url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setMovies(data.results || []);
  };

  // 🔍 SEARCH
  const searchMovies = async (text) => {
    setQuery(text);

    if (!text) {
      fetchTrending();
      return;
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${text}`
    );
    const data = await res.json();
    setMovies(data.results || []);
  };

  // 🎭 FILTER GENRE
  const filterByGenre = async (id) => {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${id}`
    );
    const data = await res.json();
    setMovies(data.results || []);
  };

  // ⭐ RATE
  const rateMovie = (id, val) => {
    setRatings({ ...ratings, [id]: val });
  };

  // 🎬 OPEN MOVIE
  const openMovie = async (movie) => {
  const type = movie.media_type === "tv" ? "tv" : "movie";

  // 🎬 GET IMAGES
  const imgRes = await fetch(
    `https://api.themoviedb.org/3/${type}/${movie.id}/images?api_key=${API_KEY}`
  );
  const images = await imgRes.json();

  // 🎥 GET TRAILER
  const vidRes = await fetch(
    `https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=${API_KEY}`
  );
  const videos = await vidRes.json();

  const trailer = videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  );

  setSelectedMovie({
    ...movie,
    images,
    trailerKey: trailer ? trailer.key : null,
  });
};

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>🎬 Filmo</h2>

        <p onClick={fetchTrending}>🔥 Trending</p>

        <p onClick={() => setShowGenres(!showGenres)}>
          🎭 Genres {showGenres ? "▲" : "▼"}
        </p>

        {showGenres && (
          <div>
            {genres.map((g) => (
              <div key={g.id} onClick={() => filterByGenre(g.id)}>
                {g.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOPBAR */}
        <div className="topbar">
          <span className={activeTab==="home"?"active":""} onClick={fetchTrending}>Home</span>
          <span className={activeTab==="movies"?"active":""} onClick={()=>loadCategory("movies")}>Movies</span>
          <span className={activeTab==="tv"?"active":""} onClick={()=>loadCategory("tv")}>TV Shows</span>
          <span className={activeTab==="anime"?"active":""} onClick={()=>loadCategory("anime")}>Anime</span>
        </div>

        {/* HERO */}
        <div className="hero">
          <h1>🎬 MovieFlix</h1>
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => searchMovies(e.target.value)}
          />
        </div>

        {/* GRID */}
        <div className="movie-grid">
          {movies.length === 0 ? (
            <h2>❌ Not available</h2>
          ) : (
            movies.map((m) => (
              <MovieCard key={m.id} movie={m} onSelect={openMovie} />
            ))
          )}
        </div>

        {/* POPUP */}
        {selectedMovie && (
          <div className="modal" onClick={() => setSelectedMovie(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              
              <span className="close" onClick={() => setSelectedMovie(null)}>❌</span>

              <h2>{selectedMovie.title || selectedMovie.name}</h2>

              <div className="screenshots">
                {selectedMovie.images?.backdrops?.slice(0,5).map((img) => (
                  <img
                    key={img.file_path}
                    src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                    alt=""
                  />
                ))}
              </div>

              <p>{selectedMovie.overview}</p>

              <p>⭐ {selectedMovie.vote_average}</p>

              <div>
                {[1,2,3,4,5].map((s)=>(
                  <span key={s} onClick={()=>rateMovie(selectedMovie.id,s)}>
                    {ratings[selectedMovie.id]>=s?"⭐":"☆"}
                  </span>
                ))}
              </div>

              <button
                className="trailer-btn"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/results?search_query=${
                      selectedMovie.title || selectedMovie.name
                    } trailer`
                  )
                }
              >
                ▶ Trailer
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;