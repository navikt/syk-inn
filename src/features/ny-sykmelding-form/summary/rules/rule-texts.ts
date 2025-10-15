/**
 * When these rules are hit, the user will be allowed to proceed (aka "send læll").
 */
const softRules: Record<string, string> = {
    BEHANDLER_SUSPENDERT: 'Behandler er suspendert av NAV på konsultasjonstidspunkt.',
    MANGLENDE_DYNAMISKE_SPOERSMAL_VERSJON2_UKE_39: 'Utdypende opplysninger som kreves ved uke 39 mangler.',
    UGYLDIG_ORGNR_LENGDE: 'Feil format på organisasjonsnummer. Dette skal være 9 sifre.',
    AVSENDER_FNR_ER_SAMME_SOM_PASIENT_FNR: 'Avsender fnr er det samme som pasient fnr',
    BEHANDLER_FNR_ER_SAMME_SOM_PASIENT_FNR: 'Behandler fnr er det samme som pasient fnr',
    AVVENTENDE_SYKMELDING_KOMBINERT: 'Avventende sykmelding kan ikke inneholde flere perioder.',
    MANGLENDE_INNSPILL_TIL_ARBEIDSGIVER:
        'Hvis innspill til arbeidsgiver om tilrettelegging i pkt 4.1.3 ikke er utfylt ved avventende sykmelding avvises meldingen',
    AVVENTENDE_SYKMELDING_OVER_16_DAGER:
        'Hvis avventende sykmelding benyttes utover arbeidsgiverperioden på 16 kalenderdager, avvises meldingen.',
    FOR_MANGE_BEHANDLINGSDAGER_PER_UKE:
        'Hvis antall dager oppgitt for behandlingsdager periode er for høyt i forhold til periodens lengde avvises meldingen. Mer enn en dag per uke er for høyt. 1 dag per påbegynt uke.',
    SYKMELDING_MED_BEHANDLINGSDAGER: 'Sykmelding inneholder behandlingsdager (felt 4.4).',
    BEHANDLER_IKKE_I_HPR: 'Den som har skrevet sykmeldingen ble ikke funnet i Helsepersonellregisteret (HPR)',
    BEHANDLER_IKKE_GYLDIG_I_HPR: 'Behandler er ikke gyldig i HPR på konsultasjonstidspunkt.',
    BEHANDLER_MANGLER_AUTORISASJON_I_HPR: 'Behandler har ikke gyldig autorisasjon i HPR.',
    BEHANDLER_IKKE_LE_KI_MT_TL_FT_I_HPR:
        'Behandler finnes i HPR, men er ikke lege, kiropraktor, fysioterapeut, manuellterapeut eller tannlege.',
    BEHANDLER_MT_FT_KI_OVER_12_UKER:
        'Sykmeldingen er avvist fordi det totale sykefraværet overstiger 12 uker (du som KI/MT/FT kan ikke sykmelde utover 12 uker).',
    ICPC_2_Z_DIAGNOSE: 'Angitt hoveddiagnose (z-diagnose) gir ikke rett til sykepenger.',
    FRAVAERSGRUNN_MANGLER: 'Hoveddiagnose eller annen lovfestet fraværsgrunn mangler. ',
    UGYLDIG_KODEVERK_FOR_HOVEDDIAGNOSE: 'Kodeverk for hoveddiagnose er ikke angitt eller ukjent.',
    UGYLDIG_KODEVERK_FOR_BIDIAGNOSE: 'Kodeverk for bidiagnose er ikke angitt eller ukjent.',
    PASIENT_YNGRE_ENN_13: 'Pasienten er under 13 år. Sykmelding kan ikke benyttes.',
    FREMDATERT: 'Hvis sykmeldingen er fremdatert mer enn 30 dager etter behandletDato avvises meldingen.',
    TILBAKEDATERT_MER_ENN_3_AR: 'Sykmeldinges fom-dato er mer enn 3 år tilbake i tid.',
    TOTAL_VARIGHET_OVER_ETT_AAR: 'Sykmeldingen første fom og siste tom har ein varighet som er over 1 år',
    INNTIL_8_DAGER: 'Første sykmelding er tilbakedatert uten at begrunnelse (felt 11.2) er tilstrekkelig utfylt',
    MINDRE_ENN_1_MAANED: 'Sykmelding er tilbakedatert uten begrunnelse (felt 11.2) er tilstrekkelig utfylt',
    MINDRE_ENN_1_MAANED_MED_BEGRUNNELSE: 'Første sykmelding er tilbakedatert og felt 11.2 (begrunnelse) er utfylt',
    OVER_1_MND:
        'Sykmelding er tilbakedatert mer enn det som er tillatt og felt 11.2 (begrunnelse) er utfylt uten tilstrekkelig begrunnelse',
    OVER_1_MND_MED_BEGRUNNELSE: 'Sykmeldingen er tilbakedatert og felt 11.2 (begrunnelse) er utfylt',
    OVER_1_MND_SPESIALISTHELSETJENESTEN:
        'Sykmeldingen er tilbakedatert over 1 månede og er fra spesialisthelsetjenesten',
}

/**
 * When these rules are hit, the user will be unable to submit, aka "hard stop".
 */
const hardRules: Record<string, string> = {}

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
