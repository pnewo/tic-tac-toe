import { h } from 'preact'
import style from './style.css'
import { resetBoard } from '../../../signals/connect4'

export const Connect4Controls = () => (
    <footer class={style.controls}>
        <button class={style.button} onClick={resetBoard}>
            Reset game
        </button>
    </footer>
)
