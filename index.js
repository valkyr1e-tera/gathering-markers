const _ = require('lodash')

module.exports = function GatheringMarkers(mod) {
  const herbs = [1, 2, 3, 4, 5, 6]
  const mines = [101, 102, 103, 104, 105, 106]
  const energies = [201, 202, 203, 204, 205, 206]
  const gatheringTargets = _.concat(herbs, mines, energies)

  const markers = []

  mod.command.add('gathering', {
    $none() {
      mod.settings.enabled = !mod.settings.enabled
      mod.command.message(`${mod.settings.enabled ? 'en' : 'dis'}abled`)
    },
    add(id) {
      id = Number(id)
      let message
      if (gatheringTargets.includes(id)) {
        if (!mod.settings.markTargets.includes(id))
          mod.settings.markTargets.push(id)
        message = `added ${id} to marking target`
      } else {
        message = `${id} is out of range of marking targets`
      }
      mod.command.message(message)
    },
    remove(id) {
      id = Number(id)
      _.pull(mod.settings.markTargets, id)
      mod.command.message(`removed ${id} from marking targets`)
    },
    clean() {
      mod.settings.markTargets = []
      mod.command.message('marking targets cleared')
    },
    $default(args) {
      switch (args[0]) {
        case 'herb':
          mod.settings.markTargets = herbs
          break
        case 'mine':
          mod.settings.markTargets = mines
          break
        case 'energy':
          mod.settings.markTargets = energies
          break
        default:
          return mod.command.message(`${args[0]} is invalid argument`)
      }
    }
  })

  mod.game.me.on('change_zone', clearMarkers)

  mod.hook('S_SPAWN_COLLECTION', 4, event => {
    if (!mod.settings.enabled || !mod.settings.markTargets.includes(event.id))
      return

    const id = event.gameId * 2n
    spawnMarker(id, event.loc)
  })

  mod.hook('S_DESPAWN_COLLECTION', 2, event => {
    const id = event.gameId * 2n
    despawnMarker(id)
  })

  function spawnMarker(id, loc) {
    if (markers.includes(id))
      return

    loc.z -= 100
    mod.send('S_SPAWN_DROPITEM', 6, {
      gameId: id,
      loc,
      item: 98260,
      amount: 1,
      expiry: 300000,
      owners: [{ id: 0 }]
    })
    markers.push(id)
  }

  function despawnMarker(id) {
    if (!markers.includes(id))
      return

    mod.send('S_DESPAWN_DROPITEM', 4, { gameId: id })
    _.pull(markers, id)
  }

  function clearMarkers() {
    markers.forEach(despawnMarker)
  }
}