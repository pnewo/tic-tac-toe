import { signal, batch, computed, effect } from '@preact/signals'
import { botMove } from '../bot/connect4bot'

export type TileValue = 'empty' | 'red' | 'blue'

const gameSize = {
    width: 7,
    height: 6,
}

const initGameColumn: TileValue[] = Array(gameSize.height).fill('empty')
const initGameState: TileValue[][] = Array(gameSize.width).fill([
    ...initGameColumn,
])

export const gameState = signal<TileValue[][]>(initGameState)

export const setValue = (dropColumn: number) => {
    const oldGameState: TileValue[][] = gameState.value

    if (
        isRedTurn.value ||
        oldGameState[dropColumn].findIndex(isEmpty) === -1 ||
        getIsGameOver.value !== 'not_over'
    ) {
        return
    }
    const value = isRedTurn.value ? 'red' : 'blue'
    batch(() => {
        gameState.value = doMove(oldGameState, value, dropColumn)
        isRedTurn.value = !isRedTurn.value
    })
}

export function doMove(
    gameState: TileValue[][],
    player: 'blue' | 'red',
    dropColumn: number
): TileValue[][] {
    const column = gameState[dropColumn]
    const firstEmpty = column.findIndex(isEmpty)
    const newColumn = [
        ...column.slice(0, firstEmpty),
        player,
        ...column.slice(firstEmpty + 1),
    ]
    return [
        ...gameState.slice(0, dropColumn),
        newColumn,
        ...gameState.slice(dropColumn + 1),
    ]
}

export const isRedTurn = signal<boolean>(false)

export const getCurrentTurn = computed(() => (isRedTurn.value ? 'red' : 'blue'))

/**
 * diaRight / only if height 3,4,5 and widht 0,1,2,3
 * diaLeft \ only if height 3,4,5 and widht 3,4,5,6
 */
function getPossibleWinner(
    gameState: TileValue[][]
): 'red' | 'blue' | 'no_winner' {
    const horizontal = checkHorizontal(gameState)
    const vertical = checkVertical(gameState)
    const diagonal = checkDiagonal(gameState)
    if (vertical !== 'no_winner') {
        return vertical
    }
    if (horizontal !== 'no_winner') {
        return horizontal
    }
    if (diagonal !== 'no_winner') {
        return diagonal
    }
    return 'no_winner'
}

function checkHorizontal(
    gameState: TileValue[][]
): 'red' | 'blue' | 'no_winner' {
    const horizontals = gameState[0].map((_, rowIndex) =>
        gameState.map((column) => column[rowIndex])
    )
    return horizontals.map(rowHasWinner).filter(isWinner)[0] || 'no_winner'
}

function rowHasWinner(row: TileValue[]): 'red' | 'blue' | 'no_winner' {
    if (row.filter(isEmpty).length > 3) {
        return 'no_winner'
    }
    const first4 = row.slice(0, 4)
    const second4 = row.slice(1, 5)
    const third4 = row.slice(2, 6)
    const last4 = row.slice(-4)
    if (
        first4.every(isRed) ||
        second4.every(isRed) ||
        third4.every(isRed) ||
        last4.every(isRed)
    ) {
        return 'red'
    }
    if (
        first4.every(isBlue) ||
        second4.every(isBlue) ||
        third4.every(isBlue) ||
        last4.every(isBlue)
    ) {
        return 'blue'
    }
    return 'no_winner'
}

function checkVertical(gameState: TileValue[][]): 'red' | 'blue' | 'no_winner' {
    return gameState.map(columnHasWinner).filter(isWinner)[0] || 'no_winner'
}

function columnHasWinner(column: TileValue[]): 'red' | 'blue' | 'no_winner' {
    const last4 = column.filter(isNotEmpty).slice(-4) as ('red' | 'blue')[]
    if (last4.length < 4) {
        return 'no_winner'
    }
    if (last4.every(isRed)) {
        return 'red'
    }
    if (last4.every(isBlue)) {
        return 'blue'
    }
    return 'no_winner'
}

function checkDiagonal(gameState: TileValue[][]): 'red' | 'blue' | 'no_winner' {
    return (
        gameState.map(diagonalHasWinner(gameState)).filter(isWinner)[0] ||
        'no_winner'
    )
}
function diagonalHasWinner(gameState: TileValue[][]) {
    return function diagonalFromColumnHasWinner(
        column: TileValue[],
        colIndex: number
    ): 'red' | 'blue' | 'no_winner' {
        const last3NonEmpty = column.slice(-3).filter(isNotEmpty)
        if (last3NonEmpty.length === 0) {
            return 'no_winner'
        }
        // check right
        let diagRight: ('red' | 'blue' | 'no_winner')[] = []
        let diagLeft: ('red' | 'blue' | 'no_winner')[] = []
        if (colIndex < 4) {
            diagRight = last3NonEmpty.map((_, rowIndex) => {
                const diagonal = [
                    ...[0, 1, 2, 3].map(
                        (diff) =>
                            gameState[colIndex + diff][rowIndex + 3 - diff]
                    ),
                ]
                if (diagonal.every(isRed)) {
                    return 'red'
                }
                if (diagonal.every(isBlue)) {
                    return 'blue'
                }
                return 'no_winner'
            })
        }
        // check left
        if (colIndex > 2) {
            diagLeft = last3NonEmpty.map((_, rowIndex) => {
                const diagonal = [
                    ...[0, 1, 2, 3].map(
                        (diff) =>
                            gameState[colIndex - diff][rowIndex + 3 - diff]
                    ),
                ]
                if (diagonal.every(isRed)) {
                    return 'red'
                }
                if (diagonal.every(isBlue)) {
                    return 'blue'
                }
                return 'no_winner'
            })
        }
        if (diagRight.includes('red') || diagLeft.includes('red')) {
            return 'red'
        }
        if (diagRight.includes('blue') || diagLeft.includes('blue')) {
            return 'blue'
        }
        return 'no_winner'
    }
}

function isRed(tile: TileValue): boolean {
    return tile === 'red'
}
function isBlue(tile: TileValue): boolean {
    return tile === 'blue'
}
function isEmpty(tile: TileValue): boolean {
    return tile === 'empty'
}
function isNotEmpty(tile: TileValue): boolean {
    return !isEmpty(tile)
}
function isWinner(tile: 'red' | 'blue' | 'no_winner'): boolean {
    return tile !== 'no_winner'
}

export const getIsGameOver = computed<'red' | 'blue' | 'draw' | 'not_over'>(
    () => {
        const state = gameState.value
        return isGameOver(state)
    }
)

export function isGameOver(
    gameState: TileValue[][]
): 'red' | 'blue' | 'draw' | 'not_over' {
    const winner = getPossibleWinner(gameState)
    if (winner !== 'no_winner') {
        return winner
    }
    if (
        gameState
            .map(
                (column) =>
                    column.filter((val) => val !== 'empty').length ===
                    gameSize.height
            )
            .every(Boolean)
    ) {
        return 'draw'
    }
    return 'not_over'
}

export const resetBoard = () => {
    batch(() => {
        gameState.value = initGameState
        // make sure value change is fired for bot to start
        isRedTurn.value = false
        isRedTurn.value = Math.random() < 0.5
    })
}

// bot is always red
effect(() => {
    const botTurn = isRedTurn.value
    const oldState: TileValue[][] = gameState.peek()
    if (!botTurn || isGameOver(oldState) !== 'not_over') {
        return
    }
    console
    const dropColumn = botMove(gameState.value, 'red')
    const column = oldState[dropColumn]
    const firstEmpty = column.findIndex(isEmpty)
    const newColumn: TileValue[] = [
        ...column.slice(0, firstEmpty),
        'red',
        ...column.slice(firstEmpty + 1),
    ]
    batch(() => {
        isRedTurn.value = !isRedTurn.value
        gameState.value = [
            ...oldState.slice(0, dropColumn),
            newColumn,
            ...oldState.slice(dropColumn + 1),
        ]
    })
})
