let types = {
  normal: "#BABBAA",
  fire: "#FF421C",
  water: "#2B9BE3",
  grass: "#63BB5A",
  flying: "#95CBFF",
  fighting: "#BB5544",
  poison: "#9553CD",
  rock: "#BCAA66",
  bug: "#92C12B",
  ghost: "#6E4370",
  steel: "#ABAABB",
  electric: "#FFDC01",
  psychic: "#FF6380",
  ice: "#73D0C0",
  dragon: "#5670BF",
  dark: "#4E4545",
  fairy: "#EC8FE6",
  ground: "#A67439",
};

let typesBackground = {
  normal: "#949588",
  fire: "#cc3416",
  water: "#227cb5",
  grass: "#4f9548",
  flying: "#77a2cc",
  fighting: "#954436",
  poison: "#7742a4",
  rock: "#968851",
  bug: "#749a22",
  ghost: "#583559",
  steel: "#888895",
  electric: "#ccb000",
  psychic: "#cc4f66",
  ice: "#5ca699",
  dragon: "#445998",
  dark: "#3e3737",
  fairy: "#bc72b8",
  ground: "#845c2d",
};

let allPokemons = [];
let currentPokemonId = 1;
let currentPage = 1;
let pokemonsPerPage = 20;
let maxPokemon = 151;
let handleSearchInputActive = false;
let showPokemonDetailsActive = false;
let pokemonready = false;


window.onload = function () {  
  document.getElementById("pokemonDetailOverlay").addEventListener("click", function (event) {
      if (event.target === this) {
        closeOverlay();
      }
    });
  document.getElementById("loadMorePokemons").addEventListener("click", function () {
      currentPage++;
      displayPokemons(allPokemons, true);
    });
    loadPokemon(); 
};


async function loadPokemon() {
  for (let i = 1; i <= maxPokemon; i++) {
    let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    try {
      let response = await fetch(url);
      let pokemon = await response.json();
      
      let secondType = pokemon.types.length > 1 ? pokemon.types[1].type.name : null;

      allPokemons.push({
        id: pokemon.id,
        name: pokemon.name,
        type: pokemon.types[0].type.name,
        secondType: secondType, 
        image: pokemon.sprites.other.dream_world.front_default || pokemon.sprites.front_default,
      });
    } catch (error) {
      console.error(`Error loading Pokémon with ID ${i}:`, error);
    }
  }
  displayPokemons(allPokemons);
  updateLoadMoreButtonVisibility();
}


function displayPokemons(pokemons,append = false) {
  let allPokemonsHTML = "";
  let start = (currentPage - 1) * pokemonsPerPage;
  let end = start + pokemonsPerPage;
  let paginatedPokemons = pokemons.slice(start, end);

  paginatedPokemons.forEach(pokemon => {
    let backgroundColor = types[pokemon.type];
    // let pokemonType = pokemon.types[0].type.name;
    // let typeColor = types[pokemonType];
    let secondType = null;
    let secondTypeColor = "";
  
  //   if (pokemon.types[1]) {
  //     secondType = pokemon.types[1].type.name;
  //     secondTypeColor = types[secondType];
  // }
    allPokemonsHTML += paginatedPokemonsHTML(pokemon, backgroundColor);
  });

  if (append) {
    document.getElementById("showAllPokemons").innerHTML += allPokemonsHTML;
  } else {
    document.getElementById("showAllPokemons").innerHTML = allPokemonsHTML;
  }
  
  document.getElementById('spinner-load').style.display = 'none';
  document.getElementById('pokemonSearch').disabled = false;
  document.getElementById('loadMorePokemons').style.display = '';
  showPokemonDetailsActive = false;
  updateLoadMoreButtonVisibility();
}

async function loadPokemonStatsAndDrawChart(pokemonID) {
  let url = `https://pokeapi.co/api/v2/pokemon/${pokemonID}`;
  let response = await fetch(url);
  let pokemon = await response.json();
  let ctx = document.getElementById(`pokemonStatsChart${pokemonID}`).getContext("2d");
  let pokemonStats = getPokemonStatsData(pokemon);
  createNewChart(ctx, pokemonStats);
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("pokemonSearch").addEventListener("input", handleSearchInput);  
});

function handleLoadMorePokemons(){
  let allLoaded = allPokemons.every(pokemon => pokemon.loaded);
  if (allLoaded){
    console.log('alloaded')
  } 
  if(handleSearchInputActive || showPokemonDetailsActive && allLoaded){
    document.getElementById('loadMorePokemons').style.display = 'none';
    console.log('Eigener none');
  }
  else if(!handleSearchInputActive && !showPokemonDetailsActive && allLoaded){
    document.getElementById('loadMorePokemons').style.display = '';
    console.log('Eigener Buttoin ist aktiv');
  }
};

function handleSearchInput(e) {
  let allLoadeds = allPokemons.every(pokemon => pokemon.loaded);

  let searchText = e.target.value.toLowerCase();
  if (searchText.length >= 3 && allLoadeds) {
    currentPage = 1;
    let filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchText)
    );
    displayPokemons(filteredPokemons);
    document.getElementById("loadMorePokemons").style.display = "none";
    handleSearchInputActive = true;
  } else if (searchText.length === 0) {
    displayPokemons(allPokemons);
    document.getElementById("loadMorePokemons").style.display = "";
    handleSearchInputActive = false;
  }
  handleLoadMorePokemons();
  updateLoadMoreButtonVisibility();
}

async function showPokemonDetails(pokemonID) {
  let url = `https://pokeapi.co/api/v2/pokemon/${pokemonID}`;
  let response = await fetch(url);
  let pokemon = await response.json();
  let pokemonType = pokemon.types[0].type.name;
  let typeColor = types[pokemonType];
  let typeBackgroundColor = typesBackground[pokemonType];
  let secondType = null;
  let secondTypeColor = "";
  
  if (pokemon.types[1]) {
    secondType = pokemon.types[1].type.name;
    secondTypeColor = types[secondType];
  }
  document.getElementById('sectionBackgroudColor').style.backgroundColor = 'rgba(128, 128, 128, 0.3)';
  let overlay = document.getElementById("pokemonDetailOverlay");
  overlay.style.display = "";
  overlay.innerHTML = detailOverlay(pokemonID, pokemon, pokemonType, typeColor, typeBackgroundColor, secondTypeColor, secondType);
  overlay.classList.remove("detail-overlay-hidden");
  document.querySelector(".openCard-top").addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.querySelector(".openCard-bottom").addEventListener("click", (event) => {
      event.stopPropagation();
    });

  document.getElementById("showAllPokemons").classList.add("no-click");
  loadPokemonStatsAndDrawChart(pokemonID);
  showPokemonDetailsActive = true;
  handleLoadMorePokemons();
}

function closeOverlay() {
  let overlay = document.getElementById("pokemonDetailOverlay");
  overlay.style.display = "none";
  document.getElementById("showAllPokemons").classList.remove("no-click");
  document.getElementById('sectionBackgroudColor').style.backgroundColor = '';

  showPokemonDetailsActive = false;
  handleLoadMorePokemons();
}



document.getElementById("pokemonDetailOverlay").addEventListener("click", () => {
    closeOverlay();
  });

function detailOverlay(  pokemonID, pokemon, pokemonType, typeColor, typeBackgroundColor, secondTypeColor, secondType) {
  let nextPokemonId = pokemonID >= maxPokemon ? 1 : pokemonID + 1;
  let previousPokemonId = pokemonID <= 1 ? maxPokemon : pokemonID - 1;

  return /*html*/ `
    <div class="navigation-arrow left-arrow btn btn-secondary"" onclick="showPreviousPokemon(${previousPokemonId})">&#8592;</div>
    <div class="openCard-top" style="background-color: ${typeBackgroundColor};">
    <h1>${pokemon.name.toUpperCase()} (#${pokemon.id})</h1>
     <div>
     <span class="first-type" style="background-color: ${typeColor};">${pokemonType}</span>
      ${secondType ? `<span class="first-type" style="background-color: ${secondTypeColor}; margin-left: 8px;">${secondType}</span>`: "" }
      </div class="show-all-types">
      <img src="${pokemon.sprites.other.dream_world.front_default}" style="width: 50%;">
    </div>
    <div class="openCard-bottom">
      <canvas id="pokemonStatsChart${pokemonID}" class="pokemonStatsChart" width="400" height="400"></canvas>
    </div>
    <div class="navigation-arrow right-arrow btn btn-secondary" onclick="showNextPokemon(${nextPokemonId})">&#8594;</div>
  `;
}

// function paginatedPokemonsHTML(pokemon, backgroundColor) {
//   return /*html*/ `    
//     <div class="onePokemon" id="onePokemon${pokemon.id}" style="background-color: ${backgroundColor};" onclick="showPokemonDetails(${pokemon.id})">
//     <p class="head-pokecard"><b>${pokemon.name.toUpperCase()}</b> <span> <b> ID:${pokemon.id}</b></span></p>
//     <div class="main-card-info">
//       <div class="typFrontend">
//         <span class="first-type">fire</span>
//         <span class="first-type">water</span>
//       </div>
//       <img src="${pokemon.image}" alt="${pokemon.name}" style="height: 200px;">
//     </div>  
//     </div>
//   `;
// }

function paginatedPokemonsHTML(pokemon, backgroundColor) {
  let pokemonTypesHTML = '';
  

  if (pokemon.type) {
    // Wenn der erste Typ vorhanden ist, füge ihn hinzu
    pokemonTypesHTML += `<span class="first-type" style="background-color: ${typesBackground[pokemon.type]};">${pokemon.type}</span>`;
  }

  if (pokemon.secondType) {
    // Wenn ein zweiter Typ vorhanden ist, füge ihn hinzu
    pokemonTypesHTML += `<span class="first-type" style="background-color: ${types[pokemon.secondType]};">${pokemon.secondType}</span>`;
  }

  return /*html*/ `    
    <div class="onePokemon" id="onePokemon${pokemon.id}" style="background-color: ${backgroundColor};" onclick="showPokemonDetails(${pokemon.id})">
    <p class="head-pokecard"><b>${pokemon.name.toUpperCase()}</b> <span> <b> ID:${pokemon.id}</b></span></p>
    <div class="main-card-info">
      <div class="typFrontend">
        ${pokemonTypesHTML}
      </div>
      <img src="${pokemon.image}" alt="${pokemon.name}" style="height: 200px;">
    </div>  
    </div>
  `;
}


function createNewChart(ctx, pokemonStats) {
  new Chart(ctx, {
    type: "radar",
    data: pokemonStats,
    options: {
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

function getPokemonStatsData(pokemon) {
  return {
    labels: [
      "HP",
      "Attack",
      "Defense",
      "Special-Attack",
      "Special-Defense",
      "Speed",
    ],
    datasets: [
      {
        label: pokemon.name,
        data: [
          pokemon.stats[0].base_stat, // HP
          pokemon.stats[1].base_stat, // Attack
          pokemon.stats[2].base_stat, // Defense
          pokemon.stats[3].base_stat, // Special-Attack
          pokemon.stats[4].base_stat, // Special-Defense
          pokemon.stats[5].base_stat, // Speed
        ],
        fill: true,
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };
}

function showNextPokemon(currentPokemonId) {
  let nextPokemonId = currentPokemonId >= maxPokemon ? 1 : currentPokemonId;
  showPokemonDetails(nextPokemonId);
}

function showPreviousPokemon(currentPokemonId) {
  let previousPokemonId =
    currentPokemonId <= 1 ? maxPokemon : currentPokemonId;
  showPokemonDetails(previousPokemonId);
}

function updateLoadMoreButtonVisibility() {
  if (!handleSearchInputActive && !showPokemonDetailsActive && allPokemons.length > currentPage * pokemonsPerPage) {
    document.getElementById('loadMorePokemons').style.display = '';
    console.log('display aktiv');
  } else {
    document.getElementById('loadMorePokemons').style.display = 'none';
    console.log('display nicht aktiv');
  }
}

//

let previousSate = false
if(handleSearchInputActive !== previousSate){
  console.log('handleSearchInputActive ist true');
}
else{
  console.log('handleSearchInputActive ist false');

};

if(showPokemonDetailsActive !== previousSate){
  console.log('showPokemonDetailsActive ist true');
}
else{
  console.log('showPokemonDetailsActive ist false');

};