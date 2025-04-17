export default interface Exercise {
    id: number,
    name: string,
    order: number
    description: string,
    elapsedTime: number,
    duration: number,
    start: boolean,
    paused: boolean,
    finish: boolean
}