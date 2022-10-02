import { h } from 'preact'
import style from './style.css'
import { gameState, setValue } from '../../signals/connect4'

export const Connect4 = () => (
    <main class={style.board}>
        {gameState.value.map((column, colIndex) =>
            column.map((val, rowIndex) => (
                <div
                    key={`${colIndex}${rowIndex}`}
                    id={`${colIndex}${rowIndex}`}
                    class={style[val]}
                    onClick={() => setValue(colIndex)}
                />
            ))
        )}
    </main>
)
