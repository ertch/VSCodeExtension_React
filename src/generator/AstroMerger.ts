import { generateHTML, type GenerateHTMLResult } from './CodeGenerator';

export interface AstroMetaData {
  campaignNr: string;
  campaignTitle: string;
  headerTitle: string;
  headerImg: string;
}

export function mergeAstro(
  jsonData: any,
  metadata: AstroMetaData
): string {
  const result: GenerateHTMLResult = generateHTML(jsonData);
  const { tabs, components, html } = result;

  const tabsArrayString = tabs.length > 0
    ? tabs.map(tab => `            ["${tab[0]}", "${tab[1]}", "${tab[2]}"]`).join(',\n')
    : '';

  const componentImports = components
    .map(comp => `import ${comp} from "@/components/${comp}.astro";`)
    .join('\n');

  return `---
import Layout from "@/layouts/Layout.astro";
import NextPageBtn from "@/components/WeiterButton.astro";
import NavTabs from "@components/NavTabs.astro";
import TabWrapper from "@components/TabWrapper.astro";
import TabPage from "@/components/TabPage.astro";
${componentImports}
---
<!-- Grunddaten -->
<Layout
    campaignNr="${metadata.campaignNr}"
    campaignTitle="${metadata.campaignTitle}"
    jsFiles={["tteditor-config.js", "query_lib.js"]}
    header_imgs={["skon.png", "${metadata.headerImg}"]}
    header_title="${metadata.headerTitle}"
    pattern="providerPattern()"
    query="main_query()"
>
<!-- main -->
 <NavTabs
        tabs={[
${tabsArrayString}
        ]}
>
<TabWrapper>
   <!-- Anfang <form> -->
${html}
        <NextPageBtn />
<!-- Ende <form> -->
</TabWrapper>
<!-- Ende main -->
</Layout>
`;
}
