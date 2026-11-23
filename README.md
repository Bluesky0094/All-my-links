# Stefano Caccamo — All my links

## Sito online

Indirizzo pubblico: **[https://bluesky0094.github.io/All-my-links/](https://bluesky0094.github.io/All-my-links/)**.

Profilo professionale di Stefano Caccamo: design, video, web, assistenza tecnologica e coordinamento turistico. Il sito presenta competenze, esperienze, progetti e contatti in italiano.

## Struttura

- `index.html`: presentazione e quattro aree di servizio.
- `static/home.css` e `static/home.js`: tipografia, layout e transizione fra le due schermate.
- `static/knot-scene.js` e `static/knot-controls.js`: nodo a strisce, geometria, rotazione e controlli. Three.js r180 e la licenza MIT sono in `static/vendor/`. La prima inquadratura è salvata in `static/assets/intreccio.webp` per l’anteprima e per i dispositivi senza WebGL.
- `profilo.html`: profilo completo con esperienze, contatti e versione stampabile.
- `static/styles.css`: impaginazione e versione stampabile del profilo.
- `static/script.js`: stampa del profilo e copia email.
- `static/assets/`: immagini del portfolio e identità del sito.

HTML, CSS e JavaScript senza dipendenze di build. GitHub Pages pubblica i file dalla radice di `main`. Per l’anteprima locale, avvia un server statico nella cartella del progetto.

## Accessibilità e movimento

Navigazione da tastiera, link per saltare al contenuto, rispetto di `prefers-reduced-motion` e controllo “Pausa rotazione”. La preferenza viene salvata solo nel browser del visitatore. Il pulsante “Stampa il profilo” utilizza una versione essenziale adatta anche al salvataggio in PDF.

## Pubblicazione con Sites

La cartella `dist/` contiene la copia pubblicabile di `index.html`, `profilo.html` e `static/`. Rigenerarla con `python scripts/package_static.py` dopo le modifiche. `.openai/hosting.json` conserva l’identità del Site e la cartella da pubblicare.

I dettagli professionali non includono date, titoli di studio o certificazioni non confermati. I recapiti e i collegamenti principali sono quelli già presenti nel progetto.
