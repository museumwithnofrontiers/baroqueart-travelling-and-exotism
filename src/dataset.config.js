import { languageLabels, offeredLanguages, sectionMeta, useDataPackage } from '@museumwnf/viewer-core'
import {
  BAROQUEART_NO_COUNTRY, BaroqueartHome, baroqueartNavigation, baroqueartRoutes, baroqueartSettings, BaroqueartShell,
} from '@museumwnf/viewer-layout/minisite'
import exhibition from './minisite.json'

// The whole declaration of this website: one of legacy Discover Baroque Art's
// virtual exhibitions, a website of its own. Its pages are Discover Baroque
// Art's mini-sites' — viewer-layout's `./minisite` (its `baroqueart` pages),
// legacy's exhibitions/BAR/ pages — and what is this exhibition's own is
// minisite.json (what legacy configured for it alone), its theme
// (theme/tokens.css) and its legacy pictures (theme/assets/legacy/,
// SOURCES.json names where each was taken from), all three written by
// inventory-app's scripts/minisites/legacy-minisite.mjs. Its records come from
// the data package, its texts from viewer-i18n's `minisiteBaroque` bundle (and
// locales/, which may overload any).

const { manifest } = useDataPackage()

// The pictures of the frame, as Vite builds and fingerprints them; the pages
// name a file by its path under theme/assets/.
const chrome = import.meta.glob('../theme/assets/**/*.{jpg,jpeg,png,gif,svg}', {
  eager: true, query: '?url', import: 'default',
})

// The languages the exhibition has a title in: legacy's switcher offered them.
const languages = offeredLanguages()

// The website that carried the exhibitions on legacy: its header, menu and
// sheet links lead there.
const parent = 'https://museumwithnofrontiers.github.io/baroqueart'

export default {
  // The dataset package this website renders. Must match the alias in
  // vite.config.js and the dependency in package.json.
  datasetPackage: '@museumwnf/baroqueart-travelling-and-exotism-data',

  siteName: manifest.site?.names?.en ?? 'Travelling and Exoticism',

  // The absolute origin this build is deployed at, base path included, no
  // trailing slash: the GitHub Pages address of this repository.
  site: { origin: 'https://museumwithnofrontiers.github.io/baroqueart-travelling-and-exotism' },

  features: { entities: [] },

  languages,

  shell: BaroqueartShell,

  chrome,

  navigation: baroqueartNavigation({ languages: languageLabels(languages), parent }),

  // What legacy configured for this exhibition alone (its libs/config.inc.php
  // and index.php, and exhibitions/BAR/libs/config.inc.php).
  minisite: baroqueartSettings({
    parent,
    // The home menu's second column starts at this position ($_HOME_MENU_COL2).
    menuSecondColumnFrom: exhibition.menuSecondColumnFrom,
    // The curators the home page credits (HOMELOGOS): a partner, with the city
    // and country legacy printed after it, or a name and a country as legacy
    // wrote them, each with its logo and the space after it.
    curators: exhibition.curators,
    // The designer, credited beside the curators.
    design: exhibition.design,
    // The home picture (#banner), when the exhibition drew one.
    banner: exhibition.banner,
    // The records legacy named no country for.
    noCountry: BAROQUEART_NO_COUNTRY,
    // The Word document's title, legacy's own.
    documentTitle: 'MWNF DISCOVER BAROQUE ART - Exhibition',
  }),

  views: { home: BaroqueartHome },

  extraViews: baroqueartRoutes(sectionMeta()),

  legacyRoutes: [],
}
