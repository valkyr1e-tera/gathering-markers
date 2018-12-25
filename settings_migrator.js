const DefaultSettings = {
  "enabled": true,
  "markTargets": [1, 2, 3, 4, 5, 6, 101, 102, 103, 104, 105, 106, 201, 202, 203, 204, 205, 206]
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
  if (from_ver === undefined) {
    // Migrate legacy config file
    return DefaultSettings
  } else if (from_ver === null) {
    // No config file exists, use default settings
    return DefaultSettings
  } else {
    // Migrate from older version (using the new system) to latest one
    if (from_ver + 1 < to_ver) {
      // Recursively upgrade in one-version steps
      settings = MigrateSettings(from_ver, from_ver + 1, settings)
      return MigrateSettings(from_ver + 1, to_ver, settings)
    }

    switch (to_ver) {
      default:
        settings = Object.assign(settings, DefaultSettings)
        break
    }

    return settings
  }
}
