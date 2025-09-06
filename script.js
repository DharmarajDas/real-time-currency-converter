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
