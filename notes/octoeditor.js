function coolEditorComp(codeElem) {
  // snippet linking
  const startInput = {...window.snippets}
  const snippetList = window.snippetList
  const selfIndex = snippetList.length
  let selfRef = codeElem.getAttribute("name")
  if (!selfRef)
    selfRef = "snippet"+selfIndex
  let prevRef = codeElem.getAttribute("prev")
  if (!prevRef && startInput[selfRef])
    prevRef = startInput[selfRef].prevRef
  if (!prevRef)
    prevRef = window.preamble
  let diff = codeElem.getAttribute("diff")
  // dom
  const editInput = codeElem.innerText.trim()
  const e = document.createElement("div")
  let o = document.createElement("div")
  const p = document.createElement("pre")
  e.className = "editor_e"
  o.className = "editor_o"
  p.className = "editor_p"
  if (diff) {
    let oldInput = startInput[selfRef].getOwnInput()
    oldInput = document.createTextNode("/*"+oldInput+"*/\n")
    let wrapper = document.createElement("i")
    wrapper.appendChild(oldInput)
    p.appendChild(wrapper)
    // highlight fragments in {{double braces}}
    let fragments = editInput.split(/{{|}}/)
    for (let i = 0; i < fragments.length/2; i++) {
      if (fragments[2*i])
      p.appendChild(document.createTextNode(fragments[2*i]))
      if (fragments[2*i+1]) {
        let w = document.createElement("span")
        w.style["background"] = "#DDDDDD"
        //w.style["padding"] = "5px"
        w.appendChild(document.createTextNode(fragments[2*i+1]))
        p.appendChild(w)
      }
    }
  //  p.appendChild(document.createTextNode(editInput))
  } else {
    p.appendChild(document.createTextNode(editInput))
  }
  p.contentEditable = true
  p.height = 200
  const a = document.createElement("a")
  a.href = ""
  a.innerText = "idle"
  let status = "idle"
  let result = undefined
  function setStatus(st, res) {
      status = st
      result = res
      if (res)
          a.innerText = st + ": " + res
      else
          a.innerText = st
  }
  function run(src) {
      const o1 = o
      function onDone(res) {
          setStatus("done", res)
      }
      function onError(err) {
          setStatus("error", err)
          // if no output, put back previous result
          if (!o.firstChild) {
              o.remove()
              o = o1
              e.appendChild(o)
          }
      }
      try {
          o.remove()
          o = document.createElement("div")
          e.appendChild(o)
          setStatus("running")
          const fullSrc = `async () => { ${src} }`
          const fun = eval(fullSrc)
          fun().then(onDone, onError)
      } catch(err) {
          onError(err)
      }
  }
  function getOwnInput() {
    return p.innerText.trim()
  }
  function getFullInput() {
    if (prevRef) {
      let chain = [getOwnInput()]
      let pr = prevRef
      let pe = startInput[pr]
      let i = 50
      while (pr && pe && i--) {
        chain.push(pe.getOwnInput())
        pr = pe.prevRef
        pe = startInput[pr]
      }
      if (!i)
        console.log("Warning: exhausted editor linkage fuel at "+selfRef)
      return chain.reverse().join("\n")
    } else {
      // console.log(startInput)
      let preamble = startInput["preamble"].getFullInput()
      let full = preamble + "\n" + getOwnInput()
      for (let k in startInput) {
        full = full.replace(new RegExp("{{"+k+"}}","g"), startInput[k].getFullInput())
      }
    //  console.log(full)
      return full
    }
  }
  function runInput() {
    run(getFullInput())
  }
  async function buttonClick(str) {
      const btn = document.createElement("button")
      btn.innerText = str
      o.appendChild(btn)
      const res = await new Promise(resolve => btn.addEventListener("click", () => resolve(str)))
      btn.remove()
      emit("> "+res)
      return res
  }
  let clearHook = null
  function onclear(f) {
    clearHook = f
  }
  function invokeOnClear() {
    if (clearHook) {
      clearHook()
      clearHook = null
    }
  }
  function clear() {
      invokeOnClear()
      while (o.firstChild) {
          o.firstChild.remove()
      }
  }
  function emit(str) {
      const l = document.createElement("div")
      l.appendChild(document.createTextNode(str))
      o.appendChild(l)
  }
  function print(...as) {
    emit(as.toString())
  }
  function assert(cond,str) {
      if (!cond) throw new Error(str || "Assertion Failed")
  }
  function expect(a,b) {
      assert(a == b, "Expected "+a+" but got "+b)
  }
  function test(str, fun) {
      const e = document.createElement("div")
      e.innerText = str + " ".padEnd(15, ".")
      o.appendChild(e)
      setTimeout(function() {
          try {
              fun()
              e.innerText = (str + " ").padEnd(30, ".") + " OK"
          } catch(ex) {
              e.innerText = (str + " ").padEnd(30, ".") + " " + ex
          }}, 0)
  }
  a.addEventListener("click", function(ev) {
      ev.preventDefault()
      // run it again
      runInput()
  })
  p.addEventListener("keydown", function(ev) {
      // could be a change/input listener
      // for now, delay to run after char insertion
      setTimeout(() => runInput(), 0)
  })
  if (codeElem.getAttribute("popout")) {
      const as = document.createElement("aside")
      const la = document.createElement("div")
      la.innerText = "code:"
      as.appendChild(la)
      as.appendChild(p)
      e.appendChild(as)
  } else
      e.appendChild(p)
  //console.log(selfRef + " -> " + prevRef)
  let name = selfRef
  window.snippets[name] = { e, name, getFullInput, getOwnInput, prevRef }
  window.snippetList.push({ e, name, getFullInput, getOwnInput, prevRef })
  e.appendChild(a)
  e.appendChild(o)
  // runInput()
  setTimeout(() => runInput(), 0)
  return { e, name, getFullInput, getOwnInput, prevRef }
}
// this one is to be called at the top of each article
window.initArticleEditorSupport = function initArticleEditorSupport(e) {
  window.coolEditor = function coolEditor(codeElem) {
    return coolEditorComp(codeElem).e
  }
  window.addPreamble = function addPreamble(e) {
    const ed = coolEditorComp(e)
    ed.e.lastChild.remove()
    window.snippets.preamble = ed
    window.preamble = ed.name
    return ed.e
  }
  window.setPreamble = function setPreamble(e) {
    window.snippets.preamble = {
      getFullInput: () => "",
      getOwnInput: () => "",
    }
    const ed = coolEditorComp(e)
    ed.e.lastChild.remove()
    window.snippets.preamble = ed
    window.preamble = ed.name
    return ed.e
  }
  window.resetSnippets = function resetSnippets(e) {
    window.snippets.preamble = {
      getFullInput: () => "",
      getOwnInput: () => "",
    }
    window.preamble = "none"
    const ed = coolEditorComp(e)
    return ed.e
  }
  window.snippets = { preamble: {
    getFullInput: () => "",
    getOwnInput: () => "",
    startInput: {},
  }}
  window.snippetList = []
  window.preamble = "none"
  // inline script should return
  return document.createElement("div")
}