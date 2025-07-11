import { test } from '@playwright/test'

import { launchWithMock } from './actions/fhir-actions'
import { startNewSykmelding, addBidiagnose, deleteBidiagnose, editBidiagnose } from './actions/user-actions'
import { expectBidagnoses } from './actions/user-form-verification'

test('bidiagnoser - adding, editing, deleting adhd test', async ({ page }) => {
    await launchWithMock('empty')(page)
    await startNewSykmelding({ name: 'Espen Eksempel', fnr: '21037712323' })(page)

    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)
    await expectBidagnoses(['Babesiose'])(page)
    await addBidiagnose({ search: 'A931', select: /Sandfluefeber/ })(page)
    await expectBidagnoses(['Babesiose', 'Sandfluefeber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses(['Sandfluefeber'])(page)

    await deleteBidiagnose(1)(page)
    await expectBidagnoses([])(page)

    await addBidiagnose({ search: 'B600', select: /Babesiose/ })(page)
    await addBidiagnose({ search: 'A931', select: /Sandfluefeber/ })(page)
    await addBidiagnose({ search: 'R772', select: /Alfaføtoproteinabnormitet/ })(page)

    await expectBidagnoses(['Babesiose', 'Sandfluefeber', 'Alfaføtoproteinabnormitet'])(page)
    await editBidiagnose({ index: 2, search: 'S022', select: /Brudd i neseben;lukket/ })(page)
    await expectBidagnoses(['Babesiose', 'Brudd i neseben;lukket', 'Alfaføtoproteinabnormitet'])(page)

    await editBidiagnose({ index: 1, search: 'A051', select: /Botulisme/ })(page)
    await expectBidagnoses(['Botulisme', 'Brudd i neseben;lukket', 'Alfaføtoproteinabnormitet'])(page)

    await editBidiagnose({ index: 3, search: 'F609', select: /Uspesifisert personlighetsforstyrrelse/ })(page)
    await expectBidagnoses(['Botulisme', 'Brudd i neseben;lukket', 'Uspesifisert personlighetsforstyrrelse'])(page)

    await deleteBidiagnose(3)(page)
    await deleteBidiagnose(2)(page)
    await deleteBidiagnose(1)(page)

    await expectBidagnoses([])(page)
})
