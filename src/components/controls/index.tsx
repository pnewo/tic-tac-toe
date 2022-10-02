import { h } from 'preact'
import style from './style.css'
import { resetBoard } from '../../signals/board'

export const Controls = () => (
    <footer class={style.controls}>
        <button class={style.button} onClick={resetBoard}>
            Reset game
        </button>
    </footer>
)
