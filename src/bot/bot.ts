import { BoardValue, doMove, isGameOver } from '../signals/board'

export function botMove(
    board: BoardValue[],
    player: 'cross' | 'circle'
): number {
    const move = minimax(board, player)
    return move
}

function minimax(board: BoardValue[], player: 'cross' | 'circle'): number {
    // gen moves
    const minMoves = getMinMovesWithSymmetryCheck(board)
    // gen boards
    const moveScores: { move: number; score: number }[] = minMoves.map(
        (move) => ({
            move,
            score: minimaxScore(doMove(board, player, move), player),
        })
    )

    // array.sort mutates original
    const sortedScores = moveScores.sort((a, b) => b.score - a.score)
    const maxScoreMoves = sortedScores.filter(
        ({ score }) => score === sortedScores[0].score
    )
    // add some randomness to bot if multiple max scores
    return sortedScores[getRandomInt(maxScoreMoves.length)].move
}

function getRandomInt(max: number) {
    return Math.floor(Math.random() * max)
}

/**
 * TODO: add alpha-beta optimization
 * 1. if board in end state and return score
 * 2. generate possible moves (minimized amount)
 * 3. call minmaxScore recursivly with inverted player and isMaximizer
 * 4. return inverted player score
 */
function minimaxScore(
    board: BoardValue[],
    player: 'cross' | 'circle',
    isMaximizer = true,
    depth = 0
): number {
    const winner = isGameOver(board)
    switch (winner) {
        case 'cross':
        case 'circle':
            if (isMaximizer) {
                return 10 - depth
            }
            return -10 + depth
        case 'draw':
            return 0
        default:
            break
    }
    const minMoves = getMinMovesWithSymmetryCheck(board)
    const nextPlayer = player === 'circle' ? 'cross' : 'circle'

    const scores = minMoves.flatMap((move) =>
        minimaxScore(
            doMove(board, nextPlayer, move),
            nextPlayer,
            !isMaximizer,
            depth + 1
        )
    )

    if (!isMaximizer) {
        return Math.max(...scores)
    }
    return Math.min(...scores)
}

const symMap = {
    diaUp: [
        [0, 8],
        [1, 5],
        [3, 7],
    ],
    diaDown: [
        [1, 3],
        [2, 6],
        [5, 7],
    ],
    ver: [
        [0, 2],
        [3, 5],
        [6, 8],
    ],
    hor: [
        [0, 6],
        [1, 7],
        [2, 8],
    ],
    multiple: [0, 1, 4],
}

const pairComparison = (board: BoardValue[]) => (pair: number[]) => {
    return board[pair[0]] === board[pair[1]]
}

// get all empty tiles and return array of indeses
function getAvailableMoves(board: BoardValue[]): number[] {
    return board.reduce(
        (acc, val, ind) => (val === 'empty' ? [...acc, ind] : acc),
        [] as number[]
    )
}

// minimizes moves if symmetry found
// reduces recursion especially at the start of the game
// over 80% reduction during first move
function getMinMovesWithSymmetryCheck(board: BoardValue[]): number[] {
    const moves = getAvailableMoves(board)
    const compare = pairComparison(board)
    const isDiaUpSymmetry = symMap.diaUp.map(compare).every(Boolean) && 'diaUp'

    const isDiaDownSymmetry =
        symMap.diaDown.map(compare).every(Boolean) && 'diaDown'

    const isVerticalSymmetry = symMap.ver.map(compare).every(Boolean) && 'ver'
    const isHorizontalSymmetry = symMap.hor.map(compare).every(Boolean) && 'hor'
    const isMultipleSymmetry =
        [
            isDiaUpSymmetry,
            isDiaDownSymmetry,
            isVerticalSymmetry,
            isHorizontalSymmetry,
        ].filter(Boolean).length > 1
    if (isMultipleSymmetry) {
        return symMap.multiple.reduce(
            (acc, index) => (board[index] === 'empty' ? [...acc, index] : acc),
            [] as number[]
        )
    }
    const mapper =
        isDiaDownSymmetry ||
        isDiaUpSymmetry ||
        isHorizontalSymmetry ||
        isVerticalSymmetry
    if (mapper) {
        return symMap[mapper].reduce(
            (acc, [first, _]) => acc.filter((move) => move !== first),
            moves
        )
    }
    return moves
}
