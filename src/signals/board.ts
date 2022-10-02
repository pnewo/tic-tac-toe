import { signal, batch, computed, effect } from '@preact/signals'
import { botMove } from '../bot/bot'

export type BoardValue = 'empty' | 'cross' | 'circle'

const initBoard: BoardValue[] = Array(9).fill('empty')

export const board = signal<BoardValue[]>(initBoard)

// user is always X
export const setValue = (index: number) => {
    // const value: BoardValue = isCircle.value ? 'circle' : 'cross'
    const oldBoard: BoardValue[] = board.value

    if (isCircle.value || oldBoard[index] !== 'empty' || getIsGameOver.value) {
        return
    }
    batch(() => {
        board.value = doMove(oldBoard, 'cross', index)
        isCircle.value = !isCircle.value
    })
}

export function doMove(
    board: BoardValue[],
    player: 'cross' | 'circle',
    index: number
): BoardValue[] {
    return [...board.slice(0, index), player, ...board.slice(index + 1)]
}

export const isCircle = signal<boolean>(true)

export const getCurrentTurn = computed(() =>
    isCircle.value ? 'circle' : 'cross'
)

const boardHelpers = {
    hor1: [0, 1, 2],
    hor2: [3, 4, 5],
    hor3: [6, 7, 8],
    ver1: [0, 3, 6],
    ver2: [1, 4, 7],
    ver3: [2, 5, 8],
    dia1: [0, 4, 8],
    dia2: [2, 4, 6],
}

const winArrays = [
    boardHelpers.hor1,
    boardHelpers.hor2,
    boardHelpers.hor3,
    boardHelpers.ver1,
    boardHelpers.ver2,
    boardHelpers.ver3,
    boardHelpers.dia1,
    boardHelpers.dia2,
]

const getPossibleWinner = (board: BoardValue[]) => (winArr: number[]) => {
    if (
        winArr.map((ind) => board[ind]).filter((val) => val === 'circle')
            .length === 3
    ) {
        return 'circle'
    }
    if (
        winArr.map((ind) => board[ind]).filter((val) => val === 'cross')
            .length === 3
    ) {
        return 'cross'
    }
}

export const getIsGameOver = computed<'circle' | 'cross' | 'draw' | undefined>(
    () => {
        const curBoard = board.value
        return isGameOver(curBoard)
    }
)

export function isGameOver(
    board: BoardValue[]
): 'circle' | 'cross' | 'draw' | undefined {
    const winner = winArrays
        .map(getPossibleWinner(board))
        .find((val) => val !== undefined)
    if (winner) {
        return winner
    }
    if (board.filter((val) => val !== 'empty').length === 9) {
        return 'draw'
    }
}

export const resetBoard = () => {
    batch(() => {
        board.value = initBoard
        // make sure value change is fired for bot to start
        isCircle.value = false
        isCircle.value = Math.random() < 0.5
    })
}

// bot is always O
effect(() => {
    const botTurn = isCircle.value
    const oldBoard: BoardValue[] = board.peek()
    if (!botTurn || isGameOver(oldBoard)) {
        return
    }
    const index = botMove(board.value, 'circle')
    batch(() => {
        isCircle.value = !isCircle.value
        board.value = [
            ...oldBoard.slice(0, index),
            'circle',
            ...oldBoard.slice(index + 1),
        ]
    })
})
