let store = Immutable.Map({
  user: { name: 'Student' },
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
  const name = state.get('user').name;
  const selectedRover = state.get('selectedRover');
  const rover = state.get('rovers').get(selectedRover);
  const roverArray = Object.keys(state.get('rovers').toObject());
  const image = rover.get('image');
  return `
          <header>
          ${Title()}
            <nav>
            ${Selecting(roverArray, selectedRover)}
            </nav>
          </header>
          <main>              
              <section>
              <div class='section__img'>
                ${image ? `${MarsImage(image, selectedRover)}` : `${Loading()}`}
              </div>
                ${RoverDashboard(rover)}
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
  return `<ul>
            ${rovers
              .map((rover) => {
                if (rover !== selectedRover) {
                  return `<li class="nav__rover" onClick="updateRover('${rover}')"><div>${rover}</div></li>`;
                } else {
                  return `<li class="nav__rover-selected" onClick="updateRover('${rover}')"><div>${rover}</div></li>`;
                }
              })
              .join('')}
        </ul>`;
};

const Loading = () => {
  return `<div class="loader">
  </div>`;
};

const MarsImage = (image, rover) => {
  return `<img src=${image.get('image_src')} alt=${
    'a picture taken by ' + rover
  }/>
  <p class="image_anno">This picture was taken by
    <span class="bold">${rover}</span> on 
    <span class="bold">${image.get('image_date')}</span>
  </p>`;
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

// ------------------------------------------------------  API CALLS
const getRoverInfo = async (state) => {
  const rover = state.get('selectedRover');
  if (!state.get('rovers').get(rover).get('image')) {
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
        const image = Immutable.Map({
          image_src: responseJSON.image.img_src,
          image_date: responseJSON.image.earth_date,
          image_camera: responseJSON.image.camera.name,
        });
        const {
          name,
          launch_date,
          landing_date,
          status,
        } = responseJSON.image.rover;
        return state.setIn(
          ['rovers', rover],
          Immutable.Map({ image, name, launch_date, landing_date, status })
        );
      })
      .catch((err) => {
        console.log('error', err);
      });
  }
  return state;
};
