**Nutzung**
Der Nutzer erstellt für sein neues Projekt zwei Ordner innerhalb von ../src/pages/Projektname für die index.astro (HTML) und in ../public/Projektname/js  für die JavaScript-Dateien.

In der index.astro wird das Webdokument mithilfe der Components und Vanilla-HTML aufgebaut.  >> INDEX

Die tteditor-config.js umfasst alle globalen Variablen und Pattern, die für die Anpassung des Projektes
zur jeweils geforderten Ausgangslage notwendig sind. 
Alle gewünschten SQL-Statements finden sich in der query_lib.js >> config&query_lib   

Während des Builds werden alle Dateien “deploy ready” im Ordner dist abgelegt. Dieser kann dann zu ttFrame überführt werden.


 

**Gedachter Ablauf**

Zum Erstellen einer neuen Kampagne öffnet der Nutzer die (asto-fähige) IDE seiner Wahl und lädt den ttEditor. Hier kann nun unter src/pages/ ein Ordner mit der Nummer der neuen Kampagne angelegt werden. In diesem wird dann die index.astro erstellt.
In dieser Index wird das HTML der Kampagne erstellt, hierfür müssen aber erst die Grundeinstellungen vorgenommen werden. 

Nachdem die Index.astro erstellt ist, werden, um die Attribute der Elemente vollständig ausfüllen zu können, die Informationen über die Variablen und der SQL-Statements benötigt. 
Hierfür wird unter public/ ebenfalls ein Ordner mit der Kampagnennummer angelegt, in den die beiden Dateien ttEditor-Config.js und query_lib.js aus einer anderen Kampagne kopiert werden können.

Diese müssen nun kampagnenspezifisch angepasst werden, um alle benötigten Informationen bereitstellen zu können. Sind die globalen Variablen und die Pattern angepasst, können nun die Daten in den Attributen aufgerufen werden. Es empfiehlt sich bei größeren Projekten die Schaltungen in einem Ablaufdiagram festzuhalten, um eine Übersicht zu behalten.


**Index.astro**
Die index.astro ist das eigentliche HTML-Dokument. Während des builds, verwendet Astro alle Informationen der Index, um die Seite aufzubauen.

Dementsprechend ist es nicht zwingend notwendig, die Funktionen von Astro zu nutzen, um eine funktionstüchtige Seite zu erschaffen. Jedoch bieten gerade die Components einen erheblichen Vorteil, bei der Menge an Code die notwendig ist, um die gewünschten Funktionen abzubilden.

**Grundeinstellungen**
Zuerst müssen die gewünschten Components importiert werden. 

Componets:

| Name(.astro) |

gedachte Nutzung |



| Bild | Anzeigen eines Img, unter Angabe des Dateinamens |

| ConBlock | Bedingungsabhängiges Element |

| CustomerCells | Darstellung der Kundendaten auf der Seite |

| DebugLog | Fenster für die DebugLogs (Hotkey [Tab] + [D])|

| EditLayout | Editierbares Grunddaten-Element |

| FinishButton | Button zum Anschluss und senden der Daten an die DB |

| FootButtons | Buttons zum Aufruf von Modalen für ttFrame-Funktionen|

| Gate | Wrapper des Einflussbereiches eines Gatekeepers |

| GatekeeperSelect | Select-Element zur Manipulation anderer Elemente |

| Layout | Grunddaten-Element der |

| NavTab | Hauptnavigation auf der Seite |

| Popups | Modale für ttFrame-Funktionen ( für FootButtons )|

| RadioButtons | Gestyltes Element |

| RecordButton | Button zum ändern des Recordingzustandes (ttFrame) |

| TabPage | Wrapper zum Schalten der Navigation|

| TabWrapper | Wrapper für die Inhalte die in die DB einfließen sollen (UserInputs) |

| SimpleFieldset | Gestyltes Fieldset-Element |

| SimpleInput | Gestyltes Input-Element |

| SimpleSelect | Gestyltes Select-Element |

| SimpleTextfield | Gestyltes Textfield-Element |

| SQLinjectionSelect | Select-Element + Options aus der DB geladen |

| SuggestionInput | Value-gesteuertes Input mit Vorschlagsfunktion |

| WeiterButton |  Navigationsbutton zum Wechseln der TabPages |

Das Dokument wird von der Layout-Komponente aus befüllt. Alles was sich innerhalb dieser befindet, liegt nicht nur innerhalb des HTML-Body, sondern auch im sogenannten ”middle block”. Dieser ist die Sektion für alle Hauptelemente.

Als nächstes folgt der TabWrapper. Dieser umschließt alle Input- bzw. Select-Elemente, da diese Component das form-Element beinhaltet. Ohne den TabWrapper werden keine Daten an die DB zurückgegeben.

Zur Unterteilung der verschiedenen Seiten oder Register, werden die TabPages genutzt.
Diese stehen in direkter Beziehung zur 
NavTabs-Component. 
Denn über die NavTabs werden die verschiedenen TabPages ein- bzw. aus- geblendet.

Ein Typischer Ausbau wäre:
"
<Layout>
    <NaxTabs></NavTabs>
    <TabWrapper> 
        <TabTage>
            <field>
                <Gatekeeper/>
                <Gate>
                    <Input>
                    <Gatekeeper/>
                        <Gate>
                            <Input>
                        </Gate>  
                </Gate>
            </Field>
        </TabPage>   
        <TabTage>
            <field>
                <Gatekeeper/>
                <Gate>
                    <Input>
                </Gate>
            </Field>
        </TabPage> 
    </TabWrapper>  
</Layout>
"
