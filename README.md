# Readme

## Erste Schritte, Installation

1. Im Terminal folgende Zeile eingeben: `git clone git@gitlab.ekontor24.net:ttframe/tteditor.git`
2. Den Wunschordner auf dem lokalen Rechner zum Ablageort angeben
3. Im Terminal in den Ordner wechseln
4. Ist `npm` installiert, dann folgenden Befehl ausführen: `npm install` - Es werden alle Abhängigkeiten installiert.
5. Zum Entwickeln im Terminal folgenden Befehl eingeben: `npm run dev`
6. Zum Bauen der Seite im Terminal diesen Befehl ausführen: `npm run build`

## Wie lege ich eine Kampagne in Astro an?

(!) Hinweis: Diese Readme ist nur für **Phase 1**. Wir haben das gesamte alte JavaScript noch in Benutzung. Damit auch Funktionen, die Inline-Styles manipulieren. Das wird sich in Phase 2 ändern. Dann arbeiten wir nicht mehr mit Inline-Styles. Die Arbeitsweise wird sich dadurch mit hoher Wahrscheinlichkeit in Zukunft ändern.

### Grundlagen schaffen

1. Im `pages`-Ordner wird ein Ordner mit der fortlaufenden Kampagnennummer angelegt, z.B. `000003`
2. Im `public`-Ordner wird ein gleichnamiger Ordner angelegt
3. In dem Kampagnen-Ordner unter `pages` wird eine Datei `index.astro` angelegt
4. In dem entsprechenden `public`-Ordner werden die `outbound_logic.js`sowie die `outbound.js` abgelegt
5. In der `index.astro` werden im Frontmatter (zwischen den beiden Linien, die jeweils aus drei Strichen bestehen) alle Abhängigkeiten zu den benutzten Komponenten angegeben

```
---
import Layout from "@/layouts/Layout.astro";
import Input from "@components/SimpleInput.astro";
import Campaign from "@components/CampaignSelect.astro";
import Field from "@components/SimpleFieldset.astro";
import Select from "@components/SimpleSelect.astro";
import SQL_Select from "@components/SQL_InsertSelect.astro";
import BasicCampaign from "@components/BasicCampaign.astro";
import Textfield from "@components/SimpleTextfield.astro";
import NavTabs from "@components/NavTabs.astro";
import FootButtons from "@components/FootButtons.astro";
import Bild from "@components/Bild.astro";
import CampaignSelect from "@components/CampaignSelect.astro";
import FinishBtn from "@components/FinishButton.astro";
import PopupRotz from "@components/PopupRotz.astro";
---
```

Der Aufbau eines Imports schaut wie folgt aus:

| Element  | Aufgabe  |
|---|---|
| `import`  |  Der Import der Komponente wird gestartet |
| `Komponentenname`  |  Hier wird der Komponentenname angegeben, wie wir die Komponente beim Bauen der Seite ansprechen wollen, z.B. als `FinishBtn`. |
| `from "@components/Komponente.astro";`  | Hier wird der Pfad angegeben zum Komponenten"gerüst".  |

### Die Seite

In der `index.astro` wird unterhalb des Frontmatters mit dem Aufbau der Seite begonnen. Dazu muss an erster Stelle folgende Komponente aufgerufen werden:

```
<Layout
  title="STE_WEL"
  campaignNr="000003"
  jsFiles={["outbound.js", "outbound_logic.js"]}
>
```

`title` beinhaltet den Kampagnennamen. Unter `campaignNr` wird die fortlaufende Kampagnennummer eingetragen. Die Zeile mit `jsFiles` braucht nicht verändert werden. Wie oben beschrieben, liegen diese beiden Dateien im `public`-Ordner mit der gleichen Kampagnennummer.

Es folgt ein Stück HTML, nämlich:

```
<div class="black_overlay" id="lightbox"></div>
```

Es muss tatsächlich noch hin und wieder HTML geschrieben werden. Nach dem Overlay für die Lightboxen folgt der `<header>`:

```
 <header>
    <Bild dateiname="skon.png" />
    <Bild dateiname="stadtenergie.svg" />
    <h1>Stadtenergie Welcome Call</h1>
  </header>
```

Die erste Komponente, die benutzt werden kann, ist die `<Bild>`-Komponente. Sie ist selbstschließend und nimmt den Dateinamen auf. Die entsprechende Datei muss unter `public/include/images` liegen.

#### Hauptbereich

Nach dem `<header>` kommt der eigentliche Hauptbereich. Zunächst das Grundgerüst, das im Folgenden mit Komponenten befüllt wird:

```
<main>
 <aside class="left_block">
  <div id="customer_info"></div>
  <div id="nav_buttons"></div>
 </aside>

 <div class="middle_block">

  <NavTabs />
  
  <form
   class="datenerf-bg"
   action="#"
   name="formular"
   method="POST"
   id="datenerfassung_form"
  >
   * Hier kommen die Formulare rein, mehr dazu unten *

   <FinishBtn />

  </form>

  <FootButtons />

 </div>

</main>

<PopupRotz />
```

Zur Erinnerung: Alles in `<main>` sowie der vorgeschaltete `<header>` sind Teil von `<Layout>`.

### Komponenten

#### `<NavTabs>`

Die Komponente `<NavTabs>` nimmt eine Propery auf und die muss ein Array sein, bestehend aus:

1. Die `id`, des anzusteuernden Inhalt-Containers.
2. Den Namen, der der Funktion `switchTab` übergeben wird.
3. Den Namen, der im Tab angezeigt wird.

Das schaut zum Beispiel so aus:

```
<NavTabs
 tabs={[
  ["tab2", "tab_produkt", "Produkt"],
  ["tab3", "tab_zusammenfassung", "Zusammenfassung"],
 ]}
/>
```
(!) **Hinweis**: Wie im Beispiel zu sehen, ist es _nicht nötig_, den ersten Tab, den Start-Tab, anzugeben. Dieser wird von der Komponente automatisch eingefügt:

```
<button id="tab1" class="tab current" onclick="switchTab('tab_start');">
 Start
</button>
```

#### Content-Tab

Das Content-Tab ist keine in Astro angelegt Komponente. Es handelt sich hierbei um ein HTML-Grundgerüst, das wie folgt ausschaut:

```
<div id="tab_produkt" class="tab_content" style="display: none;">
 <span id="datenerfassung_error_produkt" class="errormessage"></span>
 <div id="produkt" class="input_form oneColumn">

  * Hier kommen die Formulare als Komponenten hinein *

 </div>
</div>
```

##### Erklärung des Content-Tabs

Im ersten `<div>` stehen:

| Was  | Erklärung  |
|---|---|
| `id`  |  Die ID, die in der `<NavTabs>` definiert wurde und angesteuert werden soll. |
| `class="tab_content"`  |  Dieser Class-Selector muss immer vorhanden sein. |
| `style="display: none;"`  | In Phase 1 wird dieses Inline-Style noch benötigt. JavaScript wird das DOM so manipulieren, dass der Content-Tab sichtbar geschaltet wird, wenn der Navigationstab geklickt wird.  |

Es folgt das `<span>`, in das ggf. durch JavaScript eine Fehlermeldung eingefügt wird.

Im vorliegenden Beispiel haben wir die `id` namens `tab_produkt`. Aus diesem Grund folgt nach der Errormeldung ein `<div>` mit `id="produkt"`. Das `<div>` benötigt immer den Class-Selector `.input_form`, da darauf das Styling aller Formelemente beruht.

#### `<Field>`

Die Formularelemente sind in der Regel von einem `<fieldset>` umgeben. Die entsprechende Komponente dazu lautet:

```
<Field klasse="grid" legend="Optin">
 * Hier kommen ein oder mehr Formularelemente rein *
</Field>
```

Die `legend`ist das, was über den gruppierten Formularelementen steht.

#### `<Input>`

Einzeilige Eingabefelder werden als `<input>` angegeben. Die Komponente kann folgende Properties aufnehmen:

```
id: string;
label: string;
type: string;
call?: string;
value?: any;
required?: boolean;
maxlength?: string;
pattern?: string;
disabled?: boolean;
```

`id`, `label` und `type` sind zwingend erforderlich. In der Regel ist der Type `text`. Die weiteren Properties sind optional.

Bei der Property `call` wird ein String erwartet. Der `call` ruft eine Funktion auf und wird im gerenderten Markup ins Attribut `onchange` geschrieben.

Benutzt wird die Komponente wie folgt:

```
<Input
 id="datenerfassung_email"
 label="E-Mail-Adresse"
 type="email"
/>
```

oder auch

```
<Input
 id="datenerfassung_telefon"
 label="Abweichende Telefonnummer?"
 type="text"
/>
```

#### `<Select>`

Die Komponente `<Select>` wird bei Mehrfachauswahl eingesetzt, wenn man die `<option>` selber einsetzen kann und diese nicht über eine SQL-Abfrage befüllt wird.

Die Komponente kann folgende Properties aufnehmen:

```
id: string;
label: string;
options?: Array<Array<any>>;
firstOption?: Array<any>;
klasse?: string;
required?: boolean;
disabled?: boolean;
call?: string;
```

Lediglich `id` und `label` sind zwingend erforderlich. Die Property `call` kann, wie bei `<Input>` auch, den Aufruf einer Funktion als String entgegen nehmen. Das sähe z.B. so aus:

```
<Select
 id="datenerfassung_produkt"
 label="Kunde erreicht?"
 options={[
  ["ja", "Ja"],
  ["nein", "Nein"],
 ]}
 call="showprodukt($('datenerfassung_produkt').value)"
/>
```

(!) **Hinweis**: Die bisher übliche erste Option `[Bitte auswählen]` muss *nicht* mehr angegeben werden. Diese wird automatisch von der Komponente eingefügt.

Das gerenderte HTML sähe im oben beschriebenen Fall dann so aus:

```
<select
 class="dropdown h-drop"
 id="datenerfassung_produkt"
 name="datenerfassung_produkt"
 onchange="showprodukt($('datenerfassung_produkt').value)"
>
 <option disabled="" value="" selected>
  [Bitte auswählen]
 </option>
 <option value="ja">Ja</option>
 <option value="nein">Nein</option>
</select>
```

Es ist möglich, die erste Option `[Bitte auswählen]` zu umgehen. Dafür setzt man die Property `firstOption` auf den gewünschten Wert. Dieser ist ein Array mit zwei Werten:

```
<Select
 id="datenerfassung_lead"
 label="Lead"
 firstOption={["keinlead", "Kein Lead"]}
 options={[
  ["strom", "Strom"],
  ["gas", "Gas"],
]}
 call="showVertragsende($('datenerfassung_lead').value)"
/>
```

In diesem Fall sieht das gerenderte HTML so aus:

```
<select
 class="dropdown h-drop"
 id="datenerfassung_lead"
 name="datenerfassung_lead"
 onchange="showVertragsende($('datenerfassung_lead').value)"
>
 <option value="Kein Lead" selected>
  Kein Lead
 </option>
 <option value="strom">Strom</option>
 <option value="gas">Gas</option>
</select>
```

### Layout der Seite

In der `outbound_logic.js` wird u.a. die Struktur vorgegeben, wie die Kundendaten in der linken Seite angezeigt werden sollen. Diese können gemäß der Anforderungen verschoben werden. Wichtig ist hier nur, dass man mit der folgenden Zeile einen visuellen, horizontalen Trenner zwischen Datenblöcken erzeugt:

```
ns = ns + "<div class='separator'></div>";
```

Dabei ist es egal, ob im oberen Datenblock eine gerade oder eine ungerade Anzahl an Datensätzen vorhanden ist. Es wird immer ein optischer Trenner erzeugt, der über die gesamte Breite von `#customer_info` geht.

### #TODO#

`.grid` und `grid-col_1`, bzw. `grid-col_2` 

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
