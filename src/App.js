import { useReducer, useEffect } from 'react';

const SECONDS_PER_GAME = 3;

const initialState = {
  status: 'start-screen',
  turn: null,
  playerIcon: null,
  computerIcon: null,
  winner: null,
  isAWinner: false,
  isGameActive: false,
  secondsRemaining: null,
};

const draw = 'draw';
const player = 'player';
const computer = 'computer';
const lose = 'lose';
const determineFirstTurn = () => (Math.round(Math.random()) === 1 ? player : computer);

const disableAllFields = () =>
  document.querySelectorAll('.field').forEach(f => f.classList.add('field--filled'));

const handleClickedField = (fieldId, icon) => {
  fieldId.textContent = icon;
  fieldId.classList.add('field--filled');
  fieldId.disabled = true;
};

const determineAvailableFields = () => {
  const availableFields = [];
  document.querySelectorAll('.field').forEach(f => f.textContent === '' && availableFields.push(f));
  return availableFields;
};

const computersTurn = computerIcon => {
  //--- DETERMINE COMPUTER AVAILABLE FIELDS ---//
  const computerAvailableFields = determineAvailableFields();

  //--- COMPUTE RANDOM FIELD FOR PC COMPUTER PIC ---//
  const computerRandomField = computerAvailableFields.at(
    Math.floor(Math.random() * computerAvailableFields.length)
  );

  //--- HADNLE CLICK ---//
  handleClickedField(computerRandomField, computerIcon);
};

const checkIfSomeoneWins = (fields, playerIcon) => {
  const f = fields;

  const check = (pos1, pos2, pos3) =>
    pos1.textContent === playerIcon &&
    pos2.textContent === playerIcon &&
    pos3.textContent === playerIcon;

  const finish = (pos1, pos2, pos3, className) => {
    pos1.classList.add('win', className);
    pos2.classList.add('win', className);
    pos3.classList.add('win', className);
  };

  //--- HORIZONTAL ---//
  if (check(f[0], f[1], f[2])) {
    finish(f[0], f[1], f[2], 'win--horizontal');
    return true;
  }
  if (check(f[3], f[4], f[5])) {
    finish(f[3], f[4], f[5], 'win--horizontal');
    return true;
  }
  if (check(f[6], f[7], f[8])) {
    finish(f[6], f[7], f[8], 'win--horizontal');
    return true;
  }

  //--- VERTICAL ---//
  if (check(f[0], f[3], f[6])) {
    finish(f[0], f[3], f[6], 'win--vertical');
    return true;
  }
  if (check(f[1], f[4], f[7])) {
    finish(f[1], f[4], f[7], 'win--vertical');
    return true;
  }
  if (check(f[2], f[5], f[8])) {
    finish(f[2], f[5], f[8], 'win--vertical');
    return true;
  }

  //--- CROSS LEFT TOP - BOTTOM RIGHT ---//
  if (check(f[0], f[4], f[8])) {
    finish(f[0], f[4], f[8], 'win--top-left-right-bottom');
    return true;
  }

  //--- CROSS TOP RIGHT - BOTTOM LEFT ---//
  if (check(f[2], f[4], f[6])) {
    finish(f[2], f[4], f[6], 'win--top-left-left-bottom');
    return true;
  }

  return false;
};

const clearFields = () =>
  document.querySelectorAll('.field').forEach(f => {
    f.textContent = '';
    f.disabled = false;
    f.classList.remove(
      'field--filled',
      'win',
      'win--horizontal',
      'win--vertical',
      'win--top-left-right-bottom',
      'win--top-left-left-bottom'
    );
  });

const determinePlayerIcon = Math.round(Math.random()) === 1 ? 'X' : 'O';
const determineComputerIcon = determinePlayerIcon === 'X' ? 'O' : 'X';

const reducer = (state, action) => {
  switch (action.type) {
    case 'playing':
      return {
        ...state,
        turn: player,
        status: 'playing',
        playerIcon: state.playerIcon ? state.playerIcon : determinePlayerIcon,
        computerIcon: state.computerIcon ? state.computerIcon : determineComputerIcon,
        isGameActive: true,
        secondsRemaining: SECONDS_PER_GAME,
      };
    case 'computer-first':
      computersTurn(determineComputerIcon);
      return {
        ...state,
        playerIcon: determinePlayerIcon,
        computerIcon: determineComputerIcon,
        status: 'playing',
        turn: player,
        isGameActive: true,
      };
    case 'user-click':
      const fields = document.querySelectorAll('.field');
      const activatedField = document.getElementById(`field-${action.payload}`);
      handleClickedField(activatedField, state.playerIcon);

      //--- CHECK IF PLAYER WINS ---//
      if (checkIfSomeoneWins(fields, state.playerIcon))
        return { ...state, winner: player, isAWinner: true };

      //--- COMPUTER'S TURN ---//
      if (determineAvailableFields().length !== 0) computersTurn(state.computerIcon);

      //--- CHECK IF COMPUTER WINS ---//
      if (checkIfSomeoneWins(fields, state.computerIcon))
        return { ...state, winner: computer, isAWinner: true };

      if (determineAvailableFields().length === 0)
        return { ...state, winner: draw, isAWinner: true };
      return { ...state, turn: player };
    case 'tick':
      if (state.secondsRemaining <= 0) {
        disableAllFields();
        return { ...state, winner: lose, isAWinner: true };
      }
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
      };
    case 'reset':
      clearFields();
      return {
        ...initialState,
        status: 'playing',
        isGameActive: true,
        playerIcon: determinePlayerIcon,
        computerIcon: determineComputerIcon,
        secondsRemaining: SECONDS_PER_GAME,
      };
    default:
      return new Error('Unknown action');
  }
};

export default function App() {
  const [
    { status, turn, playerIcon, winner, isAWinner, isGameActive, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  console.log(status);

  return (
    <>
      {status === 'start-screen' && (
        <div className='starter-container'>
          <StarterView dispatch={dispatch} />
        </div>
      )}
      <div className={`app ${!isGameActive ? 'hidden' : ''}`}>
        <Header />
        <Main
          dispatch={dispatch}
          turn={turn}
          winner={winner}
          isAWinner={isAWinner}
          secondsRemaining={secondsRemaining}
          isGameActive={isGameActive}
        />
        <Footer playerIcon={playerIcon} />
      </div>
    </>
  );
}

function StarterView({ dispatch }) {
  return (
    <div className='starter'>
      <h1 className='text-1'>Lest's Play Tic-Tac-Toe!</h1>
      <button
        className='btn btn--start-game'
        onClick={() =>
          dispatch({ type: determineFirstTurn() === computer ? 'computer-first' : 'playing' })
        }>
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

function Main({ dispatch, turn, winner, isAWinner, secondsRemaining, isGameActive }) {
  const winnerMessage = () => {
    if (winner === player) return 'You WON!';
    if (winner === computer) return 'Computer WON!';
    if (winner === draw) return `That's a DRAW!`;
    if (winner === lose) return 'You LOSE!';
  };

  return (
    <main className='main'>
      {!winner ? (
        <h1 className='text-3'>It's {turn} Turn!</h1>
      ) : (
        <h1 className='text-3'>{winnerMessage()}</h1>
      )}
      <GenerateFields dispatch={dispatch} isAWinner={isAWinner} />
      <div className='main--bottom'>
        <button className='btn btn--main text-4' onClick={() => dispatch({ type: 'reset' })}>
          Reset
        </button>
        <Timer
          secondsRemaining={secondsRemaining}
          isGameActive={isGameActive}
          dispatch={dispatch}
        />
        <button className='btn btn--main text-4'>Pause</button>
      </div>
    </main>
  );
}

function Timer({ secondsRemaining, isGameActive, dispatch }) {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeLeft = (minutes + '').padStart(2, 0) + ':' + (seconds + '').padStart(2, 0);

  useEffect(() => {
    if (isGameActive && secondsRemaining >= 0) {
      const timer = setInterval(() => dispatch({ type: 'tick' }), 1000);
      return () => clearInterval(timer);
    }
  }, [isGameActive, dispatch, secondsRemaining]);

  return <h1 className='timer text-3'>{timeLeft}</h1>;
}

function GenerateFields({ dispatch, isAWinner }) {
  return (
    <div className='fields-container'>
      {Array.from({ length: 9 }, (cur, i) => i + 1).map((field, i) => (
        <Field index={i} dispatch={dispatch} isAWinner={isAWinner} key={i} />
      ))}
    </div>
  );
}

function Field({ index, dispatch, isAWinner }) {
  const evenBorders = i => {
    if (i === 0 || i === 1 || i === 6 || i === 7) return 'remove-right';
    if (i === 3 || i === 4) return 'remove-right remove-top-bottom';
    if (i === 5) return 'remove-top-bottom';
    return '';
  };

  return (
    <button
      disabled={isAWinner}
      className={`field ${evenBorders(index)}`}
      id={`field-${index}`}
      onClick={() => {
        dispatch({ type: 'user-click', payload: index });
      }}></button>
  );
}

function Footer({ playerIcon }) {
  return (
    <footer className='footer'>
      <h1 className='text-3'>
        You are: <span className='text-grey'>{playerIcon}</span>
      </h1>
      <h1 className='text-4'>
        Opponent: <span className='text-grey'>Computer</span>
      </h1>
    </footer>
  );
}
