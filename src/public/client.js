let store = Immutable.Map({
  user: { name: 'Student' },
  rovers: Immutable.Map({
    curiosity: Immutable.Map({ name: 'Curiosity' }),
    opportunity: Immutable.Map({ name: 'Opportunity' }),
    spirit: Immutable.Map({ name: 'Spirit' }),
  }),
  selectedRover: 'Curiosity',
});

// add our markup to the page
const root = document.getElementById('root');

const render = async (root, state) => {
  root.innerHTML = App(state);
};

// create content
const App = (state) => {
  const rovers = state.get('rovers');
  const name = store.get('user').name;
  const selectedRover = state.get('selectedRover');
  const rover = rovers.get('roverInfo');
  if (selectedRover !== rover.get('name')) {
    getImageOfTheDay(state);
  }
  console.log(rover, image);
  console.log(state);
  return `
          <header>
          ${Title(name)}
            <nav>
              ${Selecting(rovers, selectedRover)}
            </nav>
          </header>
          <main>              
              <section>
              </section>
          </main>
          <footer></footer>
      `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
  getImageOfTheDay(store);
});

// update store with new state
const updateStore = (state, newState) => {
  store = state.merge(newState);
  render(root, store);
};

// update store with a new assigned rover
const updateRover = (rover) => {
  updateStore(store, { selectedRover: rover });
};

const updateRoverInfo = (state) => {};

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Title = () => {
  return `<h1>Mars rover dashboard</h1>`;
};

const Selecting = (rovers, selectedRover) => {
  return `<ul>
            ${rovers
              .map((rover) => {
                if (rover !== selectedRover) {
                  return `<li class="nav__rover" onClick="updateRover('${rover}')">${rover}</li>`;
                } else {
                  return `<li class="nav__rover-selected" onClick="updateRover('${rover}')">${rover}</li>`;
                }
              })
              .join('')}
        </ul>`;
};

const RoverDashboard = (roverInfo) => {
  const rover = roverInfo.get('name');
  const landing_date = roverInfo.get('landing_date');
  const launch_date = roverInfo.get('launch_date');
  const status = roverInfo.get('status');
  return `<ul>
    <li>${rover}</li>
    <li>${launch_date}</li>
    <li>${landing_date}</li>
    <li>${status}</li>
  </ul>`;
};

// Example of a pure function that renders infomation requested from the backend

// ------------------------------------------------------  API CALLS

const getImageOfTheDay = (state) => {
  const rover = state.get('selectedRover').toLowerCase();
  if (state.get('rovers').get(rover)) {
    console.log(state.get('rovers').get(rover).get('image'));
  }
  fetch(`http://localhost:3000/rover`, {
    method: 'POST',
    body: JSON.stringify({ rover }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((responseJSON) => {
      const image = responseJSON.image.img_src;
      const roverInfo = responseJSON.image.rover;
      console.log(image, roverInfo);
    });
};
