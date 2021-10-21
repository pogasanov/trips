import {formatStringAsFinancialString} from "@/composition/math";

describe('math.ts', () => {
    it('generic', () => {
        const result = formatStringAsFinancialString('12345.6789')
        expect(result).toEqual('12 345.68')
    })

    it('with custom precision', () => {
        const result = formatStringAsFinancialString('12345.6789', 3)
        expect(result).toEqual('12 345.679')
    })
})
