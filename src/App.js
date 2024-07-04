import { useReducer } from 'react';

const initialState = {
  isPlyaing: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'game-start':
      return { ...state, isPlyaing: true };
    default:
      return new Error('Unknown action');
  }
};

export default function App() {
  const [{ isPlyaing }, dispatch] = useReducer(reducer, initialState);

  return (
    <div className='app'>
      {!isPlyaing ? (
        <StarterView dispatch={dispatch} />
      ) : (
        <>
          <Header />
          <Main dispatch={dispatch} />
          <Footer />
        </>
      )}
    </div>
  );
}

function StarterView({ dispatch }) {
  return (
    <div className='starter'>
      <h1 className='text-1'>Lest's Play Tic-Tac-Toe!</h1>
      <button className='btn btn--start-game' onClick={() => dispatch({ type: 'game-start' })}>
        Start
      </button>
    </div>
  );
}

function Header() {
  return (
    <header>
      <h1 className='text-2'>React Tic-Tac-Toe Game</h1>
    </header>
  );
}

function Main({ dispatch }) {
  return (
    <main className='main'>
      <h1 className='turn text-3'>It's SOMEBODY'S Turn</h1>
      <GenerateFields />
      <div className='main--bottom'>
        <button className='btn btn--main text-4'>Reset</button>
        <h1 className='timer text-3'>00:00</h1>
        <button className='btn btn--main text-4'>Pause</button>
      </div>
    </main>
  );
}

function GenerateFields() {
  return (
    <div className='fields-container'>
      {Array.from({ length: 9 }, (cur, i) => i + 1).map((field, i) => (
        <Field index={i} key={i} />
      ))}
    </div>
  );
}

function Field({ index }) {
  const evenWalls = i => {
    if (i === 0 || i === 1 || i === 6 || i === 7) return 'remove-right';
    if (i === 3 || i === 4) return 'remove-right remove-top-bottom';
    if (i === 5) return 'remove-top-bottom';
    return '';
  };
  console.log(evenWalls(index));

  return (
    <div className={`field ${evenWalls(index)}`}>
      <h1 className='game-num'>X</h1>
    </div>
  );
}

function Footer() {
  return (
    <footer className='footer'>
      <h1 className='text-3'>
        You are: <span className='text-grey'>X</span>
      </h1>
      <h1 className='text-4'>
        Opponent: <span className='text-grey'>Computer</span>
      </h1>
    </footer>
  );
}
