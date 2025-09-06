let fromCurrency = "USD";
let toCurrency = "EUR";

const fromBtn = document.getElementById("fromBtn");
const toBtn = document.getElementById("toBtn");
const fromMenu = document.getElementById("fromMenu");
const toMenu = document.getElementById("toMenu");
const fromLabel = document.getElementById("fromLabel");
const toLabel = document.getElementById("toLabel");
const fromOptions = document.getElementById("fromOptions");
const toOptions = document.getElementById("toOptions");
const fromSearch = document.getElementById("fromSearch");
const toSearch = document.getElementById("toSearch");

// Full ISO 4217 currency list
const currencies = {
  "USD": "United States Dollar",
  "EUR": "Euro",
  "GBP": "British Pound Sterling",
  "JPY": "Japanese Yen",
  "INR": "Indian Rupee",
  "AUD": "Australian Dollar",
  "CAD": "Canadian Dollar",
  "CHF": "Swiss Franc",
  "CNY": "Chinese Yuan",
  "HKD": "Hong Kong Dollar",
  "NZD": "New Zealand Dollar",
  "SEK": "Swedish Krona",
  "NOK": "Norwegian Krone",
  "RUB": "Russian Ruble",
  "BRL": "Brazilian Real",
  "ZAR": "South African Rand",
  "SGD": "Singapore Dollar",
  "KRW": "South Korean Won",
  "MXN": "Mexican Peso",
  "AED": "United Arab Emirates Dirham",
  "ARS": "Argentine Peso",
  "CLP": "Chilean Peso",
  "COP": "Colombian Peso",
  "CZK": "Czech Koruna",
  "DKK": "Danish Krone",
  "EGP": "Egyptian Pound",
  "HUF": "Hungarian Forint",
  "IDR": "Indonesian Rupiah",
  "ILS": "Israeli New Shekel",
  "MYR": "Malaysian Ringgit",
  "PHP": "Philippine Peso",
  "PLN": "Polish Zloty",
  "SAR": "Saudi Riyal",
  "THB": "Thai Baht",
  "TRY": "Turkish Lira",
  "TWD": "New Taiwan Dollar",
  "UAH": "Ukrainian Hryvnia",
  "VND": "Vietnamese Dong",
  // ... (continue with full ISO 4217 list if needed)
};

const flagMap = {
  USD: "us", EUR: "eu", GBP: "gb", JPY: "jp", INR: "in", AUD: "au",
  CAD: "ca", CHF: "ch", CNY: "cn", HKD: "hk", NZD: "nz", SEK: "se",
  NOK: "no", RUB: "ru", BRL: "br", ZAR: "za", SGD: "sg", KRW: "kr",
  MXN: "mx", AED: "ae", ARS: "ar", CLP: "cl", COP: "co", CZK: "cz",
  DKK: "dk", EGP: "eg", HUF: "hu", IDR: "id", ILS: "il", MYR: "my",
  PHP: "ph", PLN: "pl", SAR: "sa", THB: "th", TRY: "tr", TWD: "tw",
  UAH: "ua", VND: "vn"
};

function buildDropdown(menu, labelEl, isFrom, searchInput) {
  function renderOptions(filter = "") {
    menu.querySelector("div")?.remove();
    const optionsContainer = document.createElement("div");

    Object.keys(currencies)
      .filter(code =>
        code.toLowerCase().includes(filter.toLowerCase()) ||
        currencies[code].toLowerCase().includes(filter.toLowerCase())
      )
      .forEach(code => {
        const countryCode = flagMap[code] || code.substring(0, 2).toLowerCase();
        const flagUrl = `https://flagcdn.com/16x12/${countryCode}.png`;

        const option = document.createElement("div");
        option.className = "dropdown-option";
        option.innerHTML = `<img class='flag' src='${flagUrl}' onerror=\"this.style.display='none'\"> ${code} - ${currencies[code]}`;
        option.onclick = () => {
          if (isFrom) {
            fromCurrency = code;
            labelEl.innerHTML = `<img class='flag' src='${flagUrl}' onerror=\"this.style.display='none'\"> ${code}`;
            fromMenu.classList.add("hidden");
          } else {
            toCurrency = code;
            labelEl.innerHTML = `<img class='flag' src='${flagUrl}' onerror=\"this.style.display='none'\"> ${code}`;
            toMenu.classList.add("hidden");
          }
        };
        optionsContainer.appendChild(option);
      });

    menu.appendChild(optionsContainer);
  }

  renderOptions();

  searchInput.addEventListener("input", e => {
    renderOptions(e.target.value);
  });
}

buildDropdown(fromOptions, fromLabel, true, fromSearch);
buildDropdown(toOptions, toLabel, false, toSearch);

fromLabel.innerHTML = `<img class='flag' src='https://flagcdn.com/16x12/us.png'> USD`;
toLabel.innerHTML = `<img class='flag' src='https://flagcdn.com/16x12/eu.png'> EUR`;

fromBtn.onclick = () => fromMenu.classList.toggle("hidden");
toBtn.onclick = () => toMenu.classList.toggle("hidden");

// Convert function using Frankfurter API
async function convert() {
  const amount = document.getElementById("amount").value;
  if (!amount) {
    document.getElementById("result").textContent = "⚠️ Please enter an amount.";
    return;
  }
  const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
  const data = await res.json();
  document.getElementById("result").textContent =
    `${amount} ${fromCurrency} = ${data.rates[toCurrency].toFixed(2)} ${toCurrency}`;
}

// Auto update every 5 minutes
setInterval(() => {
  if (document.getElementById("amount").value) convert();
}, 300000);

// --------- paste/replace your existing convert() with this ---------
async function convert() {
  const amountRaw = document.getElementById("amount").value;
  const amount = parseFloat(amountRaw);
  const resultEl = document.getElementById("result");

  if (!amount || isNaN(amount)) {
    resultEl.textContent = "⚠️ Enter a valid amount.";
    return;
  }
  if (!fromCurrency || !toCurrency) {
    resultEl.textContent = "⚠️ Select both currencies.";
    return;
  }
  if (fromCurrency === toCurrency) {
    resultEl.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency} (same currency)`;
    return;
  }

  // Helper to format numbers nicely
  function fmt(n) {
    return Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

  // 1) Try Frankfurter first
  try {
    // Frankfurter endpoint: returns { amount, base, date, rates: { TO: value } }
    const frankUrl = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
    const r = await fetch(frankUrl, {cache: "no-store"});
    if (r.ok) {
      const data = await r.json();
      // If frankfurter returned the target rate, use it
      if (data && data.rates && data.rates[toCurrency] != null) {
        const out = data.rates[toCurrency];
        resultEl.textContent = `${amount} ${fromCurrency} = ${fmt(out)} ${toCurrency}  (source: Frankfurter)`;
        return;
      }
      // else fall through to fallback
      console.warn("Frankfurter returned no rate for", toCurrency, data);
    } else {
      console.warn("Frankfurter HTTP status:", r.status);
    }
  } catch (err) {
    console.warn("Frankfurter request failed:", err);
  }

  // 2) Fallback: exchangerate.host (broader currency coverage)
  try {
    // exchangerate.host convert endpoint returns { motd, success, query, info, result }
    const exUrl = `https://api.exchangerate.host/convert?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}&amount=${encodeURIComponent(amount)}`;
    const r2 = await fetch(exUrl, {cache: "no-store"});
    if (!r2.ok) throw new Error("exchangerate.host HTTP " + r2.status);
    const data2 = await r2.json();
    // exchangerate.host returns a `result` field with the converted amount
    if (data2 && (data2.result != null)) {
      resultEl.textContent = `${amount} ${fromCurrency} = ${fmt(data2.result)} ${toCurrency}  (source: exchangerate.host fallback)`;
      return;
    }
    // some endpoints return rates map — handle that too just in case
    if (data2 && data2.rates && data2.rates[toCurrency] != null) {
      resultEl.textContent = `${amount} ${fromCurrency} = ${fmt(data2.rates[toCurrency])} ${toCurrency}  (source: exchangerate.host fallback)`;
      return;
    }
    throw new Error("No usable rate found in exchangerate.host response");
  } catch (err) {
    console.error("Fallback exchangerate.host failed:", err);
    resultEl.textContent = "Conversion failed — both APIs returned no rate or error. Check console.";
  }
}
// --------------------------------------------------------------------

