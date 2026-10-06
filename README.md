# Stefano Caccamo — All my links

## Sito online

Indirizzo pubblico: **[https://bluesky0094.github.io/All-my-links/](https://bluesky0094.github.io/All-my-links/)**.

Profilo professionale di Stefano Caccamo: design, video, web, assistenza tecnologica e coordinamento turistico. Il sito presenta competenze, esperienze, progetti e contatti in italiano.

## Struttura

- `index.html`: contenuti, sezioni e collegamenti.
- `static/styles.css`: layout responsive, colori per sezione, animazioni e versione stampabile.
- `static/script.js`: navigazione mobile, avanzamento di lettura, cambio accento, animazioni e copia email.
- `static/assets/`: immagini del portfolio e identità del sito.

HTML, CSS e JavaScript senza dipendenze di build. GitHub Pages pubblica i file dalla radice di `main`. Per l’anteprima locale, avvia un server statico nella cartella del progetto.

## Accessibilità e movimento

Navigazione da tastiera, link per saltare al contenuto, menu mobile con Escape, rispetto di `prefers-reduced-motion` e controllo “Pausa animazioni”. La preferenza viene salvata solo nel browser del visitatore. Il pulsante “Stampa il profilo” utilizza una versione essenziale adatta anche al salvataggio in PDF.

## Pubblicazione con Sites

La cartella `dist/` contiene la copia pubblicabile di `index.html` e `static/`. Rigenerarla con `python scripts/package_static.py` dopo le modifiche. `.openai/hosting.json` conserva l’identità del Site e la cartella da pubblicare.

I dettagli professionali non includono date, titoli di studio o certificazioni non confermati. I recapiti e i collegamenti principali sono quelli già presenti nel progetto.
