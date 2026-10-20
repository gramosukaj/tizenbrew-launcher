// Contenu du lanceur. Les applis absentes de la TV sont masquées automatiquement.
// Pour trouver l'id d'une appli : tizen.application.getAppsInfo() depuis la TV.
window.LAUNCHER_CONFIG = {
  // Modules TizenBrew : nom affiché et couleur par module (sinon appName + couleur par défaut).
  modules: {
    title: 'TizenBrew',
    hidden: ['gh/gramosukaj/tizenbrew-launcher'],
    labels: {
      'npm/@foxreis/tizentube': { name: 'YouTube', sub: 'sans pub', color: '#FF0033' },
      'npm/tizentwitch': { name: 'Twitch', sub: 'sans pub', color: '#9146FF' },
      'npm/@gforceweb/smarttv-twitch-hls': { name: 'Twitch HLS', sub: "jusqu'en 1440p", color: '#6441A5' }
    }
  },

  sections: [
    {
      title: 'Streaming',
      apps: [
        { id: 'org.tizen.netflix-app', name: 'Netflix', color: '#E50914' },
        { id: 'org.tizen.primevideo', name: 'Prime Video', color: '#00A8E1' },
        { id: 'MCmYXNxgcu.DisneyPlus', name: 'Disney+', color: '#0E2B7A' },
        { id: 'QmpwflxWdt.CanalPlusLauncher', name: 'CANAL+', color: '#111111' },
        { id: 'vbUQClczfR.Wuakitv', name: 'Rakuten TV', color: '#BF0000' },
        { id: 'WG2lklBRNT.SmartTVNextGen', name: 'Pathé Home', color: '#FFC200', text: '#111111' }
      ]
    },
    {
      title: 'TV',
      apps: [
        { id: 'znCs95n93Q.OqeeTV', name: 'OQEE', sub: 'by Free', color: '#2B2B2B' },
        { id: 'QY16tZ64E3.francetv', name: 'france.tv', color: '#1F2A8A' },
        { id: 'aLlph042JZ.arte', name: 'ARTE', color: '#FA481C' },
        { id: 'E0P3lRI4H7.MYTF1', name: 'TF1+', color: '#003B8E' },
        { id: 'Ol7HVEXtqh.6play', name: '6play', color: '#6C2BD9' },
        { id: 'bstjKvX6LM.molotov', name: 'Molotov', color: '#3A2A6B' },
        { id: 'BnhhSh4SVH.SFR', name: 'RMC BFM Play', color: '#00539F' },
        { id: 'rKpKZvmSog.IPTVSmartersPro', name: 'IPTV Smarters', color: '#2E3440' }
      ]
    },
    {
      title: 'Musique, jeux & web',
      apps: [
        { id: 'rJeHak5zRg.Spotify', name: 'Spotify', color: '#1DB954', text: '#111111' },
        { id: 'GHI3a0zMSx.XboxGamePass', name: 'Xbox', color: '#107C10' },
        { id: 'CmeyUlnhYY.LunaWebApp', name: 'Amazon Luna', color: '#5B2A86' },
        { id: 'MiUDVawh7P.UtomikTizen', name: 'Utomik', color: '#E8432B' },
        { id: 'org.tizen.browser', name: 'Internet', color: '#3B4252' }
      ]
    }
  ]
};
