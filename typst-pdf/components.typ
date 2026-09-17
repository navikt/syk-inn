#let info(title, value, empty: false) = [
  = #title
  #set text(luma(120), style: "italic") if (empty)
  #value
]

#let diagnose(diagnose) = [
  #diagnose.code: #diagnose.text (#diagnose.system)
]

#let aktivitet(aktivitet) = [
  #strong(aktivitet.periode) - #aktivitet.type
  #for detail in aktivitet.details {
    [- #detail.text]
    if detail.items.len() > 0 {
      block(above: 6pt, below: 0pt, list(indent: 1em, ..detail.items))
    }
  }
]
