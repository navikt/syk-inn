#let sykmelding = json(bytes(sys.inputs.at("sykmelding")))
#let meta = sykmelding.meta
#let values = sykmelding.values

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
      image("images/nav-logo.svg", height: 20pt),
      text(size: 14pt, weight: "bold")[Innsendt sykmelding],
    )
  ],
  footer: context [
    #let page-num = counter(page).get().first()
    #let total = counter(page).final().first()
    #grid(
      columns: (1fr, auto),
      text(fill: gray, size: 8pt)[#sykmelding.sykmeldingId],
      text(size: 8pt)[Side #page-num av #total],
    )
  ],
)

#grid(
  columns: (1fr, 1fr),
  column-gutter: 8mm,
  row-gutter: 8mm,
)

hei #sykmelding.sykmeldingId!

Passient: #meta.pasientIdent
