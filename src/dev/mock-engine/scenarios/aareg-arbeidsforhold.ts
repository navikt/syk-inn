import { AaregArbeidsforhold } from '@core/services/aareg/aareg-schema'

export const simpleAaregArbeidsforhold: AaregArbeidsforhold[] = [
    {
        navn: 'Eksempel AS',
        orgnummer: '123456789',
    },
]

export const multipleAaregArbeidsforhold: AaregArbeidsforhold[] = [
    ...simpleAaregArbeidsforhold,
    {
        navn: 'Eksempel 2 AS',
        orgnummer: '987654321',
    },
    {
        navn: 'Eksempel 3 AS',
        orgnummer: '112233445',
    },
]
