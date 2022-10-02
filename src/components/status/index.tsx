import { h } from 'preact'
import { getCurrentTurn, getIsGameOver } from '../../signals/board'
import style from './style.css'

const valDisplayMap = {
    circle: 'O',
    cross: 'X',
    draw: 'draw',
}

export const Status = () => (
    <header class={style.status}>
        {getIsGameOver.value ? (
            <EndState winner={getIsGameOver.value} />
        ) : (
            <h1>Turn: {valDisplayMap[getCurrentTurn.value]}</h1>
        )}
    </header>
)

const EndState = ({ winner }: { winner: 'draw' | 'circle' | 'cross' }) => {
    if (winner === 'draw') {
        return <h1>Draw</h1>
    }
    return <h1>{valDisplayMap[winner]} wins</h1>
}
