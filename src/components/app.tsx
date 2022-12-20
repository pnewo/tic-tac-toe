import { h } from 'preact'
import { Status } from './status'
import { Board } from './board'
import { Controls } from './controls'
import { Connect4 } from './connect4'
import { Connect4Controls } from './connect4/controls'
import { Connect4Status } from './connect4/status'

const App = () => (
    <div id="app">
        <Status />
        <Board />
        <Controls />
        {/* <Connect4Status />
        <Connect4 />
        <Connect4Controls /> */}
    </div>
)

export default App
