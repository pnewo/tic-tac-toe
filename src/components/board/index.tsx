import { h } from 'preact'
import style from './style.css'
import { board, setValue } from '../../signals/board'

const valDisplayMap = {
    circle: 'O',
    cross: 'X',
    empty: '',
}

export const Board = () => (
    <main class={style.board}>
        {board.value.map((val, index) => (
            <div key={index} class={style[val]} onClick={() => setValue(index)}>
                <div>{valDisplayMap[val]}</div>
            </div>
        ))}
    </main>
)
