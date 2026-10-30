import { describe, expect, it, vi } from 'vitest'
import { mergeMessages } from '@museumwnf/viewer-core'
import {
  checkOfferedLanguages, checkRoutes, checkSectionMeta, checkTextsRendered, mountSite,
} from '@museumwnf/viewer-core/testing'
import { BAROQUEART_LABELS } from '@museumwnf/viewer-layout/minisite'
import { catalogues as sharedTexts } from '../src/texts.js'
import { readFileSync } from 'node:fs'
import ownTexts from '../locales/en.json'
import config from '../src/dataset.config.js'
import exhibition from '../src/minisite.json'
import sources from '../theme/assets/legacy/SOURCES.json'

// The same two layers main.js assembles, in the same order: the shared bundle
// first, this website's own file last.
const messages = mergeMessages(sharedTexts, { en: ownTexts })

describe('website smoke test', () => {
  // A copy of baroqueart-minisite-template is not a mini-site until
  // inventory-app's scripts/minisites/legacy-minisite.mjs has written what
  // legacy configured for it: the settings, the theme and the frame's pictures.
  it("carries this exhibition's own settings, theme and pictures", () => {
    expect(exhibition.legacy).toMatch(/^https:\/\/.+\/exhibitions\/BAR\//)
    expect(exhibition.curators.length).toBeGreaterThan(0)
    expect(readFileSync('theme/tokens.css', 'utf8')).toContain('--minisite-')
    expect(Object.keys(sources.files).length).toBeGreaterThan(0)
  })

  it('declares the entities every route reads', () => {
    for (const route of config.extraViews) {
      expect(Array.isArray(route.meta?.entities), route.name).toBe(true)
    }
  })

  it('declares the section every route belongs to', () => {
    expect(checkSectionMeta(config)).toEqual([])
  })

  it('publishes no generic entity pages', () => {
    expect(config.features.entities).toEqual([])
  })

  it('offers the languages the package declares, where the items carry them', () => {
    expect(checkOfferedLanguages(config)).toEqual([])
    expect(config.languages.length).toBeGreaterThan(0)
    expect(config.navigation.languages.map((l) => l.code)).toEqual(config.languages)
  })

  it('draws the home page: the title, the menu, the curators and the designer', async () => {
    const { app, host } = await mountSite(config, messages, '#/?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-home__title')?.textContent.trim()).toBeTruthy(), { timeout: 20000 })
    // The introduction and one entry per theme.
    expect(host.querySelectorAll('.mwnf-baroqueart-home__menu div').length).toBeGreaterThan(1)
    expect(host.querySelectorAll('.mwnf-baroqueart-partners__curator').length).toBe(config.minisite.curators.length)
    expect(Boolean(host.querySelector('.mwnf-baroqueart-partners__design'))).toBe(Boolean(config.minisite.design))
    // The frame: the menu over the footer, legacy's links in its order.
    expect(host.querySelectorAll('.mwnf-baroqueart-menu li').length).toBe(config.navigation.menu.length)
    app.unmount()
  }, 30000)

  it('draws the introduction: its text and its captioned pictures', async () => {
    const { app, host } = await mountSite(config, messages, '#/introduction?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-intro__content')?.textContent.trim()).toBeTruthy(), { timeout: 20000 })
    // The captions come with the items' texts, which may arrive after the introduction's.
    await vi.waitFor(() => expect(host.querySelectorAll('.mwnf-baroqueart-intro-item strong').length).toBeGreaterThan(0), { timeout: 20000 })
    app.unmount()
  }, 30000)

  it('draws an exhibition page: thumbnails, the item on show and its caption', async () => {
    const { app, host } = await mountSite(config, messages, '#/exhibition/1/1?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-page__caption strong')?.textContent.trim()).toBeTruthy(), { timeout: 20000 })
    expect(host.querySelectorAll('.mwnf-baroqueart-page__thumbs a').length).toBeGreaterThan(0)
    expect(host.querySelector('.mwnf-baroqueart-page__page-title').textContent.trim()).not.toBe('')
    // The first page's previous page is the introduction.
    expect(host.querySelector('.mwnf-baroqueart-page__nav--end a').getAttribute('href')).toContain('#/introduction')
    app.unmount()
  }, 30000)

  it('draws the zoom window without the frame', async () => {
    const { app, host } = await mountSite(config, messages, '#/zoom?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-zoom')).not.toBeNull(), { timeout: 20000 })
    expect(host.querySelector('.mwnf-baroqueart-header')).toBeNull()
    app.unmount()
  }, 30000)

  it('declares every route by name, and leaves the catch-all to the router', () => {
    expect(checkRoutes(config, { names: ['home', 'introduction', 'exhibition', 'zoom'] })).toEqual([])
  })

  it('renders its own texts, none as a bare entry name', async () => {
    const { app, host } = await mountSite(config, messages, '#/exhibition/1/1?lang=en')
    await vi.waitFor(() => expect(host.querySelector('.mwnf-baroqueart-page__caption')).not.toBeNull(), { timeout: 20000 })
    expect(host.textContent).toContain('Exhibition homepage')
    expect(checkTextsRendered(host, { namespaces: [BAROQUEART_LABELS, 'travellingAndExotism', 'core', 'layout'] })).toEqual([])
    app.unmount()
  }, 30000)
})
