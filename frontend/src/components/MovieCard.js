import React from "react";

function MovieCard({ movie, onSelect }) {
  const title = movie.title || movie.name;

  const image = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/300x450";

  return (
    <div className="movie-card" onClick={() => onSelect(movie)}>
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <p>⭐ {movie.vote_average?.toFixed(1)}</p>
    </div>
  );
}

export default MovieCard;