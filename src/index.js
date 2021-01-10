import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import { from, BehaviorSubject, merge } from "rxjs";
import {
  map,
  filter,
  delay,
  mergeMap,
  debounce,
  distinctUntilChanged,
  tap,
  debounceTime
} from "rxjs/operators";

import "./styles.css";

const getPokemonByName = async name => {
  const { results: allPokemons } = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000"
  ).then(res => res.json());
  console.log(allPokemons);
  return allPokemons.filter(pokemon => pokemon.name.includes(name));
};

let searchSubject = new BehaviorSubject("");
let searchResultObservable = searchSubject.pipe(
  filter(val => val.length > 1),
  debounceTime(750),
  distinctUntilChanged(),
  mergeMap(val => from(getPokemonByName(val)))
);

const useObservable = (observable, setter) => {
  useEffect(() => {
    let subscription = observable.subscribe(result => {
      setter(result);
    });

    return () => subscription.unsubscribe();
  }, [observable, setter]);
};

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useObservable(searchResultObservable, setResults);

  const handleSearchChange = e => {
    const newValue = e.target.value;
    setSearch(newValue);
    searchSubject.next(newValue);
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search"
        value={search}
        onChange={handleSearchChange}
      />
      {results.map(pokemon => (
        <div key={pokemon.name}>{pokemon.name}</div>
      ))}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
