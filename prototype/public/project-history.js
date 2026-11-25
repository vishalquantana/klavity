// KD-3089: browser Back must not take the user back into the project they switched AWAY from — while Back keeps
// working normally for everything done inside a project, before and after a switch.
// The project selected in this tab is the one from the latest NORMAL page load (a project switch, a link, a reload).
// A page reached through Back/Forward (or restored from the back/forward cache) that belongs to a DIFFERENT project
// is an "old project" page: it immediately steps forward again, so Back stops at the switch instead of crossing it.
// Every project switch is a full page load, so an old-project entry is always its own page load — this check is enough.
// Loaded synchronously at the top of <head> so it runs before the page renders or fetches anything.
; (function () {
  var KEY = "klav:proj:selected"
  function navType() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0]
      if (nav && nav.type) return nav.type
      if (performance.navigation && performance.navigation.type === 2) return "back_forward"
    } catch (e) { }
    return "navigate"
  }
  function selected() { try { return sessionStorage.getItem(KEY) } catch (e) { return null } }
  function note(p) { try { if (p) sessionStorage.setItem(KEY, p) } catch (e) { } }
  function urlProject() { try { return new URLSearchParams(location.search).get("project") } catch (e) { return null } }
  // A ticket permalink (/<slug>/<KEY>-<n>, /t/<id>) has no ?project=; the server stamps its project into a <meta>.
  function metaProject() {
    try { var m = document.querySelector('meta[name="klav-boot-ticket"]'); return (m && m.getAttribute("data-project")) || null } catch (e) { return null }
  }
  // Pages call this when they settle on a project without a normal navigation (e.g. the dashboard resolving a bare
  // /dashboard to the last-used project), so the selection always matches what is on screen.
  window.klavNoteProject = note

  function stepForward() {
    var root = document.documentElement
    try { root.style.visibility = "hidden" } catch (e) { }   // don't flash the old project while stepping forward
    try { history.forward() } catch (e) { }
    // Safety net: if there was nothing to step forward to, show the page rather than leave it blank.
    setTimeout(function () { try { root.style.visibility = "" } catch (e) { } }, 1500)
  }
  // Returns true when the page's project is known (handled), false when it isn't known yet.
  function check(fromHistory, project) {
    if (!project) return false
    if (!fromHistory) { note(project); return true }
    var sel = selected()
    if (sel && project !== sel) stepForward()
    return true
  }

  var fromHistory = navType() === "back_forward"
  if (!check(fromHistory, urlProject())) {
    document.addEventListener("DOMContentLoaded", function () { check(fromHistory, metaProject()) })
  }
  addEventListener("pageshow", function (e) {
    if (e.persisted) check(true, urlProject() || metaProject())
  })
})()
