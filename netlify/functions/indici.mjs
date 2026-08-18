export default async () => {
  try {
    const url = "https://www.etrurialucegas.it/indici-energia";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NetlifyFunction/1.0)"
      }
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const html = await response.text();

    /*
      Cerchiamo i valori nella struttura della pagina Etruria.
      La pagina attualmente mostra:
      - PUN Index GME
      - PSV
      - mese di riferimento
    */

    const punMatch = html.match(
      /PUN Index GME[\s\S]{0,2000}?(\d+,\d+)\s*€\/kWh/i
    );

    const psvMatch = html.match(
      /indice PSV[\s\S]{0,2000}?(\d+,\d+)\s*€\/Smc/i
    );

    const monthMatches = [...html.matchAll(
      /(?:Gennaio|Febbraio|Marzo|Aprile|Maggio|Giugno|Luglio|Agosto|Settembre|Ottobre|Novembre|Dicembre)\s+20\d{2}/gi
    )];

    const pun = punMatch
      ? punMatch[1].replace(",", ".")
      : null;

    const psv = psvMatch
      ? psvMatch[1].replace(",", ".")
      : null;

    const mese = monthMatches.length
      ? monthMatches[0][0]
      : null;

    if (!pun || !psv) {
      throw new Error("Valori PUN/PSV non trovati nella pagina sorgente.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        pun,
        psv,
        mese,
        fonte: "EtruriaLuceGas",
        url
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    );
  }
};