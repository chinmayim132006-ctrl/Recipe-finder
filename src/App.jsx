import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { localRecipes } from "./data/localRecipes";

const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const PAGE_SIZE = 8;

const NONVEG_KEYWORDS = [
  "chicken","beef","pork","fish","mutton",
  "lamb","shrimp","prawn","egg","crab","bacon"
];

function getYouTubeLink(meal) {
  // Use TheMealDB's direct YouTube video when available.
  if (meal.strYoutube && meal.strYoutube.trim()) return meal.strYoutube;

  // Local recipes get a recipe-specific YouTube search link.
  const search = encodeURIComponent(`how to make ${meal.strMeal} recipe`);
  return `https://www.youtube.com/results?search_query=${search}`;
}

function getIngredientsArray(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];
    if (ing && ing.trim()) {
      ingredients.push(`${measure ? measure.trim() + " " : ""}${ing.trim()}`);
    }
  }
  return ingredients;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [page, setPage] = useState(1);
  const [modalMeal, setModalMeal] = useState(null);
  const [loading, setLoading] = useState(false);

  const quickSearch = [
    "Rumali Roti","Naan","Chapati","Roti",
    "Veg Biryani","Chicken Biryani",
    "Idli","Dosa","Puri","Sambar",
    "Coconut Chutney","Tomato Chutney"
  ];

  const slicedMeals = meals.slice(0, PAGE_SIZE * page);
  const canLoadMore = slicedMeals.length < meals.length;

  const searchByName = useCallback(async (name) => {
    if (!name) return;
    setLoading(true);

    const res = await fetch(`${API_BASE}/search.php?s=${name}`);
    const j = await res.json();
    const apiMeals = j.meals || [];

    const local = localRecipes.filter(m =>
      m.strMeal.toLowerCase().includes(name.toLowerCase())
    );

    setMeals([...local, ...apiMeals]);
    setPage(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${API_BASE}/search.php?s=`);
      const j = await res.json();
      setMeals([...localRecipes.slice(0,6), ...(j.meals || []).slice(0,6)]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="app">

      {/* HEADER */}
      <header>
        <h1>Recipe Finder</h1>
        <div className="controls">
          <input
            placeholder="Search recipe..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchByName(query)}
          />
          <button onClick={() => searchByName(query)}>Search</button>
        </div>
      </header>

      {/* MAIN */}
      <main>
        {/* LEFT */}
        <section className="left">
          {loading && <p>Loading...</p>}

          <div className="grid">
            {slicedMeals.map(meal => (
              <div key={meal.idMeal} className="card">
                <img
                  className="thumb"
                  src={meal.strMealThumb || "https://via.placeholder.com/300x200"}
                  alt={meal.strMeal}
                />
                <div className="card-body">
                  <h3>{meal.strMeal}</h3>
                  <button className="small-btn" onClick={() => setModalMeal(meal)}>
                    View Recipe
                  </button>
                  <a
                    className="youtube-btn card-youtube"
                    href={getYouTubeLink(meal)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ▶ YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>

          {canLoadMore && (
            <button className="small-btn load-more" onClick={() => setPage(p => p + 1)}>
              Load more
            </button>
          )}
        </section>

        {/* RIGHT */}
        <aside className="right">
          <div className="panel">
            <h3>Quick Search</h3>
            <div className="quick-grid">
              {quickSearch.map(item => (
                <div key={item} className="card quick-card">
                  <div>{item}</div>
                  <button
                    className="small-btn"
                    onClick={() => {
                      setQuery(item);
                      searchByName(item);
                    }}
                  >
                    Search
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      <footer className="footer">
        Data from TheMealDB + Local Recipes (React)
      </footer>

      {/* MODAL */}
      {modalMeal && (
        <div className="modal" onClick={() => setModalMeal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close" onClick={() => setModalMeal(null)}>✕</button>

            <div className="modal-body">
              {/* LEFT */}
              <div className="modal-left">
                <img
                  src={modalMeal.strMealThumb || "https://via.placeholder.com/500x350"}
                  alt={modalMeal.strMeal}
                />
                <h2>{modalMeal.strMeal}</h2>
              </div>

              {/* RIGHT */}
              <div className="modal-right">
                <h3>Ingredients</h3>
                <ul className="ingredients">
                  {getIngredientsArray(modalMeal).map(i => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>

                <h3>Instructions</h3>
                <p className="instructions">
                  {modalMeal.strInstructions}
                </p>

                <a
                  className="youtube-btn modal-youtube"
                  href={getYouTubeLink(modalMeal)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ▶ Watch Recipe on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}