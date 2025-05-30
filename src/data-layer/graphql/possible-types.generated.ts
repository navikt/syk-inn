export interface PossibleTypesResultData {
    possibleTypes: {
        [key: string]: string[]
    }
}
const result: PossibleTypesResultData = {
    possibleTypes: {
        Person: ['Pasient', 'QueriedPerson'],
    },
}
export default result
