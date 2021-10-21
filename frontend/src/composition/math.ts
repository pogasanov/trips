export const formatStringAsFinancialString = (input: string, precision = 2): string => {
    // For example
    // '12345.6789'
    // will convert to
    // '12 345.68'

    return Number(input)
        .toFixed(precision)
        .toString()
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1 ");
}