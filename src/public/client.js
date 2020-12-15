let store = Immutable.Map({
  rovers: Immutable.Map({
    Curiosity: Immutable.Map({ name: 'Curiosity' }),
    Opportunity: Immutable.Map({ name: 'Opportunity' }),
    Spirit: Immutable.Map({ name: 'Spirit' }),
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
  const selectedRover = state.get('selectedRover');
  const rover = state.get('rovers').get(selectedRover);
  const roverArray = Object.keys(state.get('rovers').toObject());
  const image = rover.get('image');
  return `
          <header>
          ${Title()}
            <nav>
              <ul>
                ${Selecting(roverArray, selectedRover)}
              </ul>
            </nav>
          </header>
          <main>              
              <section>
              <div class='section__imgGrid'>
                ${RenderingImage(image, selectedRover)}
              </div>
              <ul class="dashboard">
                ${image ? RoverDashboard(rover) : ''}
              </ul>
              </section>
          </main>
          <footer></footer>
      `;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', async () => {
  const newState = await getRoverInfo(store);
  updateStore(store, newState);
});

// update store with new state
const updateStore = (state, newState) => {
  store = state.merge(newState);
  render(root, store);
};

// update store with a new assigned rover
const updateRover = async (rover) => {
  updateStore(store, { selectedRover: rover });
  if (!store.get('rovers').get(rover).get('image')) {
    const newState = await getRoverInfo(store);
    updateStore(store, newState);
  }
};

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Title = () => {
  return `<h1>Mars rover dashboard</h1>`;
};

const Selecting = (rovers, selectedRover) => {
  return rovers
    .map((rover) => {
      if (rover !== selectedRover) {
        return `<li class="nav__rover" onClick="updateRover('${rover}')"><div>${rover}</div></li>`;
      } else {
        return `<li class="nav__rover-selected" onClick="updateRover('${rover}')"><div>${rover}</div></li>`;
      }
    })
    .join('');
};

const RenderingImage = (image, rover) => {
  return image ? MarsImageGrid(image, rover) : Loading();
};

const Loading = () => {
  return `<div class="loader">
  </div>`;
};

const MarsImageGrid = (image, rover) => {
  console.log(image.toArray());
  return image
    .toArray()
    .map((img) => {
      return `<img src="${img}" class="section__imgGrid-img" alt="a picture taken by ${rover} from Mars" />`;
    })
    .join('');
};

const RoverDashboard = (roverInfo) => {
  const rover = roverInfo.get('name');
  const landing_date = roverInfo.get('landing_date');
  const launch_date = roverInfo.get('launch_date');
  const status = roverInfo.get('status');
  return `
    <li>Rover: ${rover}</li>
    <li>Launch date: ${launch_date}</li>
    <li>Landing date: ${landing_date}</li>
    <li>Status: ${status}</li>
  `;
};

// ------------------------------------------------------  API CALLS
const getRoverInfo = async (state) => {
  const rover = state.get('selectedRover');
  return await fetch('http://localhost:3000/rover', {
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
      const image = Immutable.List(
        responseJSON.image.map((img) => img.img_src)
      );
      const {
        name,
        launch_date,
        landing_date,
        status,
      } = responseJSON.image[0].rover;
      return state.setIn(
        ['rovers', rover],
        Immutable.Map({ image, name, launch_date, landing_date, status })
      );
    })
    .catch((err) => {
      console.log('error', err);
    });
};
