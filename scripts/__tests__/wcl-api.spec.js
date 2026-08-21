import { describe, it, expect } from 'vitest'
import { toRealmSlug } from '../wcl-api.js'

describe('toRealmSlug', () => {
  it('splits realms WCL reports with the space removed', () => {
    expect(toRealmSlug('TwistingNether')).toBe('twisting-nether')
    expect(toRealmSlug('DefiasBrotherhood')).toBe('defias-brotherhood')
    expect(toRealmSlug('BurningLegion')).toBe('burning-legion')
  })

  it('splits realms that still carry their space', () => {
    expect(toRealmSlug('Twisting Nether')).toBe('twisting-nether')
    expect(toRealmSlug('Argent Dawn')).toBe('argent-dawn')
  })

  it('drops apostrophes without splitting the name there', () => {
    expect(toRealmSlug("Al'Akir")).toBe('alakir')
    expect(toRealmSlug("Kil'jaeden")).toBe('kiljaeden')
    expect(toRealmSlug("C'Thun")).toBe('cthun')
  })

  it('leaves single-word realms alone', () => {
    expect(toRealmSlug('Kazzak')).toBe('kazzak')
    expect(toRealmSlug('Draenor')).toBe('draenor')
    expect(toRealmSlug('Skullcrusher')).toBe('skullcrusher')
  })
})
