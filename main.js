// Kaparulin Construction Company

// To receive form submissions by email (free, 250/month):
// 1. Go to https://web3forms.com, enter the email you want inquiries sent to.
// 2. Paste the access key they email you between the quotes below.
// Until a key is set, the form opens the visitor's messages app with the details filled in.
var WEB3FORMS_KEY = "";
var TEXT_NUMBER = "+12068904249";
var TEXT_DISPLAY = "(206) 890-4249";

(function () {
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Copy phone number
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy number"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(); });
      } else { selectText(); }
      function selectText() {
        var el = document.getElementById("phone");
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
    });
  });

  // Gallery filters + lightbox
  var grid = document.getElementById("grid");
  if (grid) {
    var tiles = Array.prototype.slice.call(grid.querySelectorAll("button"));
    var filters = document.querySelectorAll(".filter");
    filters.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filter");
        filters.forEach(function (o) { o.setAttribute("aria-pressed", o === f ? "true" : "false"); });
        tiles.forEach(function (t) { t.hidden = !(cat === "all" || t.getAttribute("data-cat") === cat); });
      });
    });

    var lb = document.getElementById("lightbox");
    var lbImg = document.getElementById("lb-img");
    var lbCap = document.getElementById("lb-cap");
    var current = 0;
    var visible = function () { return tiles.filter(function (t) { return !t.hidden; }); };
    var show = function (i) {
      var list = visible();
      current = (i + list.length) % list.length;
      var t = list[current];
      lbImg.src = t.getAttribute("data-full");
      lbImg.alt = t.getAttribute("data-cap");
      lbCap.textContent = t.getAttribute("data-cap");
    };
    tiles.forEach(function (t) {
      t.addEventListener("click", function () {
        show(visible().indexOf(t));
        if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
      });
    });
    lb.addEventListener("click", function (e) {
      var act = e.target.getAttribute && e.target.getAttribute("data-lb");
      if (act === "close" || e.target === lb || e.target.classList.contains("lightbox__inner")) lb.close();
      if (act === "prev") show(current - 1);
      if (act === "next") show(current + 1);
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.open) return;
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // Inquiry form
  var form = document.getElementById("inquiry");
  if (form) {
    var status = document.getElementById("status");
    var say = function (msg) { status.textContent = msg; status.hidden = false; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var missing = Array.prototype.filter.call(form.querySelectorAll("[required]"), function (el) { return !el.value.trim(); });
      if (missing.length) {
        say("Please fill in your name, mobile number, and a few words about the project.");
        missing[0].focus();
        return;
      }
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });

      if (WEB3FORMS_KEY) {
        var btn = form.querySelector("button[type=submit]");
        btn.disabled = true; btn.textContent = "Sending";
        d.access_key = WEB3FORMS_KEY;
        d.subject = "New project inquiry: " + d.project_type + " (" + (d.location || "location not given") + ")";
        d.from_name = "Kaparulin Construction website";
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(d)
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (!res.success) throw new Error(res.message);
          form.reset();
          say("Thanks, " + d.name.split(" ")[0] + ". We have your inquiry and will text you back.");
        }).catch(function () {
          say("That didn't go through. Please text the details to " + TEXT_DISPLAY + " instead.");
        }).then(function () { btn.disabled = false; btn.textContent = "Send inquiry"; });
        return;
      }

      var body = "Hi, this is " + d.name + ". Project: " + d.project_type +
        (d.location ? " in " + d.location : "") + ". Timing: " + d.timing + ". " + d.message +
        (d.email ? " Email: " + d.email : "");
      var sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?";
      window.location.href = "sms:" + TEXT_NUMBER + sep + "body=" + encodeURIComponent(body);
      say("Your messages app should open with this filled in. If it didn't, text the details to " + TEXT_DISPLAY + ".");
    });
  }
})();
