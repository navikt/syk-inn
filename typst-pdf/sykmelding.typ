// Destructure the input from the JSON provided via --input
#let sykmelding = json(bytes(sys.inputs.at("sykmelding")))
#let meta = sykmelding.meta
#let values = sykmelding.values

// Reusable templates
#let info(title, value, empty: false) = [
  == #title
  #set text(luma(120), style: "italic") if (empty)
  #value
]

#let diagnose(diagnose) = [
  #diagnose.code: #diagnose.text (#diagnose.system)
]

#let aktivitet(aktivitet) = [
  #aktivitet.periode - #aktivitet.type
  #for detail in aktivitet.details {
    [- #detail.text]
    if detail.items.len() > 0 {
      list(indent: 1em, ..detail.items)
    }
  }
]

// Global configuration
#set text(font: "Source Sans 3", lang: "nb", size: 10pt)

#set page(
  paper: "a4",
  header: [
    #grid(
      columns: (auto, 1fr),
      gutter: 24pt,
      [#pdf.artifact(image("./images/nav-logo.svg", alt: none, height: 18pt))],
      grid.cell(
        [
          #set text(16pt)
          = Innsendt sykmelding
        ],
        align: horizon,
      ),
    )
  ],
  footer: context [
    #let page-num = counter(page).get().first()
    #let total = counter(page).final().first()
    #grid(
      columns: (1fr, auto),
      text(fill: gray, size: 8pt)[#sykmelding.id], text(size: 8pt)[Side #page-num av #total],
    )
  ],
)

// Document metadata
#set document(
  title: sykmelding.title,
  author: sykmelding.author,
  description: sykmelding.description,
  date: datetime.today(),
)

// General metadata
#let baseMeta = (
  info(
    "Navn",
    [#meta.pasient.navn (#meta.pasient.ident)],
  ),
  info(
    "Mottatt av Nav",
    [#meta.mottatt],
  ),
  info(
    "Sykmelder",
    [
      #meta.behandler.navn \
      HPR-nummer: #meta.behandler.hpr
    ],
  ),
  info(
    "Legekontor",
    [
      Org.nr.: #meta.legekontor.orgnr \
      Tlf: #meta.legekontor.tlf
    ],
  ),
)

// Arbeidsgiver
#let arbeidsgiver = if values.arbeidsgiver != none {
  (grid.cell(info("Arbeidsgiver", values.arbeidsgiver), colspan: 2),)
}

// Aktivitet
#let aktivitet = grid.cell(
  info("Sykmeldingsperiode", [
    #for it in values.aktivitet {
      [ #aktivitet(it)\ ]
    }
  ]),
  colspan: 2,
)

// Diagnoser
#let diagnoser = (
  grid.cell(
    info("Diagnose", diagnose(values.diagnose.hoved)),
  ),
  grid.cell(
    info(
      "Bidiagnoser",
      [
        #if values.diagnose.bi.len() == 0 [
          Ingen bidiagnoser oppgitt
        ] else [
          #for bi in values.diagnose.bi {
            [ #diagnose(bi)\ ]
          }
        ]
      ],
      empty: values.diagnose.bi.len() == 0,
    ),
  ),
)

// Annen lovfestet fraværsgrunn
#let annenFravarsgrunn = if values.annenFravarsgrunn != none {
  (grid.cell(info("Annen lovfestet fraværsgrunn", values.annenFravarsgrunn), colspan: 2),)
}

// Andre spørsmål
#let andreSporsmal = if values.andreSporsmal != none {
  (grid.cell(
    info("Andre spørsmål", [
      #list(..values.andreSporsmal)
    ]),
    colspan: 2,
  ),)
}

// Meldinger
#let meldinger = (
  grid.cell(
    info(
      "Melding til Nav",
      if values.meldinger.tilNav != none { values.meldinger.tilNav } else [ Ingen melding til Nav ],
      empty: values.meldinger.tilNav == none,
    ),
    colspan: 2,
  ),
  grid.cell(
    info(
      "Innspill til arbeidsgiver",
      if values.meldinger.tilArbeidsgiver != none { values.meldinger.tilArbeidsgiver } else [ Ingen melding til arbeidsgiver ],
      empty: values.meldinger.tilArbeidsgiver == none,
    ),
    colspan: 2,
  ),
)

// Pasienten skal skjermes
#let pasientenSkalSkjermes = if values.pasientenSkalSkjermes {
  (grid.cell(info("Pasienten er skjermet for medisinske opplysninger", [Ja]), colspan: 2),)
}

// Utdypende spørsmål
#let utdypende = values.utdypendeSporsmal.map(it => grid.cell(info(it.text, it.answer), colspan: 2))


#grid(
  columns: (1fr, 1fr),
  row-gutter: 26pt,
  gutter: 3pt,
  ..baseMeta,
  ..arbeidsgiver,
  aktivitet,
  ..diagnoser,
  ..annenFravarsgrunn,
  ..andreSporsmal,
  ..meldinger,
  ..pasientenSkalSkjermes,
  ..utdypende,
)
