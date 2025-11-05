/**
 * When these rules are hit, the user will be allowed to proceed (aka "send læll").
 */
const softRules: Record<string, string | null> = {
    BEHANDLER_MT_FT_KI_OVER_12_UKER: 'Pasientens sykefravær overstiger 12 uker. Som kiropraktor, manuellterapeut eller fysioterapeut kan du ikke sykmelde utover 12 uker.',
    ICPC_2_Z_DIAGNOSE: 'Hoveddiagnosen er en z-diagnose (ICPC-2) som ikke gir rett til sykepenger.',
    PASIENT_YNGRE_ENN_13: 'Pasienten er under 13 år. Sykmelding kan ikke benyttes. Hvis pasienten trenger dokumentasjon på fravær, så kan legeerklæring benyttes.',
    INNTIL_8_DAGER: 'Sykmeldingen mangler begrunnelse for tilbakedatering.',
    MINDRE_ENN_1_MAANED: 'Sykmeldingen mangler begrunnelse for tilbakedatering.',
    MINDRE_ENN_1_MAANED_MED_BEGRUNNELSE: "Sykmeldingen er tilbakedatert mindre enn 1 måned",
    OVER_1_MND: 'Sykmeldingen er tilbakedatert over 1 måned uten at den er tilstrekkelig begrunnet. Ved lengre tilbakedatering må du gi en lang og god begrunnelse.',
    OVER_1_MND_MED_BEGRUNNELSE: 'Sykmeldingen er tilbakedatert over 1 måned uten at den er tilstrekkelig begrunnet. Ved lengre tilbakedatering må du gi en lang og god begrunnelse.',
}

/**
 * When these rules are hit, the user will be unable to submit, aka "hard stop".
 */
const hardRules: Record<string, string | null> = {
    AVSENDER_FNR_ER_SAMME_SOM_PASIENT_FNR: 'Avsenders fødselsnummer er det samme som pasientens fødselsnummer. (Du kan ikke sykmelde deg selv)',
    BEHANDLER_FNR_ER_SAMME_SOM_PASIENT_FNR: 'Behandlers fødselsnummer er det sammen som pasientens fødselsnummer. (Du kan ikke sykmelde deg selv)',
    BEHANDLER_IKKE_I_HPR: 'Vi finner deg ikke i Helsepersonellregisteret. Er du registrert med riktig HPR-nummer?',
    BEHANDLER_IKKE_GYLDIG_I_HPR: 'Ditt HPR-nummer er ikke gyldig i Helsepersonellregisteret på konsultasjonstidspunktet.',
    BEHANDLER_MANGLER_AUTORISASJON_I_HPR: 'Du har ikke gyldig autorisasjon i Helsepersonellregisteret',
    BEHANDLER_IKKE_LE_KI_MT_TL_FT_I_HPR: 'Du er ikke registrert med autorisasjon til å sykmelde i Helsepersonellregisteret. Du må være lege, kiropraktor, fysioterapeut, manuellterapeut eller tannlege med tilleggskompetanse i HPR.',
    // Skal være validert
    UGYLDIG_ORGNR_LENGDE: 'Det er feil format på organisasjonsnummer. Dette skal være 9 sifre. Dette må korrigeres i EPJ-systemet ditt før sykmelding kan sendes.',
    PERIODER_MANGLER: 'Sykmeldingsperioder mangler.',
    FRADATO_ETTER_TILDATO: 'Til-dato er før fra-dato.',
    OVERLAPPENDE_PERIODER: 'Det er en eller flere perioder i sykmeldingen som overlapper.',
    OPPHOLD_MELLOM_PERIODER: 'De oppgitte sykmeldingsperiodene henger ikke sammen/Det er opphold mellom sykmeldingsperiodene',
    IKKE_DEFINERT_PERIODE: 'Det er ikke oppgitt type for sykmeldingen (den må være enten 100 prosent, gradert, avventende, reisetilskudd eller behandlingsdager).',
    GRADERT_SYKMELDING_OVER_99_PROSENT: 'Sykmeldingsgraden kan ikke være høyere enn 99 % for gradert sykmelding.',
    GRADERT_SYKMELDING_0_PROSENT: 'Gradert sykmelding kan ikke være 0 %',
    FRAVAERSGRUNN_MANGLER: 'Du har ikke oppgitt hoveddiagnose eller annen lovfestet fraværsgrunn.',
    UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE: 'Kodeverk for hoveddiagnose er ikke angitt eller ukjent.',
    UGYLDIG_KODEVERK_FOR_BIDIAGNOSE: 'Kodeverk for bidiagnose er ikke angitt eller ukjent.',
    FREMDATERT: 'Starttidspunktet for sykmeldingen er mer enn 30 dager fram i tid.',
    TILBAKEDATERT_MER_ENN_3_AR: 'Starttidspunktet for sykmeldingen er mer enn 3 år tilbake i tid.',
    TOTAL_VARIGHET_OVER_ETT_AAR: 'Sykmeldingen har en varighet på over ett år.',
    MANGLENDE_DYNAMISKE_SPOERSMAL_VERSJON2_UKE_39: 'Utdypende opplysninger som kreves ved uke 39 mangler.',
    AVVENTENDE_SYKMELDING_KOMBINERT: 'Avventende sykmelding kan ikke inneholde flere perioder.',
    MANGLENDE_INNSPILL_TIL_ARBEIDSGIVER: 'Ved avventende sykmelding må feltet Innspill til arbeidsgiver om tilrettelegging fylles ut.',
    AVVENTENDE_SYKMELDING_OVER_16_DAGER: 'Avventende sykmelding kan ikke benyttes utover arbeidsgiverperioden på 16 kalenderdager.',
    FOR_MANGE_BEHANDLINGSDAGER_PER_UKE: 'Det er oppgitt mer enn én behandlingsdag per uke.',
    OVER_1_MND_SPESIALISTHELSETJENESTEN: 'Tilbakedatert over 1 måned med begrunnelse på min ord = manuell behandling',
    // TODO
    BEHANDLER_SUSPENDERT: null,
    // Impossible in syk-inn
    BEHANDLINGSDATO_ETTER_MOTTATTDATO: null,
    SYKMELDING_MED_BEHANDLINGSDAGER: null,
    UGYLDIG_REGELSETTVERSJON: null,
}

export function getRuleType(rule: string): 'soft' | 'hard' | 'unknown' {
    if (softRules[rule]) {
        return 'soft'
    } else if (hardRules[rule]) {
        return 'hard'
    } else {
        return 'unknown'
    }
}

export function getRuleText(rule: string): string | null {
    if (softRules[rule]) {
        return softRules[rule]
    } else if (hardRules[rule]) {
        return hardRules[rule]
    } else {
        return null
    }
}
