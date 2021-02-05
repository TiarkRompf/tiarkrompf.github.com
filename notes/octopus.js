console.log("begin")

// preprocess
//const url = "/Users/me/Desktop/tryout/web/gatsby-test1/public/page-data/all/page-data.json"
//const root = "#A_"

const dataUrl = octopus_url || "page-data.json"
const root = octopus_root || "/"

const defaultTitle = document.title
const defaultDescription = document.querySelector('meta[name="description"]').getAttribute("content")
const defaultKeywords = document.querySelector('meta[name="keywords"]').getAttribute("content")
const defaultAuthor = document.querySelector('meta[name="author"]').getAttribute("content")

let articles = {}

let articleQueue = []

function $$(href) {
  return $(articles[href])
}

function isValidLink(href) {
  return href.startsWith("?/") && (href in articles)
}

function isBrokenLink(href) {
  return href.startsWith("?/") && (!(href in articles))
}


// ---------- drawing and scrolling ----------

function drawMarkers(ctx, p1, p2, es1, es2) {
  ctx.clearRect(0,0,200,10000)

  // const es1 = $("#p1 .xxlink")
  // const es2 = $("#p2 article")

  const length = es1.length

  const height = $(".outerPanel")[0].offsetHeight



  for (var i = 0; i < length; i++) {
    const e1 = es1[i]
    const href = e1.attributes.href.value
    if (!isValidLink(href))
      continue
    const es2 = $$(href)
    if (es2.length == 0)
      continue

    const e2 = es2[0]
    if (e2.parentElement != p2) // only draw if target is in this lane
      continue

    const top1 = e1.offsetTop - p1.offsetTop - p1.scrollTop
    const bot1 = e1.offsetTop - p1.offsetTop - p1.scrollTop + e1.offsetHeight

    const top2 = e2.offsetTop - p2.offsetTop - p2.scrollTop
    const bot2 = e2.offsetTop - p2.offsetTop - p2.scrollTop + e2.offsetHeight

    const show =
      (bot1 != top1) &&              // left not collapsed
      (bot2 != top2) /*&& (             // right not collapsed
      (top1 >= 0 && top1 < height) || // left top in view
      (top2 >= 0 && top2 < height)    // right top in view
      )*/

    if (!show)
      continue


    ctx.fillStyle = "white" //"#fafafc";
    ctx.strokeStyle = "black" //"#f9f9f9";
    ctx.lineWidth = 5


    if (/*0 <= (top1+bot1)/2 && (top1+bot1)/2 < height &&*/ // left in view
      (top2 <= height &&
       0 <= bot2)) {
      // ctx.strokeStyle = "#eee";
      ctx.lineWidth = 3
    } else continue


    // ctx.lineWidth = 5

    // arc fill

    function drawArcLink(top1,top2) {
      const radius = Math.min(60,Math.abs(top1 - top2))/2

      ctx.beginPath()
      ctx.moveTo(0, top1)
      ctx.arcTo(
        radius, top1, 50, (top1+top2)/2, radius)
      ctx.lineTo(50, (top1+top2)/2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(100, top2)
      ctx.arcTo(
        100-radius, top2, 50, (top1+top2)/2, radius)
      ctx.lineTo(50, (top1+top2)/2)
      ctx.stroke()
    }


    function drawBezierLink(top1,top2) {
      const radius = Math.min(100,Math.abs(top1 - top2))

      ctx.beginPath()
      ctx.moveTo(0, top1)
      ctx.bezierCurveTo(
        radius, top1,
        100-radius, top2,
        100, top2)
      ctx.stroke()
    }

    drawLink = drawArcLink


    if (top2 < (top1+bot1)/2)
      drawLink((top1+bot1)/2, top2)
    if (bot2 > (top1+bot1)/2)
      drawLink((top1+bot1)/2, bot2)


/*
    // bezier fill
    ctx.beginPath()
    ctx.moveTo(0, top1)
    ctx.bezierCurveTo(
      100, top1,
      0, top2,
      100, top2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, bot1)
    ctx.bezierCurveTo(
      100, bot1,
      0, bot2,
      100, bot2)
    ctx.stroke()
*/

    ctx.fillStyle = "#dadada";

    // ctx.fillRect(0, top1, 2, e1.offsetHeight)
    // ctx.fillRect(98, top2, 2, e2.offsetHeight)


  }

}


function redraw() {

  const p1 = $("#p1")[0]
  const p2 = $("#p2")[0]
  const p3 = $("#p3")[0]
  const p4 = $("#p4")[0]
  const p5 = $("#p5")[0]
  const p6 = $("#p6")[0]
  const ctx1 = $("#cvs1")[0].getContext("2d")
  const ctx2 = $("#cvs2")[0].getContext("2d")
  const ctx3 = $("#cvs3")[0].getContext("2d")
  const ctx4 = $("#cvs4")[0].getContext("2d")
  const ctx5 = $("#cvs5")[0].getContext("2d")

  const p1vis = p1.offsetHeight > 5
  const p2vis = p2.offsetHeight > 5
  const p3vis = p3.offsetHeight > 5
  const p4vis = p4.offsetHeight > 5
  const p5vis = p5.offsetHeight > 5
  const p6vis = p6.offsetHeight > 5

  if (p1vis) $("#p1").addClass("nonempty"); else $("#p1").removeClass("nonempty");
  if (p2vis) $("#p2").addClass("nonempty"); else $("#p2").removeClass("nonempty");
  if (p3vis) $("#p3").addClass("nonempty"); else $("#p3").removeClass("nonempty");
  if (p4vis) $("#p4").addClass("nonempty"); else $("#p4").removeClass("nonempty");
  if (p5vis) $("#p5").addClass("nonempty"); else $("#p5").removeClass("nonempty");
  if (p6vis) $("#p6").addClass("nonempty"); else $("#p6").removeClass("nonempty");


  if (p1vis && p2vis) $("#mid1").removeClass("hidden"); else $("#mid1").addClass("hidden");
  if (p2vis && p3vis) $("#mid2").removeClass("hidden"); else $("#mid2").addClass("hidden");
  if (p3vis && p4vis) $("#mid3").removeClass("hidden"); else $("#mid3").addClass("hidden");
  if (p4vis && p5vis) $("#mid4").removeClass("hidden"); else $("#mid4").addClass("hidden");
  if (p5vis && p6vis) $("#mid5").removeClass("hidden"); else $("#mid5").addClass("hidden");

  drawMarkers(ctx1, p1, p2, $("#p1 a"), $("#p2 article"))
  drawMarkers(ctx2, p2, p3, $("#p2 a"), $("#p3 article"))
  drawMarkers(ctx3, p3, p4, $("#p3 a"), $("#p4 article"))
  drawMarkers(ctx4, p4, p5, $("#p4 a"), $("#p5 article"))
  drawMarkers(ctx5, p5, p6, $("#p5 a"), $("#p6 article"))
}


function scrollHandler() {
  redraw()
  saveScroll()
}


function saveScroll() {
  const p1 = $("#p1")[0]
  const p2 = $("#p2")[0]
  const p3 = $("#p3")[0]
  const p4 = $("#p4")[0]
  const p5 = $("#p5")[0]
  const p6 = $("#p6")[0]
  window.localStorage.setItem("scroll1", p1.scrollTop)
  window.localStorage.setItem("scroll2", p2.scrollTop)
  window.localStorage.setItem("scroll3", p3.scrollTop)
  window.localStorage.setItem("scroll4", p4.scrollTop)
  window.localStorage.setItem("scroll5", p5.scrollTop)
}

function loadScroll() {
  const p1 = $("#p1")[0]
  const p2 = $("#p2")[0]
  const p3 = $("#p3")[0]
  const p4 = $("#p4")[0]
  const p5 = $("#p5")[0]
  const p6 = $("#p6")[0]

  p1.scrollTop = window.localStorage.getItem("scroll1")
  p2.scrollTop = window.localStorage.getItem("scroll2")
  p3.scrollTop = window.localStorage.getItem("scroll3")
  p4.scrollTop = window.localStorage.getItem("scroll4")
  p5.scrollTop = window.localStorage.getItem("scroll5")
}


/*
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  $("#cvs1")[0].height = window.innerHeight
  $("#cvs2")[0].height = window.innerHeight
  $("#cvs3")[0].height = window.innerHeight
  $("#cvs4")[0].height = window.innerHeight
  $("#cvs5")[0].height = window.innerHeight
}

resizeCanvas()
*/

$("#p1").on("scroll", scrollHandler)
$("#p2").on("scroll", scrollHandler)
$("#p3").on("scroll", scrollHandler)
$("#p4").on("scroll", scrollHandler)
$("#p5").on("scroll", scrollHandler)
$("#p6").on("scroll", scrollHandler)

function layoutHandler() {
  return redraw()
}

// ---------- navigation ----------


window.onpopstate = function(event) {

  const href = document.location.search
  const elem = $$(href)
  elem.removeClass("hidden")

  if (elem[0])
    elem[0].scrollIntoView()

  layoutHandler()

//  alert(`location: ${document.location}, state: ${JSON.stringify(event.state)}`)
}


function visibleLink(href) {
  if (href == octopus_root)
    href = ""

  return window.location.pathname+href

  let url = window.location.href
  let i = url.indexOf("?")
  if (i > 0)
     url = url.substring(0,i)

  return url+href
}

function canonicalLink(href) {
  if (href == octopus_root)
    href = ""
  return octopus_canonical+href
}


function navigateTo(href,scroll=true) {
  console.log("navigateTo "+href)

  if (!isValidLink(href))
    throw Error("page "+href+" does not exist")

  const elem = $$(href)
  elem.removeClass("hidden")
  if (!elem[0].parentElement) // not in DOM? add! (initial page)
    elem.appendTo($("#p"+elem.attr("rank")))

  const url = visibleLink(href)

  if (window.location.href != url) {
    console.log(window.location.href, "->", url)
    history.pushState({}, ""+elem.attr("title"), url)
  }

  document.title = ""+elem.attr("title")
  document.querySelector('meta[name="description"]')
    .setAttribute("content", elem.attr("description"))
  document.querySelector('meta[name="keywords"]')
    .setAttribute("content", elem.attr("keywords"))
  document.querySelector('meta[name="author"]')
    .setAttribute("content", elem.attr("author"))


  let link = document.querySelector("link[rel='canonical']")
  link.setAttribute("href", canonicalLink(href))

  // Note: title & meta info for asides has been set based
  // on parent during visitLink. We could also look it up
  // here, but then we'd need to search for the first
  // non-aside parent.

  ga('set', 'page', url)
  ga('send', 'pageview')

  if (scroll && elem[0]) {
    setTimeout(() => elem[0].scrollIntoView(), 0)
  }
}


// ---------- interaction ----------

function clickLink(ev) {
  ev.stopPropagation()
  ev.preventDefault()
  ensureAllDom()
  const elem = ev.target
  const hhref = elem.attributes.href.value
  console.log("click",hhref, $$(hhref).hasClass("hidden"))
  if (window.location.search == hhref) {
    // hide
    $$(hhref).addClass("hidden")
    // navigate to the parent of the link
    let parent = elem.parentElement
    while (parent && (!parent.id || !isValidLink("?"+parent.id))){
      parent = parent.parentElement
    }
    if (parent) {
      navigateTo("?"+parent.id,false) // do not scroll
    }
  } else {
    // show
    navigateTo(hhref)
  }
  layoutHandler()
}


function hideChildren(href) {
  const elem = $$(href)
  $("a",elem).map((i,e) => {
    const hhref = e.attributes.href.value
    if (!$(e).hasClass("backlink") && !$(e).hasClass("brokenLink") && isValidLink(hhref))
      $$(hhref).addClass("hidden")
  })
}

function showChildren(href) {
  const elem = $$(href)
  let first = null
  $("a",elem).map((i,e) => {
    const hhref = e.attributes.href.value
    if (!$(e).hasClass("backlink") && !$(e).hasClass("brokenLink") && isValidLink(hhref)) {
      $$(hhref).removeClass("hidden")
      if (!first) first = hhref
    }
  })
  return first
}


function hideAllChildren(href, except) {
  const elem = $$(href)
  $("a",elem).map((i,e) => {
    const hhref = e.attributes.href.value
    if (!$(e).hasClass("backlink") && !$(e).hasClass("brokenLink") && isValidLink(hhref) && !(hhref in except)) {
      $$(hhref).addClass("hidden")
      except[hhref] = true
      hideAllChildren(hhref, except)
    }
  })
}

function anyChildVisible(href) {
  const elem = $$(href)
  let res = false
  $("a",elem).map((i,e) => {
    const hhref = e.attributes.href.value
    if (!$(e).hasClass("backlink") && !$(e).hasClass("brokenLink") && isValidLink(hhref)) {
      if (!$$(hhref).hasClass("hidden")) res = true // FIXME: non-local return??
      //if (anyChildVisible(hhref)) return true
    }
  })
  return res
}

/*
function showAllChildren(href) {
  const elem = $$(href)
  $("a",elem).map((i,e) => {
    const hhref = e.attributes.href.value
    if (!$(e).hasClass("backlink") && !$(e).hasClass("brokenLink") && isValidLink(hhref)) {
      $$(hhref).removeClass("hidden")
      showAllChildren(hhref)
    }
  })
}
*/

function hideAllSiblings(href) {
  const elem = $$(href)
  const pid = elem.attr("parent")// || return
  const mark = {}
  mark[href] = true
  hideAllChildren(pid, mark)
}



// ---------- initialization ----------

function buildNav(eid, slug) {
    let aux = $("<span class='tooltiptext'></span>")

    // TODO: it would be good to make these proper
    // links and point their hrefs to parent/child

    $("<a class='backlink' href=''> << </a>").on("click", function(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      ensureAllDom()
      const pid = $$("?"+eid).attr("parent")
      if (!pid) return
      const pelem = $$(pid)
      if (pelem.hasClass("hidden")) {
        pelem.removeClass("hidden")
        // navigate to parent
        navigateTo(pid)
      } else {
        pelem.addClass("hidden")
        hideAllSiblings("?"+eid)
        // navigate to self
        navigateTo("?"+eid, false)
      }
      layoutHandler()
    }).appendTo(aux)

    $("<a class='backlink' href=''> x </a>").on("click", function(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      ensureAllDom()
      $$("?"+eid).addClass("hidden")
      layoutHandler()
    }).appendTo(aux)

    $("<a class='backlink' href=''> >> </a>").on("click", function(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      ensureAllDom()
      if (anyChildVisible("?"+eid)) {
        hideAllChildren("?"+eid, {})
        // navigate to self
        navigateTo("?"+eid, false)
      } else {
        const fst = showChildren("?"+eid)
        // navigate to first child
        if (fst) navigateTo(fst)
      }
      layoutHandler()
    }).appendTo(aux)

    //slug = slug || eid

    //$("<small>"+slug+"</small>").appendTo(aux)
    return aux
}

function buildTitleNav(eid, slug, title) {

    let aux = buildNav(eid, slug)

    let titleLink = $("<a href='"+ "?"+eid+"' class='backlink tooltip'></a>")
    titleLink.text(title)
    titleLink.append(aux)
    titleLink.on("click", function(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      ensureAllDom()
      navigateTo("?"+eid)
    })

    let h1 = $("<h1></h1>").append(titleLink)

    return h1
}

function runScriptElement(e, src) {
  return eval(src || e.innerText)
}


function runScripts(eid,elem) {
  $(".runScript", elem).map((i,e) => {
    try {
      const defaultFilter = runScriptElement
      const filter = eval(e.getAttribute("filter")) || defaultFilter
      //console.log("filter",filter)
      const res = filter(e)
      if (res instanceof Element) {
        //console.log(res)
        $(e).replaceWith(res)
      }
    } catch (err) {
      $(e).after(`<div>Error running script: ${err}</div`)
      console.error(`Error in embedded script in article ${eid}: `, err)
    }
  })
}

// create articles from JSON data
function buildArticles(edges) {
  for (e of edges) {
    // console.log(e.node)
    let eid = e.node.fields.slug //.replaceAll("/","_")

    if (eid.startsWith(octopus_prefix))
      eid = eid.substring(octopus_prefix.length)

    const title = buildTitleNav(eid, e.node.fields.slug, e.node.frontmatter.title)

    let description = null
    if (e.node.frontmatter.description) {
      description = $("<div class='description'></div>")
      description[0].innerText = e.node.frontmatter.description
    }

    const body = $("<div></div>")
    body[0].innerHTML = e.node.html

    // convert links
    $("a", body).map((i,e) => {
      let href = e.attributes.href.value
      if (!href.startsWith("http") && !href.startsWith("javascript") && !href.startsWith("#")) {
        href = href //.replaceAll("/","_")
        if (href.startsWith(octopus_prefix))
          href = href.substring(octopus_prefix.length)
        if (href.startsWith("/")) //"_"
          href = "?" + href
        else // relative
          href = "?" + eid + href
        if (!href.endsWith("/")) //"_"
          href = href + "/" //"_"
        e.attributes.href.value = href
      }
    })

    const backlinks = $("<div class=\"backlinks hidden\">Backlinks:</div>")

    const article = $("<article class=\"hidden\"></article>")
    article.attr("id", eid)
    article.attr("title", e.node.frontmatter.title)
    article.attr("description", e.node.frontmatter.description || defaultDescription)
    article.attr("keywords", e.node.frontmatter.keywords || defaultKeywords)
    article.attr("author", e.node.frontmatter.author || defaultAuthor)
    article.append(title)
    if (description) article.append(description)
    article.append(body)
    article.append(backlinks)

    articles["?"+eid] = article

    runScripts(eid, article)

    //article.appendTo($("#p6"))

    // now extract asides
    extractArticleAsides(eid,article)
  }
}

// extract asides as articles and replace with a link
function extractArticleAsides(parentHref, parentArticle) {
  //let parentHref = parentArticle.id
  let asideCount = 0
  $("aside",parentArticle).map((i,e0) => {
    const e = $(e0)
    const contents = e.contents()
    const article = $("<article class=\"hidden\"></article>")

    let summary = contents.text().trim()
    let end = 100
    let run = summary.indexOf("\n")
    if (0 < run && run < end) end = run
    run = summary.indexOf(".")
    if (0 < run && run < end) end = run
    summary = summary.substring(0,end)
    run = summary.indexOf("?")
    if (0 < run && run < end) end = run
    summary = summary.substring(0,end)
    run = summary.indexOf(":")
    if (0 < run && run < end) end = run
    summary = summary.substring(0,end)

    let eid = $(e0).attr("id")

    if (eid && !eid.startsWith("/"))
      eid = "/" + eid
    if (eid && !eid.endsWith("/"))
      eid = eid + "/"

    if (!eid)
      eid = parentHref+"aside" + (++asideCount)

    // const aux = buildNav(eid)

    const backlinks = $("<div class=\"backlinks hidden\">Backlinks:</div>")

    article.attr("id", eid)
    article.attr("generatedTitle", summary)
    article.attr("title", summary)

    let titleElem = contents[0]
    // If first element is empty, skip to next
    if (!titleElem || $(titleElem).text().trim().length == 0) {
      titleElem = contents[1]
    }

    if (titleElem) {
      // TODO: for consistency with top level articles,
      // wrap in link, but only if this is a heading
      //$(titleElem).addClass("tooltip").append(aux)
      $(titleElem).replaceWith(buildTitleNav(eid,eid,$(titleElem).text()))
    }

    article.append(e.contents())

    e.replaceWith("<div><a href=\"?"+eid+"\">"+summary+"&nbsp;>></a></div>")

    article.append(backlinks)

    articles["?"+eid] = article

    //runScripts(eid, article) don't run twice!

    //article.appendTo($("#p6"))
  })
}


function visitLink(href,n, parent) {
  // console.log("visitLink", href, n)

  if (!isValidLink(href)) {
    if (isBrokenLink(href)) {
      console.warn("not found: ", href)
      return "brokenLink"
    }
    return "externalLink"
  }

  const elem = $$(href)

  // If we hit an element multiple times that's ok,
  // well just put it in a different position (with children).
  // But we should add event handlers only once (otherwise
  // we'll toggle "hidden" twice
  const seenBefore = elem.attr("rank")

  // Move it only upwards in the hierarchy

  if (!seenBefore || seenBefore > n) {
    elem.attr("parent", parent)
    elem.attr("rank", n)

    // elem.appendTo($("#p"+n)) // we're delaying this now!
    articleQueue.push(elem)

    // fix up titles and other meta info for asides
    const generatedTitle = elem.attr("generatedTitle")
    if (generatedTitle) {
      elem.attr("title", $$(parent).attr("title") + " / " + generatedTitle)
      elem.attr("description", $$(parent).attr("description"))
      elem.attr("author", $$(parent).attr("author"))
      elem.attr("keywords", $$(parent).attr("keywords"))
    }

    $("a",elem).map((i,e) => {
      if ($(e).hasClass("backlink"))
        return
      const hhref = e.attributes.href.value
      const res = visitLink(hhref,n+1, href)
      if (res)
        $(e).addClass(res)
      if (!seenBefore && res != "externalLink") {
        $(e).on("click", clickLink)
      }
    })

  }

  if (parent) {
    let hasBacklink = false
    $(".backlink",elem).map((i,e) => {
      if (e.attributes.href.value == parent)
        hasBacklink = true
    })
    if (!hasBacklink) {
      const parentTitle = $$(parent).attr("title")
      const backlink = $(`<a class="backlink" href="${parent}"><<&nbsp;${parentTitle}</a>`)
      backlink.on("click", clickLink)

      $(".backlinks", elem).removeClass("hidden").append($("<div></div>").append(backlink))
    }
  }
}


function clearAllDom() {
  $("#p1")[0].innerText = ""
  $("#p2")[0].innerText = ""
  $("#p3")[0].innerText = ""
  $("#p4")[0].innerText = ""
  $("#p5")[0].innerText = ""
  $("#p6")[0].innerText = ""
}

function ensureAllDom() {
  for (let elem of articleQueue)
    elem.appendTo($("#p"+elem.attr("rank")))
  articleQueue = []
}


function loadData(result) {
  try {
    console.log("begin2")
    const query = result.result ? result : JSON.parse(result)
    const edges = query.result.data.allMarkdownRemark.edges

    buildArticles(edges)
    clearAllDom()

    visitLink(root, 1)

    const target = window.location.search || root
    navigateTo(target)

    $(".loading").remove()

    loadScroll()
    redraw()

    console.log("end2")
  } catch (ex) {
    console.error("error during loading",ex)
    //console.error(ex)
    $(".loading").removeClass("blink").text(ex)
    //throw ex
  }
}

function handleError(statusText) {
    let str = "Ajax error "+statusText // typically ""?
    console.error(str)
    $(".loading").removeClass("blink").text(str)
}

console.log(dataUrl)

// faster time to interactive if we load data before loading jQuery
//$.ajax({url: dataUrl, success: loadData, error: handleError}); // TODO: handle error

octopus_data.then(loadData, handleError)

console.log("end")