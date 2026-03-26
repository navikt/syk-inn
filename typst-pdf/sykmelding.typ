#set text(font: ("Source Sans 3"))
#set page(paper: "a4")

#let data = json(bytes(sys.inputs.at("data")))

= Sykmelding

*Fødselsnummer:* #data.meta.pasientIdent \
