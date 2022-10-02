import { h } from 'preact'
import { getCurrentTurn, getIsGameOver } from '../../../signals/connect4'
import style from './style.css'

export const Connect4Status = () => (
    <header class={style.status}>
        {getIsGameOver.value !== 'not_over' ? (
            <EndState winner={getIsGameOver.value} />
        ) : (
            <h1>Turn: {getCurrentTurn.value}</h1>
        )}
    </header>
)

const EndState = ({ winner }: { winner: 'draw' | 'red' | 'blue' }) => {
    if (winner === 'draw') {
        return <h1>Draw</h1>
    }
    return <h1>{winner} wins</h1>
}
