import { TileValue, doMove, isGameOver } from '../signals/connect4'

export function botMove(
    gameState: TileValue[][],
    player: 'red' | 'blue'
): number {
    const move = minimax(gameState, player)
    return move
}

function minimax(gameState: TileValue[][], player: 'red' | 'blue'): number {
    console.log('start minimax')
    // gen moves
    const minMoves = getAvailableMoves(gameState)
    // gen gameStates
    const moveScores: { move: number; score: number }[] = minMoves.map(
        (move) => ({
            move,
            score: minimaxScore(doMove(gameState, player, move), player),
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
 * 1. if gameState in end state and return score
 * 2. generate possible moves (minimized amount)
 * 3. call minmaxScore recursivly with inverted player and isMaximizer
 * 4. return inverted player score
 */
function minimaxScore(
    gameState: TileValue[][],
    player: 'red' | 'blue',
    alpha = -Infinity,
    beta = Infinity,
    isMaximizer = true,
    depth = 0
): number {
    const winner = isGameOver(gameState)
    switch (winner) {
        case 'red':
        case 'blue':
            if (isMaximizer) {
                return 7 * 6 - depth
            }
            return -7 * 6 + depth
        case 'draw':
            return 0
        default:
            break
    }
    const minMoves = getAvailableMoves(gameState)
    const nextPlayer = player === 'blue' ? 'red' : 'blue'

    const scores = minMoves.flatMap((move) =>
        minimaxScore(
            doMove(gameState, nextPlayer, move),
            nextPlayer,
            alpha,
            beta,
            !isMaximizer,
            depth + 1
        )
    )

    if (!isMaximizer) {
        return Math.max(...scores)
    }
    return Math.min(...scores)
}

// get all empty tiles and return array of indeses
function getAvailableMoves(gameState: TileValue[][]): number[] {
    return gameState.reduce(
        (acc, val, ind) => (val.includes('empty') ? [...acc, ind] : acc),
        [] as number[]
    )
}
