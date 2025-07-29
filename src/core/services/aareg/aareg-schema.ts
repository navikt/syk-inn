import * as z from 'zod'

export type AaregArbeidsforhold = z.infer<typeof AaregArbeidsforholdSchema>
export const AaregArbeidsforholdSchema = z.object({
    navn: z.string(),
    orgnummer: z.string(),
})
