module.exports = { webpack: (config, { isServer }) => { if (isServer) config.externals = [...(config.externals||[]), 'sql.js']; return config; } };
