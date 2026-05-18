import { describe, it, expect } from 'vitest'
import { WOW_CLASSES, RAID_BUFFS } from '../wow-classes.js'

describe('WOW_CLASSES', () => {
  it('has all 13 classes', () => {
    expect(Object.keys(WOW_CLASSES)).toHaveLength(13)
  })

  it('every class has a display name and at least one spec', () => {
    for (const [key, classDef] of Object.entries(WOW_CLASSES)) {
      expect(classDef.name, `${key} missing name`).toBeTruthy()
      expect(Object.keys(classDef.specs).length, `${key} has no specs`).toBeGreaterThan(0)
    }
  })

  it('every spec has a name, valid role, and buffs array', () => {
    const validRoles = ['tank', 'healer', 'melee', 'ranged']
    for (const [classKey, classDef] of Object.entries(WOW_CLASSES)) {
      for (const [specKey, spec] of Object.entries(classDef.specs)) {
        const label = `${classKey}.${specKey}`
        expect(spec.name, `${label} missing name`).toBeTruthy()
        expect(validRoles, `${label} has invalid role '${spec.role}'`).toContain(spec.role)
        expect(Array.isArray(spec.buffs), `${label} buffs is not an array`).toBe(true)
      }
    }
  })

  it('every buff referenced in a spec exists in RAID_BUFFS', () => {
    for (const [classKey, classDef] of Object.entries(WOW_CLASSES)) {
      for (const [specKey, spec] of Object.entries(classDef.specs)) {
        for (const buff of spec.buffs) {
          expect(
            RAID_BUFFS,
            `${classKey}.${specKey} references unknown buff '${buff}'`,
          ).toHaveProperty(buff)
        }
      }
    }
  })
})

describe('RAID_BUFFS', () => {
  it('every buff has a name, description, icon, and at least one providing class', () => {
    for (const [key, buff] of Object.entries(RAID_BUFFS)) {
      expect(buff.name, `${key} missing name`).toBeTruthy()
      expect(buff.description, `${key} missing description`).toBeTruthy()
      expect(buff.icon, `${key} missing icon`).toBeTruthy()
      expect(buff.classes.length, `${key} has no providing classes`).toBeGreaterThan(0)
    }
  })

  it('every class referenced in a buff exists in WOW_CLASSES', () => {
    for (const [buffKey, buff] of Object.entries(RAID_BUFFS)) {
      for (const cls of buff.classes) {
        expect(WOW_CLASSES, `${buffKey} references unknown class '${cls}'`).toHaveProperty(cls)
      }
    }
  })
})
