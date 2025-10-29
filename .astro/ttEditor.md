Die grundlegenden Dateien  

Index.astro

Die index.astro ist das eigentliche HTML-Dokument. Während des builds, verwendet Astro alle Informationen der Index, um die Seite aufzubauen.

Dementsprechend ist es nicht zwingend notwendig, die Funktionen von Astro zu nutzen, um eine funktionstüchtige Seite zu erschaffen. Jedoch bieten gerade die Components einen erheblichen Vorteil, bei der Menge an Code die notwendig ist, um die gewünschten Funktionen abzubilden.

Grundeinstellungen

Sind alle Schritte der Installation abgeschlossen, geht es an die Bearbeitung der index.astro.
Zuerst müssen die gewünschten Components importiert werden. 

Hierfür wird Astro mit den dreifachen Minus signalisiert, dass es sich um eine Astro-Anweisung handelt.

Mit dem Befehl import, gefolgt von dem gewünschten Tag der Komponente, wird festgelegt, wie diese innerhalb des Dokuments aufgerufen wird. (Anstatt “Bild” könnte man also auch z.B. “Grafik” oder “Tuetensuppe” definieren.

Der Befehl from verweist dann auf den Pfad zu der Datei der Component.

Standardmäßig sind alle Komponenten im Ordner /components abgelegt. Astro-spezifisch kann hier in der Pfadangabe ein @ genutzt werden, um den Pfad abzukürzen. 

Name(.astro)

gedachte Nutzung

Doku

Bild

Anzeigen eines Img, unter Angabe des Dateinamens

link

ConBlock

Bedingungsabhängiges Element 

link

CustomerCells

Darstellung der Kundendaten auf der Seite

link

DebugLog

Fenster für die DebugLogs (Hotkey [Tab] + [D])

nicht vorhanden

EditLayout

Editierbares Grunddaten-Element

link

FinishButton

Button zum Anschluss und senden der Daten an die DB

link

FootButtons

Buttons zum Aufruf von Modalen für ttFrame-Funktionen

nicht vorhanden

Gate

Element des Einflussbereiches eines Gatekeepers

link

GatekeeperSelect

Select-Element zur Manipulation anderer Elemente

link

Layout

Grunddaten-Element der 

link

NavTab

Hauptnavigation auf der Seite

link

Popups

Modale für ttFrame-Funktionen ( für FootButtons )

nicht vorhanden

RadioButtons

Gestyltes Element 

nicht vorhanden

RecordButton

Button zum ändern des Recordingzustandes (ttFrame)

link

TabPage

Wrapper zum Schalten der Navigation

link

TabWrapper

Wrapper für die Einhalte die in die DB einfließen sollen 

link

SimpleFieldset

Gestyltes Fieldset-Element 

nicht vorhanden

SimpleInput

Gestyltes Input-Element 

link

SimpleSelect

Gestyltes Select-Element 

nicht vorhanden

SimpleTextfield

Gestyltes Textfield-Element 

link

SQLinjectionSelect

Select-Element + Options aus der DB geladen

link

SuggestionInput

Value-gesteuertes Input mit Vorschlagsfunktion

link

WeiterButton

Navigationsbutton zum Wechseln der TabPages

link

Hier muss nun, je nach Anwendungsfall, entschieden werden, ob spezielle oder zusätzliche Elemente angezeigt werden sollen. 

Muss keine spezielle Änderung vorgenommen werden, empfiehlt es sich die verkürzte Variante mit dem etablierten Standard (einer Kampagne im Stil der Callcenter-Masken) zu nutzen: Layout-Component.

Diese beschränkt sich auf die notwendigsten Angaben und benötigt daher auch nur ein einzelnes Element. 
In beiden Fällen (sofern genutzt wie hier gezeigt) erhält man das selbe Ergebnis.
Der Import der Components muss bei beiden Varianten durchgeführt werden:

"---
import Layout from "@/layouts/Layout.astro";
import Input from "@components/SimpleInput.astro";
import Field from "@components/SimpleFieldset.astro";
import Select from "@components/SimpleSelect.astro";
import Gatekeeper from "@/components/GatekeeperSelect.astro";
import Gate from "@/components/Gate.astro";
import GateGroup from "@/components/GateGroup.astro";
import SQL_Select from "@/components/SQLinjectionSelect.astro";
import Suggestion from "@components/SuggestionInput.astro";
import NavTabs from "@components/NavTabs.astro";
import TabPage from "@/components/TabPage.astro";
import TabWrapper from "@components/TabWrapper.astro";
import ConBlock from "@/components/ConBlock.astro";
import NextPageBtn from "@/components/WeiterButton.astro";
import FinishBtn from "@components/FinishButton.astro";
import RecordBtn from "@/components/RecordButton.astro";
---"

Gedachte Struktur einer Seite

Da der ttEditor für den schnelleren Aufbau der ttFrame-Masken erdacht wurde, sind auch die Components für diesen Zweck angepasst. Der gedachte Aufbau sieht wie folgt aus:

Das Dokument wird (nach den Imports) von der Layout geöffnet. Alles was sich innerhalb dieser befindet, liegt nicht nur innerhalb des HTML-Body, sondern auch im sogenannten ”middle block”. Dieser ist die Sektion für alle Hauptelemente.

Als nächstes folgt der TabWrapper. Dieser umschließt alle Input- bzw. Select-Elemente, da diese Component das form-Element beinhaltet. Ohne den TabWrapper werden keine Daten an die DB zurückgegeben.

Zur Unterteilung der verschiedenen Seiten oder Register, werden die TabPages genutzt.
Diese stehen in direkter Beziehung zur 
NavTabs-Component. 
Denn über die NavTabs werden die verschiedenen TabPages ein- bzw. aus- geblendet.


Die Fields sind für die Funktionalität nicht notwendig, jedoch sind sie durch Ihr fieldset-Element dazu gedacht, die verschiedenen Inputs optisch voneinander zu trennen.  

Gedachte Struktur einer Seite

Da der ttEditor für den schnelleren Aufbau der ttFrame-Masken erdacht wurde, sind auch die Components für diesen Zweck angepasst. Der gedachte Aufbau sieht wie folgt aus:

Das Dokument wird (nach den Imports) von der Layout geöffnet. Alles was sich innerhalb dieser befindet, liegt nicht nur innerhalb des HTML-Body, sondern auch im sogenannten ”middle block”. Dieser ist die Sektion für alle Hauptelemente.

Als nächstes folgt der TabWrapper. Dieser umschließt alle Input- bzw. Select-Elemente, da diese Component das form-Element beinhaltet. Ohne den TabWrapper werden keine Daten an die DB zurückgegeben.

Zur Unterteilung der verschiedenen Seiten oder Register, werden die TabPages genutzt.
Diese stehen in direkter Beziehung zur 
NavTabs-Component. 
Denn über die NavTabs werden die verschiedenen TabPages ein- bzw. aus- geblendet.


Die Fields sind für die Funktionalität nicht notwendig, jedoch sind sie durch Ihr fieldset-Element dazu gedacht, die verschiedenen Inputs optisch voneinander zu trennen.  



Positionierung der Buttons 

Für die optimale Nutzung sind für die beiden Buttons: WeiterButton und FinishButton, ganz bestimmte Positionen im DOM vorgesehen.

Damit der WeiterButton “auf” jeder TabPage angezeigt werden kann, wird dieser als letztes Element auf dem Tabwrapper platziert.

So wird gewährleistet, dass nach jeder ausgefüllten TabPage und Silent-Validierung, der Button auch am unteren Ende der Seite erscheint.

Diese Funktionalität wird allerdings ausgehebelt, wenn man sich auf der letzten TabPage befindet (sofern deren Name in der tteditor-config, in der Variable Global.lastTab, deklariert worden ist)

Der FinishButton kann hingegen nur auf der letzten TabPage platziert werden. Im besten Fall ist dieser von einem ConBlock umgeben, oder wird durch eine Gatekeeper-Funktion eingeblendet.

Gedachte Struktur einer Seite

Da der ttEditor für den schnelleren Aufbau der ttFrame-Masken erdacht wurde, sind auch die Components für diesen Zweck angepasst. Der gedachte Aufbau sieht wie folgt aus:

Das Dokument wird (nach den Imports) von der Layout geöffnet. Alles was sich innerhalb dieser befindet, liegt nicht nur innerhalb des HTML-Body, sondern auch im sogenannten ”middle block”. Dieser ist die Sektion für alle Hauptelemente.

Als nächstes folgt der TabWrapper. Dieser umschließt alle Input- bzw. Select-Elemente, da diese Component das form-Element beinhaltet. Ohne den TabWrapper werden keine Daten an die DB zurückgegeben.

Zur Unterteilung der verschiedenen Seiten oder Register, werden die TabPages genutzt.
Diese stehen in direkter Beziehung zur 
NavTabs-Component. 
Denn über die NavTabs werden die verschiedenen TabPages ein- bzw. aus- geblendet.


Die Fields sind für die Funktionalität nicht notwendig, jedoch sind sie durch Ihr fieldset-Element dazu gedacht, die verschiedenen Inputs optisch voneinander zu trennen.  



Positionierung der Buttons 

Für die optimale Nutzung sind für die beiden Buttons: WeiterButton und FinishButton, ganz bestimmte Positionen im DOM vorgesehen.

Damit der WeiterButton “auf” jeder TabPage angezeigt werden kann, wird dieser als letztes Element auf dem Tabwrapper platziert.

So wird gewährleistet, dass nach jeder ausgefüllten TabPage und Silent-Validierung, der Button auch am unteren Ende der Seite erscheint.

Diese Funktionalität wird allerdings ausgehebelt, wenn man sich auf der letzten TabPage befindet (sofern deren Name in der tteditor-config, in der Variable Global.lastTab, deklariert worden ist)

Der FinishButton kann hingegen nur auf der letzten TabPage platziert werden. Im besten Fall ist dieser von einem ConBlock umgeben, oder wird durch eine Gatekeeper-Funktion eingeblendet.

JavaScript & Konfiguration

Die wichtigsten Daten, die in der Layout-Component benötigt werden, sind die 
kampagnenspezifischen JavaScript-Files. Für diese gibt es zwei Vorlagen, die nur in 
wenigen Punkten an die jeweilige Kampagne angepasst werden müssen.

Zusätzlich kann aber auch eigenes JavaScript eingebunden werden.

Um eigenes JavaScript nutzen zu können, müssen zwei Bedingungen erfüllt sein.

Die JS-Datei befindet sich im Ordner ../public/KampagnenName/js

Die Datei wird über jsFiles in der Layout-Component geladen

Ist dies gegeben, können Funktionen und Variablen, die global deklariert worden, von überall aufgerufen werden. Beispielsweise im Call eines Inputs für eine besondere Validierung oder dem OnClick eines Buttons. Hierbei ist zu beachten, dass diese unter keinen Umständen in den JS-Hauptdateien aufgerufen werden darf, da diese sonst in anderen Kampagnen nicht mehr funktionieren.

Daher solle der Aufruf von externen Skripten nur auf Index.astro, ttEditor-config.js und querylib.js stattfinden und nirgendwo anders. 



Funktionen automatisch ausführen
Für den Fall, dass bestimmte (externe) Funktionen automatisch ausgeführt werden müssen, steht der Funktionsname beforeStart() bereit. Diese Funktion wird im buildUp() aufgerufen, nachdem alle Informationen geladen worden sind. Nur diese Funktion wird automatisch gestartet.

Hierfür einfach in eine neu erstellte JS-Datei die Funktion mit dem Namen beforeStart() deklarieren und diese Datei einbinden, wie oben beschrieben.

Die tteditor-config.js ist hier ausschlaggebend für die meisten Funktionen und Einstellungen.
Diese arbeitet im Zusammenspiel mit der query_lib.js, in der alle SQL-Statements hinterlegt werden, um die verschiedenen Datenbanken anzusprechen.

Diese werden in der Layout-Component angegeben, hier können auch weitere JS-Dateien hinzugefügt werden, falls nötig. Siehe >> Layout-Component



tteditor-config.js 

Diese Config-Datei ist in mehrere Segmente gegliedert, die nun von oben nach unten beschrieben werden. Zudem befinden sich innerhalb der Datei Kommentare, die einen tieferen Einblick in die Nutzung ermöglichen sollten.

Global Var:

Initialisierung der globalen Variablen, die für die Funktionalität der JS-Logik notwendig sind.
Die einzige veränderbare Variable ist hier die pageLock. Diese kann auf true gesetzt werden, wenn ein Verlassen des ersten Tabs nur unter bestimmten Umständen möglich sein soll.
Sobald ein Input oder Select, mit dem required-Attribut erfolgreich validiert wurde, wird pageLock wieder auf false geschaltet und der Nutzer kann frei navigieren. 

Abschnitt 1 - Konstante Größen des Projektes

In diesem Abschnitt muss und sollten in der Regel keine Änderung vorgenommen werden:
CustomerPattern

DataObject mit den Kundendaten des aktuellen Anrufs 

null

agentId

Variable für die ID des Agenten

null

clientIP

Variable für die IP des Agenten

null

ttWeb

DataObject für die ttFrame-API

Object()

keyCode1Pressed

Variable für HotKey 1

false

keyCode2Pressed

Variable für HotKey 2

false

keyCode3Pressed

Variable für HotKey 3

false

timer

Hotkeytimer

null

btnLock

Verhindert Nutzung der Entertaste bei Buttonelementen

false

pageLock

Boolean um den Seitenwechsel zu sperren 

false

buildupFail

Boolean zum Errorhandling in der Datenverarbeitung

false

TriggerData

DataObject zur Filterung der Kundendaten aus der DB

triggerPattern()

SendBack

FilterArray für Datenübergabe an DB

Array

firstTab

ID der ersten TabPage

"tab_start"

lastTab

ID der letzten TabPage

freiwählbar

freiwählbar



Campaign Var:

In diesem Bereich befinden sich alle Variablen, die spezifisch auf die Kampagne angepasst werden sollten. Die Informationen für die Nutzung sind aus den Kommentaren zu entnehmen.
Abschnitt 1 -  Das Result- Objekt
Abschnitt 1 -  Das Result- Objekt

Das Result-Objekt enthält alle Variablen, die für die Terminierung und die Speicherungen wichtig sind. 

Jeder Block beschreibt einen Zustand, jeweils bestehend aus dem TermCode (TerminateCall-Code oder auch TerminationCode).

Der Terminationcode wird je nach Abschluss an die Funktion ttWab.terminateCall übergeben.
Ist Global.posSale = true, wird die pos_termination übergeben, wenn über den FinishBtn abgeschlossen wird. Bei Global.posSale = false, dann entsprechend neg_termination.

positive und negative werden wiederum über die Querys an die DB weitergegeben.

Hierfür wird das pushSQL-Statement “finish” genutzt.
(Dies gilt auch für alle anderen Fälle)

Abschnitt 1 -  Das Result- Objekt

Das Result-Objekt enthält alle Variablen, die für die Terminierung und die Speicherungen wichtig sind. 

Jeder Block beschreibt einen Zustand, jeweils bestehend aus dem TermCode (TerminateCall-Code oder auch TerminationCode).

Der Terminationcode wird je nach Abschluss an die Funktion ttWab.terminateCall übergeben.
Ist Global.posSale = true, wird die pos_termination übergeben, wenn über den FinishBtn abgeschlossen wird. Bei Global.posSale = false, dann entsprechend neg_termination.

positive und negative werden wiederum über die Querys an die DB weitergegeben.

Hierfür wird das pushSQL-Statement “finish” genutzt.
(Dies gilt auch für alle anderen Fälle)

Abschnitt 2 - Kampagnen-Variablen im Global-Objekt 

Name

Beschreibung

Global.campaignId

DB-Kampagnen-ID

Global.sperrzeit (DataObject)

gesperrter Zeitraum zum Anlegen von Wiedervorlagen
von Abends, bis Morgens (Folgetag)

Global.LoadTrigger 

”everytime” : Bei Seitenwechsel und Laden der Seite
”pages”:        Nur bei Seitenwechsel
”end”:            Nur bei Aufruf der letzten Seite
””                   Niemals

Global.directionState

<automatisiert> Pointer für Recording direction

Global.startCallwithState

Nutzen einer bestimmten Recording direction beim Laden der Seite
”0”:   keine Aufnahme
”2”:   nur Agent wird aufgezeichnet
”3”:   Agent und Kunde werden aufgezeichnet 

Global.onNegDeleteRec:

Umgang mit Voicefile wenn Finish mit  Global.posSale = false
true =  Aufnahme löschen
false = Aufnahme speichern

Global.debugMode (Bool)

Zustand des Debug-Modus

Global.showDebug (Bool)

Bei true kann mit [Tab] + [D] der DebugLog aufgerufen werden

Global.logIntottDB (Bool)

Bei true werden (ausschließlich) die Fehlermeldungen an den ErrorLog in der DB weitergegeben

Global.logGK (Bool)

Zeigt die Informationen von Gatekeeper-Funktionen im DebugLog an

Global.logSQL (Bool)

Zeigt die abgeschickten Querys im DebugLog an

Global.addressdatatable

Name des AddressdataTables auf der DB

Global.key1

Name des Columns (addressdatatable) mit der ID 

Global.calldatatable

Name des CalldataTable auf der DB

Global.key2

<automatisiert>  calldatatable-ID  (bezogen über ttWeb)

Global.salesdatatable

Name des SalesdataTable auf der DB

Global.key3

ID des Datensatzes in SalesdataTable auf der DB

Global.fieldname_firstname

Columbezeichner des Vornamens auf dem addressdatatable

Global.fieldname_lastname

Columbezeichner des Nachnamens auf dem addressdatatable

Global.currentTabName

Name der TabPage, die zuerst geladen werden soll

Global.nestor

URL zur Debug-Instanz

Global.debugdataTableId

ID für den Debug-addressdatatable

Global.recordingPrefix

Pfadangabe zur Ablage-Ordnerstruktur der Voicefiles

Global.FileNamePattern (Array)

(Alle Angaben als String)

Auflistung der Variablen oder Stings, die zum Voicefile-Namen zusammengefügt werden sollen. (Entsprechend der aufgeführten Reihenfolge, durch Unterstrich getrennt)

Global.recordingNameSuffix

Suffix des Voicefiles

Global.recordFileName

Variable als Cache für den Names des Voicefiles

Global.terminationCode

Variable als Cache für den TerminationCdoe

Global.wiedervorlage (Bool)

Wenn true, werden die Wiedervorlagedaten geladen

Global.wievorElement

ID des Elementes, in dessen innerHTML die WiedervorlageDaten geladen werden sollen

Global.posSale (Bool)

<automatisiert>  Cache für den aktuellen Zustand des Falles

Global.showCDObuild (Bool)

Zeige Aufbau der CustomerData in Debuglog

Global.noCustomerData (Bool)

Verhindere den Aufbau der CustomerData
Abschnitt 1 -  Das Result- Objekt

Das Result-Objekt enthält alle Variablen, die für die Terminierung und die Speicherungen wichtig sind. 

Jeder Block beschreibt einen Zustand, jeweils bestehend aus dem TermCode (TerminateCall-Code oder auch TerminationCode).

Der Terminationcode wird je nach Abschluss an die Funktion ttWab.terminateCall übergeben.
Ist Global.posSale = true, wird die pos_termination übergeben, wenn über den FinishBtn abgeschlossen wird. Bei Global.posSale = false, dann entsprechend neg_termination.

positive und negative werden wiederum über die Querys an die DB weitergegeben.

Hierfür wird das pushSQL-Statement “finish” genutzt.
(Dies gilt auch für alle anderen Fälle)

Abschnitt 2 - Kampagnen-Variablen im Global-Objekt 

Name

Beschreibung

Global.campaignId

DB-Kampagnen-ID

Global.sperrzeit (DataObject)

gesperrter Zeitraum zum Anlegen von Wiedervorlagen
von Abends, bis Morgens (Folgetag)

Global.LoadTrigger 

”everytime” : Bei Seitenwechsel und Laden der Seite
”pages”:        Nur bei Seitenwechsel
”end”:            Nur bei Aufruf der letzten Seite
””                   Niemals

Global.directionState

<automatisiert> Pointer für Recording direction

Global.startCallwithState

Nutzen einer bestimmten Recording direction beim Laden der Seite
”0”:   keine Aufnahme
”2”:   nur Agent wird aufgezeichnet
”3”:   Agent und Kunde werden aufgezeichnet 

Global.onNegDeleteRec:

Umgang mit Voicefile wenn Finish mit  Global.posSale = false
true =  Aufnahme löschen
false = Aufnahme speichern

Global.debugMode (Bool)

Zustand des Debug-Modus

Global.showDebug (Bool)

Bei true kann mit [Tab] + [D] der DebugLog aufgerufen werden

Global.logIntottDB (Bool)

Bei true werden (ausschließlich) die Fehlermeldungen an den ErrorLog in der DB weitergegeben

Global.logGK (Bool)

Zeigt die Informationen von Gatekeeper-Funktionen im DebugLog an

Global.logSQL (Bool)

Zeigt die abgeschickten Querys im DebugLog an

Global.addressdatatable

Name des AddressdataTables auf der DB

Global.key1

Name des Columns (addressdatatable) mit der ID 

Global.calldatatable

Name des CalldataTable auf der DB

Global.key2

<automatisiert>  calldatatable-ID  (bezogen über ttWeb)

Global.salesdatatable

Name des SalesdataTable auf der DB

Global.key3

ID des Datensatzes in SalesdataTable auf der DB

Global.fieldname_firstname

Columbezeichner des Vornamens auf dem addressdatatable

Global.fieldname_lastname

Columbezeichner des Nachnamens auf dem addressdatatable

Global.currentTabName

Name der TabPage, die zuerst geladen werden soll

Global.nestor

URL zur Debug-Instanz

Global.debugdataTableId

ID für den Debug-addressdatatable

Global.recordingPrefix

Pfadangabe zur Ablage-Ordnerstruktur der Voicefiles

Global.FileNamePattern (Array)

(Alle Angaben als String)

Auflistung der Variablen oder Stings, die zum Voicefile-Namen zusammengefügt werden sollen. (Entsprechend der aufgeführten Reihenfolge, durch Unterstrich getrennt)

Global.recordingNameSuffix

Suffix des Voicefiles

Global.recordFileName

Variable als Cache für den Names des Voicefiles

Global.terminationCode

Variable als Cache für den TerminationCdoe

Global.wiedervorlage (Bool)

Wenn true, werden die Wiedervorlagedaten geladen

Global.wievorElement

ID des Elementes, in dessen innerHTML die WiedervorlageDaten geladen werden sollen

Global.posSale (Bool)

<automatisiert>  Cache für den aktuellen Zustand des Falles

Global.showCDObuild (Bool)

Zeige Aufbau der CustomerData in Debuglog

Global.noCustomerData (Bool)

Verhindere den Aufbau der CustomerData

Abschnitt 3 - specialNames

Diese Funktion wird für die Anpassung von Variablen genutzt, die in die RecordFileName-Variable einfließen und dafür manipuliert werden sollen.

  switch(varName){

        case 'agentId':
            giveBack = `agent-${eval(varName)}`;
            break;

        default :
            giveBack = eval(varName);
    }

In diesem Bespiel wird auf die Variable agendId gehorcht und diese dann an den String ‘agent-’ angehangen. Die Ausgabe an die RecordFileName-Variable muss als String über die Variable giveBack erfolgen.

Die Ausgabe für date und time, kann auch direkt in den Funktionen für die Erstellung dieser bearbeitet werden. Hierfür müssen die Funktionen getdate() oder getTime() manipuliert werden.

Abschnitt 4 - finishCall() 

Die finishCall-Funktion beschreibt die letzten Arbeitsschritte, bevor der Call terminiert wird.
An dieser Stelle sind bereits alle Angaben validiert, verarbeitet und an die Datenbank geschickt worden.
Sollten noch weitere Daten abgespeichert, bestimmte Meldungen ausgegeben oder der Abschluss unter Vorgabe eines bestimmten Terminatiocodes durchgeführt werden, kann dies hier eingetragen werden.

Hier könnten auch Funktionen aufgerufen werden, die über externe JS-Dateien eingebunden wurden.
Auch aufrufen der pushSQl()-Funktion könnte hier die Möglichkeit bieten weitere Daten abzuspeichern.

ProviderPattern: (CustomerPattern)

Das ProviderPattern ist die Funktion, die die abgerufenen Informationen aus der DB in einen nutzbaren Zustand umwandelt. Während des Buildups wird das Pattern in ein DataObjekt umgewandelt und mit den gewünschten Daten befüllt (sofern sie aus der Datenbank abgerufen werden). Aus diesem Objekt werden die CostumerCards generiert. Die Daten können auch für die weitere Verwendung im Code genutzt werden.

Hierfür kann das DataObjekt mit CostumerData.match angesprochen werden.


Der Aufbau einer Zeile ist wie folgt:

Das CustomerData-Objekt ist eine globale Variable, die genutzt werden kann um auf alle geladenen Kundendaten zuzugreifen. Geht man von dem Aufbau im unteren Beispiel aus, könnte man sich den Vornamen wie folgt ausgeben lassen Console.log( CustomerData.firstname.value ) 

Die Einträge (bzw. Keys) im Objekt werden anhand des match erstellt und erhalten die Keys 
.value, .label und .index. Nun kann man diese beispielsweise auch im TriggerPattern nutzten, um Texte mit der korrekten Ansprache zu erzeugen. 

Beispiel:  

`<p> Guten Tag, ${CustomerData.salutation.value} ${CustomerData.surname.value} </p>` 

Sollte an dieser Stelle nicht sicher sein, ob es ein wiederkehrendes Muster in der Ansprache gibt, zum Beispiel weil evtl. Titel mit genannt werden sollen, kann die Funktion gimmeSomeSpace(“VarName“) genutzt werden. So wird nur dann ein Leerzeichen angehangen, wenn die Variable auch gefüllt ist.

Die sähe dann so aus:

`<p> Guten Tag, ${CustomerData.salutation.value} ${gimmeSomeSpace('CustomerData.title.value')}${CustomerData.surname.value}</p>`

Hier stehen die Aufrufe der Variablen direkt hintereinander weg ${X}${Y}. Ist X nicht vorhanden, entsteht so kein doppeltes Leerzeichen, wie es bei der oberen Variante der Fall wäre.

{ label: ‘Vorname',  match: ‘firstname',  value: "",   standAlone: true,   createCell: true,  dbType: 'VARCHAR’ }

label:
Der Wert dieses Keys wird in der cell__head der CustomerCells angegeben und ist für den User als label der jeweiligen Zelle sichtbar.

match:
Der Wert, der in diesen Key eingetragen wird, ist der Filter für die von der Datenbank kommenden Einträge. Es ist hier äußerst wichtig auf die richtige Schreibweise zu achten. Entspricht der hinterlegte String nicht dem, was die DB als Columnbezeichner zurück gibt, wird der Eintrag auch nicht geladen und in der Cell wird ein - ausgespielt.

value:
Hier wird der Eintrag aus der DB automatisch eingetragen.

standAlone:
Dieser Key erwartet ein Boolean, bei true wird die Cell normal beschrieben. Ist der Wert jedoch false, wird der Wert mit in die nächste Cell übernommen. Hierbei wird das ehemalige Lable ignoriert.
Anwendungsfälle wären beispielsweise das Kombinieren von Vorwahl und Telefonnummer.

createCell:
Hier entspricht ein true der Erstellung der jeweiligen Cell, false hingegen ignoriert den Eintrag. 

dbType:
Um die Varianz der Datenbanktypen abzufedern, sollten diese in der CustomerData mit angegeben sein.
Sind diese nicht korrekt eingetragen, kann es zu Fehlern beim Laden der Daten kommen.

Markierungen und Hervorhebungen
Um die in den Cards angezeigten Informationen zu highlighten kann im key lable ein Trigger platziert werden. Der Wert der Card kann mit rot, grün oder gelb hinterlegt werden

               { label: 'red!text',   …}     { label: 'grn!text',   …}      { label: 'yel!text',   …}      { label: 'text',   …}



ProviderPattern - Separator

Eine Besonderheit bei den Einträgen bildet hier der „Separator“.  Dieser baut einen Abstand zwischen den Cards ein und wird wie folgt aufgerufen:

{ label: '',    match: 'separator',    value: "",   standAlone: true,   createCard: true    dbType: “VARCHAR“}

 TriggerPattern 

Jede Gatekeeper- und SuggestionInput-Komponente bietet die Möglichkeit, einen trigger-Befehl zu hinterlegen. Dieser kann im Zusammenspiel mit dem ProviderPattern bestimmte Textbausteine oder Werte aus Variablen in ein dafür vorgesehenes Element laden.

Hierfür wird das TriggerPattern wie folgt aufgebaut:                                                                         

  {  id: ‘txt2',       grp: ‘a',       target_id: ‘div_text',      active: true,    mode:’add’,     value: '<p>mytxt</p>’ }

id:
Die Kennung des Eintrags, über den dieser in der Funktion setTrigger() erreichbar wird.

grp:
Einteilung der Einträge in Gruppen. Alle Gruppenmitglieder schließen sich gegenseitig vom gleichzeitigen Anzeigen aus. So können Textblöcke gezielter genutzt werden.
Jeder Eintrag kann nur einer Gruppe zugeteilt werden.

target_id:
ID des Elements in dessen inneres HTML der value eingefügt werden soll.

active: 
Ist active: true, wird der Eintrag getriggert sobald die Funktion readTrigger() aufgerufen wird. 
Wird ein Eintrag true geschaltet, der die selbe grp teilt, wird ausschließlich der neue Aufruf active : true gesetzt.

mode:
Anhand des mode kann entschieden werden, ob das im Target enthaltenen HTML überschrieben, oder mit dem neuen Value zusammengeführt werden soll. Gruppenmitglieder schließen sich dennoch weiter gegenseitig vom Anzeigen aus. Der Mode ‘replace' ersetzt alle anderen Elemente im Target-Element. Der Mode ‘add’ fügt den neuen Eintrag zum Target-Element hinzu und der Mode 'load’ lädt die Einträge, die beim BuildUp active=true sind, ein einziges Mal.  

value: 
Der Wert, der in das innere HTML des Target geschrieben werden soll. 
Hier können Strings, aber auch Variablen eingetragen werden. 

Anhand des obigen Beispiels würde bei dem Aufruf der Funktion readTrigger() nun das Element 
<p>mytxt</p> in das innere HTML des Elementes mit der ID div_text geladen werden. 

Die Actions von GatekeeperSelect und SuggestionInput können für jeden eingetragenen Wert ein Trigger setzten. Hierbei wird dieser aber nicht direkt ausgeführt, sondern vorgemerkt bis die readTrigger()-Funktion ausgelöst wird. Ähnlich wie mit SetTrigger ein Postauto zu beladen und mit ReadTrigger die Zustellung im Eilverfahren durchzuführen.

Beide Funktionen können auch z.B. mit einem Button aufgerufen werden.

Das Laden von Variablen ist ebenfalls möglich. So kann beispielsweise eine JS-Datei angelegt werden, die als Text- bzw. HTML-Libary dient. Solange die Variablen dort global deklariert wurden, können sie im TriggerPattern genutzt werden. Dies erleichtert das Einbinden von großen Textblöcken.



query_lib.js

In der Query-Library befinden sich drei Funktionen, die folgenden Aufgaben zugeschrieben sind:


main_query()
Hier liegt das größte SQL-Statement, das die Daten für die Erstellung der CustomerData sowie der CustomerCards aus der DB lädt. Diese muss je nach Kampagne angepasst werden und nutzt die globalen Variablen aus der tteditor-config.js.


function main_query() {
              let query = pullMainQuery();

An dieser Stelle wird der Autogenerator für das Query genutzt. Die pullMainQuery()-Funktion
erstellt anhand des CustomerPattern eigenständig ein query, das an die Datenbank geleitet wird.

Es ist möglich ein starres query an dieser Stelle einzusetzen, jedoch werden auch bei diesem nur die Daten, die im CustomerPattern / CustomerData hinterlegt sind, gespeichert und sind durchgängig zugängig. 


 function main_query() { 
        let query = pullMainQuery(); // <-- queryGenerator aus Pattern
        //---------------------------------------------------------
        //  Hier kann auch händisch ein query eingetragen werden
        //---------------------------------------------------------

        try { // Auswertung des DataObjects
           ...                     
    };



pullSQL(promtName)
In dieser Funktion sind alle kleineren SQL-Statements hinterlegt, die Daten aus der DB ziehen sollen, die nicht auf dem addressdatatable liegen. Die Funktion wird beispielsweise im SQLinjectionSelect genutzt.
Bei diesem wird im Attribut load die ID des gewünschten SQL-Statements eingetragen.
Da innerhalb der PullSQL-Funktion mit einem Switch-Case gearbeitet wird, reicht es, die ID bzw. den Case-trigger zu nutzen.

switch (promtName) {
            case "result_test":
                query = `SELECT test FROM calldatatable where id=${test} LIMIT 1`;
                break;



PushSQL(promtName)
Ähnlich wie schon bei der pullSQL, wird auch bei der pushSQL mit einem Switch-Case gearbeitet.
Der Aufruf wird ebenfalls über den jeweiligen Namen des gewünschten Querys getätigt.
Wird dieses ausgeführt wird es mit den Angehangenen Daten aus den Variablen an die Datenbank versendet. Müssen noch mehr Daten übermittelt werden, als im standet vorgesehen, können weitere PushSQL-Aufrufe in der finishCall()-Funktion eingebunden werden.

Components

Grundlegendes

Im folgenden werden die verschiedene Components erläutert.
Diese Beschreibungen erfolgen in bestimmten Begrifflichkeiten, die hier zunächst aufgeschlüsselt werden.

Aufbau einer Component:
Hier wird das Element gezeigt, wie es in der index.astro genutzt werden würde, mit einer anschließenden Auflistung der jeweiligen Attribute. Attribute, die einen String oder einen Integer erwarten, werden mit attribut="string" angesprochen, die Booleans werden hingegen schlicht mit attribut aufgerufen.
Alle Arrays erwarten als Value einen String.

Operatoren, IDs & Trigger
Als Operatoren werden Strings bezeichnet, die eine Zeichenfolge aufweisen und in der Funktion, an die sie übergeben werden, einen bestimmten Bearbeitungsschritt aufrufen.
Wird der String benutzt, um ein SQL-Statement aufzurufen oder einen Wert aus einem der Pattern
auszulesen, wird dieser hingegen als ID oder Trigger bezeichnet. 


Beim Importbefehl der Components, kann bestimmt werden, wie der jeweilige Bezeichner/Tag zum Aufrufen des Elementes geschrieben wird. Dies kann zu eventueller Verwirrung führen, falls die Bezeichner nicht mehr dieser Dokumentation entsprechen.

Bild

Diese Component zeigt eine ausgewählte Bilddatei in einem generierten <img>-Tag an. 



Um die Bilddatei zu laden, müssen zwei Bedingungen erfüllt sein:

Im Attribut dateiname ist der korrekte Name der Bilddatei mit Suffix angegeben

Die Bilddatei befindet sich im Ordner ./public/images

<Bild dateiname="mynewselfie.jpg" />

Attribut

Beschreibung

Erwartet

dateiname

Name der jeweiligen Bilddatei im Ordner ./public/images

String

ConBlock

Die ConBlocks-Component minimiert die Notwendigkeit, umfangreiches JavaScript, für das zustandsbedingte Einblenden von Elementen, manuell zu schreiben. Die Auswertung der Bedingungen erfolgt dynamisch, sodass Benutzeroberflächen auf spezifische Zustände von Elementen reagieren können.

Der Hauptgedanke hinter dem ConBlock ist, bestimmte Bedingungen abfragen zu können und abhängig vom aktuellen Zustand anderer Elemente (z. B. ob aktiv oder ausgefüllt) Aktionen auszuführen.

Die gedachte Funktion dieser Component ist somit alle Elemente in ihrem inneren HTML ein- oder auszublenden, wenn die Bedingungen abgefragt werden.



Das ConBlock arbeitet anhand eines Attributs namens If, das eine Reihe von Bedingungen enthält, die auf die betroffenen Elemente angewendet werden. Diese Bedingungen steuern die Sichtbarkeit der gesamten Component und deren Child-Elementen. Zusätzlich kann man diese Component auch als verstecktes Schaltelement nutzten. Das erzeugte HTML-Element der Component, ist ein leeres <div> und wird daher ohne Inhalt kollabieren. 
Nutzt man in diesem Zusammenhang das setPosSale - Attribut, kann die globale Variable
Global.posSale manipuliert werden: Sind die Bedingungen erfüllt = true, sonnst false.

Auch Verkettungen sind hier möglich. So können sich ConBlocks auch andere ConBlocks abfragen. Hierbei ist jedoch zu beachten, dass (in der Anordnung des HTML) diese nicht verschachtelt sein dürfen und sie entsprechend der Reigenfolge des DOMs abgearbeitet werden.

Die ConBlocks werden immer beim Seitenwechsel aufgerufen, können aber auch mit der Funktion ifTheDivs(TabPageName) über ein call-Attribut aufgerufen werden. 
Hier treten häufig zwei Fehlerquellen auf:

Das Abfragen das Status “active” von Elementen auf einer anderen (geschlossenen) Seite.

Fehlende Selbsterhaltungsabfrage in bereits geöffneten ConBlocks.

Um diese zu umgehen solle beim Einsatz von ConBlocks folgendes beachtet werden:

Die Abfrage erfolgt vor dem Seitenwechsel. Daher kann der Status “active” (bei aktiven Seitenwechsel) nur auf Elemente von der Seite bzw. TabPage, von der gewechselt wird angewandt werden. Nach dem Seitenwechsel sind diese dann “inaktiv”.

“filled”, “empty” und “hasValue{X}” können auch auf ausgeblendete/inaktive Elemente zugreifen.

Wird eine Selbsterhaltungsbedingung [“active”, “my-id”] gesetzt, dann der ConBlock nur von außen, bsw. durch einen Gatekeeper, geschlossen werden.

ConBlock steht übrigens für “conditional block”. Vor der Umbenennung trug es den klanghaften Namen: “IfDiv”.

<ConBlock
    id="beispiel"
    klasse="input_form grid-col_center d-none"
    group="endCardGrp"
    If={[
      ["hasValue{0815}", "datenerfassung_standart"]
    ]} 
>
        <AndereElemente>
      
</ConBlock>

Das Attribut “If” erhält ein Datenobjekt, bei dem jede Bedingung ein eigenes Array bildet. Dies ist noch einmal näher unter “Syntax-Beispiele” beschrieben. 

Attribut

Beschreibung

Erwartet

If

Eine Liste von Bedingungen, welche beim auslösen der Funktion ifTheDivs(TabPageName) überprüft werden.

Array

klasse

<Optional> Zuweisung einer weiteren CSS-Class.

string

group

<Optional> Gruppierung für GK-Funktionen

string

hidden

<Optional> Component wird standardmäßig ausgeblendet

Boolean

setPosSale

<Optional> Manipuliert den Wert von Global.posSale ja nach Ergebnis

Boolean

id

<Optional> Eindeutige ID des Elements

string

required

<Optional> Makiert das Element als Validierungsrelevant

Boolean

Bedingung

Beschreibung

active

Prüfe ob Ziel sichtbar ist.

hidden

Prüfe ob Ziel nicht sichtbar ist.

filled

Prüfe ob Ziel ein Value größer als “ “ hat.

empty

Prüfe ob Ziel ein Value gleich “ “ oder null hat.

hasValue{ X }

Prüfe ob Ziel einen Value gleich X hat.

Operatoren

Beschreibung

and

Ziel muss ebenfalls voriger Vorgabe entsprechen.

or

Dieses Ziel oder voriges muss die Bedingung erfüllen.

Der Aufruf der Funktionen folgt einer bestimmten Syntax. 
Die Bedingungen werden in sogenannten “Blöcken” verfasst. Hierbei besteht der die Bedingungsabfrage immer aus eine Array mit zwei Werten [ operator , elementId ] und der Indikator zum trennen der Blöcke aus einem Array mit nur einem Wert [ Indikator ]. Dabei ist es egal welcher String im Indikator steht, da dieser nicht ausgewertet wird. Somit können diese als Notiz für die Leserlichkeit genutzt werden. 
Ein Block hat keine Begrenzung wie viele Bedingungen er abfragen kann, jedoch müssen immer alle Erfüllt sein, um eine Ausführung auszulösen.

If={[
    ["block1"],
    ["active","datenerfassung_produkt"],
    ["and","datenerfassung_product"],

    ["block2"],
    ["active","datenerfassung_ablehnungsgrund"],

    ["End"],
]}

Nach den Bedingungs-Blöcken muss zwingend ein [“End“] - Indikator folgen, um die Bedingungsabfrage zu beenden. 



Gruppierung
Grundlegend sind Blöcken und die Operatoren  "and" und "or"  die selbe Bedingungsabfrage.
Perse ist der “and”-Operator mehr oder weniger obsolet und dient lediglich der Leserlichkeit.  Denn es müssen immer alle Bedingungen eines Blockes zutreffen, solange keine “or” genutzt wurde. 

Denn der “or”-Operator ermöglicht es, wieder der Name bereits verrät, dass auf einzelne Bedingungen verzichtet werden, wenn der jeweilige Gegenpart zutrifft. Dies trifft ebenfalls auf die Blöcke zu, nur dass dort die gesamten Blöcke in einem OR-Verhältnis zueinander stehen.

So wird in diesem Beispiel abgefragt, ob entweder das Element mit der ID “display_product” oder jenes mit der ID “display_product2” aktiv ist (also angezeigt wird). 

 ["block1"],
    ["active","display_product"],
    ["or","display_product2"],

CustomerCells

  Die CustomerCells zeigen dem User die im CustomerPattern definierten und aus der Datenbank geladen Informationen zum aktuell aufgerufenen Datensatz.

Die einzelnen Einträge werden in je eine Zelle geladen, die aus dem Cell__head für das Label und der Cell__data für die eigentlichen Informationen zum Kunden bestehen.

Nach dem Laden des DOMs wird die Funktion buildUp() aufgerufen. Während der Laufzeit dieser Funktion werden die Kundendaten mit der main_query() aus der Datenbank geladen und in das, im  ProviderPattern erstellten DataObject CustomerData übertragen.

Für diesen Vorgang muss bekannt sein, welche Pattern genutzt werden sollen. 
Dies wird in der Component CustomerCells deklariert.
Hierfür werden die beiden Funktionen als String in den Attributen pattern und queryId abgelegt.

<CustomerCells
	pattern={"ProviderPattern()"}
	queryId={"main_query()"} 
>
</CustomerCells>

Attribut

Beschreibung

Erwartet

pattern

Name der Funktion zur Initialisierung der CustomerData

string

queryId

Name der main_query-Funktion

string

EditLayout & Layout

Die beiden Layout-Components sind so etwas wie die Wrapper für das Projekt. Sie enthalten den strukturellen Aufbau des umgebenen HTML-Dokuments und alle Angaben zum Laden der Grundfunktionen.



<CampaignLayout     
    campaignTitle="STE_WEL"
    campaignNr="000003"
    jsFiles={["query_lib.js", "tteditor-config.js"]}
    header_imgs={["skon.png", "stadtenergie.svg"]}
    header_title="Stadtenergie Welcome Call"
    pattern="providerPattern()"
    query="main_query()" 
 >  
 ... HTML ...
 </CampaignLayout>

Attribut

Beschreibung

Erwartet

campaignTitle

Title des HTML-Dokuments Teil 1

string

campaignNr

Title des HTML-Dokuments Teil 2 + Ordnername der JS-Dateien

string

jsFiles

Title der JS-Dateien (mit Suffix)

string

header_imgs

Bilddateien (max. 2) die im Header angezeigt werden (mit Suffix)

string

header_title

String, der als Title im Header angezeigt wird

string

pattern

Funktion des ProviderPattern (Standard = “providerPattern()”)

string

query

Funktion der main_query (Standard = "main_query()" )

string

Der Aufbau ist der selbe wie bei der CampaignLayout-Component, jedoch bietet diese Variante mehr Möglichkeiten zusätzliche Elemente zu platzieren, falls benötigt. 

<Layout 
  title="STE_WEL" 
  campaignNr="000003" 
  jsFiles={[
    "query_lib.js",
    "tteditor-config.js"
]}> 
  <header>
    <Bild dateiname="skon.png" />
    <Bild dateiname="stadtenergie.svg" />
    <h1>Stadtenergie Wellcome Call</h1>
  </header>
  <main>
    <CustomerCells
		pattern="providerPattern()"
		queryId="main_query()" 
    >
    </CustomerCells>
    <section class="middle_block">
    
      ... HTML ...
    
    </section>
  </main>
  <Popups />
  <DebugLog />
</Layout>

Attribut

Beschreibung

Erwartet

title

Title des HTML-Dokuments Teil 1

string

campaignNr

Title des HTML-Dokuments Teil 2 + Ordnername der JS-Dateien

string

jsFiles

Title der JS-Dateien (mit Suffix)

string

dateiname

Bilddateien die im Header angezeigt werden (mit Suffix)

string

pattern

Funktion des ProviderPattern (Standard = “providerPattern()”)

string

query

Funktion der main_query (Standard = "main_query()" )

string

FinishButton

Die “FinishButton”-Component ist das Element, was den Call beenden, die gesammelten Daten absenden und ttFrame vermitteln soll, wie das jeweilige Verkaufsgespräch abgeschlossen wurde.

Hierfür können zwei verschiedene Modi genutzt werden, die über das auslösende Attribut gesteuert werden:



Variante 1: <FinishButton auto ></FinishButton> 
Bei dieser Variante werden aus allen Elementen des HTML-Dokuments diese herausgesucht, die ein 'submitTo'-Attribut tragen und aus deren Daten ein query generiert, welches an die DB gegeben wird.



Variante 2: <FinishButton queryLib = “my_pushSQL_Id“ ></FinishButton> 
Hier wird ein query aus der pushSQL-Funktion in der QueryLib genutzt, um die Daten zu versenden.
(Dieses Query muss erst von dem Editor erstellt werden)

Siehe auch: Positionierung

Gate

Die Gate-Component definiert den Einflussbereich des zugewiesenen Gatekeepers. Erst durch diese Zuweisung ist es möglich den vollen Funktionsumfang des Gatekeepers zu nutzen. Den dieser greift mit seiner Funktion in das ihm zugeteilte Gate um die darin liegenden Elemente zu manipulieren.







 <Gate 
    id = "gk_grp1" 
    klasse = "grid"
>
    ... innerHTML ...
</Gate>

Attribut

Beschreibung

Erwartet

grp

<Optional> Name zur Zielansprache durch Parent-Gatekeeper

String

hidden

<Optional> Fügt die class “d-none” hinzu (ausblenden)

Boolean

id

<Optional> Eindeutige Kennung für das Element

String

klasse

<Optional> Vergabe von zusätzlichen CSS-Klassen

String

GateGroup

Die GateGroup-Component ist dafür gedacht innerhalb einer Gate-Component, weitere einzeln ansprechbare Gruppen zu schaffen. So kann unter Anderen der programmatische Aufwand, bei der Definierung der Gatekeeper-Befehle, reduziert werden.







 <GateGroup
    id = "datenerfassung_product"
    klasse = "input_form grid-col_center d-none"
    group = "grp1"
>
    ... innerHTML ...
</GateGroup>

Attribut

Beschreibung

Erwartet

group

Gruppenname für die Zielansprache des Gatekeepers

String

hidden

<Optional> Fügt die class “d-none” hinzu (ausblenden)

Boolean

id

<Optional> Eindeutige Kennung für das Element

String

klasse

<Optional> Vergabe von zusätzlichen CSS-Klassen

String

GatekeeperSelect 

Das GatekeeperSelect-Element (folgend auch als GKS abgekürzt) ermöglicht es, basierend auf der Auswahl des Users verschiedene Aktionen ausgeführt zu können, um beispielsweise die Sichtbarkeit anderer Elemente auf der Seite zu steuern. hfh

fht

Erschaffen wurde das GKS, um die Schreibarbeit an dem, für die Schaltlogik verknüpften, JavaScript so gering wie möglich zu halten. Diese wird hier durch das direkte einspeichern, der wichtigsten Informationen, in die Attribute des GKS-Elements erreicht.
Mithilfe dieser, bei der Erstellung des Elements mitgegebenen Daten, kann das Select bei einem 
onChange-Event selbstständig auswerten, welche Aktionen bei dem aktuellen Wert ausgeführt werden sollen. So können mit den Befehlen dynamische Benutzeroberflächen gestaltet werden.

Der Grundgedanke ist das ein GKS ein sogenanntes Gate steuert. Dieses Gate umfasst alle Elemente, die sich innerhalb der Gate-Component befinden, die im Attribut “gate” des GKS eingetragen ist. 



Wird im Select vom User ein neuer Wert ausgewählt, ruft das GKS die Funktion Gatekeeper() auf und übergibt das Action-Array aus dem eigenen “data-array” - Attribut. In diesem Array sind wiederum Operation-Arrays abgelegt die jeweils einen Auslösewert, den Operator und das Ziel beinhalten. 
Hierfür wird beispielsweise die CSS-Klasse “d-none” genutzt, welche die Anweisung display: none enthält.

Hast das GKS das Array an die Gatekeeper-Funktion übergeben, 
wertet dieses aus, welche Aktionen durchgeführt werden müssen und führt diese, entsprechend der Reihenfolge im Array, nacheinander aus.

Neben der Manipulation anderer Elemente hat das GatekeeperSelect auch einen zugeordneten Bereich, in welchem eine Validierung, der sich darin befindenden Elemente, angestoßen werden kann.
Das “Gate”  ist eine eigene Component und wird mithilfe der ID, welche im GKS hinterlegt wird, an dieses gebunden. Jedem GKS kann ein Gate zugeordnet werden.

Für die Nutzung der Gatekeeper-Funktion werden bestimmte Schlüsselwörter genutzt, um die verschiedenen Aktionen aufzurufen. Diese lassen sich auch beliebig miteinander kombinieren, mit der Ausnahme von “trigger”. Denn die Trigger-Operator zielt nicht auf ein anderes Element, sondern schreib in ein Dataobject.

Auch die Aneinanderreihung von mehreren Operatoren oder Zielen ist möglich. 
Diese werden dann in einem weiteren Array zusammengefasst. 



Besonderheiten der Operatoren

all{ X } 
Der (Target-)Operator all erhält, in den geschweiften Klammern, einen String mit den Namen des group-Attributes, der gewünschten GateGroup-Component. Kann keine GateGroup mit diesem Namen gefunden werden, wird automatisch das Gate anvisiert.

setTrue & setFalse
Die Operatoren setTrue und setFalse könne ausschließlich Variablen des Global-Objektes manipulieren. 
Erdacht wurden diese Operatoren mit dem Gedanken, die Global.posSale zu beeinflussen, um bei bestimmten Eingaben auf den negativen Abschluss zu springen.
Wenn weitere Variablen gebraucht werden, um beispielsweise Zwischenschritte abzuspeichern, können diese einfach in der ttEditor.config.js hinzugefügt werden.

openOnly
Der Operator openOnly kann nur dann genutzt werden, wenn dem Gatekeeper ein Gate zugewiesen wurde. Denn die Funktion die dieser Operator anstößt schließt/versteckt alle Elemente im Gate und zeigt dann nur das Target wieder an. Werden in diesem Zusammenhang die GateGroups genutzt können einzelne Abschnitte geschaffen werden die sich gegenseitig schalten.



Anekdote

Der Gatekeeper steht vor dem Tor und bestimmt wer hinein- und hinausgelassen wird.
Die Elemente die sich im Bereich des Tores (Gate) befinden, können also nur dann hineingelangen, wo sie im Schutz des Gebäudes nicht gesehen werden, wenn der Gatekeeper sie passieren lässt. Ebenso kann der Gatekeeper sie aber auch vor die Tür setzen, wenn er den Befehl dafür bekommt und sie somit wieder sichtbar macht.



Aktion

Operator

Target

Beschreibung

Gruppierung

anyOperator

 all{grpID}

Alle Mitglieder der “Group”-Component, mit der genannten ID, werden als Ziel ausgewählt.

Werte setzten

setValue{value}

anyElementID

Der in den geschweiften Klammern eingetragene Wert wird als neue Element.value des Ziels deklariert.

Elemente anzeigen

open

anyElementID

Dem Ziel wird die class “d-none” entzogen.

Nur ein Element Anzeigen

openOnly

anyElementID

Dem Ziel wird die class “d-none” entzogen und allen anderen Mitgliedern des Gates wird die class “d-none” zugeordnet.

Elemente verstecken

close

anyElementID

Dem Ziel wird die class “d-none” zugeordnet.

Elemente sperren

disable

anyElementID

Dem Ziel wird das Attribut “disabled“ zugewiesen.

Elemente entsperren

enable

anyElementID

Den Ziel das Attribut “disabled“ entzogen

Inhalte triggern

trigger

“triggerID”

Die im Ziel angegebene ID, innerhalb des “TriggerPattern”, aktiv geschaltet.

Boolean = true

setTrue

Global.X

Die im Ziel angegebene Variable = true

Boolean = false

setFalse

Global.X

Die im Ziel angegebene Variable = false

<GatekeeperSelect     
  id="example_select" 
  label="Beispiel-Auswahl:" 
  options={[ 
    ["option1", "Option 1"], 
    ["option2", "Option 2"], 
    ["option3", "Option 3"], 
  ]} 
  actions={[ 
    ["option1", "open", "element1"], 
    ["option2", "close", "element2"], 
    ["option3", "openOnly", "element3"], 
  ]} 
  gate="example_gate" 
  pageLock 
  required 
>
</GatekeeperSelect>


Attribut

Beschreibung 

Erwartet

id

Eindeutige Kennung dieses Elements.

string

label

Beschriftung des Auswahlbereichs für den User.

string

gate

ID des Gates, für das dieses GKS zuständig ist.

string

options

Eine Liste von Optionen, die dem Benutzer zur Auswahl angeboten werden. Jede Option besteht aus einem Wert und der dazugehörigen Beschriftung.

Array

actions

Eine Liste von Aktionen, die bei Auswahl einer bestimmten Option ausgeführt werden sollen. Jede Aktion besteht aus dem Wert der Option, der ausgelösten Aktion und dem Ziel der Aktion.

Array

klasse

<Optional> Zuweisung einer weiteren CSS-Class.

string

call

<Optional> Aufruf einer alternativen Validierung.

string

preset

<Optional> Laden eines Presets aus CustomerData.

string

pageLock

<Optional> Sperrt die TabSeite nach der Nutzung des GKS bis zu vollständigen Validierung der TabSeite.

Boolean

submitTo

<Optional> Gibt den Name des Ziel-Coloumn-Bezeichner für die DB an

string

required

<Optional> Markiert das GKS als erforderlich, für die Validierung.

Boolean

diabled

<Optional> Sperren des Elements.

Boolean

firstOption

<Optional> Platzhalter für Select einfügen. 

Array



Actions:

Beispiel - Ein Select auf einen bestimmten Wert geben und sperren
Gehen wir davon aus dass, bei ausgewähltem Wert2 des GKS, das Select mit der ID “testSelc” den Wert “test” annehmen soll und dann für den User gesperrt wird.
Hierfür setzten wir in das Tamplate [ value , action , target ] wie folgt ein:

action = {[
  [ "Wert2" , ["setValue{test}" , "disable"] , "testSelc" ]
  ...
]}



RecordButton

Der RecordButton ist ein Bedienelement das dem User dir Möglichkeit gibt den aktuellen
Aufnahmestatus, bzw. die Parteien des Gespräches, die Aufgezeichnet werden zu wechseln.  Wurde der Button geklickt und der Aufnahmestatus geändert, wird der Button automatisch ausgeblendet. So kann auch beispielsweise über einen ConBlock abgefragt werden, ob der Button betätigt wurde und der Agent sich im richtigen Aufnahmezustand befindet.



Je nachdem welcher Wert im Attribut CallState hinterlegt ist wird ein anderer Aufnahmezustand ausgelöst:

Wert

Zustand

'0'

keine Aufnahme

'1'

Nur der Kunde wird aufgezeichnet

'2'

Nur der Agent wird aufgezeichnet

'3'

Agent und Kunde werden aufgezeichnet

<RecordBtn 
      id="testrecbtn" 
      callState="2" 
      showInfo 
      txt_info="Der Kunde" 
      txt_btn="ist Sauer"
>  
</RecordBtn>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung dieses Elements.

String

callState

<Optional> Zuweisung CallStates ( 0 - 3 )

String

centered

<Optional> Zentriert den Button in seinem Elternelement

Boolean

showInfo

<Optional> Zeigt den Infotext an (txt_info)

Boolean

txt_btn

<Optional> Im Button angezeigter Text

String

txt_info

<Optional> Im Infotext angezeigter String

String

NavTab & TabPage

 Die NavTab bilden die Hauptnavigation für die verschiedenen Unterseiten der jeweiligen Kampagne. Diese werden von der TabPage-
Component abgebildet.

Der Tab “Start” wird immer autogeneriert und als erste Auswahl markiert. Daran sollte man denken, wenn man die TabPage erstellt. Da die TabPages standartmäßig ein d-none besitzen und ihnen dieses erst nach dem Klick auf den verknüpften Tab entzogen wird.



Klickt der User auf einen der Tab-Buttons, wird geprüft, ob derzeitig ein pageLock aktiv ist, das diese Aktion verhindert, ob Einträge Validiert, oder andere Werte geladen werden müssen. Laufen alle Prüfungen positiv ab, wird der ehemalige Tab ausgegraut, dem dazugehörige TabPage d-none hinzugefügt, der neue Tab hervorgehoben und dessen TabPage sichtbar geschaltet.
Getragen wird die Schaltlogik von der Funktion “switchTab()”. 

<NavTabs
    tabs={[
        ["tab2", "tab_product", "Produkt"],
        ["tab3", "tab_zusammenfassung", "Zusammenfassung"],
    ]}
>
</NavTabs>

tabs 

Name

Beschreibung

[“tab2”, “tab-product”, “Produkt”]

tabID

ID des Tab-Buttons in der TopNav

[“tab2“,"tab_product", "Produkt"]

tabPageID

ID des zugehörigen TabPage-Elements  

[“tab2“,"tab_product", "Produkt"]

Label

Angezeigtes Lable im Tab-Button

 <TabPage
    id="tab_start"
    tab="tab1"
    isVisible 
>     
... Elemente der Seite ...

</TabPage>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung dieses Elements.

string

tab

Verknüpfung zur NavTab

string

isVisible

Entfernen der standartmäßigen CSS-Class d-none.

boolean

Beispiel: Einfügen der ersten Tab-Seite
Gehen wir davon aus dass, wir ein neue Projekt aufbauen. Hier soll die erste Tab-Seite direkt nach dem laden der Seite sichtbar sein. Hierfür nutzten wir das NavTab-Element und das TabPage-Element.
NavTab generiert automatisch den Eintrag für die erste TabPage mit den Werten:
[ tabID = “tab1“ , tabPageID = “tab_start” , label = “Start“ ]

Diese Werte müssen wir jetzt nur noch in das TabPage-Element eintragen und schon sind die beiden Elemente verknüpft. Die Besonderheit hier ist das “isVisible”-boolean, welches diesem TabPage-Element die CSS-Class “d-none” entzieht und es dadurch sichtbar macht.

  <NavTabs
      tabs={[
          ["tab1","tab_start", "Start"], <-- Auto-generiert
          ["tab2","tab_product", "Produkt"],
      ]}
  >
  </NavTabs>

  <TabPage
      id="tab_start"
      tab="tab1"
      isVisible 
  > 
  ...  

TabWrapper

Die TabWrapper-Component ist eine der simpelsten, aber auch eine der wichtigsten Bausteine dieses Editors.
Das im Build generierte Element dieser Component ist die form, die alle Eingabeelemente umschließt. Diese ist essenziell für die Auswertung der Eingaben und den daraus generierten Querys, die an die Datenbank geschickt werden. Daher sollte diese Component immer genutzt werden.   

Die TabWrapper-Component umschließt die TabPages, in welchen die Eingabeelemente platziert werden.

Im Build wird aus der Component ein <form>-Element generiert:

<form
    class=`datenerf-bg ${klasse}`
    name="formular"
    method="POST"
    id="tabsForm"
> 
    <slot>
        ... innerHTML ...
    </slot>
</form>

<TabWrapper>
    ... innerHTML ...
</TabWrapper>

Attribut

Beschreibung

Erwartet

klasse

<Optional> Zuweisung von CSS-Klassen

String

SimpleTextfield

Die SimpleTextfield-Component ist für die Erfassung von größeren Texten gedacht und finden sich in den Modalen für die Sonderabschluss-Fälle (wie APNE).

Sie bieten etwas weniger Funktonen als die SimpleInput, können dafür aber in der Größe angepasst werden.



Die SimpleTextfield-Components beinhalten eine autoResize()-Funktion. Mit dieser wird das Textarea-Element auf eine Höhe von 200px ausgeweitet, sobald es beschreiben wird. Sollte kein Text vorhanden sein, kollabiert dieses wieder auf die voriger Größe.

Bei dieser Component ist das nutzen des maxLength-Attributes von Vorteil, da so begrenzt wird, wie viel Freitext dem Agenten gewährt wird. 

Wichtig: Das validate-Attribut dieser Component ist optional, muss aber vergeben sein, sobald ein required vergeben wurde, da der Text sonnst ohne weitere Validierung durchgewunken wird.  

Das SimpleTextfield besitzt kein onChange-Event.

 <TxtArea
    klasse="textarea-expend"
    label="Notiz"
    col="1"
    row="1"
    id="wiedervorlage_Text"
></TxtArea>

Attribut

Beschreibung

Erwartet

col

Weitergabe des Stings an col-Attribut des Elements (Spaltenanzahl)

String

id

Eindeutige Kennung des Input-Elements. 

String

label

Beschriftung des Eingabefeldes für den User. 

String

row

Weitergabe des Stings an row-Attribut des Elements (Reihenanzahl)

String

call

<Optional> Name der Funktion für Validierung   ( wenn validate = “call” )

String

hidden

<Optional> CSS-class “d-none” als Startwert zuweisen

Boolean

klasse

<Optional> Zusätzliche CSS-Klasse für das Element. 

String

maxlength

<Optional> Maximale Anzahl der Zeichen für das Input. 

String

required

<Optional> Markiert das Feld als Pflichtfeld. 

Boolean

submitTo

<Optional> Gibt den Name des Ziel-Coloumn-Bezeichner für die DB an

String

validate

<Optional> Marker zur Sortierung/Einteilung der Werte, der bestimmt, gegen welches Regex der Input geprüft wird (z. B. txt, email, tel, plz). 

String

value

<Optional>Der Startwert des Elements. 

any

SimpleInput

Das SimpleInput bildet die Grundlage der Datenerfassung- 
Elemente des ttEditors.  Obwohl der Name es vermuten lässt, ist die Component Alles andere als ein simples Input-Element. Die mannigfaltigen Attribute sorgen für eine sehr unterschiedliche Einsatzmöglichkeiten. 

Grundlegend soll die Component von der Eingabeüberprüfung, der Validierung. bis hin zum Senden an die Datenbank alle Arbeitsschritte übernehmen können, sofern gewünscht.


Der einfachste Aufbau den diese Component bietet, hält sich an die drei benötigten Attribute:
id, label und validate. 

 <Input
    id="datenerfassung_telefon"
    label="Abweichende Telefonnummer?"
    validate="tel"
>
</Input>

id vergibt hierbei eine einmalige Kennung für das generierte Input-Element, als auch die IDs für das Element für die Error Message mit ‘id_errorMsg’ und das Label-Element mir ‘id_label’

label erhält den String, der in dem zugehörigen Label-Element als innerHTML angezeigt wird.

validate erhält seinen eigentlichen Nutzen erst dann, wenn auch das Attribut required vergeben wurde, da erst dann der value des Inputs an die Validierung weitergegeben wird. Da es technisch aber nicht anderes umsetzbar ist, zu verhindern, dass das validate-Attribut vergessen wird, muss es immer angegeben werden. Siehe auch: validate-Attribut 



Mit dem Einsatz der optionalen Attribute beginnt dann die Spezifizierung für das Input-Element.
So kann beispielweise mit regex, max und min bestimmt werden, dass nur Ziffern von 1 bis 10 eingetragen werden können, oder es wird mit preset ein Wert aus der CustomerData geladen, der bei Änderungswünschen ungeschrieben und mit submitTo wieder in der Datenbank abgelegt wird.

<Input
    id="vertragsende_dataErf"
    label="Vertragsende aktueller Anbieter - tt.mm.jjjj"
    type="text"
    validate="date"
    submitTo="endOfContract, providerdataTable, Global.key2"
    blur='showWeiterBtn("gk_grp1")'
    required
>
</Input>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung des Input-Elements. 

string

label

Beschriftung des Eingabefeldes für den User. 

string

validate

Marker zur Sortierung/Einteilung der Werte, der bestimmt, gegen welches Regex der Input geprüft wird (z. B. txt, email, tel, plz). 

string

blur

<Optional> Funktion, die beim Verlassen des Eingabefelds ausgeführt wird. 

string

call

<Optional> Name der Funktion für Validierung   ( wenn validate = “call” )

string

disabled

<Optional> Deaktiviert das Eingabefeld. 

boolean

klasse

<Optional> Zusätzliche CSS-Klasse für das Element. 

string

max

<Optional> Maximale Eingabegrenze (z. B. für numerische Felder). 

string

maxlength

<Optional> Maximale Anzahl der Zeichen für das Input. 

string

min

<Optional> Minimale Eingabegrenze (z. B. für numerische Felder). 

string

pattern

<Optional> RegEx-Muster zur Validierung des Inputs. 

string

preset

<Optional> Vordefinierter Wert, der aus CustomerData geladen wird. 

string

required

<Optional> Markiert das Feld als Pflichtfeld. 

boolean

submitTo

<Optional> Gibt den Name des Ziel-Coloumn-Bezeichner für die DB an

string

type

<Optional>Art des Input-Typs (z. B. text, email). 

string

oc

<Optional> Funktionsaufruf für OnChange-Event

string

value

<Optional>Der Startwert des Elements. 

any

SimpleSelect

Das SimpleSelect bietet neben dem Standarteinsatz als Select-Element noch ein paar zusätzliche Fähigkeiten.

Auch wenn es primär nur für die Datenerhebung gedacht ist, kann es beispielsweise auch dafür genutzt werden, basierend auf dem ausgewählten Wert, die Trigger im TriggerPattern zu aktivieren.


Um Trigger zu setzen, muss in dem actions-Attribut eine Anweisung in Form deiner Arrays hinterlegt werden. In diesem Array muss der erforderlicher Wert zum Auslösen und die Trigger-ID vorhanden sein:

                                                               [ “valueX”, “trigger-ID”]

actions={[
  ["valueX", "trigger_id1"],
  ["valueY", "trigger_id2"]
]}

Damit diese actions nun geladen werden können, muss zusätzlich im call-Attribut die Funktion getTrigger() hinterlegt sein. Diese erhält die ID des Selects und ein Boolean für die optionale Aktivierung einer nachfolgenden Validierung via showWeiterButton().

                                                     call = “getTrigger( 'select_id', 'false' )”



 <Select
    id='datenerfassung_optin_detail'
    label='Optin?'
    call='showWeiterBtn("tab_product")'
    firstOption={
        ['keine', 'Keine Änderung der Werbeerlaubnis']
    }
    options={[
        ['voll', 'Volle Werbeerlaubnis'],
        ['schrift', 'Nur schriftlich (Mail/Brief)'],
        ['out', 'Opt-OUT !ACHTUNG! Voller Entzug der Werbeerlaubnis'],
    ]}
>
</Select>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung dieses Elements.

String

label

Beschriftung des Auswahlbereichs für den User.

String

actions

<Optional>Eine Liste von Aktionen, die bei Auswahl einer bestimmten Option ausgeführt werden sollen. (Nur Trigger)

Array<Array>

call

<Optional> Funktionsaufruf für OnChange-Event

String

disabled

<Optional>Sperren des Elements

Boolean

firstOption

<Optional> Abändern der ersten Option “Bitte Auswählen“

Array<any>

hidden

<Optional> CSS-class “d-none” als Startwert zuweisen

Boolean

klasse

<Optional> Zuweisen von CSS-Klassen

String

options

<Optional>Eine Liste von Optionen, die dem Benutzer zur Auswahl angeboten werden. Jede Option besteht aus einem Wert und der dazugehörigen Beschriftung.

Array<Array>

preset

<Optional> Laden eines Presets aus CustomerData.

String

required

<Optional> Marker: Element erforderlich, für die Validierung

Boolean

requiredValue

<Optional> erforderlicher Wert, für die pos. Validierung

Array<any>

submitTo

<Optional> Gibt den Name des Ziel-Coloumn-Bezeichner für die DB an

String

SuggestionInput

Das SuggestionInput (fortlaufen auch als SGI bezeichnet) ist mehr oder minder die kleine Schwester des GKS.
Die Idee war es ein Input zu schaffen, das bei der Eingabe von bestimmten Schlagwörtern selbstständig
eine Funktion aufrufen kann. Hierbei wird die Vorschlag-Methodik aus der Kombination von Input und Datalist mit der Gatekeeper Funktionalität verknüpft.

Hierbei ist entscheidend, dass die Gatekeeper-Funktion optional zugeschaltet werden kann und das Input somit auch als normales Vorschlags-Input genutzt werden könnte.

 

Trägt der User etwas in das Input ein, wird bei verlassen des Elements eine onBlur-Methode aufgerufen.
Diese Prüft ob die Gatekeeper-Funktion aufgerufen werden soll. Ist dem so, werden der aktuelle Wert und das Action-Array an die Funktion übergeben und ausgewertet.

Ab diesem Punkt ist der Ablauf der Selbe wie beim GKS, mit einer kleinen Ausnahme.
Wurde in die actions als wert “default” für die Ausführung eingetragen, wird diese Umgesetzt, solange der Wert im Input größer als ““ ist.

Aktion

Operator

Target

Beschreibung

Gruppierung

anyOperator

 all{grpID}

Alle Mitglieder der “Group”-Component, mit der genannten ID, werden als Ziel ausgewählt.

Werte setzten

setValue{value}

anyElementID

Der in den geschweiften Klammern eingetragene Wert wird als neue Element.value des Ziels deklariert.

Elemente anzeigen

open

anyElementID

Dem Ziel wird die class “d-none” entzogen.

Nur ein Element Anzeigen

openOnly

anyElementID

Dem Ziel wird die class “d-none” entzogen und allen anderen Mitgliedern des Gates wird die class “d-none” zugeordnet.

Elemente verstecken

close

anyElementID

Dem Ziel wird die class “d-none” zugeordnet.

Elemente sperren

disable

anyElementID

Dem Ziel wird das Attribut “disabled“ zugewiesen.

Elemente entsperren

enable

anyElementID

Den Ziel das Attribut “disabled“ entzogen

Inhalte triggern

trigger

“triggerID”

Die im Ziel angegebene ID, innerhalb des “TriggerPattern”, aktiv geschaltet.

Boolean = true

true

posSale

Ziel-Variable = true

Boolean = false

false

posSale

Ziel-Variable = false

default werte

anyOperator

anyElementID

Als Wert wird “default” eingetragen.

<Suggestion
      id = "datenerfassung_input"
      label="Kunde kaufwillig?"
      options={[
          "ja",
          "nein",
      ]}
      actions={[
          [`ja`, 'openOnly', "datenerfassung_test"],
          [`ja`, 'trigger', "PAtxt1"],
          ["nein", "openOnly", "datenerfassung_ablehnung"],
          ["nein", "enable", "datenerfassung_ablehnungsgrund"],
          ["nein", "trigger", "NAtxt1"],
          ["default", "close", "all{testGrp}"]
      ]}
      type="txt"
      validate="txt"
      gatekeeper
      gate="gk_grp1"
>
</Suggestion>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung dieses Elements.

string

label

Beschriftung des Auswahlbereichs für den User.

string

options

Eine Liste von Schlagwörtern,  die dem Benutzer zur Auswahl angeboten werden. 

array

actions

<Optional>Eine Liste von Aktionen, die bei Auswahl einer bestimmten Option ausgeführt werden sollen. Jede Aktion besteht aus dem Wert der Option, der ausgelösten Aktion und dem Ziel der Aktion.

array

klasse

<Optional> Zuweisung einer weiteren CSS-Class.

string

submitTo

<Optional> Gibt den Name des Ziel-Coloumn-Bezeichner für die DB an

string

preset

<Optional> Laden eines Presets aus CustomerData.

string

gatekeeper

<Optional> Weitergabe an Gatekeeper-Funktion 

boolean

gate

<Optional> ID des Gates, für das dieses SGI zuständig ist.

string

pattern

<Optional> Eingabe einer eigenen RegEx

string

type

<Optional> Art des Input-Typs

string

value

<Optional> Startwert

string

validate

<Optional> Nach welcher Regel soll validiert werden ( bundleInputs() )

string

hidden

<Optional> CSS-class “d-none” als Startwert zuweisen

boolean

disabled

<Optional>Sperren des Elements

boolean

maxlength

<Optional> Maximallänge des values 

string

Actions:

Beispiel - Ein Select bei jedem Wert im SGI sperren
Gehen wir davon aus dass, ein zweites Input nur dann befüllt werden soll, wenn das erste Leer bleibt.
Dafür wird der value “default” abgegriffen und das zweite Input mit disable gesperrt.
Hierfür setzten wir in das Tamplate [ value , action , target ] wie folgt ein:

action = {[
  ...
  [ "default" , "disable" , "secoundInput" ]
]}



SQL InjectionSelect

Das InjectionSelect ist ein Select-Element welches über das “load”-Attribut verfügt. Mit diesem Attribut wird bestimmt, welcher Case aus der PullSQL()-Funktion die Daten laden soll, die als Options in das Select geschrieben werden.



Müssen die Daten in einem Select-Element spezifisch auf den Kunden zugeschnitten sein oder Datensätze beinhalten, die einer hohen Varianz unterliegen, empfiehlt es sich, das InjectionSelect zu nutzen. Denn dieses erhält seine Optionen dynamisch aus der Datenbank und kann sogar noch während des laufenden Betriebs beschrieben oder ausgetauscht werden.

Das InjectionSelect autogeneriert immer die erste Option als “Bitte Auswählen” und schaltet sich selber als disabled, sofern es keine Daten erhält.

<SQL_Select
    id="datenerfassung_ablehnungsgrund"
    label="Ablehnungsgrund:"
    name="datenerfassung_ablehnungsgrund"
    call="showWeiterBtn('gk_grp1')"
    load="cancellation_reasons"
    required
>
</SQL_Select>

Attribut

Beschreibung

Erwartet

id

Eindeutige Kennung des Dropdown-Elements.

string

label

Beschriftung des Dropdowns für den User.

string

name

Der Name des Dropdown-Elements für Formularzwecke.

string

load

Name des querys in der PullSQL()-Funktion

string

call

<Optional> Funktion, die beim Ändern der Auswahl ausgelöst wird.

string

trigger

<Optional> Ein Array von Bedingungen, das als Trigger für andere Elemente dient.

Array<Array<any>>

required

<Optional> Markiert das Dropdown als Pflichtfeld.

boolean

requiredValue

<Optional> Liste der Werte, die als gültige Pflichtwerte anerkannt werden.

Array<any>

preset

<Optional> Vordefinierter Wert, der aus CustomerData geladen wird.

string

submitTo

<Optional> Name des Ziel-Columns für die DB, um die Auswahl zu speichern.

string

WeiterButton

Der WeiterButton ist standartmäßig ausgeblendet und kann über die Funktion showWeiterBtn('tabPage_id'); aufgerufen werden. Diese sollte im besten Falle durch das wichtigste oder letzte Input/select auf der Page gecalled werden. Bei diesem Aufruf wird gleichzeitig die Funktion Silent(); ausgeführt, welche alle Elemente der jeweiligen Page, die das Attribut required tragen, darauf prüft, ob diese ausgefüllt wurden.

Sind alle notwendigen Inputs befüllt, wird der WeiterButton angezeigt.

Sollte im Laufe der Datenverarbeitung die Variable Global.posSale = false deklariert worden sein, wird der Text im WeiterButton auf “Abschluss” geändert und der Button leitet auf die letzte TabPage.

Siehe auch: Positionierung

 <NextPageBtn></NextPageBtn> 

Diese Component besitzt keine Attribute.

Attribute

Jede der Components besitzt verschiedene und für diese erstelle Attribute.
Zumeist dienen diese dafür, die verschiedenen Aufgaben der Logik zu übernehmen. Die Attribute erwarten zumeist Strings, einige wenige hingegen aber auch Arrays oder Booleans.
Für einen genauen Überblick über die Nutzung folgt hier nun eine Aufgliederung:



Actions 

Die actions sind eine Anweisung für die Logik, welche Elemente ein- und ausblenden, sperren, entsperren, beschreiben, oder auch deren Werte manipulieren soll. 
Die Syntax dieser Anweisung folgt dem Aufbau: [ Auslöser, Operation , Ziel ]

Der Auslöser ist der Wert der Aktuell ausgewählten Option im Select oder der Datalist des jeweiligen Elements. Die einzige Ausnahme bildet hier der Auslöser “default”, welcher im SuggestionInput genutzt werden kann. Dieser reagiert auf Alle Werte die nicht leer oder in den Options vorhanden sind. Für einen Auslöser können auch mehrere Anweisungen geschrieben werden.

Die Operation bezeichnet eine Reihe von vordefinierten Befehlen, welche das Ziel manipulieren.
Hierbei gibt es zwei unterschiedliche Arten von Zielen, die jeweils ihre eigenen Operatoren haben.
Immer wenn das Ziel ein Element ist könne folgende Operationen genutzt werden:

Befehl

 Operation

open

Entferne CSS-Class “d-none” → Ziel anzeigen 

close

Füge CSS-Class “d-none” hinzu → Ziel verstecken

openOnly

Verstecke alle Elemente eines Gruppe und zeige Ziel an

setValue{X}

Füge Ziel Value X hinzu, falls nicht vorhanden und wähle diesen aus

disable

Sperre Ziel

enable

Entsperre Ziel

Ist das Ziel hingegen eine Variable oder ein Trigger kann man folgende Operatoren nutzen:

Befehl

Operation

true

Die im Ziel angegebene Variable = true

false

Die im Ziel angegebene Variable = false

setVar{X}

Die im Ziel angegebene Variable nimmt den Wert X an

trigger

Die im Ziel angegebene Id wird aktiv geschaltet



Das Ziel kann sowohl die ID eines Elementes, aber auch der Name einer Variable sein. Hier ist besonders darauf zu achten, welche Operationen für welches Ziel genutzt werden kann. In alles Fällen wird das Ziel aber als String angegeben.

Nutzt man das Ziel “all{GrpX}” werden automatisch alle Elemente in der GrpX anvisiert.

Operations- und Ziel-Arrays

Es ist durchaus möglich für eine Operation mehrere Ziele, oder mehrere Operationen für ein Ziel  auszuwählen, diese werden dann wiederum in einem Array angegeben.

                       [ "nein", [ "open”, “disable" ], "datenerfassung_ablehnungsgrund" ] ,

                             [ "nein",  "open”, [ "elementA", "elementB", "elementC" ] ] ,

                     [ "nein", [ "open”, “disable" ], [ "elementA", "elementB", "elementC" ] ] ,

Das Attribut auto findet nur in der FinishBtn-Component Anwendung.           
Hier wird es genutzt um die automatische Generierung der SQL-Querys auszulösen.
Ist es gesetzt werden bei Klicken des FinishButton alle Elemente, die sich innerhalb des TabWrappers befinden und ein submitTo-Attribut tragen ausgelesen und aus dessen Daten die Querys erstellt.

                                                      <FinishBtn auto ></FinishBtn>

Für das auswählen eines eigen Querys wird dann hingegen das Attribut queryLib genutzt.

Das Attribut blur gibt einen String an die onBlur-Methode des Elementes weiter. Enthält dieser String den Namen einer Funktion, wird diese ausgeführt, sobald das Element den Fokus verliert.
Hierbei ist wichtig, dass darauf geachtet wird Parameter und Funktion in unterschiedlichen Quotes zu übergeben, da es sonnst zu einem Syntaxfehler bei der Ausführung kommt.      

                                                     blur = 'showWeiterBtn( "gk_grp1" )'

Das Attribut call übergibt denn mitgegebenen String an die onChange-Methode des Elements.
Enthält dieser String den Namen einer Funktion, wird diese ausgeführt, sobald sich der Wert des  Elements ändert. Hierbei ist wichtig, dass darauf geachtet wird Parameter und Funktion in unterschiedlichen Quotes zu übergeben, da es sonnst zu einem Syntaxfehler bei der Ausführung kommt. 

                                                     call = 'showWeiterBtn( "gk_grp1" )'

                                                     call = 'showWeiterBtn( "gk_grp1" )'



Die Input-Elemente verfügen ebenfalls über das Attribut call, nur das dieses hier zur Validation genutzt wird. Denn dieses Attribut funktioniert nur im Zusammenhang mit dem validate-Attribut.

Trägt man dort “call” ein, wird die in dem Attribut call hinterlegte Funktion für die Validierung des Values im Input genutzt. Wichtig ist, dass neues JS-Dateien auch in der Layout-Component eingetragen sind.

                                                                     validate = 'call'

                                                             call = 'validateMyInput( )'

Das Attribut campaignTitle findet ausschließlich in den Layout-Components Anwendung.
Der übergebene String wird als Title des HTML-Dokuments eingetragen.

In der EditLayout-Component heiße dieses Attribut title. 

                                                         campaignTitle = "STE_WEL"  

Das Attribut campaginNr findet ausschließlich in den Layout-Components Anwendung.
Der übergebene String muss den Namen des Ordners tragen, in dem sich die externen JS-Dateien befinden. Da diese in das HTML-Dokument gemapped werden.  

                                                           campaignNr = "0000003"  

Das Attribut col findet ausschließlich in der SimpleTextfield-Component Anwendung.
Der übergebene String wird an das Attribut cols weitergegeben, welches die Columns des Textarea-Elementes steuert. Dieses Attribut hat keine weitere Funktion als den String durchzureichen. 

Das Attribut dateiname findet ausschließlich in der Bild-Component Anwendung. 
Der übergebene String wird für die Pfadangabe zum einfügen von Bilder / PNGs genutzt.
Ein Bild kann nur dann geladen werden, wenn es sich in “public/include/images“ befindet.

                                                      <Bild dateiname = "skon.png" />

Das Attribut disabled ist ein Boolean um ein Element zu sperren.

                                                    <Input id=”a”… disabled > </Input>

Das Attribut firstOption findet in alles Select-Elementen Anwendung.
Standartmäßig werden alle Select-Elemente ein [Bitte Auswählen] als ersten Wert vorausgewählt haben. Soll jedoch ein anderer Wert ausgewählt sein, wird dieser mit der firstOption-Attribut festgelegt.

Die Werte werden als Array eingetragen: [ value , Anzeigetext ]

Das Attribut gate findet sich ausschließlich in der Gatekeeper- & SuggestionInput-Component Anwendung.
Der hier eingetragene String bezieht sich auf die ID des <Gate>-Elementes, das gesteuert werden soll.

Durch diese Zuweisung erhält die Gatekeeper()-Funktion die Information, in welchem Bereich die zu beeinflussenden Elemente zu finden sind.

Siehe auch: GatekeeperSelect

Das Attribut grp findet sich ausschließlich in der Gate-Component. Dieses ist ein optionales Attribut welches eine Vernetzung der Gates unter verschiedenen Gatekeepern zulässt.
Denn durch das Vergeben einer grp wird die Gate-Component auch für die “all{grp}” Befehle anderer Gatekeeper angreifbar.

Das Attribut group findet sich in den Components ConBlock, Gategroup und SimpleFieldset.
Denn durch das Vergeben einer group werden die Components für die “all{grp}” Befehle der Gatekeeper angreifbar und können dann geschaltet werden.

Das Attribut header_imgs findet sich ausschließlich in der Component Layout.
Hier werden die Namen (+Suffix) der Bilddateien eingetragen, die im Header angezeigt werden sollen.

                                         header_imgs={["skon.png", "stadtenergie.svg"]}

Wichitg: Die Bilddateien müssen im Ordner ../public//include/images liegen, um nutzbar zu sein.

Das Attribut header_title findet sich ausschließlich in der Component Layout.
Der hier abgelegte String wird im Header als H1 angezeigt.

Das Attribut hidden findet sich in den Components: ConBlock, Gate, GateGroup und SimpleFieldset.
Ist dieses Attribut vergeben, erhält das nach dem Build generierte Element die Klasse d-none.

<Field 
    id="kundenhistorie" 
    legend="Kundenhistorie" 
    klasse="dis-p grid-col_center"
    hidden
>
</Field>

Wichtig hierbei zu beachten:
Auch das jeweilige Label für das generierte Element wird mit der Klasse “d-none” versehen.
Wenn diese sichtbar geschaltet werden sollen wird an die id des Elementes das angezeigt werden soll noch ein “_label” angehangen, um das Label zu erreichen. 

Das Attribute id ist in jeder Component vorhanden und gibt den String direkt an die Element-ID weiter,
Siehe auch: HTML - The id attribute (w3schools.com)

Das Attribut isVisible findet sich ausschließlich in der TabPage-Component.
Dieses ist das Äquivalent zum hidden-Attribut, da die TabPages standartmäßig die Klasse “d-none” tragen, können sie mit einsetzten dieses Attributes sichtbar gemacht werden.

Das Attribut jsFiles findet sich ausschließlich in den Components Layout und LayoutEdit.
In diesem Attribut werden die JS-Dateien aufgelistet, die für die Kampagne geladen werden sollen.

                                           jsFiles={["tteditor-config.js", "query_lib.js"]}

Siehe auch: JavaScript

Dieses Attribut ist in jeder Component vorhanden und entspricht dem eigentlichen class-Attribut der HTML-Elemente. Jedoch lässt Astro eine Doppelbenennung nicht zu und somit muss die deutsche Schreibweise genutzt werden.

siehe auch: HTML Classes - The Class Attribute (w3schools.com)

Das Attribut label findet sich in den Components: GatekeeperSelect, RadioButton, SimpleInput, SimpleSelect, SimpleTextfield, SQLinjectionSelect und SuggestionInput.

Mit diesem Attribut wird der hinterlegte String an das, im Build generierte, label-Element weitergegeben. 

Das Attribut legend findet sich ausschließlich in der SimpleFieldset-Component.
Mit diesem Attribut wird der hinterlegte String an das, im Build generierte, legend-Element weitergegeben und über dem Fieldset angezeigt.

Das Attribut load findet sich ausschließlich in der SQLinjectionSelect-Component.
Mit diesem Attribut wird bestimmt, welcher Case aus der PullSQL()-Funktion die Daten laden soll, die als Options in das Select geschrieben werden.

Siehe auch: SQLinjectionSelect

Das Attribute id findet sich in den Component: SimpleInput, SimpleTextfield und SuggestionInput.
Dieses gibt den String direkt an das maxlength-Attribut des Input-Elements weiter.

Siehe auch: HTML input maxlength Attribute (w3schools.com)

Das Attribut name findet sich ausschließlich in der RadioButton-Component.
Der String wird direkt an das name-Attribut des Button-Elements weitergegeben.
Dieses Attribut kann für den Fall genutzt werden, dass der Button mit einem Label versehen werden soll.

Das Attribute options findet sich in den Component: GatekeeperSelect, SimpleSelect und SuggestionInput. Diese werden das Datenobjekt hinterlegt, aus denen im Build die Option-Elemente für das jeweilige Eltern-Element generiert werden.

Hierbei gibt es zwei Varianten dieses Attributs, dich sich bei der Angabe der benötigten Daten unterscheiden. 

Variante 1: GatekeeperSelect und SimpleSelect
Hier müssen die Daten für value und innerHTML angegeben werden um die Funktion nutzten zu können. Dafür wird für jedes Option-Element ein Array erstellt:
[“value”, “innerHTML”]   → <option value=”value”> innerHTML </option> 

options={[
   ["ja", "Ja"],
   ["nein", "Nein"],
]}



Anders verhält es sich mit dem Options des SuggestionInputs. Bei diesem werden nur die values benötigt, daher braucht man für diese Component nur ein einzelnes Array, um alle values zu erfassen.
Hierbei wird für jeden String ein eigenes Option-Element erzeugt:
[”ja”,”nein”] → <option value=”ja”></option> <option value=”nein”></option> 

options={[
    "ja",
    "nein",
]}

Das Attribut pageLock findet sich ausschließlich in der GatekeeperSelect-Component.
Dieses ist sowohl ein Indikator dafür, dass auf dieser Seite eine Validierung der Eingaben stattfinden soll, als auch eine Sperre, um das Welchen der Pages zu unterbinden, bis die Validierung abgeschlossen ist.

Um den pageLock zu nutzen, wird dieses Attribut als Boolean aufgeführt. Mit dem ersten OnChange-Event der Component wird diese dann aktiviert. 
Somit kann sowohl bei der Nutzung des Selects durch den User, als auch durch ein setValue{X} von einen anderen Gatekeeper, der pageLock ausgelöst werden.

 <Gatekeeper
    id="datenerfassung_produkt"
    label="Kunde erreicht?"
    pageLock
    required
>
</Gatekeeper> 

Das Attribut pattern findet sich ausschließlich in den Components Layout und LayoutEdit.
In diesem Attribut wird das CustomerPattern ausgewählt, das für die Kampagne geladen werden sollen.

                                                         pattern = "providerPattern()"

Das Attribute preset findet sich in den Component: GatekeeperSelect, SimpleInput, SimpleSelect,  SQLinjectionSelect und SuggestionInput.
Mit diesem Attribut kann der jeweiligen Component ein Wert aus der CustomerData zugewiesen werden, welcher als Standartwert vorausgewählt wird. Hierfür muss der key: match des jeweiligen Eintrags genannt werden, um diesen zu laden.

                                                              preset ="emailprivate"

Das Attribut query findet sich in den Components CustomerCells und Layout.
In diesem Attribut wird das mainQuery ausgewählt, das für die Kampagne geladen werden sollen.

                                                              query ="main_query()"

Dies Layout-Component beinhaltet die CustomerCells und gibt den String im Build an diese weiter.

Das Attribut queryLib findet sich ausschließlich in der FinishButton-Component.
Mit diesem wird das Query der pushSQL ausgesucht, welches beim Klicken des FinishButton die im query erwähnten Daten an die Datenbank übermittelt.

                                                              queryLib = "myquery"

Das Attribut regex findet sich ausschließlich in der SimpleInput-Component.
Dieses Attribut übergibt den String an des pattern-Attribut des generierten Input-Elements.
Damit kann ein Regex direkt bei der Eingabe abgeprüft werden um nur bestimmte eingaben zuzulassen.

                                                         regex = "^[a-zA-Z0-9]{5,10}$"

Das Attribut required in den Components: ConBlock, GatekeeperSelect, RadioButton, SimpleInput, SimpleSelect, SimpleTextfield, SQLinjectionSelect und SuggestionInput.
Mit diesem Attribut wird festgelegt ob eine Eingabe in dieser Component validiert werden soll.


Alle Components die sich beim Aufruf von silent(pageName) oder vailidate(pageName) auf der genannten Seite befinden und das Attribut required tragen müssen ein positives Ergebnis in der Validierung erziehen können, da es sonnst nicht möglich ist die Seite zu wechseln, falls ein pageLock aktiv sein sollte.


required ist ein boolean:

<Input
    id="vertragsende_dataErf"
    type="text"
    validate="date"
    
    required
>
</Input>

Das Attribut requiredValue findet sich in den Components SimpleSelect und SQLinjectionSelect.
Dieses Attribut ist dafür zuständig, das angegebenen Array an die Validierung weiter zu geben.
Dort wird dann geprüft, ob das Select.value einer dieser Angaben entspricht.

                                                  requiredValue = [“value1”, “value2”]

Das Attribute row findet sich in der SimpleTextfield-Component.
Dieses gibt den String direkt an das rows-Attribut des Textarea-Elements weiter,

Siehe auch: HTML rows Attribute (w3schools.com)

Das Attribut submitTo findet sich in den Components: GatekeeperSelect, RadioButton, SimpleInput, SimpleSelect, SimpleTextfield, SQLinjectionSelect und SuggestionInput.
Mit diesem Attribut wird bestimmt unter welchem Spaltennamen, auf welche Datenbank und mit welchem Schlüssel, das Value dieser Component übermittelt werden soll -  wenn der Finish-Button geklickt wird.

                                    submitTo = "firstname, ste_wel_addressdata, Global.key2"

Das Attribut tabs findet sich ausschließlich in der NavTabs-Component.

Dieses Attribut erhält ein Array mit drei Strings die die TabNummer, den Page-Namen und den Anzeigenamen der jeweiligen Tabs festlegen. Hierbei ist zu beachten, dass automatisch immer ein Tab mit den Eigenschaften [“tab1”, “tab_start”, “Start”] generiert wird und somit nicht selbst eingetragen werden muss.

<NavTabs
   tabs={[
      ["tab2","tab_product", "Produkt"],
      ["tab3","tab_zusammenfassung", "Zusammenfassung"],
   ]}
>
</NavTabs>

Im Build werden dann die Tab-Buttons aus den jeweiligen Arrays erstellt.

    <button   id=”tabNr”   class=“tab”   onclick=”switchTab('pageName')> Anzeigename </button>

Die pageNamen müssen mit dein jewiligen IDs der TabPages übereinstimmten, das diese sonnst nicht gesteuert werden können.


Das Attribut title findet sich ausschließlich in der Component LayoutEdit.
In diesem Attribut wird der Titel des HTML-Dokumentes ausgewählt.

In der Layout-Component heiße dieses Attribut campaignTitle.

                                                      title = "meine_neue_kampagne"

Das Attribut trigger findet sich ausschließlich in der Component SQLinjectionSelect.
Dieses ist an die Funktionsweise des Gatekeeper angelehnt und ist dafür vorgesehen auch mit diesem Select trigger setzten zu können.

Hierfür muss jedoch zusätzlich im Attribut call die Funktion: getTrigger(callerId, validate) hinterlegt werden, damit die Trigger auch geladen werden können. Nachteil hierbei, die Values müssen bekannt sein, das diese sonnst nicht von der Funktion erkannt werden.,

Bei folgenden Beispiel wird das Select auf die Values: value1 und value2 überprüft. Hat das Select.value einen der beiden genannten Values wird setTrigger() ausgeführt.

Mit validate= true ( in der getTrigger()-Funktion ) wird zusätzlich eine Validierung angestoßen.

<SQL_Select
    id="datener"
    label="Ablehnungsgrund:"
    name="datenerfassung_ablehnungsgrund"
    call="getTrigger('datener', true )"
    trigger={[
      ['value1','trigge_id'],
      ['value2','trigge_id2']
    ]}
>
</SQL_Select>

Das Attribut type findet sich in den Components SimpleInput und SuggestionInput.
Dieses gibt den String direkt an das type-Attribut des generierten Input-Elements weiter.

Siehe auch: HTML Input Types (w3schools.com)

Das Attribut type findet sich in den Components SimpleInput und SuggestionInput.

Mit diesem Attribut wird bestimmt wie die Eingabe des Users geprüft werden soll.
Hinter jedem validate steht ein Regex oder ein externer Funktionsaufruf, welche ein true or false zurückgeben. So ist es möglich jegliche Eingaben zu validieren.  

validate

Beschreibung

txt 

Text mit mehr als 0 und weniger als 256 Zeichen

handy

Nur Zahlen, beginnt mit 01 oder +49 und mehr als 5 Zeichen

email  

E-Mail-Adressen mit einem @ und einem Punkt

tel

Zahlen, die mit 0, gefolgt von weiteren Ziffern.

plz

Fünfstellige Zahlen.

time

Zeitangaben im Format HH:MM(:SS)

date

Datumsangaben im Format DD.MM.JJJJ

dateandtime

Datums- und Zeitangaben im Format DD.MM.JJJJ HH:MM(:SS)

empty

Beliebige Zeichen, einschließlich Zeilenumbrüchen.

options

Prüfe ob value in der <datalist> vorhanden ist (nur für SuggestionInput)

call

(ext. Funktion) Rufe die angegebene Funktion als Validierung auf

““

Jede Zeichenkette

Das Attribut value findet sich in den Components RadioButton, SimpleInput, SimpleTextfield und SuggestionInput. Gibt den String direkt an das value-Attribut des generierten Input-Elements weiter.

Siehe auch: HTML input value Attribute (w3schools.com)



Funktionen

Dieser Abschnitt umfasst ein paar Zusatzinformationen, die sich auf die ausführenden Funktionen hinter den Components beziehen. Zu verstehen, wie man diese nutzt kann, wärend der Nutzung, hilfreich sein.

Gatekeeper()

Die Gatekeeper-Funktion ist maßgeblich für die Umsetzung der Schaltlogik zuständig.
Um eine höhst dynamische Logik gewährleiten zu können, arbeitet diese Funktion mit eigener Syntax.
Diese ermöglicht es    

Obwohl Gatekeeper standardmäßig von GatekeeperSelect- (und SuggestionInput)-Elementen aufgerufen wird, kann es auch manuell ausgelöst werden. Dies ist nützlich, um bestimmte Aktionen unabhängig von Benutzerinteraktionen auszuführen.

Die Syntax für die manuelle Ausführung von Gatekeeper lautet wie folgt:

gatekeeper([ 
  [gksId, gate, nextFunc], 
  [value1, action1, target1], 
  [value2, action2, target2],
 ... 
 ]);



switchTab()

Die Grundlegende Funktion zum wechseln, sperren und validieren der TabPages.

pageLock - Seiten sperren

weiterBtn - Validieren und weiter springen





getTrigger()

Mit der getTrigger( callerId, validate )-Funktion kann aus einem Element die Trigger-Information ausgelesen werden. Dies findet beispielsweise Anwendung, wenn man bei einer bestimmten Auswahl eines Select-Elementes einen Text oder einen bestimmten Value in ein Anderes Element einfügen möchte.

Hierfür wird in für callerId die ID des Selects und für validate ein “true” oder “false” eingesetzt. 
bei validate = true wird nach dem Auslesen der Trigger-Anweisung automatisch die showWeiterButton()-Funktion angestoßen und die aktuelle Seite Validiert.

readTrigger()

Die readTrigger Funktion ist die Anweisung zum Ausführen des TriggerPattern.
Alle Trigger die den status true tragen werden dann in ihre vorgesehen Ziele geladen.


bundleInputs() & validateBundle()

Die beiden Funktionen bundleInputs() und validateBundle() sind für die Validierung der Values zuständig.
Diese fassen alle Values, die aus einem Element mit den required-Attribut entspringen, zu Bundles zusammen, entsprechend ihres Typs im validate-Attribut.

Die Auswertung jedes Bundles ist im DebugLog zu finden  ( Hotkey:  [ Tab ] + [ D ] ).





showWeiterBtn()

Die Funktion showWeiterBtn( X ) erhält die ID einer TabPage oder eines anderen Trägerelements, wie beispielsweise einem Gate. Innerhalb dieses Trägerelements wird dann die Funktion Silent() angewendet.

Diese prüft ob alle Eingabe-Elemente die das Attribut required tragen, ausgefüllt worden sind. 
(keine richtige Validierung) und blendet bei positivem Ergebnis den WeiterBtn ein.  

WeiterBtn()

Die Funktion WeiterBtn() ist die ausführende Funktion hinter dem Btn-Element. Diese ruft die Validierung der, auf der gesamten Seite, eingeblendeten Elemente auf und schaltet bei positiven Abschluss, auf die nächste TabPage (der Reihenfolge entsprechend)

Wurde während Nutzung der Seite oder in der Validierung Global.posSale auf false gesetzt, leitet der WeiterBtn direkt auf den letzten Tab.



finishCall()

Diese Funktion bietet die Möglichkeit eigenen JS-Code vor dem Schließen des Calls einzubinden.

Siehe auch: finishCall

Arbeitsschritt-Anleitungen und Beispiele

In diesem Kapitel finden sich die genauen Anleitungen um die einzelnen Funktionen des ttEditors nutzten zu können.



PageLock - Eine Seite bis zur Validierung sperren

Das Gatekeeper-Select besitzt das optionale Attribut pageLock.
Ist dieses gesetzt wird der Gatekeeper zum Schalter für die Seitensperre.
Ab dem Moment, in dem der User den Gatekeeper bedient, wird die Seite ,auf welcher sich dieser befindet, gesperrt. D. h. die Funktion zum Seitenwechsel (SwitchTab) blockiert. 



Hierdurch wird bei jedem versuchen Seitenwechsel, automatisch die Abfrage für die vollständige Validierung angestoßen. 

In dieser wird geschaut, welche der Input- und Select-Elemente, auf der gesperrten Seite, das Attribut 
”required” tragen und sichtbar geschaltet sind. (kein d-none)

Entspricht keines der Elemente diesen Anforderungen, wird die Validierung als erfolgreich angesehen.



