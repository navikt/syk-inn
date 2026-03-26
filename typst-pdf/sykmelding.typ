// ─── Data ────────────────────────────────────────────────────────────────────

#let data = json(bytes(sys.inputs.at("data")))
#let meta = data.meta
#let values = data.values

// ─── Date helpers ─────────────────────────────────────────────────────────────

#let months-nb = (
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
)

#let parse-date(s) = {
  // Strip time component for ISO datetime strings (e.g. "2024-03-15T10:00:00+01:00")
  let p = s.split("T").at(0).split("-")
  (year: int(p.at(0)), month: int(p.at(1)), day: int(p.at(2)))
}

#let fmt-date(s) = {
  let d = parse-date(s)
  str(d.day) + ". " + months-nb.at(d.month - 1) + " " + str(d.year)
}

#let fmt-date-no-year(s) = {
  let d = parse-date(s)
  str(d.day) + ". " + months-nb.at(d.month - 1)
}

#let fmt-period(fom, tom) = {
  if fom == tom {
    fmt-date(fom)
  } else {
    let f = parse-date(fom)
    let t = parse-date(tom)
    if f.year == t.year and f.month == t.month {
      str(f.day) + ". \u{2013} " + fmt-date(tom)
    } else if f.year == t.year {
      fmt-date-no-year(fom) + " \u{2013} " + fmt-date(tom)
    } else {
      fmt-date(fom) + " \u{2013} " + fmt-date(tom)
    }
  }
}

// ─── AnnenFravarsgrunn helper ─────────────────────────────────────────────────

#let annen-fravarsgrunn-tekst(arsak) = {
  if arsak == "ABORT" {
    "Pasienten er arbeidsufør som følge av svangerskapsavbrudd"
  } else if arsak == "BEHANDLING_FORHINDRER_ARBEID" {
    "Pasienten er under behandling som gjør det nødvendig med fravær fra arbeid (ikke enkeltstående behandlingsdager)"
  } else if arsak == "ARBEIDSRETTET_TILTAK" {
    "Pasienten deltar på et arbeidsrettet tiltak"
  } else if arsak == "BEHANDLING_STERILISERING" {
    "Pasienten er arbeidsufør som følge av behandling i forbindelse med sterilisering"
  } else if arsak == "DONOR" {
    "Pasienten er donor eller er under vurdering som donor"
  } else if arsak == "GODKJENT_HELSEINSTITUSJON" {
    "Pasienten er innlagt i en godkjent helseinstitusjon"
  } else if arsak == "MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND" {
    "Pasienten mottar tilskott til opplæringstiltak på grunn av sykdom, skade eller lyte"
  } else if arsak == "NODVENDIG_KONTROLLUNDENRSOKELSE" {
    "Pasienten er til nødvendig kontrollundersøkelse som krever minst 24 timers fravær"
  } else if arsak == "SMITTEFARE" {
    "Pasienten har forbud mot å arbeide på grunn av smittefare"
  } else if arsak == "UFOR_GRUNNET_BARNLOSHET" {
    "Pasienten er arbeidsufør som følge av behandling for barnløshet"
  } else {
    arsak
  }
}

// ─── Page setup ───────────────────────────────────────────────────────────────

#set text(font: ("Source Sans 3"), lang: "nb", size: 10pt)
#set par(leading: 4pt)
#set list(indent: 8pt)

#set page(
  paper: "a4",
  margin: (top: 32mm, bottom: 22mm, left: 20mm, right: 20mm),
  header: block(
    fill: rgb("#E6F0FF"),
    width: 100%,
    inset: (x: 8mm, y: 5mm),
  )[
    #grid(
      columns: (auto, 1fr),
      column-gutter: 8mm,
      align: (horizon, horizon),
      image("nav-logo.svg", height: 20pt),
      text(size: 14pt, weight: "bold")[Innsendt sykmelding],
    )
  ],
  footer: context [
    #let page-num = counter(page).get().first()
    #let total = counter(page).final().first()
    #grid(
      columns: (1fr, auto),
      text(fill: gray, size: 8pt)[#data.sykmeldingId],
      text(size: 8pt)[Side #page-num av #total],
    )
  ],
)

// ─── Layout helpers ───────────────────────────────────────────────────────────

#let lbl(t) = text(weight: "bold", size: 10pt)[#t]
#let val(t) = text(size: 9pt)[#t]

#let half-item(label, body) = block(breakable: false)[
  #lbl(label) \
  #body
]

#let full-item(label, body) = grid.cell(
  colspan: 2,
  block(breakable: false)[
    #lbl(label) \
    #body
  ],
)

#let section-header(title) = grid.cell(
  colspan: 2,
  block(below: 2pt)[#text(size: 11pt, weight: "bold", title)],
)

// ─── Diagnose helper ──────────────────────────────────────────────────────────

#let fmt-diagnose(d) = d.code + ": " + d.text + " (" + d.system + ")"

// ─── Aktivitet helpers ────────────────────────────────────────────────────────

#let aktivitet-item(label, akt) = {
  if akt.type == "AKTIVITET_IKKE_MULIG" {
    let medisinsk = akt.at("medisinskArsak", default: none)
    let arbeidsrelatert = akt.at("arbeidsrelatertArsak", default: none)
    let has-medisinsk = medisinsk != none and medisinsk.isMedisinskArsak == true
    let has-arbeidsrelatert = arbeidsrelatert != none and arbeidsrelatert.isArbeidsrelatertArsak == true

    full-item(label, {
      val("100% sykmelding, fra " + fmt-period(akt.fom, akt.tom))
      if has-medisinsk or has-arbeidsrelatert {
        let top-items = ()
        let top-items = if has-medisinsk {
          top-items + ([Medisinske årsaker som forhindrer arbeidsrelatert aktivitet],)
        } else { top-items }
        let top-items = if has-arbeidsrelatert {
          let arsaker = arbeidsrelatert.arbeidsrelaterteArsaker.map(arsak => {
            if arsak == "TILRETTELEGGING_IKKE_MULIG" {
              [Tilrettelegging er ikke mulig]
            } else if arsak == "ANNET" {
              let annen = arbeidsrelatert.at("annenArbeidsrelatertArsak", default: none)
              [Annen arbeidsrelatert årsak: #if annen != none { annen } else { [Ikke oppgitt] }]
            } else {
              [#arsak]
            }
          })
          top-items + (block[
            Arbeidsrelaterte årsaker som forhindrer arbeidsrelatert aktivitet
            #list(..arsaker)
          ],)
        } else { top-items }
        list(..top-items)
      }
    })
  } else if akt.type == "GRADERT" {
    full-item(label, val(str(int(akt.grad)) + "% gradert sykmelding, fra " + fmt-period(akt.fom, akt.tom)))
  } else {
    full-item(label, val(akt.type))
  }
}

// ─── Content cells ────────────────────────────────────────────────────────────

#let sykmelder = meta.sykmelder
#let sykmelder-name = (sykmelder.fornavn, sykmelder.mellomnavn, sykmelder.etternavn)
  .filter(x => x != none and x != "")
  .fold("", (acc, x) => if acc == "" { x } else { acc + " " + x })

#let cells = ()

// Patient (person name not available in sykmelding object – show identifier)
#let cells = cells + (half-item("Fødselsnummer", val(meta.pasientIdent)),)

// Received date
#let cells = cells + (half-item("Mottatt av Nav", val(fmt-date(meta.mottatt))),)

// Sykmelder
#let cells = cells + (half-item("Sykmelder", [
  #val(sykmelder-name) \
  #val("HPR-nr: " + sykmelder.hprNummer)
]),)

// Legekontor
#let cells = cells + (half-item("Legekontor", [
  #val("Org.nr.: " + if meta.legekontorOrgnr != none { meta.legekontorOrgnr } else { "Ikke oppgitt" }) \
  #val("Tlf: " + if meta.legekontorTlf != none { meta.legekontorTlf } else { "Ikke oppgitt" })
]),)

// Arbeidsgiver (only when patient has multiple employers)
#let arbeidsgiver = values.at("arbeidsgiver", default: none)
#let cells = if arbeidsgiver != none and arbeidsgiver.harFlere == true {
  cells + (half-item("Arbeidsgiver", val(arbeidsgiver.arbeidsgivernavn)),)
} else { cells }

// Aktivitet / sykmeldingsperioder
#let aktivitet = values.aktivitet
#let cells = if aktivitet.len() == 1 {
  cells + (aktivitet-item("Sykmeldingsperiode", aktivitet.at(0)),)
} else {
  let periode-cells = range(aktivitet.len()).map(i =>
    aktivitet-item("Periode " + str(i + 1), aktivitet.at(i))
  )
  cells + (section-header("Sykmeldingsperioder"),) + periode-cells
}

// Hoveddiagnose
#let hoveddiagnose = values.at("hoveddiagnose", default: none)
#let bidiagnoser = values.at("bidiagnoser", default: none)
#let cells = cells + (full-item(
  "Diagnose",
  val(if hoveddiagnose != none { fmt-diagnose(hoveddiagnose) } else { "Ingen diagnose oppgitt" }),
),)

// Bidiagnoser
#let cells = if bidiagnoser != none and bidiagnoser.len() > 0 {
  cells + (full-item("Bidiagnoser", {
    let lines = bidiagnoser.map(d => val(fmt-diagnose(d)))
    lines.join(linebreak())
  }),)
} else { cells }

// Annen lovfestet fraværsgrunn
#let annen-fravarsgrunn = values.at("annenFravarsgrunn", default: none)
#let cells = if annen-fravarsgrunn != none {
  cells + (full-item("Annen lovfestet fraværsgrunn", val(annen-fravarsgrunn-tekst(annen-fravarsgrunn))),)
} else { cells }

// Utdypende spørsmål og svar
#let svar-obj = values.at("utdypendeSporsmalSvar", default: none)
#let cells = if svar-obj != none {
  let svar-items = svar-obj.values()
    .filter(x => x != none)
    .map(item => full-item(
      if item.sporsmalstekst != none { item.sporsmalstekst } else { "" },
      val(item.svar),
    ))
  cells + svar-items
} else { cells }

// Andre spørsmål (svangerskapsrelatert / yrkesskade)
#let yrkesskade = values.at("yrkesskade", default: none)
#let vis-andre = values.svangerskapsrelatert == true or (yrkesskade != none and yrkesskade.yrkesskade == true)
#let cells = if vis-andre {
  let andre-items = ()
  let andre-items = if values.svangerskapsrelatert == true {
    andre-items + ([Sykdommen er svangerskapsrelatert],)
  } else { andre-items }
  let andre-items = if yrkesskade != none and yrkesskade.yrkesskade == true {
    let skadedato = yrkesskade.at("skadedato", default: none)
    let skadedato-sub = if skadedato != none {
      list([Eventuell skadedato: #fmt-date(skadedato)])
    } else { [] }
    andre-items + (block[
      Sykmeldingen kan skyldes en yrkesskade/yrkessykdom
      #skadedato-sub
    ],)
  } else { andre-items }
  cells + (full-item("Andre spørsmål", list(..andre-items)),)
} else { cells }

// Melding til Nav
#let til-nav = values.meldinger.tilNav
#let cells = cells + (full-item("Melding til Nav", {
  if til-nav != none {
    val(til-nav)
  } else {
    text(style: "italic", fill: rgb("#708090"), size: 9pt, "Ingen melding til Nav")
  }
}),)

// Innspill til arbeidsgiver
#let til-ag = values.meldinger.tilArbeidsgiver
#let cells = cells + (full-item("Innspill til arbeidsgiver", {
  if til-ag != none {
    val(til-ag)
  } else {
    text(style: "italic", fill: rgb("#708090"), size: 9pt, "Ingen melding til arbeidsgiver")
  }
}),)

// Pasienten er skjermet
#let cells = if values.pasientenSkalSkjermes == true {
  cells + (full-item("Pasienten er skjermet for medisinske opplysninger", val("Ja")),)
} else { cells }

// ─── Render ───────────────────────────────────────────────────────────────────

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  row-gutter: 8mm,
  ..cells,
)
